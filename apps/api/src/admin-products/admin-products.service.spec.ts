/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { NotFoundException } from '@nestjs/common';
import { AdminProductsService } from './admin-products.service';
import {
  AdminProductSort,
  AdminProductStatus,
  AdminStockStatus,
} from './dto/admin-product-query.dto';
describe('AdminProductsService queries', () => {
  const count = jest.fn().mockResolvedValue(0),
    findMany = jest.fn().mockResolvedValue([]),
    findUnique = jest.fn(),
    raw = jest.fn().mockResolvedValue([]);
  const prisma = {
    product: { count, findMany, findUnique },
    $queryRaw: raw,
    $transaction: jest.fn(async (x: Promise<unknown>[]) => Promise.all(x)),
  };
  const service = new AdminProductsService(prisma as never);
  beforeEach(() => jest.clearAllMocks());
  it('builds database filters for name/slug/SKU and all scalar filters', async () => {
    await service.findAll({
      page: 2,
      limit: 5,
      search: 'milk',
      categoryId: '00000000-0000-4000-8000-000000000001',
      status: AdminProductStatus.ARCHIVED,
      featured: true,
      mainProduct: false,
      availabilityMode: 'MANUAL',
      stockStatus: AdminStockStatus.ALL,
      sort: AdminProductSort.UPDATED_DESC,
    });
    const call = findMany.mock.calls[0][0];
    expect(call).toMatchObject({
      skip: 5,
      take: 5,
      orderBy: [{ updatedAt: 'desc' }, { id: 'asc' }],
    });
    const json = JSON.stringify(call.where);
    expect(json).toContain('variants');
    expect(json).toContain('sku');
    expect(json).toContain('insensitive');
    expect(json).toContain('ARCHIVED');
  });
  it.each([
    AdminProductSort.NEWEST,
    AdminProductSort.OLDEST,
    AdminProductSort.NAME_ASC,
    AdminProductSort.NAME_DESC,
    AdminProductSort.STATUS,
  ])('sorts %s in database', async (sort) => {
    await service.findAll({
      page: 1,
      limit: 12,
      status: AdminProductStatus.ALL,
      stockStatus: AdminStockStatus.ALL,
      sort,
    });
    expect(findMany.mock.calls[0][0].orderBy).toBeDefined();
  });
  it('uses a database stock predicate before pagination', async () => {
    raw.mockResolvedValueOnce([{ id: '00000000-0000-4000-8000-000000000001' }]);
    await service.findAll({
      page: 1,
      limit: 12,
      status: AdminProductStatus.ALL,
      stockStatus: AdminStockStatus.LOW_STOCK,
      sort: AdminProductSort.NEWEST,
    });
    expect(raw).toHaveBeenCalledTimes(1);
    expect(findMany.mock.calls[0][0].where.id.in).toHaveLength(1);
  });
  it('returns 404 for an unknown UUID', async () => {
    findUnique.mockResolvedValueOnce(null);
    await expect(
      service.findOne('00000000-0000-4000-8000-000000000001'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
