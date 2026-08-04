import { describe, expect, it } from 'vitest';
import {
  parseAuditFilters,
  parseCustomerFilters,
  serializeCustomerFilters,
} from './query';
describe('customer filters', () => {
  it('normalizuje enum, page, limit i date range', () => {
    const x = parseCustomerFilters(
      new URLSearchParams(
        'page=-1&limit=99&status=HACK&sort=nope&createdFrom=2026-09-01&createdTo=2026-08-01',
      ),
    );
    expect(x).toEqual({
      page: 1,
      limit: 12,
      search: '',
      sort: 'newest',
      status: undefined,
      createdFrom: undefined,
      createdTo: undefined,
      lastOrderFrom: undefined,
      lastOrderTo: undefined,
    });
  });
  it('čuva validne filtere i paginaciju', () => {
    const x = parseCustomerFilters(
      new URLSearchParams(
        'page=2&limit=24&status=DISABLED&sort=total_spent_desc&search=Ana',
      ),
    );
    expect(serializeCustomerFilters(x).toString()).toContain('status=DISABLED');
    expect(x.page).toBe(2);
  });
});
describe('audit filters', () => {
  it('ograničava tekst i normalizuje sort', () => {
    const x = parseAuditFilters(
      new URLSearchParams({ search: 'x'.repeat(150), sort: 'bad' }),
    );
    expect(x.search).toHaveLength(120);
    expect(x.sort).toBe('newest');
  });
});
