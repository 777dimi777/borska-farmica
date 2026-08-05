'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';

export function AccountMenu() {
  const auth = useAuth();
  const router = useRouter();

  if (auth.status !== 'authenticated') {
    return (
      <Link className="account-control" href="/prijava">
        {auth.status === 'loading' ? 'Nalog' : 'Prijava'}
      </Link>
    );
  }

  return (
    <details className="account-header-menu">
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
          <Link href="/nalog">♙ Pregled naloga</Link>
          <Link href="/nalog/porudzbine">🛒 Moje porudžbine</Link>
        </nav>
        <button
          onClick={async () => {
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
