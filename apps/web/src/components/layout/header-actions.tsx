'use client';
import { CartControl } from '@/features/cart/cart-control';
import { AccountMenu } from './account-menu';
import { AdminNavLink } from '@/features/admin/admin-nav-link';

export function HeaderActions() {
  return (
    <div className="header-actions">
      <AdminNavLink />
      <AccountMenu />
      <CartControl />
    </div>
  );
}
