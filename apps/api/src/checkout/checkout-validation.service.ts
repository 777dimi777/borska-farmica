import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { cartInclude, CartRecord, validQuantity } from '../cart/cart.mapper';
import { evaluateAvailability } from '../products/availability';
import { CheckoutRequestDto } from './dto/checkout.dto';
import { validatePickupDate } from './checkout-date';

export const CHECKOUT_ISSUES = {
  CART_EMPTY: 'CART_EMPTY',
  PRODUCT_INACTIVE: 'PRODUCT_INACTIVE',
  CATEGORY_INACTIVE: 'CATEGORY_INACTIVE',
  VARIANT_INACTIVE: 'VARIANT_INACTIVE',
  PRODUCT_UNAVAILABLE: 'PRODUCT_UNAVAILABLE',
  INVALID_QUANTITY: 'INVALID_QUANTITY',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  BACKORDER_NOT_SUPPORTED: 'BACKORDER_CHECKOUT_NOT_SUPPORTED',
} as const;

@Injectable()
export class CheckoutValidationService {
  constructor(private readonly prisma: PrismaService) {}

  pickupLocations() {
    return this.prisma.pickupLocation.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        code: true,
        name: true,
        address: true,
        instructions: true,
        allowedWeekday: true,
        sortOrder: true,
      },
    });
  }

  async preview(customerId: string, cartId: string, dto: CheckoutRequestDto) {
    const [customer, pickup, cart] = await Promise.all([
      this.prisma.customerUser.findFirst({
        where: { id: customerId, status: 'ACTIVE' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      }),
      this.prisma.pickupLocation.findUnique({
        where: { id: dto.pickupLocationId },
      }),
      this.prisma.cart.findFirst({
        where: {
          id: cartId,
          status: 'ACTIVE',
          expiresAt: { gt: new Date() },
        },
        include: cartInclude,
      }),
    ]);
    if (!customer) throw new UnauthorizedException('CUSTOMER_UNAVAILABLE');
    if (!pickup) throw new BadRequestException('CHECKOUT_PICKUP_NOT_FOUND');
    if (!pickup.isActive)
      throw new ConflictException('CHECKOUT_PICKUP_INACTIVE');
    if (!cart) throw new ConflictException('CHECKOUT_CART_UNAVAILABLE');
    const requestedDate = validatePickupDate(
      dto.requestedPickupDate,
      pickup.allowedWeekday,
    );
    return this.map(customer, pickup, cart, requestedDate, dto.customerNote);
  }

  map(
    customer: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
    },
    pickup: {
      id: string;
      code: string;
      name: string;
      address: string;
      instructions: string | null;
    },
    cart: CartRecord,
    requestedDate: Date,
    customerNote?: string,
  ) {
    let subtotal = new Prisma.Decimal(0);
    const globalIssues: string[] = [];
    if (cart.items.length === 0) globalIssues.push(CHECKOUT_ISSUES.CART_EMPTY);
    const items = cart.items.map((item) => {
      const variant = item.variant,
        product = variant.product,
        issues: string[] = [],
        availability = evaluateAvailability({
          mode: product.availabilityMode,
          manuallyAvailable: product.isManuallyAvailable,
          variants: product.variants,
          windows: product.availabilityWindows,
        }),
        available = variant.stockQuantity.minus(variant.reservedQuantity),
        lineTotal = variant.price.times(item.quantity);
      if (product.status !== 'ACTIVE')
        issues.push(CHECKOUT_ISSUES.PRODUCT_INACTIVE);
      if (!product.category.isActive)
        issues.push(CHECKOUT_ISSUES.CATEGORY_INACTIVE);
      if (!variant.isActive) issues.push(CHECKOUT_ISSUES.VARIANT_INACTIVE);
      if (!availability.currentlyAvailable)
        issues.push(CHECKOUT_ISSUES.PRODUCT_UNAVAILABLE);
      if (
        !validQuantity(
          item.quantity,
          variant.minimumPurchaseQuantity,
          variant.purchaseIncrement,
        )
      )
        issues.push(CHECKOUT_ISSUES.INVALID_QUANTITY);
      if (available.lessThan(item.quantity))
        issues.push(
          variant.allowBackorder
            ? CHECKOUT_ISSUES.BACKORDER_NOT_SUPPORTED
            : CHECKOUT_ISSUES.INSUFFICIENT_STOCK,
        );
      subtotal = subtotal.plus(lineTotal);
      globalIssues.push(...issues.map((issue) => `${variant.id}:${issue}`));
      return {
        cartItemId: item.id,
        variantId: variant.id,
        productName: product.name,
        variantName: variant.name,
        quantity: item.quantity.toFixed(3),
        unitPrice: variant.price.toFixed(2),
        lineTotal: lineTotal.toFixed(2),
        available: issues.length === 0,
        issues,
      };
    });
    return {
      items,
      pickup: {
        locationId: pickup.id,
        code: pickup.code,
        name: pickup.name,
        address: pickup.address,
        instructions: pickup.instructions,
        requestedPickupDate: requestedDate.toISOString().slice(0, 10),
        exactTimeRequiresConfirmation: true,
      },
      customer,
      customerNote: customerNote ?? null,
      summary: {
        subtotal: subtotal.toFixed(2),
        fee: '0.00',
        total: subtotal.toFixed(2),
        currency: 'RSD',
        paymentMethod: 'CASH_ON_PICKUP',
      },
      valid: globalIssues.length === 0,
      issues: globalIssues,
    };
  }
}
