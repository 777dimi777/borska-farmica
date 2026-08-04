import type { CancellationReason, OrderStatus, PaymentStatus } from './types';
export const orderStatusLabel: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: 'Čeka potvrdu',
  CONFIRMED: 'Potvrđena',
  PREPARING: 'U pripremi',
  READY_FOR_PICKUP: 'Spremna za preuzimanje',
  COMPLETED: 'Preuzeta',
  CANCELLED: 'Otkazana',
};
export const paymentLabel = (s: PaymentStatus) =>
  s === 'PAID' ? 'Plaćeno gotovinom' : 'Plaćanje pri preuzimanju';
export const cancellationLabel = (r: CancellationReason) =>
  r === 'CUSTOMER_REQUEST'
    ? 'Otkazali ste porudžbinu'
    : r === 'ADMIN_ACTION'
      ? 'Porudžbinu je otkazala Borska Farmica'
      : r === 'CONFIRMATION_TIMEOUT'
        ? 'Porudžbina nije potvrđena u predviđenom roku'
        : 'Porudžbina je otkazana';
export const formatBelgradeDate = (v: string) =>
  new Intl.DateTimeFormat('sr-Latn-RS', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Belgrade',
  }).format(new Date(v));
export const formatPickupDate = (v: string) =>
  new Intl.DateTimeFormat('sr-Latn-RS', {
    dateStyle: 'long',
    timeZone: 'Europe/Belgrade',
  }).format(new Date(`${v}T12:00:00Z`));
