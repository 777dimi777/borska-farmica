import { browserApi } from '@/lib/browser-api/client';
import type {
  Category,
  CategoryInput,
  CategoryPage,
  MovementPage,
  Preview,
  ProductDetail,
  ProductImage,
  ProductInput,
  ProductPage,
  Variant,
  VariantInput,
  Window,
} from './types';
const p = (id: string) => `/admin/products/${encodeURIComponent(id)}`;
export const catalogApi = {
  categories: {
    list: (t: string, q: string) =>
      browserApi<CategoryPage>(`/admin/categories${q ? `?${q}` : ''}`, {
        token: t,
      }),
    detail: (t: string, id: string) =>
      browserApi<Category>(`/admin/categories/${id}`, { token: t }),
    create: (t: string, b: CategoryInput) =>
      browserApi<Category>('/admin/categories', {
        token: t,
        method: 'POST',
        body: b,
      }),
    update: (t: string, id: string, b: Partial<CategoryInput>) =>
      browserApi<Category>(`/admin/categories/${id}`, {
        token: t,
        method: 'PATCH',
        body: b,
      }),
    remove: (t: string, id: string) =>
      browserApi<void>(`/admin/categories/${id}`, {
        token: t,
        method: 'DELETE',
      }),
    reorder: (t: string, items: { id: string; sortOrder: number }[]) =>
      browserApi<Category[]>('/admin/categories/reorder', {
        token: t,
        method: 'PATCH',
        body: { items },
      }),
  },
  products: {
    list: (t: string, q: string) =>
      browserApi<ProductPage>(`/admin/products${q ? `?${q}` : ''}`, {
        token: t,
      }),
    detail: (t: string, id: string) =>
      browserApi<ProductDetail>(p(id), { token: t }),
    create: (t: string, b: ProductInput) =>
      browserApi<ProductDetail>('/admin/products', {
        token: t,
        method: 'POST',
        body: b,
      }),
    update: (t: string, id: string, b: Partial<ProductInput>) =>
      browserApi<ProductDetail>(p(id), { token: t, method: 'PATCH', body: b }),
    remove: (t: string, id: string) =>
      browserApi<void>(p(id), { token: t, method: 'DELETE' }),
  },
  variants: {
    create: (t: string, id: string, b: VariantInput) =>
      browserApi<Variant>(`${p(id)}/variants`, {
        token: t,
        method: 'POST',
        body: b,
      }),
    update: (t: string, id: string, v: string, b: Partial<VariantInput>) =>
      browserApi<Variant>(`${p(id)}/variants/${v}`, {
        token: t,
        method: 'PATCH',
        body: b,
      }),
    remove: (t: string, id: string, v: string) =>
      browserApi<void>(`${p(id)}/variants/${v}`, {
        token: t,
        method: 'DELETE',
      }),
  },
  images: {
    list: (t: string, id: string) =>
      browserApi<ProductImage[]>(`${p(id)}/images`, { token: t }),
    create: (
      t: string,
      id: string,
      b: {
        url: string;
        altText: string;
        isPrimary?: boolean;
        sortOrder?: number;
      },
    ) =>
      browserApi<ProductImage>(`${p(id)}/images`, {
        token: t,
        method: 'POST',
        body: b,
      }),
    upload: (t: string, id: string, b: FormData) =>
      browserApi<ProductImage>(`${p(id)}/images/upload`, {
        token: t,
        method: 'POST',
        body: b,
        timeout: 30000,
      }),
    update: (t: string, id: string, x: string, b: Record<string, unknown>) =>
      browserApi<ProductImage>(`${p(id)}/images/${x}`, {
        token: t,
        method: 'PATCH',
        body: b,
      }),
    remove: (t: string, id: string, x: string) =>
      browserApi<void>(`${p(id)}/images/${x}`, { token: t, method: 'DELETE' }),
    reorder: (
      t: string,
      id: string,
      items: { id: string; sortOrder: number }[],
      primaryImageId?: string,
    ) =>
      browserApi<ProductImage[]>(`${p(id)}/images/reorder`, {
        token: t,
        method: 'PATCH',
        body: { items, ...(primaryImageId ? { primaryImageId } : {}) },
      }),
  },
  availability: {
    list: (t: string, id: string) =>
      browserApi<Window[]>(`${p(id)}/availability-windows`, { token: t }),
    preview: (t: string, id: string, at?: string) =>
      browserApi<Preview>(
        `${p(id)}/availability-preview${at ? `?at=${encodeURIComponent(at)}` : ''}`,
        { token: t },
      ),
    create: (t: string, id: string, b: Record<string, unknown>) =>
      browserApi<Window>(`${p(id)}/availability-windows`, {
        token: t,
        method: 'POST',
        body: b,
      }),
    update: (t: string, id: string, w: string, b: Record<string, unknown>) =>
      browserApi<Window>(`${p(id)}/availability-windows/${w}`, {
        token: t,
        method: 'PATCH',
        body: b,
      }),
    remove: (t: string, id: string, w: string) =>
      browserApi<void>(`${p(id)}/availability-windows/${w}`, {
        token: t,
        method: 'DELETE',
      }),
    reorder: (
      t: string,
      id: string,
      items: { id: string; sortOrder: number }[],
    ) =>
      browserApi<Window[]>(`${p(id)}/availability-windows/reorder`, {
        token: t,
        method: 'PATCH',
        body: { items },
      }),
  },
  inventory: {
    history: (t: string, id: string, v: string, q = '') =>
      browserApi<MovementPage>(
        `${p(id)}/variants/${v}/inventory-movements${q ? `?${q}` : ''}`,
        { token: t },
      ),
    adjust: (
      t: string,
      id: string,
      v: string,
      b: {
        type: 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGE';
        quantity: string;
        reason?: string;
        reference?: string;
      },
    ) =>
      browserApi<Variant>(`${p(id)}/variants/${v}/inventory-adjustments`, {
        token: t,
        method: 'POST',
        body: b,
      }),
  },
};
