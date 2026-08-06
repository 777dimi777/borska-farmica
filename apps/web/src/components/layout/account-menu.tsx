'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import { useAuth } from '@/features/auth/auth-provider';

export function AccountMenu() {
  const auth = useAuth();
  const router = useRouter();
  const menu = useRef<HTMLDetailsElement>(null);
  const closeMenu = () => menu.current?.removeAttribute('open');

  if (auth.status !== 'authenticated') {
    return (
      <Link className="account-control" href="/prijava">
        {auth.status === 'loading' ? 'Nalog' : 'Prijava'}
      </Link>
    );
  }

  return (
    <details ref={menu} className="account-header-menu">
      <summary className="account-control">
        <span aria-hidden="true">♙</span>
        <span>Moj nalog</span>
      </summary>
      <div>
        <header>
          <strong>
            {auth.customer?.firstName} {auth.customer?.lastName}
          </strong>
          <small>{auth.customer?.email}</small>
        </header>
        <nav aria-label="Navigacija naloga">
          <Link href="/nalog" onClick={closeMenu}>
            ♙ Pregled naloga
          </Link>
          <Link href="/nalog/porudzbine" onClick={closeMenu}>
            🛒 Moje porudžbine
          </Link>
        </nav>
        <button
          onClick={async () => {
            closeMenu();
            await auth.logout();
            router.replace('/');
          }}
        >
          ↪ Odjavi se
        </button>
      </div>
    </details>
  );
}
