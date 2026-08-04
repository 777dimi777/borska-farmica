import type { Category, ProductListResponse } from '@/types/catalog';
import { publicApiFetch } from './client';
export const getCategories = () =>
  publicApiFetch<Category[]>('/categories', { revalidate: 60 });
export const getProducts = (
  params: Record<string, string | number | boolean>,
) => {
  const query = new URLSearchParams(
    Object.entries(params).map(([key, value]) => [key, String(value)]),
  );
  return publicApiFetch<ProductListResponse>(`/products?${query}`, {
    revalidate: 60,
  });
};
export async function getHomepageCatalog() {
  const categories = await getCategories();
  const attempts: Array<Record<string, string | number | boolean>> = [
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
