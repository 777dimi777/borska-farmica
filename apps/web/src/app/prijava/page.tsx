import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/auth-form';
export const metadata: Metadata = {
  title: 'Prijava',
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <section className="auth-page">
      <div>
        <p className="eyebrow">Dobro došli nazad</p>
        <h1>Prijava</h1>
        <Suspense>
          <AuthForm mode="login" />
        </Suspense>
      </div>
    </section>
  );
}
