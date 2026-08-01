import { ProductsService } from './products.service';
import { ProductSort } from './product-sort.enum';

const query = (overrides = {}) => ({
  page: 1,
  limit: 12,
  sort: ProductSort.NEWEST,
  ...overrides,
});

describe('ProductsService listing', () => {
  const count = jest.fn();
  const findMany = jest.fn();
  const prisma = {
    product: { count, findMany },
    productVariant: { fields: { reservedQuantity: 'reserved-ref' } },
    $transaction: jest.fn(async (values: Array<Promise<unknown>>) =>
      Promise.all(values),
    ),
  };
  const service = new ProductsService(prisma as never);
  beforeEach(() => {
    jest.clearAllMocks();
    count.mockResolvedValue(0);
    findMany.mockResolvedValue([]);
  });

  it('returns the pagination contract for an empty list', async () => {
    await expect(service.findAll(query())).resolves.toEqual({
      data: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
  });
  it('applies public visibility and database pagination', async () => {
    await service.findAll(query({ page: 2, limit: 5 }));
    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 }),
    );
    expect(JSON.stringify(findMany.mock.calls)).toContain('ACTIVE');
    expect(JSON.stringify(findMany.mock.calls)).toContain('isActive');
  });
  it('combines search, category and merchandising filters', async () => {
    await service.findAll(
      query({
        search: 'milk',
        category: 'dairy',
        featured: true,
        mainProduct: false,
        availabilityMode: 'MANUAL',
      }),
    );
    const calls = JSON.stringify(findMany.mock.calls);
    for (const value of [
      'milk',
      'dairy',
      'isFeatured',
      'isMainProduct',
      'MANUAL',
      'insensitive',
    ])
      expect(calls).toContain(value);
  });
  it('filters stock only when inStock is true', async () => {
    await service.findAll(query({ inStock: true }));
    expect(JSON.stringify(findMany.mock.calls)).toContain('allowBackorder');
    jest.clearAllMocks();
    count.mockResolvedValue(0);
    findMany.mockResolvedValue([]);
    await service.findAll(query({ inStock: false }));
    expect(JSON.stringify(findMany.mock.calls)).not.toContain('"OR"');
  });
  it.each([
    [ProductSort.NEWEST, 'createdAt'],
    [ProductSort.NAME_ASC, 'name'],
    [ProductSort.NAME_DESC, 'name'],
    [ProductSort.FEATURED, 'isFeatured'],
  ])('sorts %s in the database', async (sort, field) => {
    await service.findAll(query({ sort }));
    expect(JSON.stringify(findMany.mock.calls)).toContain(field);
  });
});
