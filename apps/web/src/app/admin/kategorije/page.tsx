import { Suspense } from 'react';
import { CategoryList } from '@/features/admin/catalog/categories';
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Učitavanje…</p>}>
      <CategoryList />
    </Suspense>
  );
}
