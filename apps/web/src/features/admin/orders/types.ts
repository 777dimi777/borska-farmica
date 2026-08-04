import type {
  OrderStatus,
  PaymentStatus,
  CancellationReason,
} from '@/features/orders/types';
export type { OrderStatus, PaymentStatus, CancellationReason };
export type AdminOrderSort = 'newest' | 'oldest' | 'pickup_date' | 'status';
export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};
export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: OrderStatus;
  paymentMethod: 'CASH_ON_PICKUP';
  paymentStatus: PaymentStatus;
  pickup: { id: string; code: string; name: string };
  requestedPickupDate: string;
  confirmedPickupAt: string | null;
  total: string;
  currency: 'RSD';
  itemCount: number;
  attentionRequired: boolean;
  confirmationExpiresAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type AdminOrdersPage = {
  data: AdminOrderListItem[];
  pagination: Pagination;
};
export type PickupLocation = {
  id: string;
  code: string;
  name: string;
  address: string;
  instructions: string | null;
  allowedWeekday: number | null;
  sortOrder: number;
};
export type AdminOrderDetail = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerProfile: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    status: string;
  };
  customerSnapshot: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  status: OrderStatus;
  paymentMethod: 'CASH_ON_PICKUP';
  paymentStatus: PaymentStatus;
  pickup: PickupLocation & {
    requestedPickupDate: string;
    confirmedPickupAt: string | null;
  };
  customerNote: string | null;
  cancellationReason: CancellationReason;
  cancellationNote: string | null;
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    productName: string;
    productSlug: string;
    categoryName: string;
    categorySlug: string;
    variantName: string;
    sku: string;
    packageAmount: string;
    measurementUnit: string;
    quantity: string;
    unitPrice: string;
    lineTotal: string;
    imageUrl: string | null;
  }>;
  reservations: Array<{
    status: 'ACTIVE' | 'RELEASED' | 'CONSUMED';
    variantId: string;
    quantity: string;
    reservedAt: string;
    releasedAt: string | null;
    consumedAt: string | null;
    stock: {
      sku: string;
      physical: string;
      reserved: string;
      available: string;
    };
  }>;
  timeline: Array<{
    type: string;
    fromStatus: OrderStatus | null;
    toStatus: OrderStatus | null;
    actorType: 'CUSTOMER' | 'ADMIN' | 'SYSTEM';
    note: string | null;
    metadata: unknown;
    createdAt: string;
  }>;
  summary: { subtotal: string; fee: string; total: string; currency: 'RSD' };
  confirmationExpiresAt: string | null;
  confirmedAt: string | null;
  preparingAt: string | null;
  readyAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
};
export type TransitionInput = {
  targetStatus: OrderStatus;
  confirmedPickupAt?: string;
  note?: string;
  cancellationReason?: string;
  cashReceived?: true;
};
