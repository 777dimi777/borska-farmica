'use client';
import { CartControl } from '@/features/cart/cart-control';
import { AccountMenu } from './account-menu';

export function HeaderActions() {
  return (
    <div className="header-actions">
      <AccountMenu />
      <CartControl />
    </div>
  );
}
