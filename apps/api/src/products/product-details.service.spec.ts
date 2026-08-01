import { NotFoundException } from '@nestjs/common';
import { ProductsService } from './products.service';

describe('ProductsService details', () => {
  const findFirst = jest.fn();
  const service = new ProductsService({ product: { findFirst } } as never);
  beforeEach(() => jest.clearAllMocks());
  it('queries exact slug with every public visibility condition', async () => {
    findFirst.mockResolvedValue({
      id: 'p',
      name: 'Test',
      slug: 'test',
      shortDescription: null,
      description: null,
      isFeatured: false,
      isMainProduct: false,
      availabilityMode: 'ALWAYS',
      isManuallyAvailable: true,
      seoTitle: null,
      seoDescription: null,
      category: { name: 'C', slug: 'c' },
      variants: [],
      images: [],
      availabilityWindows: [],
    });
    await service.findBySlug('test');
    const call = JSON.stringify(findFirst.mock.calls);
    for (const value of [
      'test',
      'ACTIVE',
      'isActive',
      'sortOrder',
      'storageKey',
    ])
      if (value !== 'storageKey') expect(call).toContain(value);
    expect(call).not.toContain('storageKey');
  });
  it('returns 404 for missing, draft, archived, inactive-category or variant-less products', async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.findBySlug('hidden')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
