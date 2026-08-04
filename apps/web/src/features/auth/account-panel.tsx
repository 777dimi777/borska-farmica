'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';
import { useFeedback } from '@/components/providers/feedback-provider';
export function AccountPanel() {
  const a = useAuth(),
    router = useRouter(),
    feedback = useFeedback();
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (a.status === 'anonymous') router.replace('/prijava?returnTo=/nalog');
  }, [a.status, router]);
  if (a.status === 'loading' || !a.customer)
    return <div className="account-skeleton" aria-label="UÄitavanje naloga" />;
  const c = a.customer;
  const profile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const f = new FormData(e.currentTarget);
    try {
      await a.updateProfile({
        firstName: String(f.get('firstName')),
        lastName: String(f.get('lastName')),
        phone: String(f.get('phone')),
      });
      feedback('Profil je saÄuvan.', 'success');
    } catch {
      feedback('Profil nije saÄuvan. Proverite podatke.', 'error');
    } finally {
      setBusy(false);
    }
  };
  const password = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget,
      f = new FormData(form),
      next = String(f.get('newPassword'));
    if (next !== String(f.get('confirm'))) {
      feedback('Nove lozinke se ne podudaraju.', 'error');
      return;
    }
    setBusy(true);
    try {
      await a.changePassword({
        currentPassword: String(f.get('currentPassword')),
        newPassword: next,
      });
      form.reset();
      router.replace('/prijava');
      feedback('Lozinka je promenjena. Prijavite se ponovo.', 'success');
    } catch {
      feedback('Lozinka nije promenjena. Proverite podatke.', 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="account-grid">
      <section>
        <h2>Podaci naloga</h2>
        <p>{c.email}</p>
        <p>
          Nalog napravljen{' '}
          {new Intl.DateTimeFormat('sr-Latn-RS', { dateStyle: 'long' }).format(
            new Date(c.createdAt),
          )}
        </p>
        <form className="auth-form" onSubmit={profile}>
          <label className="form-field">
            <span>Ime</span>
            <input name="firstName" defaultValue={c.firstName} maxLength={80} />
          </label>
          <label className="form-field">
            <span>Prezime</span>
            <input name="lastName" defaultValue={c.lastName} maxLength={80} />
          </label>
          <label className="form-field">
            <span>Telefon</span>
            <input
              name="phone"
              type="tel"
              defaultValue={c.phone}
              maxLength={32}
            />
          </label>
          <button className="button button-primary" disabled={busy}>
            SaÄuvajte profil
          </button>
        </form>
      </section>
      <section>
        <h2>Promena lozinke</h2>
        <form className="auth-form" onSubmit={password}>
          <label className="form-field">
            <span>Trenutna lozinka</span>
            <input
              name="currentPassword"
              type="password"
              autoComplete="current-password"
              required
            />
          </label>
          <label className="form-field">
            <span>Nova lozinka</span>
            <input
              name="newPassword"
              type="password"
              autoComplete="new-password"
              minLength={12}
              maxLength={128}
              required
            />
          </label>
          <label className="form-field">
            <span>Potvrdite novu lozinku</span>
            <input
              name="confirm"
              type="password"
              autoComplete="new-password"
              required
            />
          </label>
          <button className="button button-secondary" disabled={busy}>
            Promenite lozinku
          </button>
        </form>
        <button
          className="button button-ghost"
          onClick={async () => {
            await a.logout();
            router.replace('/');
          }}
        >
          Odjavite se
        </button>
      </section>
    </div>
  );
}
