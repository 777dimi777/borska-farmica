import { AuditDetail, AuditGuard } from '@/features/admin/operations/audit';
export default async function Page({
  params,
}: {
  params: Promise<{ auditId: string }>;
}) {
  return (
    <AuditGuard>
      <AuditDetail id={(await params).auditId} />
    </AuditGuard>
  );
}
