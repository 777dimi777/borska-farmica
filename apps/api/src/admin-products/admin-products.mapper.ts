/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Prisma } from '../generated/prisma/client';
import {
  AdminProductDetailDto,
  AdminProductDto,
} from './dto/admin-product-response.dto';
import { productStockStatus, variantStockStatus } from './admin-product-stock';

type RecordType = any;
const sum = (values: Prisma.Decimal[]) =>
  values.reduce((a, b) => a.plus(b), new Prisma.Decimal(0));
export function mapAdminProduct(p: RecordType): AdminProductDto {
  const active = p.variants.filter((v: RecordType) => v.isActive);
  const stock = sum(p.variants.map((v: RecordType) => v.stockQuantity));
  const reserved = sum(p.variants.map((v: RecordType) => v.reservedQuantity));
  const prices = active
    .map((v: RecordType) => v.price)
    .sort((a: Prisma.Decimal, b: Prisma.Decimal) => a.comparedTo(b));
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    status: p.status,
    featured: p.isFeatured,
    mainProduct: p.isMainProduct,
    availabilityMode: p.availabilityMode,
    manuallyAvailable: p.isManuallyAvailable,
    category: p.category,
    variantCount: p.variants.length,
    activeVariantCount: active.length,
    startingPrice: prices[0]?.toFixed(2) ?? null,
    highestPrice: prices.at(-1)?.toFixed(2) ?? null,
    stockQuantity: stock.toFixed(3),
    reservedQuantity: reserved.toFixed(3),
    availableQuantity: stock.minus(reserved).toFixed(3),
    stockStatus: productStockStatus(p.variants),
    primaryImage: p.images[0]
      ? { ...p.images[0], primary: p.images[0].isPrimary }
      : null,
    createdAt: p.createdAt,
    updatedAt: p.updatedAt,
  };
}
export function mapAdminProductDetail(p: RecordType): AdminProductDetailDto {
  return {
    ...mapAdminProduct(p),
    shortDescription: p.shortDescription,
    description: p.description,
    seoTitle: p.seoTitle,
    seoDescription: p.seoDescription,
    variants: p.variants.map((v: RecordType) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      price: v.price.toFixed(2),
      compareAtPrice: v.compareAtPrice?.toFixed(2) ?? null,
      packageAmount: v.packageAmount.toFixed(3),
      unit: v.measurementUnit,
      stockQuantity: v.stockQuantity.toFixed(3),
      reservedQuantity: v.reservedQuantity.toFixed(3),
      availableQuantity: v.stockQuantity.minus(v.reservedQuantity).toFixed(3),
      lowStockThreshold: v.lowStockThreshold.toFixed(3),
      minimumPurchaseQuantity: v.minimumPurchaseQuantity.toFixed(3),
      purchaseIncrement: v.purchaseIncrement.toFixed(3),
      allowBackorder: v.allowBackorder,
      isDefault: v.isDefault,
      isActive: v.isActive,
      sortOrder: v.sortOrder,
      stockStatus: variantStockStatus(v),
      createdAt: v.createdAt,
      updatedAt: v.updatedAt,
    })),
    images: p.images.map((x: RecordType) => ({ ...x, primary: x.isPrimary })),
    availabilityWindows: p.availabilityWindows,
  };
}
