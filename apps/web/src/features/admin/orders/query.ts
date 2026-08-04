import type { AdminOrderSort, OrderStatus, PaymentStatus } from './types';
export const ORDER_STATUSES = [
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
  'COMPLETED',
  'CANCELLED',
] as const;
export const PAYMENT_STATUSES = ['UNPAID', 'PAID'] as const;
export const ORDER_SORTS = [
  'newest',
  'oldest',
  'pickup_date',
  'status',
] as const;
export type OrderFilters = {
  page: number;
  limit: 12 | 24 | 48;
  search: string;
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  pickupLocationId?: string;
  requestedPickupDateFrom?: string;
  requestedPickupDateTo?: string;
  createdAtFrom?: string;
  createdAtTo?: string;
  sort: AdminOrderSort;
};
const date = /^\d{4}-\d{2}-\d{2}$/;
const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validDate = (v: string | null) =>
  v && date.test(v) && !Number.isNaN(Date.parse(`${v}T12:00:00Z`))
    ? v
    : undefined;
export function parseOrderFilters(input: URLSearchParams): OrderFilters {
  const rawPage = Number(input.get('page'));
  const rawLimit = Number(input.get('limit'));
  const search = (input.get('search') ?? '').trim().slice(0, 120);
  const status = ORDER_STATUSES.includes(input.get('status') as OrderStatus)
    ? (input.get('status') as OrderStatus)
    : undefined;
  const paymentStatus = PAYMENT_STATUSES.includes(
    input.get('paymentStatus') as PaymentStatus,
  )
    ? (input.get('paymentStatus') as PaymentStatus)
    : undefined;
  const pickup = input.get('pickupLocationId');
  let requestedPickupDateFrom = validDate(input.get('requestedPickupDateFrom')),
    requestedPickupDateTo = validDate(input.get('requestedPickupDateTo')),
    createdAtFrom = validDate(input.get('createdAtFrom')),
    createdAtTo = validDate(input.get('createdAtTo'));
  if (
    requestedPickupDateFrom &&
    requestedPickupDateTo &&
    requestedPickupDateFrom > requestedPickupDateTo
  ) {
    requestedPickupDateFrom = undefined;
    requestedPickupDateTo = undefined;
  }
  if (createdAtFrom && createdAtTo && createdAtFrom > createdAtTo) {
    createdAtFrom = undefined;
    createdAtTo = undefined;
  }
  return {
    page: Number.isInteger(rawPage) && rawPage > 0 ? rawPage : 1,
    limit: [12, 24, 48].includes(rawLimit) ? (rawLimit as 12 | 24 | 48) : 12,
    search,
    status,
    paymentStatus,
    pickupLocationId: pickup && uuid.test(pickup) ? pickup : undefined,
    requestedPickupDateFrom,
    requestedPickupDateTo,
    createdAtFrom,
    createdAtTo,
    sort: ORDER_SORTS.includes(input.get('sort') as AdminOrderSort)
      ? (input.get('sort') as AdminOrderSort)
      : 'newest',
  };
}
export function serializeOrderFilters(f: OrderFilters) {
  const q = new URLSearchParams();
  if (f.page > 1) q.set('page', String(f.page));
  if (f.limit !== 12) q.set('limit', String(f.limit));
  if (f.search) q.set('search', f.search);
  for (const key of [
    'status',
    'paymentStatus',
    'pickupLocationId',
    'requestedPickupDateFrom',
    'requestedPickupDateTo',
    'createdAtFrom',
    'createdAtTo',
  ] as const)
    if (f[key]) q.set(key, f[key]!);
  if (f.sort !== 'newest') q.set('sort', f.sort);
  return q;
}
export function updateOrderFilters(
  current: OrderFilters,
  patch: Partial<OrderFilters>,
  resetPage = true,
) {
  return serializeOrderFilters({
    ...current,
    ...patch,
    page: resetPage ? 1 : (patch.page ?? current.page),
  });
}
export const adminOrderKeys = {
  all: ['admin-orders'] as const,
  lists: () => ['admin-orders', 'list'] as const,
  list: (f: OrderFilters) =>
    ['admin-orders', 'list', serializeOrderFilters(f).toString()] as const,
  details: () => ['admin-orders', 'detail'] as const,
  detail: (id: string) => ['admin-orders', 'detail', id] as const,
};
