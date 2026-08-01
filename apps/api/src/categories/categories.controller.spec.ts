import { CategoriesController } from './categories.controller';

describe('CategoriesController', () => {
  it('delegates listing and slug lookup to the service', async () => {
    const service = {
      findAll: jest.fn().mockResolvedValue([]),
      findBySlug: jest.fn().mockResolvedValue({ slug: 'name' }),
    };
    const controller = new CategoriesController(service as never);
    await expect(controller.findAll()).resolves.toEqual([]);
    await expect(controller.findBySlug({ slug: 'name' })).resolves.toEqual({
      slug: 'name',
    });
    expect(service.findBySlug).toHaveBeenCalledWith('name');
  });
});
