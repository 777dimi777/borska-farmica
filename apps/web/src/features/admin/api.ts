import { browserApi } from '@/lib/browser-api/client';
import type {
  AdminAuthResponse,
  AdminProfile,
  Attention,
  CategorySales,
  InventoryAlerts,
  InventorySummary,
  OrderFlow,
  OrdersByStatus,
  Overview,
  PickupSales,
  RecentOrders,
  RevenueSeries,
  Seasonal,
  TopProducts,
} from './types';
const path = (name: string, query = '') =>
  `/admin/dashboard/${name}${query ? `?${query}` : ''}`;
export const adminAuthApi = {
  login: (body: { email: string; password: string }) =>
    browserApi<AdminAuthResponse>('/admin/auth/login', {
      method: 'POST',
      body,
    }),
  refresh: () =>
    browserApi<AdminAuthResponse>('/admin/auth/refresh', { method: 'POST' }),
  logout: () => browserApi<void>('/admin/auth/logout', { method: 'POST' }),
  me: (token: string) => browserApi<AdminProfile>('/admin/auth/me', { token }),
};
export const dashboardApi = {
  overview: (t: string, q: string) =>
    browserApi<Overview>(path('overview', q), { token: t }),
  revenue: (t: string, q: string) =>
    browserApi<RevenueSeries>(path('revenue-series', q), { token: t }),
  statuses: (t: string, q: string) =>
    browserApi<OrdersByStatus>(path('orders-by-status', q), { token: t }),
  flow: (t: string, q: string) =>
    browserApi<OrderFlow>(path('order-flow', q), { token: t }),
  products: (t: string, q: string) =>
    browserApi<TopProducts>(path('top-products', q), { token: t }),
  categories: (t: string, q: string) =>
    browserApi<CategorySales>(path('category-sales', q), { token: t }),
  pickups: (t: string, q: string) =>
    browserApi<PickupSales>(path('pickup-sales', q), { token: t }),
  alerts: (t: string) =>
    browserApi<InventoryAlerts>(path('inventory-alerts', 'status=all'), {
      token: t,
    }),
  inventory: (t: string) =>
    browserApi<InventorySummary>(path('inventory-summary'), { token: t }),
  seasonal: (t: string) =>
    browserApi<Seasonal>(path('seasonal', 'horizon=60'), { token: t }),
  recent: (t: string) =>
    browserApi<RecentOrders>(path('recent-orders', 'limit=10'), { token: t }),
  attention: (t: string) =>
    browserApi<Attention>(path('attention'), { token: t }),
};
