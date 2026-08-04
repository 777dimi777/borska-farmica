const date = /^\d{4}-\d{2}-\d{2}$/;
const valid = (x: string | null) =>
  x && date.test(x) && !Number.isNaN(Date.parse(x + 'T12:00:00Z'))
    ? x
    : undefined;
const range = (a: string | undefined, b: string | undefined) =>
  a && b && a > b ? [undefined, undefined] : [a, b];
export type CustomerFilters = {
  page: number;
  limit: 12 | 24 | 48;
  search: string;
  status?: 'ACTIVE' | 'DISABLED';
  createdFrom?: string;
  createdTo?: string;
  lastOrderFrom?: string;
  lastOrderTo?: string;
  sort:
    | 'newest'
    | 'oldest'
    | 'name_asc'
    | 'name_desc'
    | 'last_order_desc'
    | 'total_spent_desc';
};
const customerSorts = [
  'newest',
  'oldest',
  'name_asc',
  'name_desc',
  'last_order_desc',
  'total_spent_desc',
] as const;
export function parseCustomerFilters(p: URLSearchParams): CustomerFilters {
  const [createdFrom, createdTo] = range(
      valid(p.get('createdFrom')),
      valid(p.get('createdTo')),
    ),
    [lastOrderFrom, lastOrderTo] = range(
      valid(p.get('lastOrderFrom')),
      valid(p.get('lastOrderTo')),
    ),
    page = Number(p.get('page')),
    limit = Number(p.get('limit')),
    status = ['ACTIVE', 'DISABLED'].includes(p.get('status') ?? '')
      ? (p.get('status') as CustomerFilters['status'])
      : undefined,
    sort = customerSorts.includes(
      p.get('sort') as (typeof customerSorts)[number],
    )
      ? (p.get('sort') as CustomerFilters['sort'])
      : 'newest';
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: [12, 24, 48].includes(limit) ? (limit as 12 | 24 | 48) : 12,
    search: (p.get('search') ?? '').trim().slice(0, 120),
    status,
    createdFrom,
    createdTo,
    lastOrderFrom,
    lastOrderTo,
    sort,
  };
}
export function serializeCustomerFilters(f: CustomerFilters) {
  const q = new URLSearchParams();
  if (f.page > 1) q.set('page', String(f.page));
  if (f.limit !== 12) q.set('limit', String(f.limit));
  for (const k of [
    'search',
    'status',
    'createdFrom',
    'createdTo',
    'lastOrderFrom',
    'lastOrderTo',
  ] as const)
    if (f[k]) q.set(k, f[k]!);
  if (f.sort !== 'newest') q.set('sort', f.sort);
  return q;
}
export type AuditFilters = {
  page: number;
  limit: 12 | 24 | 48;
  adminId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  createdFrom?: string;
  createdTo?: string;
  search: string;
  sort: 'newest' | 'oldest';
};
export function parseAuditFilters(p: URLSearchParams): AuditFilters {
  const [createdFrom, createdTo] = range(
      valid(p.get('createdFrom')),
      valid(p.get('createdTo')),
    ),
    page = Number(p.get('page')),
    limit = Number(p.get('limit'));
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: [12, 24, 48].includes(limit) ? (limit as 12 | 24 | 48) : 12,
    adminId: p.get('adminId') || undefined,
    resourceId: p.get('resourceId') || undefined,
    action: (p.get('action') ?? '').trim().slice(0, 100),
    resourceType: (p.get('resourceType') ?? '').trim().slice(0, 80),
    search: (p.get('search') ?? '').trim().slice(0, 120),
    createdFrom,
    createdTo,
    sort: p.get('sort') === 'oldest' ? 'oldest' : 'newest',
  };
}
export function serializeAuditFilters(f: AuditFilters) {
  const q = new URLSearchParams();
  if (f.page > 1) q.set('page', String(f.page));
  if (f.limit !== 12) q.set('limit', String(f.limit));
  for (const k of [
    'adminId',
    'action',
    'resourceType',
    'resourceId',
    'createdFrom',
    'createdTo',
    'search',
  ] as const)
    if (f[k]) q.set(k, f[k]!);
  if (f.sort === 'oldest') q.set('sort', 'oldest');
  return q;
}
export const operationKeys = {
  all: ['admin-operations'] as const,
  customers: ['admin-operations', 'customers'] as const,
  customerList: (q: string) =>
    ['admin-operations', 'customers', 'list', q] as const,
  customer: (id: string) =>
    ['admin-operations', 'customers', 'detail', id] as const,
  orders: (id: string, q: string) =>
    ['admin-operations', 'customers', id, 'orders', q] as const,
  audits: ['admin-operations', 'audit'] as const,
  auditList: (q: string) => ['admin-operations', 'audit', 'list', q] as const,
  audit: (id: string) => ['admin-operations', 'audit', 'detail', id] as const,
};
