import type { MeasurementUnit } from '@/types/catalog';
export type CartIssue =
  | 'PRODUCT_INACTIVE'
  | 'CATEGORY_INACTIVE'
  | 'VARIANT_INACTIVE'
  | 'PRODUCT_UNAVAILABLE'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_QUANTITY';
export type CartItem = {
  id: string;
  quantity: string;
  unitPriceAtAddition: string;
  currentUnitPrice: string;
  priceChanged: boolean;
  lineTotal: string;
  product: { id: string; name: string; slug: string; status: string };
  variant: {
    id: string;
    name: string;
    sku: string;
    packageAmount: string;
    minimumPurchaseQuantity: string;
    purchaseIncrement: string;
    unit: MeasurementUnit;
  };
  image: { id: string; url: string; altText: string } | null;
  availability: {
    currentlyAvailable: boolean;
    inStock: boolean;
    purchasable: boolean;
    businessReason: string;
    stockReason: string;
  };
  validation: { valid: boolean; issues: CartIssue[] };
};
export type Cart = {
  items: CartItem[];
  summary: {
    distinctItemCount: number;
    totalQuantity: string;
    subtotal: string;
    currency: 'RSD';
  };
  expiresAt: string | null;
};
