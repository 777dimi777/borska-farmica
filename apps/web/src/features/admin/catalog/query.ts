export type ProductFilters = {
  page: number;
  limit: 12 | 24 | 48;
  search: string;
  categoryId?: string;
  status?: string;
  featured?: boolean;
  mainProduct?: boolean;
  availabilityMode?: string;
  stockStatus?: string;
  sort: string;
};
export const parseProductFilters = (p: URLSearchParams): ProductFilters => {
  const page = Number(p.get('page')),
    limit = Number(p.get('limit'));
  return {
    page: Number.isInteger(page) && page > 0 ? page : 1,
    limit: [12, 24, 48].includes(limit) ? (limit as 12 | 24 | 48) : 12,
    search: (p.get('search') ?? '').trim().slice(0, 120),
    categoryId: p.get('categoryId') || undefined,
    status: p.get('status') || undefined,
    featured: p.has('featured') ? p.get('featured') === 'true' : undefined,
    mainProduct: p.has('mainProduct')
      ? p.get('mainProduct') === 'true'
      : undefined,
    availabilityMode: p.get('availabilityMode') || undefined,
    stockStatus: p.get('stockStatus') || undefined,
    sort: p.get('sort') || 'newest',
  };
};
export const serializeProductFilters = (f: ProductFilters) => {
  const q = new URLSearchParams();
  if (f.page > 1) q.set('page', String(f.page));
  if (f.limit !== 12) q.set('limit', String(f.limit));
  for (const k of [
    'search',
    'categoryId',
    'status',
    'availabilityMode',
    'stockStatus',
  ] as const)
    if (f[k]) q.set(k, String(f[k]));
  for (const k of ['featured', 'mainProduct'] as const)
    if (f[k] !== undefined) q.set(k, String(f[k]));
  if (f.sort !== 'newest') q.set('sort', f.sort);
  return q;
};
export const catalogKeys = {
  all: ['admin-catalog'] as const,
  categories: (q = '') => ['admin-catalog', 'categories', q] as const,
  category: (id: string) => ['admin-catalog', 'category', id] as const,
  products: (q = '') => ['admin-catalog', 'products', q] as const,
  product: (id: string) => ['admin-catalog', 'product', id] as const,
  images: (id: string) => ['admin-catalog', 'images', id] as const,
  windows: (id: string) => ['admin-catalog', 'windows', id] as const,
  preview: (id: string, at = '') =>
    ['admin-catalog', 'preview', id, at] as const,
  movements: (id: string, v: string, q = '') =>
    ['admin-catalog', 'movements', id, v, q] as const,
};
