import { Prisma } from '../generated/prisma/client';
import { evaluateAvailability } from '../products/availability';
export const cartInclude = {
  items: {
    orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }],
    include: {
      variant: {
        include: {
          product: {
            include: {
              category: {
                select: { id: true, name: true, slug: true, isActive: true },
              },
              images: {
                orderBy: [
                  { isPrimary: 'desc' as const },
                  { sortOrder: 'asc' as const },
                  { createdAt: 'asc' as const },
                  { id: 'asc' as const },
                ],
                take: 1,
                select: { id: true, url: true, altText: true },
              },
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
                select: {
                  id: true,
                  isActive: true,
                  type: true,
                  startsAt: true,
                  endsAt: true,
                  startMonth: true,
                  startDay: true,
                  endMonth: true,
                  endDay: true,
                  publicLabel: true,
                },
              },
            },
          },
        },
      },
    },
  },
} satisfies Prisma.CartInclude;
export type CartRecord = Prisma.CartGetPayload<{ include: typeof cartInclude }>;
export function emptyCart() {
  return {
    items: [],
    summary: {
      distinctItemCount: 0,
      totalQuantity: '0.000',
      subtotal: '0.00',
      currency: 'RSD',
    },
    expiresAt: null,
  };
}
export function validQuantity(
  quantity: Prisma.Decimal,
  minimum: Prisma.Decimal,
  increment: Prisma.Decimal,
) {
  return (
    quantity.greaterThanOrEqualTo(minimum) &&
    quantity.minus(minimum).modulo(increment).isZero()
  );
}
export function mapCart(cart: CartRecord) {
  let total = new Prisma.Decimal(0),
    quantityTotal = new Prisma.Decimal(0);
  const items = cart.items.map((item) => {
    const v = item.variant,
      p = v.product,
      availability = evaluateAvailability({
        mode: p.availabilityMode,
        manuallyAvailable: p.isManuallyAvailable,
        variants: p.variants,
        windows: p.availabilityWindows,
      });
    const availableStock = v.stockQuantity.minus(v.reservedQuantity),
      issues: string[] = [];
    if (p.status !== 'ACTIVE') issues.push('PRODUCT_INACTIVE');
    if (!p.category.isActive) issues.push('CATEGORY_INACTIVE');
    if (!v.isActive) issues.push('VARIANT_INACTIVE');
    if (!availability.currentlyAvailable) issues.push('PRODUCT_UNAVAILABLE');
    if (!v.allowBackorder && availableStock.lessThan(item.quantity))
      issues.push('INSUFFICIENT_STOCK');
    if (
      !validQuantity(
        item.quantity,
        v.minimumPurchaseQuantity,
        v.purchaseIncrement,
      )
    )
      issues.push('INVALID_QUANTITY');
    const line = v.price.times(item.quantity),
      priceChanged = !v.price.equals(item.unitPriceAtAddition);
    total = total.plus(line);
    quantityTotal = quantityTotal.plus(item.quantity);
    return {
      id: item.id,
      quantity: item.quantity.toFixed(3),
      unitPriceAtAddition: item.unitPriceAtAddition.toFixed(2),
      currentUnitPrice: v.price.toFixed(2),
      priceChanged,
      lineTotal: line.toFixed(2),
      product: { id: p.id, name: p.name, slug: p.slug, status: p.status },
      variant: {
        id: v.id,
        name: v.name,
        sku: v.sku,
        packageAmount: v.packageAmount.toFixed(3),
        minimumPurchaseQuantity: v.minimumPurchaseQuantity.toFixed(3),
        purchaseIncrement: v.purchaseIncrement.toFixed(3),
        unit: v.measurementUnit,
      },
      image: p.images[0] ?? null,
      availability: {
        currentlyAvailable: availability.currentlyAvailable,
        inStock: availableStock.greaterThan(0),
        purchasable: availability.purchasable,
        businessReason: availability.businessReason,
        stockReason: availability.stockReason,
      },
      validation: { valid: issues.length === 0, issues },
    };
  });
  return {
    items,
    summary: {
      distinctItemCount: items.length,
      totalQuantity: quantityTotal.toFixed(3),
      subtotal: total.toFixed(2),
      currency: cart.currency,
    },
    expiresAt: cart.expiresAt.toISOString(),
  };
}
