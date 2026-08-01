import { ProductsController } from './products.controller';
import { ProductSort } from './product-sort.enum';

describe('ProductsController', () => {
  it('delegates the validated query', async () => {
    const service = { findAll: jest.fn().mockResolvedValue({ data: [] }) };
    const controller = new ProductsController(service as never);
    const query = { page: 1, limit: 12, sort: ProductSort.NEWEST };
    await controller.findAll(query);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });
});
