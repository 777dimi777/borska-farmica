export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};
export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  activeProductCount: number;
  draftProductCount?: number;
  archivedProductCount?: number;
  createdAt: string;
  updatedAt: string;
};
export type CategoryPage = { data: Category[]; pagination: Pagination };
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type AvailabilityMode = 'ALWAYS' | 'MANUAL' | 'SEASONAL';
export type StockStatus =
  'in_stock' | 'low_stock' | 'out_of_stock' | 'backorder';
export type Unit = 'PIECE' | 'GRAM' | 'KILOGRAM' | 'MILLILITER' | 'LITER';
export type ProductImage = {
  id: string;
  url: string;
  altText: string;
  primary: boolean;
  isPrimary?: boolean;
  sortOrder: number;
  storageProvider?: string | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  byteSize?: number | null;
};
export type Variant = {
  id: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  packageAmount: string;
  unit: Unit;
  stockQuantity: string;
  reservedQuantity: string;
  availableQuantity: string;
  lowStockThreshold: string;
  minimumPurchaseQuantity: string;
  purchaseIncrement: string;
  allowBackorder: boolean;
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
  stockStatus: StockStatus;
  createdAt: string;
  updatedAt: string;
};
export type Window = {
  id: string;
  productId?: string;
  type: 'FIXED_DATE_RANGE' | 'RECURRING_ANNUAL';
  startsAt: string | null;
  endsAt: string | null;
  startMonth: number | null;
  startDay: number | null;
  endMonth: number | null;
  endDay: number | null;
  isActive: boolean;
  label?: string | null;
  publicLabel?: string | null;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};
export type Product = {
  id: string;
  name: string;
  slug: string;
  status: ProductStatus;
  featured: boolean;
  mainProduct: boolean;
  availabilityMode: AvailabilityMode;
  manuallyAvailable: boolean;
  category: { id: string; name: string; slug: string; isActive: boolean };
  variantCount: number;
  activeVariantCount: number;
  startingPrice: string | null;
  highestPrice: string | null;
  stockQuantity: string;
  reservedQuantity: string;
  availableQuantity: string;
  stockStatus: StockStatus;
  primaryImage: ProductImage | null;
  createdAt: string;
  updatedAt: string;
};
export type ProductDetail = Product & {
  shortDescription: string | null;
  description: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  variants: Variant[];
  images: ProductImage[];
  availabilityWindows: Window[];
};
export type ProductPage = { data: Product[]; pagination: Pagination };
export type Preview = {
  productId: string;
  mode: AvailabilityMode;
  evaluatedAt: string;
  businessDate: string;
  currentlyAvailable: boolean;
  inStock: boolean;
  purchasable: boolean;
  label: string | null;
  matchedWindowId: string | null;
  businessReason: string;
  stockReason: string;
};
export type Movement = {
  id: string;
  type: string;
  quantityDelta: string;
  balanceAfter: string | null;
  reason: string | null;
  reference: string | null;
  createdAt: string;
};
export type MovementPage = { data: Movement[]; pagination: Pagination };
export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string | null;
  imageUrl?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};
export type ProductInput = {
  categoryId: string;
  name: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
  featured?: boolean;
  mainProduct?: boolean;
  availabilityMode?: AvailabilityMode;
  manuallyAvailable?: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  status?: ProductStatus;
};
export type VariantInput = Omit<
  Variant,
  | 'id'
  | 'stockQuantity'
  | 'reservedQuantity'
  | 'availableQuantity'
  | 'stockStatus'
  | 'createdAt'
  | 'updatedAt'
>;
