'use client';

import { usePathname } from 'next/navigation';
import { AdminGuard, AdminShell } from './admin-shell';

export function AdminAreaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (pathname === '/admin/prijava') return children;

  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
