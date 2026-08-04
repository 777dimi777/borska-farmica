import { describe, expect, it } from 'vitest';
import { catalogHref, parseCatalogQuery, serializeCatalogQuery } from './query';
describe('catalog query', () => {
  it('defaults', () =>
    expect(parseCatalogQuery({})).toEqual({
      page: 1,
      limit: 12,
      sort: 'featured',
    }));
  it('valid query', () =>
    expect(
      parseCatalogQuery({
        page: '2',
        limit: '24',
        search: [' sir ', 'x'],
        category: 'mlecni',
        sort: 'name_asc',
        availabilityMode: 'SEASONAL',
        inStock: 'true',
      }),
    ).toMatchObject({
      page: 2,
      limit: 24,
      search: 'sir',
      category: 'mlecni',
      sort: 'name_asc',
      availabilityMode: 'SEASONAL',
      inStock: true,
    }));
  it('normalizuje invalid', () =>
    expect(
      parseCatalogQuery({
        page: '-2',
        limit: '99',
        sort: 'price',
        availabilityMode: 'BAD',
      }),
    ).toEqual({ page: 1, limit: 48, sort: 'featured' }));
  it('empty/long search', () => {
    expect(parseCatalogQuery({ search: ' ' })).not.toHaveProperty('search');
    expect(parseCatalogQuery({ search: 'x'.repeat(120) }).search).toHaveLength(
      100,
    );
  });
  it('reset page on filter', () =>
    expect(catalogHref({ page: 5, sort: 'featured' }, { featured: true })).toBe(
      '/proizvodi?featured=true',
    ));
  it('preserves filter on page', () =>
    expect(
      catalogHref(
        { page: 1, category: 'sir', sort: 'name_asc' },
        { page: 3 },
        false,
      ),
    ).toBe('/proizvodi?page=3&category=sir&sort=name_asc'));
  it('skips defaults', () =>
    expect(
      serializeCatalogQuery({
        page: 1,
        limit: 12,
        sort: 'featured',
      }).toString(),
    ).toBe(''));
});
