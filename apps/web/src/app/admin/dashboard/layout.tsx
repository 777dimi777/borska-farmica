import { AdminGuard, AdminShell } from '@/features/admin/admin-shell';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
