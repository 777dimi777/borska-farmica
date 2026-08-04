import type {
  Category,
  ProductDetail,
  ProductListResponse,
} from '@/types/catalog';
import type { CatalogQuery } from '@/types/catalog-query';
import { serializeCatalogQuery } from '@/lib/catalog/query';
import { publicApiFetch } from './client';
export const getCategories = () =>
  publicApiFetch<Category[]>('/categories', { revalidate: 60 });
export const getCategory = (slug: string) =>
  publicApiFetch<Category>(`/categories/${encodeURIComponent(slug)}`, {
    revalidate: 60,
  });
export const getProducts = (params: Partial<CatalogQuery>) =>
  publicApiFetch<ProductListResponse>(
    `/products?${serializeCatalogQuery(params)}`,
    { revalidate: 60 },
  );
export const getProduct = (slug: string) =>
  publicApiFetch<ProductDetail>(`/products/${encodeURIComponent(slug)}`, {
    revalidate: 60,
  });
export async function getHomepageCatalog() {
  const categories = await getCategories();
  const attempts: Array<Partial<CatalogQuery>> = [
    { featured: true },
    { mainProduct: true },
    {},
  ];
  let products: ProductListResponse | null = null;
  for (const filters of attempts) {
    products = await getProducts({ ...filters, limit: 4, sort: 'featured' });
    if (products.data.length) break;
  }
  return { categories, products: products?.data ?? [] };
}
