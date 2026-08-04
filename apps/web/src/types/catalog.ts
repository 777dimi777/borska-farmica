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
