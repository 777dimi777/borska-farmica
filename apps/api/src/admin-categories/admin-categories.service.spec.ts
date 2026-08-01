import { AdminCategoriesService } from './admin-categories.service';
import {
  AdminCategorySort,
  AdminCategoryStatus,
} from './dto/admin-category-query.dto';
describe('AdminCategoriesService', () => {
  const count = jest.fn().mockResolvedValue(0),
    findMany = jest.fn().mockResolvedValue([]),
    findUnique = jest.fn(),
    groupBy = jest.fn().mockResolvedValue([]);
  const p = {
    category: { count, findMany, findUnique },
    product: { groupBy },
    $transaction: jest.fn(async (x: Promise<unknown>[]) => Promise.all(x)),
  };
  const s = new AdminCategoriesService(p as never, { write: jest.fn() });
  beforeEach(() => jest.clearAllMocks());
  it('paginates, filters inactive, searches and sorts in database', async () => {
    await s.findAll({
      page: 2,
      limit: 5,
      status: AdminCategoryStatus.INACTIVE,
      sort: AdminCategorySort.NAME_DESC,
      search: ' test ',
    });
    expect(JSON.stringify(findMany.mock.calls)).toContain('insensitive');
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
        orderBy: [{ name: 'desc' }],
      }),
    );
  });
  it('selects counts without loading products', async () => {
    await s.findAll({
      page: 1,
      limit: 12,
      status: AdminCategoryStatus.ALL,
      sort: AdminCategorySort.SORT_ORDER,
    });
    const json = JSON.stringify(findMany.mock.calls);
    expect(json).toContain('products');
    expect(json).not.toContain('include');
    expect(JSON.stringify(groupBy.mock.calls)).toContain('"status":"ACTIVE"');
  });
});
