import type { OrderDetail } from '@/features/orders/types';
export type PickupLocation = {
  id: string;
  code: 'FARM_HOME' | 'BOR_CITY_MARKET' | string;
  name: string;
  address: string;
  instructions: string | null;
  allowedWeekday: number | null;
  sortOrder: number;
};
export type CheckoutPayload = {
  pickupLocationId: string;
  requestedPickupDate: string;
  customerNote?: string;
};
export type CheckoutPreview = {
  items: Array<{
    cartItemId: string;
    variantId: string;
    productName: string;
    variantName: string;
    quantity: string;
    unitPrice: string;
    lineTotal: string;
    available: boolean;
    issues: string[];
  }>;
  pickup: {
    locationId: string;
    code: string;
    name: string;
    address: string;
    instructions: string | null;
    requestedPickupDate: string;
    exactTimeRequiresConfirmation: boolean;
  };
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  customerNote: string | null;
  summary: {
    subtotal: string;
    fee: string;
    total: string;
    currency: 'RSD';
    paymentMethod: 'CASH_ON_PICKUP';
  };
  valid: boolean;
  issues: string[];
};
export type CreatedOrder = OrderDetail & { idempotentReplay: boolean };
