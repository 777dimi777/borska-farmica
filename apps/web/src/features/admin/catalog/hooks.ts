'use client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAdmin } from '../admin-provider';
import { catalogApi } from './api';
import { catalogKeys } from './query';
export function useCatalogQuery<T>(
  key: readonly unknown[],
  run: (t: string) => Promise<T>,
  enabled = true,
) {
  const { status, authorized } = useAdmin();
  return useQuery({
    queryKey: key,
    queryFn: () => authorized(run),
    enabled: enabled && status === 'authenticated',
    staleTime: 20_000,
  });
}
export function useCatalogMutation<T, V>(run: (t: string, v: V) => Promise<T>) {
  const { authorized } = useAdmin();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: V) => authorized((t) => run(t, v)),
    retry: false,
    onSuccess: () => qc.invalidateQueries({ queryKey: catalogKeys.all }),
  });
}
export const useCategories = (q = 'limit=48') =>
  useCatalogQuery(catalogKeys.categories(q), (t) =>
    catalogApi.categories.list(t, q),
  );
export const useCategory = (id: string) =>
  useCatalogQuery(
    catalogKeys.category(id),
    (t) => catalogApi.categories.detail(t, id),
    !!id,
  );
export const useProducts = (q: string) =>
  useCatalogQuery(catalogKeys.products(q), (t) =>
    catalogApi.products.list(t, q),
  );
export const useProduct = (id: string) =>
  useCatalogQuery(
    catalogKeys.product(id),
    (t) => catalogApi.products.detail(t, id),
    !!id,
  );
export const useImages = (id: string) =>
  useCatalogQuery(
    catalogKeys.images(id),
    (t) => catalogApi.images.list(t, id),
    !!id,
  );
export const useWindows = (id: string) =>
  useCatalogQuery(
    catalogKeys.windows(id),
    (t) => catalogApi.availability.list(t, id),
    !!id,
  );
export const usePreview = (id: string, at = '') =>
  useCatalogQuery(
    catalogKeys.preview(id, at),
    (t) => catalogApi.availability.preview(t, id, at || undefined),
    !!id,
  );
export const useMovements = (id: string, v: string, q = 'limit=12') =>
  useCatalogQuery(
    catalogKeys.movements(id, v, q),
    (t) => catalogApi.inventory.history(t, id, v, q),
    !!id && !!v,
  );
