import { Suspense } from 'react';
import { CustomerList } from '@/features/admin/operations/customers';
export default function Page() {
  return (
    <Suspense fallback={<p role="status">Učitavanje…</p>}>
      <CustomerList />
    </Suspense>
  );
}
