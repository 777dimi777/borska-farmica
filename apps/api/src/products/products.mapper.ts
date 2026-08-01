import { Prisma } from '../generated/prisma/client';
import { AvailabilityMode } from '../generated/prisma/enums';
import { ProductListItemDto } from './dto/product-response.dto';

type DecimalValue = Prisma.Decimal;
export interface ProductListRecord {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  isFeatured: boolean;
  isMainProduct: boolean;
  availabilityMode: AvailabilityMode;
  isManuallyAvailable: boolean;
  category: { name: string; slug: string };
  variants: Array<{
    price: DecimalValue;
    stockQuantity: DecimalValue;
    reservedQuantity: DecimalValue;
    allowBackorder: boolean;
  }>;
  images: Array<{ url: string; altText: string }>;
  availabilityWindows: Array<{ publicLabel: string | null }>;
}

export function mapProductListItem(
  record: ProductListRecord,
): ProductListItemDto {
  const sellableVariant = record.variants.some(
    (variant) =>
      variant.allowBackorder ||
      variant.stockQuantity.greaterThan(variant.reservedQuantity),
  );
  const currentlyAvailable =
    record.availabilityMode === AvailabilityMode.ALWAYS ||
    (record.availabilityMode === AvailabilityMode.MANUAL &&
      record.isManuallyAvailable) ||
    (record.availabilityMode === AvailabilityMode.SEASONAL &&
      record.availabilityWindows.length > 0);
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    shortDescription: record.shortDescription,
    featured: record.isFeatured,
    mainProduct: record.isMainProduct,
    category: record.category,
    primaryImage: record.images[0] ?? null,
    startingPrice: record.variants[0].price.toFixed(2),
    availability: {
      mode: record.availabilityMode,
      currentlyAvailable,
      inStock: sellableVariant,
      purchasable: currentlyAvailable && sellableVariant,
      label: record.availabilityWindows[0]?.publicLabel ?? null,
    },
  };
}
