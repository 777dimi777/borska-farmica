import { Prisma } from '../generated/prisma/client';
import { AvailabilityMode } from '../generated/prisma/enums';
import { calculateAvailability, AvailabilityWindowInput } from './availability';
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
    name: string;
    price: DecimalValue;
    stockQuantity: DecimalValue;
    reservedQuantity: DecimalValue;
    allowBackorder: boolean;
  }>;
  images: Array<{
    url: string;
    altText: string;
    width?: number | null;
    height?: number | null;
  }>;
  availabilityWindows: AvailabilityWindowInput[];
}

export function mapProductListItem(
  record: ProductListRecord,
  referenceTime?: Date,
): ProductListItemDto {
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
    featured: record.isFeatured,
    mainProduct: record.isMainProduct,
    category: record.category,
    primaryImage: record.images[0]
      ? {
          ...record.images[0],
          width: record.images[0].width ?? null,
          height: record.images[0].height ?? null,
        }
      : null,
    packageLabel: record.variants[0].name,
    startingPrice: record.variants[0].price.toFixed(2),
    availability,
  };
}
