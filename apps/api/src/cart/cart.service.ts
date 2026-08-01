import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { evaluateAvailability } from '../products/availability';
import { decimal } from '../admin-products/decimal';
import { cartInclude, emptyCart, mapCart, validQuantity } from './cart.mapper';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
const variantInclude = {
  product: {
    include: {
      category: { select: { isActive: true } },
      variants: {
        where: { isActive: true },
        select: {
          stockQuantity: true,
          reservedQuantity: true,
          allowBackorder: true,
        },
      },
      availabilityWindows: {
        orderBy: [
          { sortOrder: 'asc' as const },
          { createdAt: 'asc' as const },
          { id: 'asc' as const },
        ],
      },
    },
  },
} satisfies Prisma.ProductVariantInclude;
type Variant = Prisma.ProductVariantGetPayload<{
  include: typeof variantInclude;
}>;
@Injectable()
export class CartService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}
  empty() {
    return emptyCart();
  }
  async read(cartId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { id: cartId },
      include: cartInclude,
    });
    return cart ? mapCart(cart) : emptyCart();
  }
  private validate(v: Variant, q: Prisma.Decimal) {
    if (
      v.product.status !== 'ACTIVE' ||
      !v.product.category.isActive ||
      !v.isActive
    )
      throw new ConflictException('CART_ITEM_UNAVAILABLE');
    const a = evaluateAvailability({
      mode: v.product.availabilityMode,
      manuallyAvailable: v.product.isManuallyAvailable,
      variants: v.product.variants,
      windows: v.product.availabilityWindows,
    });
    if (!a.currentlyAvailable)
      throw new ConflictException('CART_ITEM_UNAVAILABLE');
    if (!validQuantity(q, v.minimumPurchaseQuantity, v.purchaseIncrement))
      throw new BadRequestException('CART_INVALID_QUANTITY');
    if (
      !v.allowBackorder &&
      v.stockQuantity.minus(v.reservedQuantity).lessThan(q)
    )
      throw new ConflictException('CART_INSUFFICIENT_STOCK');
  }
  private expiry() {
    return new Date(
      Date.now() + this.config.getOrThrow<number>('CART_TTL_DAYS') * 86400000,
    );
  }
  async add(cartId: string, dto: AddCartItemDto) {
    const requested = decimal(dto.quantity, 3);
    await this.serial(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: { id: cartId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
      });
      if (!cart) throw new ConflictException('CART_UNAVAILABLE');
      const variant = await tx.productVariant.findUnique({
        where: { id: dto.variantId },
        include: variantInclude,
      });
      if (!variant) throw new NotFoundException('Variant not found.');
      const old = await tx.cartItem.findUnique({
        where: { cartId_variantId: { cartId, variantId: dto.variantId } },
      });
      const target = old ? old.quantity.plus(requested) : requested;
      this.validate(variant, target);
      if (!old && (await tx.cartItem.count({ where: { cartId } })) >= 50)
        throw new ConflictException('CART_LIMIT_REACHED');
      if (old)
        await tx.cartItem.update({
          where: { id: old.id },
          data: { quantity: target },
        });
      else
        await tx.cartItem.create({
          data: {
            cartId,
            variantId: variant.id,
            quantity: target,
            unitPriceAtAddition: variant.price,
          },
        });
      await tx.cart.update({
        where: { id: cartId },
        data: { expiresAt: this.expiry() },
      });
    });
    return this.read(cartId);
  }
  async update(cartId: string, itemId: string, dto: UpdateCartItemDto) {
    const q = decimal(dto.quantity, 3);
    if (q.isZero()) throw new BadRequestException('CART_INVALID_QUANTITY');
    await this.serial(async (tx) => {
      const item = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cartId,
          cart: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
        },
        include: { variant: { include: variantInclude } },
      });
      if (!item) throw new NotFoundException('Cart item not found.');
      this.validate(item.variant, q);
      await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity: q },
      });
      await tx.cart.update({
        where: { id: cartId },
        data: { expiresAt: this.expiry() },
      });
    });
    return this.read(cartId);
  }
  async remove(cartId: string, itemId: string) {
    await this.prisma.$transaction(async (tx) => {
      const item = await tx.cartItem.findFirst({
        where: {
          id: itemId,
          cartId,
          cart: { status: 'ACTIVE', expiresAt: { gt: new Date() } },
        },
        select: { id: true },
      });
      if (!item) throw new NotFoundException('Cart item not found.');
      await tx.cartItem.delete({ where: { id: itemId } });
      await tx.cart.update({
        where: { id: cartId },
        data: { expiresAt: this.expiry() },
      });
    });
  }
  async clear(cartId: string) {
    await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findFirst({
        where: { id: cartId, status: 'ACTIVE', expiresAt: { gt: new Date() } },
        select: { id: true },
      });
      if (!cart) throw new ConflictException('CART_UNAVAILABLE');
      await tx.cartItem.deleteMany({ where: { cartId } });
      await tx.cart.update({
        where: { id: cartId },
        data: { expiresAt: this.expiry() },
      });
    });
  }
  private async serial<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let i = 0; ; i++) {
      try {
        return await this.prisma.$transaction(fn, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (e) {
        if (
          i < 2 &&
          e instanceof Prisma.PrismaClientKnownRequestError &&
          (e.code === 'P2034' || e.code === 'P2002')
        )
          continue;
        throw e;
      }
    }
  }
}
