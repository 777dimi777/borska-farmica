import { browserApi } from '@/lib/browser-api/client';
import type {
  CheckoutPayload,
  CheckoutPreview,
  CreatedOrder,
  PickupLocation,
} from './types';
export const checkoutApi = {
  pickups: () => browserApi<PickupLocation[]>('/checkout/pickup-locations'),
  preview: (token: string, payload: CheckoutPayload) =>
    browserApi<CheckoutPreview>('/checkout/preview', {
      method: 'POST',
      token,
      body: payload,
    }),
  create: (token: string, payload: CheckoutPayload, key: string) =>
    browserApi<CreatedOrder>('/checkout/orders', {
      method: 'POST',
      token,
      body: payload,
      headers: { 'Idempotency-Key': key },
    }),
};
