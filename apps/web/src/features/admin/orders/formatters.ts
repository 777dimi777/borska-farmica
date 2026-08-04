import type { OrderStatus, PaymentStatus } from './types';
export const statusLabel: Record<OrderStatus, string> = {
  PENDING_CONFIRMATION: 'Čeka potvrdu',
  CONFIRMED: 'Potvrđena',
  PREPARING: 'U pripremi',
  READY_FOR_PICKUP: 'Spremna za preuzimanje',
  COMPLETED: 'Završena',
  CANCELLED: 'Otkazana',
};
export const paymentStatusLabel: Record<PaymentStatus, string> = {
  UNPAID: 'Nije plaćeno',
  PAID: 'Plaćeno gotovinom',
};
export const formatRsd = (v: string) =>
  new Intl.NumberFormat('sr-Latn-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 2,
  }).format(Number(v));
export const formatDateTime = (v: string) =>
  new Intl.DateTimeFormat('sr-Latn-RS', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Belgrade',
  }).format(new Date(v));
export const formatDate = (v: string) =>
  new Intl.DateTimeFormat('sr-Latn-RS', {
    dateStyle: 'medium',
    timeZone: 'Europe/Belgrade',
  }).format(new Date(`${v.slice(0, 10)}T12:00:00Z`));
export const eventLabel = (type: string) =>
  (
    ({
      'order.created': 'Porudžbina je kreirana',
      'order.confirmed': 'Admin je potvrdio porudžbinu',
      'order.preparing': 'Priprema je započeta',
      'order.ready_for_pickup': 'Porudžbina je spremna za preuzimanje',
      'order.completed': 'Porudžbina je preuzeta i plaćena',
      'order.cancelled_by_customer': 'Kupac je otkazao porudžbinu',
      'order.cancelled_by_admin': 'Admin je otkazao porudžbinu',
      'order.cancelled_by_timeout':
        'Sistem je otkazao porudžbinu zbog isteka roka',
      'reservation.created': 'Zaliha je rezervisana',
      'reservation.released': 'Rezervacija je oslobođena',
      'reservation.consumed': 'Rezervacija je potrošena',
      'payment.marked_paid': 'Gotovinsko plaćanje je potvrđeno',
    }) as Record<string, string>
  )[type] ?? 'Status porudžbine je ažuriran';
export const actorLabel = (actor: string) =>
  actor === 'ADMIN'
    ? 'Administrator'
    : actor === 'CUSTOMER'
      ? 'Kupac'
      : 'Sistem';
