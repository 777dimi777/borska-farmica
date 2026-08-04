import { browserApi } from '@/lib/browser-api/client';
import type {
  AdminOrderDetail,
  AdminOrdersPage,
  PickupLocation,
  TransitionInput,
} from './types';
export const adminOrdersApi = {
  list: (token: string, query: string) =>
    browserApi<AdminOrdersPage>(`/admin/orders${query ? `?${query}` : ''}`, {
      token,
    }),
  detail: (token: string, id: string) =>
    browserApi<AdminOrderDetail>(`/admin/orders/${encodeURIComponent(id)}`, {
      token,
    }),
  transition: (token: string, id: string, body: TransitionInput) =>
    browserApi<AdminOrderDetail>(
      `/admin/orders/${encodeURIComponent(id)}/transitions`,
      { method: 'POST', token, body },
    ),
  pickupLocations: (token: string) =>
    browserApi<PickupLocation[]>('/checkout/pickup-locations', { token }),
};
