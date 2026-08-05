export type AvailabilityMode = 'ALWAYS' | 'MANUAL' | 'SEASONAL';
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  productCount: number;
}
export interface ProductImage {
  url: string;
  altText: string;
  width: number | null;
  height: number | null;
}
export interface ProductAvailability {
  mode: AvailabilityMode;
  currentlyAvailable: boolean;
  inStock: boolean;
  purchasable: boolean;
  label: string | null;
}
export interface ProductPreview {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  featured: boolean;
  mainProduct: boolean;
  category: { name: string; slug: string };
  primaryImage: ProductImage | null;
  packageLabel: string;
  startingPrice: string;
  availability: ProductAvailability;
}
export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}
export interface ProductListResponse {
  data: ProductPreview[];
  pagination: Pagination;
}
export type MeasurementUnit =
  'LITER' | 'KILOGRAM' | 'GRAM' | 'PIECE' | 'MILLILITER';
export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  packageAmount: string;
  minimumPurchaseQuantity?: string;
  purchaseIncrement?: string;
  unit: MeasurementUnit;
  default: boolean;
  inStock: boolean;
  purchasable: boolean;
}
export interface ProductDetailImage extends ProductImage {
  id: string;
  primary: boolean;
}
export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  featured: boolean;
  mainProduct: boolean;
  category: { name: string; slug: string };
  variants: ProductVariant[];
  images: ProductDetailImage[];
  availability: ProductAvailability;
  seo: { title: string | null; description: string | null };
}
