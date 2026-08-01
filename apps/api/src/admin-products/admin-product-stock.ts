import { Prisma } from '../generated/prisma/client';
import { AdminStockStatus } from './dto/admin-product-query.dto';

export interface StockVariant {
  isActive: boolean;
  stockQuantity: Prisma.Decimal;
  reservedQuantity: Prisma.Decimal;
  lowStockThreshold: Prisma.Decimal;
  allowBackorder: boolean;
}
export function variantStockStatus(v: StockVariant): AdminStockStatus {
  const available = v.stockQuantity.minus(v.reservedQuantity);
  if (available.greaterThan(v.lowStockThreshold))
    return AdminStockStatus.IN_STOCK;
  if (available.greaterThan(0)) return AdminStockStatus.LOW_STOCK;
  return v.allowBackorder
    ? AdminStockStatus.BACKORDER
    : AdminStockStatus.OUT_OF_STOCK;
}
export function productStockStatus(variants: StockVariant[]): AdminStockStatus {
  const active = variants.filter((v) => v.isActive);
  if (active.some((v) => variantStockStatus(v) === AdminStockStatus.IN_STOCK))
    return AdminStockStatus.IN_STOCK;
  if (active.some((v) => variantStockStatus(v) === AdminStockStatus.LOW_STOCK))
    return AdminStockStatus.LOW_STOCK;
  if (active.some((v) => variantStockStatus(v) === AdminStockStatus.BACKORDER))
    return AdminStockStatus.BACKORDER;
  return AdminStockStatus.OUT_OF_STOCK;
}
