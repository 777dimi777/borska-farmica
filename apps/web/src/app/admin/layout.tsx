import { AdminQueryProvider } from '@/features/admin/admin-query-provider';
import { AdminProvider } from '@/features/admin/admin-provider';
import './admin.css';
import './admin-orders.css';
import './admin-catalog.css';
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AdminQueryProvider>
      <AdminProvider>{children}</AdminProvider>
    </AdminQueryProvider>
  );
}
