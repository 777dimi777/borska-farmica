import { describe, expect, it } from 'vitest';
import { parseProductFilters, serializeProductFilters } from './query';
describe('admin product URL filters', () => {
  it('koristi bezbedne podrazumevane vrednosti', () =>
    expect(parseProductFilters(new URLSearchParams())).toEqual({
      page: 1,
      limit: 12,
      search: '',
      sort: 'newest',
    }));
  it('čuva backend filtere i paginaciju', () => {
    const f = parseProductFilters(
      new URLSearchParams(
        'page=2&limit=24&search=sir&status=ACTIVE&stockStatus=low_stock&featured=true&availabilityMode=SEASONAL',
      ),
    );
    expect(f).toMatchObject({
      page: 2,
      limit: 24,
      search: 'sir',
      status: 'ACTIVE',
      stockStatus: 'low_stock',
      featured: true,
      availabilityMode: 'SEASONAL',
    });
    expect(serializeProductFilters(f).get('page')).toBe('2');
  });
  it('ograničava pretragu i ne emituje default parametre', () => {
    expect(
      parseProductFilters(new URLSearchParams({ search: 'x'.repeat(140) }))
        .search,
    ).toHaveLength(120);
    expect(
      serializeProductFilters(
        parseProductFilters(new URLSearchParams()),
      ).toString(),
    ).toBe('');
  });
});
