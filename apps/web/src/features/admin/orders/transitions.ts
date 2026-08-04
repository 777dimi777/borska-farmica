import type { OrderStatus } from './types';
export type PrimaryAction = {
  target: OrderStatus;
  label: string;
  description: string;
};
export const primaryAction: Partial<Record<OrderStatus, PrimaryAction>> = {
  PENDING_CONFIRMATION: {
    target: 'CONFIRMED',
    label: 'Potvrdi porudžbinu',
    description:
      'Rezervacija ostaje aktivna, a automatski confirmation timeout više se ne primenjuje.',
  },
  CONFIRMED: {
    target: 'PREPARING',
    label: 'Započni pripremu',
    description:
      'Porudžbina prelazi u pripremu. Zalihe i plaćanje se ne menjaju.',
  },
  PREPARING: {
    target: 'READY_FOR_PICKUP',
    label: 'Označi kao spremnu',
    description:
      'Kupca je potrebno obavestiti postojećim dogovorenim putem; email/SMS se ne šalje automatski.',
  },
  READY_FOR_PICKUP: {
    target: 'COMPLETED',
    label: 'Završi i potvrdi naplatu',
    description:
      'Porudžbina postaje završena i plaćena, zalihe se umanjuju i nastaju SALE movements.',
  },
};
export const allowedTargets = (status: OrderStatus): OrderStatus[] =>
  status === 'PENDING_CONFIRMATION'
    ? ['CONFIRMED', 'CANCELLED']
    : status === 'CONFIRMED'
      ? ['PREPARING', 'CANCELLED']
      : status === 'PREPARING'
        ? ['READY_FOR_PICKUP', 'CANCELLED']
        : status === 'READY_FOR_PICKUP'
          ? ['COMPLETED', 'CANCELLED']
          : [];
