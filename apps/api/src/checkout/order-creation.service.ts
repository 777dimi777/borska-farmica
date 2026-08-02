import { ConflictException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CartIdentityService } from '../cart/cart-identity.service';
import { cartInclude } from '../cart/cart.mapper';
import { CheckoutValidationService } from './checkout-validation.service';
import { CheckoutRequestDto } from './dto/checkout.dto';
import {
  checkoutFingerprint,
  hashIdempotencyKey,
  orderNumber,
} from './checkout-idempotency';
import { mapOrder, orderResponseInclude } from './order.mapper';
import { validatePickupDate } from './checkout-date';
import { isRetryableTransactionError } from '../common/prisma-write-conflict';

@Injectable()
export class OrderCreationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly identity: CartIdentityService,
    private readonly validation: CheckoutValidationService,
  ) {}

  async create(
    customerId: string,
    rawCartToken: string,
    dto: CheckoutRequestDto,
    rawIdempotencyKey: string | undefined,
  ) {
    if (!/^[A-Za-z0-9_-]{43}$/.test(rawCartToken))
      throw new ConflictException('CHECKOUT_CART_UNAVAILABLE');
    const keyHash = hashIdempotencyKey(rawIdempotencyKey),
      tokenHash = this.identity.hash(rawCartToken);
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => this.createIn(tx, customerId, tokenHash, keyHash, dto),
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (attempt < 2 && isRetryableTransactionError(error, true)) continue;
        throw error;
      }
    }
    throw new ConflictException('CHECKOUT_CONCURRENCY_CONFLICT');
  }

  private async createIn(
    tx: Prisma.TransactionClient,
    customerId: string,
    tokenHash: string,
    keyHash: string,
    dto: CheckoutRequestDto,
  ) {
    const cart = await tx.cart.findUnique({
      where: { tokenHash },
      include: cartInclude,
    });
    if (!cart) throw new ConflictException('CHECKOUT_CART_UNAVAILABLE');
    const fingerprint = checkoutFingerprint({
      customerId,
      cartId: cart.id,
      pickupLocationId: dto.pickupLocationId,
      requestedPickupDate: dto.requestedPickupDate,
      customerNote: dto.customerNote ?? null,
      items: cart.items
        .map((item) => ({
          id: item.id,
          variantId: item.variantId,
          quantity: item.quantity.toFixed(3),
        }))
        .sort((a, b) => a.id.localeCompare(b.id)),
    });
    const replay = await tx.order.findUnique({
      where: {
        customerId_checkoutIdempotencyKeyHash: {
          customerId,
          checkoutIdempotencyKeyHash: keyHash,
        },
      },
      include: orderResponseInclude,
    });
    if (replay) {
      if (replay.checkoutRequestFingerprint !== fingerprint)
        throw new ConflictException('CHECKOUT_IDEMPOTENCY_KEY_CONFLICT');
      return mapOrder(replay, true);
    }
    if (cart.status !== 'ACTIVE' || cart.expiresAt <= new Date())
      throw new ConflictException('CHECKOUT_CART_UNAVAILABLE');
    if (await tx.order.findUnique({ where: { cartId: cart.id } }))
      throw new ConflictException('CHECKOUT_CART_ALREADY_CONVERTED');
    const [customer, pickup] = await Promise.all([
      tx.customerUser.findFirst({
        where: { id: customerId, status: 'ACTIVE' },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
        },
      }),
      tx.pickupLocation.findUnique({ where: { id: dto.pickupLocationId } }),
    ]);
    if (!customer) throw new ConflictException('CUSTOMER_UNAVAILABLE');
    if (!pickup || !pickup.isActive)
      throw new ConflictException('CHECKOUT_PICKUP_UNAVAILABLE');
    const requestedDate = validatePickupDate(
        dto.requestedPickupDate,
        pickup.allowedWeekday,
      ),
      preview = this.validation.map(
        customer,
        pickup,
        cart,
        requestedDate,
        dto.customerNote,
      );
    if (!preview.valid)
      throw new ConflictException({
        message: 'CHECKOUT_INVALID',
        issues: preview.issues,
      });
    for (const item of cart.items) {
      const changed = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        UPDATE "ProductVariant"
        SET "reservedQuantity" = "reservedQuantity" + ${item.quantity},
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${item.variantId}::uuid
          AND "stockQuantity" - "reservedQuantity" >= ${item.quantity}
        RETURNING "id"
      `);
      if (changed.length !== 1)
        throw new ConflictException('CHECKOUT_INSUFFICIENT_STOCK');
    }
    const itemSnapshots = cart.items.map((item) => ({
      id: randomUUID(),
      productId: item.variant.productId,
      variantId: item.variantId,
      productName: item.variant.product.name,
      productSlug: item.variant.product.slug,
      variantName: item.variant.name,
      sku: item.variant.sku,
      packageAmount: item.variant.packageAmount,
      measurementUnit: item.variant.measurementUnit,
      quantity: item.quantity,
      unitPrice: item.variant.price,
      lineTotal: item.variant.price.times(item.quantity),
      imageUrl: item.variant.product.images[0]?.url ?? null,
    }));
    const subtotal = itemSnapshots.reduce(
      (sum, item) => sum.plus(item.lineTotal),
      new Prisma.Decimal(0),
    );
    const order = await tx.order.create({
      data: {
        orderNumber: orderNumber(),
        customerId,
        cartId: cart.id,
        pickupLocationId: pickup.id,
        subtotal,
        total: subtotal,
        requestedPickupDate: requestedDate,
        customerFirstName: customer.firstName,
        customerLastName: customer.lastName,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        customerNote: dto.customerNote ?? null,
        checkoutIdempotencyKeyHash: keyHash,
        checkoutRequestFingerprint: fingerprint,
        items: { createMany: { data: itemSnapshots } },
      },
    });
    await tx.stockReservation.createMany({
      data: itemSnapshots.map((item) => ({
        orderId: order.id,
        orderItemId: item.id,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    });
    await tx.orderEvent.createMany({
      data: [
        {
          orderId: order.id,
          type: 'order.created',
          toStatus: 'PENDING_CONFIRMATION',
          actorType: 'CUSTOMER',
          customerId,
        },
        ...itemSnapshots.map((item) => ({
          orderId: order.id,
          type: 'reservation.created',
          actorType: 'SYSTEM' as const,
          metadata: {
            variantId: item.variantId,
            quantity: item.quantity.toFixed(3),
          },
        })),
      ],
    });
    await tx.cart.update({
      where: { id: cart.id },
      data: { status: 'CONVERTED', convertedAt: new Date() },
    });
    const result = await tx.order.findUniqueOrThrow({
      where: { id: order.id },
      include: orderResponseInclude,
    });
    return mapOrder(result, false);
  }
}
