import { AdminQueryProvider } from '@/features/admin/admin-query-provider';
import { AdminProvider } from '@/features/admin/admin-provider';
import { AdminAreaLayout } from '@/features/admin/admin-area-layout';
import './admin.css';
import './admin-orders.css';
import './admin-catalog.css';
import './admin-operations.css';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminQueryProvider>
      <AdminProvider>
        <AdminAreaLayout>{children}</AdminAreaLayout>
      </AdminProvider>
    </AdminQueryProvider>
  );
}
