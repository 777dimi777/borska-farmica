'use client';
import { usePathname } from 'next/navigation';
import { Header } from './header';
import { Footer } from './footer';
export function SiteChrome({ children }: { children: React.ReactNode }) {
  const admin = usePathname().startsWith('/admin');
  if (admin) return children;
  return (
    <>
      <Header />
      <main id="glavni-sadrzaj">{children}</main>
      <Footer />
    </>
  );
}
