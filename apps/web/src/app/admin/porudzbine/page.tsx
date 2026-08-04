import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AdminOrderList } from '@/features/admin/orders/order-list';
export const metadata: Metadata = {
  title: 'Admin porudžbine',
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Suspense
      fallback={<div className="admin-boot">Učitavanje porudžbina…</div>}
    >
      <AdminOrderList />
    </Suspense>
  );
}
