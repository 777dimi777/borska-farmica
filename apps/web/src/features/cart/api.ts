import { browserApi } from '@/lib/browser-api/client';
import type { Cart } from './types';
export const cartApi = {
  get: () => browserApi<Cart>('/cart'),
  add: (x: { variantId: string; quantity: string }) =>
    browserApi<Cart>('/cart/items', { method: 'POST', body: x }),
  update: (id: string, quantity: string) =>
    browserApi<Cart>(`/cart/items/${id}`, {
      method: 'PATCH',
      body: { quantity },
    }),
  remove: (id: string) =>
    browserApi<void>(`/cart/items/${id}`, { method: 'DELETE' }),
  clear: () => browserApi<void>('/cart/items', { method: 'DELETE' }),
};
