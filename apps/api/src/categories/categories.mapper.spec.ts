import { mapCategory } from './categories.mapper';

describe('mapCategory', () => {
  it('returns only public fields', () => {
    const result = mapCategory({
      id: 'id',
      name: 'Name',
      slug: 'name',
      description: null,
      imageUrl: null,
      _count: { products: 2 },
    });
    expect(result).toEqual({
      id: 'id',
      name: 'Name',
      slug: 'name',
      description: null,
      imageUrl: null,
      productCount: 2,
    });
    expect(result).not.toHaveProperty('isActive');
    expect(result).not.toHaveProperty('_count');
  });
});
