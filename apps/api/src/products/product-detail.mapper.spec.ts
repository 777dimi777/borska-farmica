import { Prisma } from '../generated/prisma/client';
import { AvailabilityMode, MeasurementUnit } from '../generated/prisma/enums';
import { mapProductDetail, ProductDetailRecord } from './product-detail.mapper';

const d = (value: string) => new Prisma.Decimal(value);
const record = (): ProductDetailRecord => ({
  id: 'p',
  name: 'Test',
  slug: 'test',
  shortDescription: null,
  description: 'Full',
  isFeatured: true,
  isMainProduct: false,
  availabilityMode: AvailabilityMode.ALWAYS,
  isManuallyAvailable: true,
  seoTitle: null,
  seoDescription: null,
  category: { name: 'Category', slug: 'category' },
  variants: [
    {
      id: 'v',
      name: '1 l',
      sku: 'TEST-1',
      price: d('250'),
      compareAtPrice: null,
      packageAmount: d('1'),
      measurementUnit: MeasurementUnit.LITER,
      isDefault: true,
      stockQuantity: d('1'),
      reservedQuantity: d('0'),
      allowBackorder: false,
    },
  ],
  images: [
    {
      id: 'i',
      url: 'https://example.test/i.jpg',
      altText: 'Test',
      isPrimary: true,
    },
  ],
  availabilityWindows: [],
});

describe('mapProductDetail', () => {
  it('formats money and package quantity as fixed strings', () =>
    expect(mapProductDetail(record()).variants[0]).toMatchObject({
      price: '250.00',
      packageAmount: '1.000',
      compareAtPrice: null,
    }));
  it('does not expose internal stock quantities or storage fields', () => {
    const json = JSON.stringify(mapProductDetail(record()));
    expect(json).not.toContain('stockQuantity');
    expect(json).not.toContain('reservedQuantity');
    expect(json).not.toContain('storageKey');
  });
  it('maps sorted public images and computed availability', () =>
    expect(
      mapProductDetail(record(), new Date('2026-01-01T12:00:00Z')),
    ).toMatchObject({
      images: [{ id: 'i', primary: true }],
      availability: {
        currentlyAvailable: true,
        inStock: true,
        purchasable: true,
      },
    }));
});
