import type { Metadata } from 'next';
import { Suspense } from 'react';
import { AuthForm } from '@/features/auth/auth-form';
export const metadata: Metadata = {
  title: 'Registracija',
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <section className="auth-page">
      <div>
        <p className="eyebrow">Kupovina zahteva nalog</p>
        <h1>Registracija</h1>
        <Suspense>
          <AuthForm mode="register" />
        </Suspense>
      </div>
    </section>
  );
}
