import { describe, expect, it } from 'vitest';
import {
  parseOrderFilters,
  serializeOrderFilters,
  updateOrderFilters,
} from './query';
describe('admin order URL filters', () => {
  it('ima bezbedne default vrednosti', () =>
    expect(parseOrderFilters(new URLSearchParams())).toEqual({
      page: 1,
      limit: 12,
      search: '',
      sort: 'newest',
    }));
  it('parsira sve stvarne backend filtere', () => {
    const f = parseOrderFilters(
      new URLSearchParams(
        'page=3&limit=24&search=BF-1&status=CONFIRMED&paymentStatus=UNPAID&pickupLocationId=00000000-0000-4000-8000-000000000001&requestedPickupDateFrom=2026-08-01&requestedPickupDateTo=2026-08-08&createdAtFrom=2026-07-01&createdAtTo=2026-08-01&sort=pickup_date',
      ),
    );
    expect(f.page).toBe(3);
    expect(f.status).toBe('CONFIRMED');
    expect(f.pickupLocationId).toBeTruthy();
    expect(f.sort).toBe('pickup_date');
  });
  it('normalizuje nevalidne enum vrednosti', () => {
    const f = parseOrderFilters(
      new URLSearchParams('status=HACKED&paymentStatus=CARD&sort=random'),
    );
    expect(f.status).toBeUndefined();
    expect(f.paymentStatus).toBeUndefined();
    expect(f.sort).toBe('newest');
  });
  it('normalizuje page, limit i UUID', () => {
    const f = parseOrderFilters(
      new URLSearchParams('page=-2&limit=999&pickupLocationId=nope'),
    );
    expect(f.page).toBe(1);
    expect(f.limit).toBe(12);
    expect(f.pickupLocationId).toBeUndefined();
  });
  it('odbacuje obrnut period', () => {
    const f = parseOrderFilters(
      new URLSearchParams('createdAtFrom=2026-08-10&createdAtTo=2026-08-01'),
    );
    expect(f.createdAtFrom).toBeUndefined();
    expect(f.createdAtTo).toBeUndefined();
  });
  it('trimuje i ograničava search', () =>
    expect(
      parseOrderFilters(
        new URLSearchParams({ search: `  ${'x'.repeat(150)}  ` }),
      ).search,
    ).toHaveLength(120));
  it('promena filtera vraća page na 1 i čuva ostalo', () => {
    const f = parseOrderFilters(
      new URLSearchParams('page=4&status=CONFIRMED&sort=oldest'),
    );
    const q = updateOrderFilters(f, { paymentStatus: 'PAID' });
    expect(q.get('page')).toBeNull();
    expect(q.get('status')).toBe('CONFIRMED');
    expect(q.get('sort')).toBe('oldest');
  });
  it('promena stranice čuva filtere', () => {
    const f = parseOrderFilters(
      new URLSearchParams('status=PREPARING&search=Ana'),
    );
    const q = updateOrderFilters(f, { page: 2 }, false);
    expect(q.toString()).toContain('page=2');
    expect(q.get('status')).toBe('PREPARING');
    expect(q.get('search')).toBe('Ana');
  });
  it('serializer ne emituje default vrednosti', () =>
    expect(
      serializeOrderFilters(
        parseOrderFilters(new URLSearchParams()),
      ).toString(),
    ).toBe(''));
});
