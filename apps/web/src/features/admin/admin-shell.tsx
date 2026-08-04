'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAdmin } from './admin-provider';
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { status } = useAdmin();
  const router = useRouter();
  useEffect(() => {
    if (status === 'anonymous') router.replace('/admin/prijava');
  }, [status, router]);
  if (status === 'loading')
    return (
      <div className="admin-boot" role="status">
        Učitavanje admin sesije…
      </div>
    );
  if (status === 'anonymous')
    return <div className="admin-boot">Preusmeravanje…</div>;
  return children;
}
export function AdminShell({ children }: { children: React.ReactNode }) {
  const { admin, logout } = useAdmin();
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const exit = async () => {
    await logout();
    router.replace('/admin/prijava');
  };
  return (
    <div className="admin-app">
      <aside
        className={open ? 'admin-sidebar open' : 'admin-sidebar'}
        aria-label="Admin navigacija"
      >
        <Link
          href="/admin/dashboard"
          className="admin-brand"
          onClick={() => setOpen(false)}
        >
          <span>BF</span>
          <strong>
            Borska Farmica<small>Administracija</small>
          </strong>
        </Link>
        <nav>
          <Link
            className={path === '/admin/dashboard' ? 'active' : ''}
            href="/admin/dashboard"
            onClick={() => setOpen(false)}
          >
            Pregled poslovanja
          </Link>
          <Link
            className={path.startsWith('/admin/porudzbine') ? 'active' : ''}
            href="/admin/porudzbine"
            onClick={() => setOpen(false)}
          >
            Porudžbine
          </Link>
          <Link
            className={path.startsWith('/admin/proizvodi') ? 'active' : ''}
            href="/admin/proizvodi"
            onClick={() => setOpen(false)}
          >
            Proizvodi
          </Link>
          <Link
            className={path.startsWith('/admin/kategorije') ? 'active' : ''}
            href="/admin/kategorije"
            onClick={() => setOpen(false)}
          >
            Kategorije
          </Link>
          <Link
            className={path.startsWith('/admin/kupci') ? 'active' : ''}
            href="/admin/kupci"
            onClick={() => setOpen(false)}
          >
            Kupci
          </Link>
          <Link
            className={path.startsWith('/admin/izvozi') ? 'active' : ''}
            href="/admin/izvozi"
            onClick={() => setOpen(false)}
          >
            Izvozi
          </Link>
          {admin?.role === 'SUPER_ADMIN' && (
            <Link
              className={path.startsWith('/admin/audit') ? 'active' : ''}
              href="/admin/audit"
              onClick={() => setOpen(false)}
            >
              Audit logovi
            </Link>
          )}
          <Link href="/" target="_blank" rel="noreferrer">
            Otvori prodavnicu
          </Link>
        </nav>
        <div className="admin-account">
          <span>
            {admin?.firstName} {admin?.lastName}
          </span>
          <small>
            {admin?.role === 'SUPER_ADMIN'
              ? 'Super administrator'
              : 'Administrator'}
          </small>
          <button onClick={exit}>Odjavi se</button>
        </div>
      </aside>
      <div className="admin-main">
        <header className="admin-topbar">
          <button
            className="admin-menu"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="admin-sidebar"
          >
            Meni
          </button>
          <span>Operativni centar</span>
          <button onClick={exit}>Odjava</button>
        </header>
        <main id="glavni-sadrzaj">{children}</main>
      </div>
      {open && (
        <button
          className="admin-backdrop"
          aria-label="Zatvori meni"
          onClick={() => setOpen(false)}
        />
      )}
    </div>
  );
}
