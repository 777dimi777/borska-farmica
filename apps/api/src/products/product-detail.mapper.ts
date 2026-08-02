import { Prisma } from '../generated/prisma/client';
import {
  AvailabilityMode,
  AvailabilityWindowType,
  MeasurementUnit,
} from '../generated/prisma/enums';
import { calculateAvailability, AvailabilityWindowInput } from './availability';
import { ProductDetailResponseDto } from './dto/product-detail-response.dto';

export interface ProductDetailRecord {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  isFeatured: boolean;
  isMainProduct: boolean;
  availabilityMode: AvailabilityMode;
  isManuallyAvailable: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  category: { name: string; slug: string };
  variants: Array<{
    id: string;
    name: string;
    sku: string;
    price: Prisma.Decimal;
    compareAtPrice: Prisma.Decimal | null;
    packageAmount: Prisma.Decimal;
    measurementUnit: MeasurementUnit;
    isDefault: boolean;
    stockQuantity: Prisma.Decimal;
    reservedQuantity: Prisma.Decimal;
    allowBackorder: boolean;
  }>;
  images: Array<{
    id: string;
    url: string;
    altText: string;
    isPrimary: boolean;
    width?: number | null;
    height?: number | null;
  }>;
  availabilityWindows: Array<
    AvailabilityWindowInput & { type: AvailabilityWindowType }
  >;
}
export function mapProductDetail(
  record: ProductDetailRecord,
  referenceTime?: Date,
): ProductDetailResponseDto {
  const availability = calculateAvailability(
    {
      mode: record.availabilityMode,
      manuallyAvailable: record.isManuallyAvailable,
      variants: record.variants,
      windows: record.availabilityWindows,
    },
    referenceTime,
  );
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    shortDescription: record.shortDescription,
    description: record.description,
    featured: record.isFeatured,
    mainProduct: record.isMainProduct,
    category: record.category,
    variants: record.variants.map((variant) => {
      const inStock = variant.stockQuantity.greaterThan(
        variant.reservedQuantity,
      );
      return {
        id: variant.id,
        name: variant.name,
        sku: variant.sku,
        price: variant.price.toFixed(2),
        compareAtPrice: variant.compareAtPrice?.toFixed(2) ?? null,
        packageAmount: variant.packageAmount.toFixed(3),
        unit: variant.measurementUnit,
        default: variant.isDefault,
        inStock,
        purchasable:
          availability.currentlyAvailable &&
          (inStock || variant.allowBackorder),
      };
    }),
    images: record.images.map((image) => ({
      id: image.id,
      url: image.url,
      altText: image.altText,
      primary: image.isPrimary,
      width: image.width ?? null,
      height: image.height ?? null,
    })),
    availability,
    seo: { title: record.seoTitle, description: record.seoDescription },
  };
}
