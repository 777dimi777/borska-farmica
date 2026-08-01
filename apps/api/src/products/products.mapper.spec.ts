import { Prisma } from '../generated/prisma/client';
import { AvailabilityMode } from '../generated/prisma/enums';
import { mapProductListItem, ProductListRecord } from './products.mapper';

const decimal = (value: string) => new Prisma.Decimal(value);
const record = (
  overrides: Partial<ProductListRecord> = {},
): ProductListRecord => ({
  id: 'id',
  name: 'Milk',
  slug: 'milk',
  shortDescription: null,
  isFeatured: false,
  isMainProduct: false,
  availabilityMode: AvailabilityMode.ALWAYS,
  isManuallyAvailable: true,
  category: { name: 'Dairy', slug: 'dairy' },
  variants: [
    {
      price: decimal('850'),
      stockQuantity: decimal('2'),
      reservedQuantity: decimal('1'),
      allowBackorder: false,
    },
  ],
  images: [{ url: 'https://example.test/image.jpg', altText: 'Milk' }],
  availabilityWindows: [],
  ...overrides,
});

describe('mapProductListItem', () => {
  it('formats Decimal price and omits internal stock fields', () => {
    const result = mapProductListItem(record());
    expect(result.startingPrice).toBe('850.00');
    expect(result).not.toHaveProperty('stockQuantity');
    expect(JSON.stringify(result)).not.toContain('reservedQuantity');
  });
  it('uses the selected primary image', () =>
    expect(mapProductListItem(record()).primaryImage).toEqual({
      url: 'https://example.test/image.jpg',
      altText: 'Milk',
    }));
  it('returns null without an image', () =>
    expect(mapProductListItem(record({ images: [] })).primaryImage).toBeNull());
  it('marks fully reserved stock unavailable', () => {
    const variant = {
      price: decimal('1'),
      stockQuantity: decimal('2'),
      reservedQuantity: decimal('2'),
      allowBackorder: false,
    };
    expect(
      mapProductListItem(record({ variants: [variant] })).availability.inStock,
    ).toBe(false);
  });
  it('allows backorder without available physical stock', () => {
    const variant = {
      price: decimal('1'),
      stockQuantity: decimal('0'),
      reservedQuantity: decimal('0'),
      allowBackorder: true,
    };
    expect(
      mapProductListItem(record({ variants: [variant] })).availability
        .purchasable,
    ).toBe(true);
  });
  it('honors manual availability', () =>
    expect(
      mapProductListItem(
        record({
          availabilityMode: AvailabilityMode.MANUAL,
          isManuallyAvailable: false,
        }),
      ).availability.currentlyAvailable,
    ).toBe(false));
});
