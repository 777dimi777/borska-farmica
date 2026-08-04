import type { MeasurementUnit } from '@/types/catalog';
export type OrderStatus =
  | 'PENDING_CONFIRMATION'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY_FOR_PICKUP'
  | 'COMPLETED'
  | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PAID';
export type CancellationReason =
  | 'CUSTOMER_REQUEST'
  | 'ADMIN_ACTION'
  | 'CONFIRMATION_TIMEOUT'
  | 'UNSPECIFIED'
  | null;
export type OrderItem = {
  productName: string;
  productSlug: string | null;
  variantName: string;
  sku: string;
  packageAmount: string;
  measurementUnit: MeasurementUnit;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
  imageUrl: string | null;
};
export type OrderDetail = {
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: 'CASH_ON_PICKUP';
  paymentStatus: PaymentStatus;
  pickup: {
    id?: string;
    locationId?: string;
    code: string;
    name: string;
    address: string;
    instructions: string | null;
    requestedPickupDate: string;
    confirmedPickupAt: string | null;
    exactTimeRequiresConfirmation: boolean;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  customerNote: string | null;
  cancellationReason: CancellationReason;
  cancellationNote?: string | null;
  items: OrderItem[];
  summary: { subtotal: string; fee: string; total: string; currency: 'RSD' };
  timeline?: Array<{
    type: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus | null;
    note: string | null;
    createdAt: string;
  }>;
  confirmationExpiresAt?: string;
  confirmedAt: string | null;
  preparingAt?: string | null;
  readyAt?: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt?: string;
  idempotentReplay?: boolean;
};
export type OrderListItem = {
  orderNumber: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  total: string;
  currency: 'RSD';
  pickup: { code: string; name: string };
  requestedPickupDate: string;
  confirmedPickupAt: string | null;
  itemCount: number;
  createdAt: string;
};
export type OrdersPage = {
  data: OrderListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};
