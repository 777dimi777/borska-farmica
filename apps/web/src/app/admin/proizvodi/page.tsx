import { Suspense } from 'react';
import { ProductList } from '@/features/admin/catalog/products';
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Učitavanje…</p>}>
      <ProductList />
    </Suspense>
  );
}
