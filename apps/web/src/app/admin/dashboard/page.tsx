import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Dashboard } from '@/features/admin/dashboard';
export const metadata: Metadata = {
  title: 'Admin dashboard',
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Suspense
      fallback={<div className="admin-boot">Učitavanje dashboarda…</div>}
    >
      <Dashboard />
    </Suspense>
  );
}
