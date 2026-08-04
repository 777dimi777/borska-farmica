'use client';
import Link from 'next/link';
import { useAuth } from '@/features/auth/auth-provider';
import { CartControl } from '@/features/cart/cart-control';
export function HeaderActions() {
  const a = useAuth();
  return (
    <div className="header-actions">
      <Link
        className="account-control"
        href={a.status === 'authenticated' ? '/nalog' : '/prijava'}
      >
        {a.status === 'loading'
          ? 'Nalog'
          : a.status === 'authenticated'
            ? 'Moj nalog'
            : 'Prijava'}
      </Link>
      <CartControl />
    </div>
  );
}
