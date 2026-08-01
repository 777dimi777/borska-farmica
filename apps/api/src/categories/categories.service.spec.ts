import { NotFoundException } from '@nestjs/common';
import { CategoriesService } from './categories.service';

const category = {
  id: 'id',
  name: 'Name',
  slug: 'name',
  description: null,
  imageUrl: null,
  _count: { products: 1 },
};

describe('CategoriesService', () => {
  const findMany = jest.fn();
  const findFirst = jest.fn();
  const service = new CategoriesService({
    category: { findMany, findFirst },
  } as never);

  beforeEach(() => jest.clearAllMocks());

  it('queries only active categories in public order', async () => {
    findMany.mockResolvedValue([category]);
    await expect(service.findAll()).resolves.toEqual([
      {
        id: 'id',
        name: 'Name',
        slug: 'name',
        description: null,
        imageUrl: null,
        productCount: 1,
      },
    ]);
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
    );
  });

  it('counts only active products with an active variant', async () => {
    findMany.mockResolvedValue([]);
    await service.findAll();
    expect(JSON.stringify(findMany.mock.calls)).toContain('ACTIVE');
    expect(JSON.stringify(findMany.mock.calls)).toContain('isActive');
  });

  it('finds an active category using the exact slug', async () => {
    findFirst.mockResolvedValue(category);
    await expect(service.findBySlug('name')).resolves.toMatchObject({
      slug: 'name',
    });
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { slug: 'name', isActive: true } }),
    );
  });

  it('returns 404 for a missing or inactive category', async () => {
    findFirst.mockResolvedValue(null);
    await expect(service.findBySlug('missing')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
