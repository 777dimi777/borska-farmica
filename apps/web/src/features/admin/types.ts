export type AdminRole = 'ADMIN' | 'SUPER_ADMIN';
export type AdminSummary = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
};
export type AdminProfile = AdminSummary & {
  status: 'ACTIVE' | 'DISABLED';
  lastLoginAt: string | null;
};
export type AdminAuthResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  admin: AdminSummary;
};
export type Metric = {
  current: string | number;
  previous: string | number;
  absoluteChange: string | number;
  percentageChange: string | null;
  trend: 'up' | 'down' | 'flat';
};
export type Period = {
  from: string;
  to: string;
  days: number;
  start: string;
  endExclusive: string;
  previous: {
    from: string;
    to: string;
    days: number;
    start: string;
    endExclusive: string;
  };
};
export type Overview = {
  period: Period;
  metrics: Record<
    | 'revenue'
    | 'completedOrders'
    | 'createdOrders'
    | 'averageOrderValue'
    | 'itemsSold'
    | 'uniqueCustomers'
    | 'cancelledOrders',
    Metric
  >;
  operational: { pendingConfirmation: number };
};
export type RevenueSeries = {
  period: Period;
  granularity: 'day' | 'week' | 'month';
  data: { bucket: string; revenue: string; orders: number }[];
};
export type OrdersByStatus = {
  period: Period;
  total: number;
  data: { status: string; count: number; percentage: string }[];
};
export type OrderFlow = {
  period: Period;
  semantics: 'event_timestamp_counts';
  data: Record<
    | 'created'
    | 'confirmed'
    | 'preparing'
    | 'readyForPickup'
    | 'completed'
    | 'cancelled',
    number
  >;
};
export type TopProducts = {
  period: Period;
  sort: string;
  data: {
    productId: string;
    productName: string;
    productSlug: string;
    revenue: string;
    quantity: string;
    orders: number;
    imageUrl: string | null;
  }[];
};
export type CategorySales = {
  period: Period;
  snapshotSource: 'order_item';
  data: {
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    revenue: string;
    quantity: string;
    orders: number;
  }[];
};
export type PickupSales = {
  period: Period;
  displaySource: 'current_pickup_location';
  data: {
    pickupLocationId: string;
    code: string;
    name: string;
    address: string | null;
    revenue: string;
    orders: number;
  }[];
};
export type InventoryAlerts = {
  filter: string;
  total: number;
  data: {
    id: string;
    product: { id: string; name: string; slug: string };
    name: string;
    sku: string;
    measurementUnit: string;
    stockQuantity: string;
    reservedQuantity: string;
    availableQuantity: string;
    lowStockThreshold: string;
    status: string;
    reservedPressure: boolean;
  }[];
};
export type InventorySummary = {
  activeVariants: number;
  counts: {
    inStock: number;
    lowStock: number;
    outOfStock: number;
    backorder: number;
    reservedPressure: number;
  };
  byMeasurementUnit: {
    measurementUnit: string;
    stockQuantity: string;
    reservedQuantity: string;
    availableQuantity: string;
  }[];
};
export type Seasonal = {
  businessDate: string;
  timeZone: string;
  horizon: number;
  data: {
    id: string;
    name: string;
    slug: string;
    currentlyAvailable: boolean;
    businessReason: string;
    matchedWindowId: string | null;
    nextAvailableDate: string | null;
  }[];
};
export type RecentOrders = {
  data: {
    id: string;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    total: string;
    currency: string;
    createdAt: string;
    requestedPickupDate: string | null;
    customerName: string;
    pickupLocation: { id: string; code: string; name: string };
    requiresAttention: boolean;
  }[];
};
export type Attention = {
  generatedAt: string;
  timeZone: string;
  pendingAttentionHours: number;
  counts: {
    pending: number;
    stalePending: number;
    confirmedToday: number;
    ready: number;
    overduePickup: number;
    stockAlerts: number;
    seasonalWithoutWindows: number;
    activeWithoutImage: number;
    activeWithoutVariant: number;
  };
};
