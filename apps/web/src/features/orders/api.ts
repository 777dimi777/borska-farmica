import { browserApi } from '@/lib/browser-api/client';
import type { OrderDetail, OrdersPage, OrderStatus } from './types';
export const ordersApi = {
  list: (
    token: string,
    q: { page?: number; status?: OrderStatus; sort?: 'newest' | 'oldest' } = {},
  ) => {
    const p = new URLSearchParams({
      page: String(q.page ?? 1),
      limit: '12',
      sort: q.sort ?? 'newest',
    });
    if (q.status) p.set('status', q.status);
    return browserApi<OrdersPage>(`/account/orders?${p}`, { token });
  },
  detail: (token: string, n: string) =>
    browserApi<OrderDetail>(`/account/orders/${encodeURIComponent(n)}`, {
      token,
    }),
  cancel: (token: string, n: string, reason?: string) =>
    browserApi<OrderDetail>(`/account/orders/${encodeURIComponent(n)}/cancel`, {
      method: 'POST',
      token,
      body: reason ? { reason } : {},
    }),
};
