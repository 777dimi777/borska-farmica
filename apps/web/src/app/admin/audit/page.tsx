import { Suspense } from 'react';
import { AuditGuard, AuditList } from '@/features/admin/operations/audit';
export default function Page() {
  return (
    <AuditGuard>
      <Suspense fallback={<p role="status">Učitavanje…</p>}>
        <AuditList />
      </Suspense>
    </AuditGuard>
  );
}
