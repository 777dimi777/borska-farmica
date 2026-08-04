import { Suspense } from 'react';
import { ProductEditor } from '@/features/admin/catalog/products';
export default async function Page({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  return (
    <Suspense fallback={<p role="status">Učitavanje…</p>}>
      <ProductEditor id={(await params).productId} />
    </Suspense>
  );
}
