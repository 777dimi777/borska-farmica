import type { Metadata } from 'next';
import { AdminLogin } from '@/features/admin/admin-login';
export const metadata: Metadata = {
  title: 'Admin prijava',
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <main id="glavni-sadrzaj" className="admin-login-page">
      <section>
        <p className="eyebrow">Borska Farmica</p>
        <h1>Admin prijava</h1>
        <p>Pristup je dozvoljen samo ovlašćenim administratorima.</p>
        <AdminLogin />
      </section>
    </main>
  );
}
