import { Prisma } from '../generated/prisma/client';
import { mapAdminProduct } from './admin-products.mapper';
const d = (x: string) => new Prisma.Decimal(x);
describe('admin product mapper', () => {
  it('returns precise decimal strings and aggregates stock without floats', () => {
    const result = mapAdminProduct({
      id: '1',
      name: 'P',
      slug: 'p',
      status: 'DRAFT',
      isFeatured: false,
      isMainProduct: false,
      availabilityMode: 'ALWAYS',
      isManuallyAvailable: true,
      category: { id: '2', name: 'C', slug: 'c', isActive: true },
      variants: [
        {
          price: d('10.10'),
          stockQuantity: d('2.125'),
          reservedQuantity: d('0.125'),
          lowStockThreshold: d('1'),
          allowBackorder: false,
          isActive: true,
        },
        {
          price: d('20.20'),
          stockQuantity: d('3.000'),
          reservedQuantity: d('1.000'),
          lowStockThreshold: d('0'),
          allowBackorder: false,
          isActive: true,
        },
      ],
      images: [],
      createdAt: new Date(0),
      updatedAt: new Date(0),
    } as never);
    expect(result).toMatchObject({
      startingPrice: '10.10',
      highestPrice: '20.20',
      stockQuantity: '5.125',
      reservedQuantity: '1.125',
      availableQuantity: '4.000',
      variantCount: 2,
      activeVariantCount: 2,
    });
    expect(JSON.stringify(result)).not.toContain('password');
  });
});
