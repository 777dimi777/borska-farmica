import type {
  CatalogQuery,
  ProductSort,
  SearchParams,
} from '@/types/catalog-query';
import type { AvailabilityMode } from '@/types/catalog';
const sorts = new Set<ProductSort>([
  'newest',
  'name_asc',
  'name_desc',
  'featured',
]);
const modes = new Set<AvailabilityMode>(['ALWAYS', 'MANUAL', 'SEASONAL']);
const first = (v: string | string[] | undefined) =>
  Array.isArray(v) ? v[0] : v;
const positive = (
  v: string | undefined,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER,
) => {
  const n = Number(v);
  return Number.isInteger(n) && n > 0 ? Math.min(n, max) : fallback;
};
export function parseCatalogQuery(params: SearchParams): CatalogQuery {
  const rawSearch = first(params.search)?.trim().slice(0, 100);
  const sort = first(params.sort) as ProductSort;
  const mode = first(params.availabilityMode) as AvailabilityMode;
  const category = first(params.category)?.trim();
  return {
    page: positive(first(params.page), 1),
    limit: positive(first(params.limit), 12, 48),
    ...(rawSearch && { search: rawSearch }),
    ...(category && { category }),
    ...(first(params.featured) === 'true' && { featured: true as const }),
    ...(first(params.mainProduct) === 'true' && { mainProduct: true as const }),
    ...(modes.has(mode) && { availabilityMode: mode }),
    ...(first(params.inStock) === 'true' && { inStock: true as const }),
    sort: sorts.has(sort) ? sort : 'featured',
  };
}
export function serializeCatalogQuery(
  query: Partial<CatalogQuery>,
): URLSearchParams {
  const out = new URLSearchParams();
  if (query.page && query.page !== 1) out.set('page', String(query.page));
  if (query.limit && query.limit !== 12)
    out.set('limit', String(Math.min(48, query.limit)));
  for (const key of ['search', 'category', 'availabilityMode'] as const) {
    const v = query[key];
    if (v) out.set(key, String(v));
  }
  for (const key of ['featured', 'mainProduct', 'inStock'] as const)
    if (query[key]) out.set(key, 'true');
  if (query.sort && query.sort !== 'featured') out.set('sort', query.sort);
  return out;
}
export function catalogHref(
  query: Partial<CatalogQuery>,
  change: Partial<CatalogQuery>,
  resetPage = true,
) {
  return `/proizvodi?${serializeCatalogQuery({ ...query, ...change, ...(resetPage && { page: 1 }) })}`.replace(
    /\?$/,
    '',
  );
}
