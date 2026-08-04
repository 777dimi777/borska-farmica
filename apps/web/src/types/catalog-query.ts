import type { AvailabilityMode } from './catalog';
export type ProductSort = 'newest' | 'name_asc' | 'name_desc' | 'featured';
export interface CatalogQuery {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  featured?: true;
  mainProduct?: true;
  availabilityMode?: AvailabilityMode;
  inStock?: true;
  sort: ProductSort;
}
export type SearchParams = Record<string, string | string[] | undefined>;
