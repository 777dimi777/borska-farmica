'use client';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from './auth-provider';
import { safeReturnTo } from './return-to';
import { PasswordField } from './password-field';
import { BrowserApiError } from '@/lib/browser-api/client';
import { adminAuthApi } from '@/features/admin/api';
import { adminMemorySession } from '@/features/admin/session';
const schema = z.object({
  email: z.email('Unesite ispravnu email adresu.').max(254),
  password: z.string().min(1, 'Unesite lozinku.').max(128),
  firstName: z.string().trim().max(80).optional(),
  lastName: z.string().trim().max(80).optional(),
  phone: z.string().trim().max(32).optional(),
  confirmPassword: z.string().optional(),
});
export type AuthFormValues = z.infer<typeof schema>;
export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const auth = useAuth(),
    router = useRouter(),
    params = useSearchParams(),
    returnTo = safeReturnTo(params.get('returnTo'));
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    reset,
  } = useForm<AuthFormValues>({ resolver: zodResolver(schema) });
  const submit = async (v: AuthFormValues) => {
    if (mode === 'register') {
      if (!v.firstName || !v.lastName || !v.phone) {
        setError('root', { message: 'Popunite sva obavezna polja.' });
        return;
      }
      if (v.password.length < 12) {
        setError('password', {
          message: 'Lozinka mora imati najmanje 12 karaktera.',
        });
        return;
      }
      if (v.password !== v.confirmPassword) {
        setError('confirmPassword', { message: 'Lozinke se ne podudaraju.' });
        return;
      }
    }
    try {
      if (mode === 'login') {
        try {
          await auth.login({ email: v.email, password: v.password });
        } catch (customerError) {
          if (
            !(customerError instanceof BrowserApiError) ||
            customerError.kind !== 'unauthenticated'
          )
            throw customerError;
          const adminAuth = await adminAuthApi.login({
            email: v.email,
            password: v.password,
          });
          adminMemorySession.set(adminAuth.accessToken);
          reset();
          router.replace('/admin/dashboard');
          return;
        }
      } else
        await auth.register({
          firstName: v.firstName!,
          lastName: v.lastName!,
          phone: v.phone!,
          email: v.email,
          password: v.password,
        });
      reset();
      router.replace(returnTo);
    } catch (e) {
      const message =
        e instanceof BrowserApiError && e.kind === 'rate-limit'
          ? 'Previše pokušaja. Sačekajte malo i pokušajte ponovo.'
          : mode === 'login'
            ? 'Email ili lozinka nisu ispravni.'
            : 'Registracija nije uspela. Proverite podatke ili pokušajte kasnije.';
      setError('root', { message });
    }
  };
  return (
    <form className="auth-form" onSubmit={handleSubmit(submit)} noValidate>
      {errors.root && (
        <div className="form-summary" role="alert">
          {errors.root.message}
        </div>
      )}
      {mode === 'register' && (
        <>
          <label className="form-field">
            <span>Ime</span>
            <input
              autoComplete="given-name"
              maxLength={80}
              {...field('firstName')}
            />
            {errors.firstName && <small>{errors.firstName.message}</small>}
          </label>
          <label className="form-field">
            <span>Prezime</span>
            <input
              autoComplete="family-name"
              maxLength={80}
              {...field('lastName')}
            />
          </label>
          <label className="form-field">
            <span>Telefon</span>
            <input
              type="tel"
              autoComplete="tel"
              placeholder="064 123 4567"
              maxLength={32}
              {...field('phone')}
            />
          </label>
        </>
      )}
      <label className="form-field">
        <span>Email</span>
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          {...field('email')}
        />
        {errors.email && <small>{errors.email.message}</small>}
      </label>
      <PasswordField
        label="Lozinka"
        name="password"
        autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
        error={errors.password?.message}
        register={field}
      />
      {mode === 'register' && (
        <PasswordField
          label="Potvrdite lozinku"
          name="confirmPassword"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          register={field}
        />
      )}
      <button className="button button-primary" disabled={isSubmitting}>
        {isSubmitting
          ? 'Sačekajte…'
          : mode === 'login'
            ? 'Prijavite se'
            : 'Napravite nalog'}
      </button>
      <p>
        {mode === 'login' ? 'Nemate nalog?' : 'Već imate nalog?'}{' '}
        <Link
          href={`${mode === 'login' ? '/registracija' : '/prijava'}?returnTo=${encodeURIComponent(returnTo)}`}
        >
          {mode === 'login' ? 'Registrujte se' : 'Prijavite se'}
        </Link>
      </p>
    </form>
  );
}
