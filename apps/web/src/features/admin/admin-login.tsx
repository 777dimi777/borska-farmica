'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAdmin } from './admin-provider';
const schema = z.object({
  email: z.email('Unesite ispravan email.'),
  password: z
    .string()
    .min(12, 'Lozinka mora imati najmanje 12 karaktera.')
    .max(128),
});
type Form = z.infer<typeof schema>;
export function AdminLogin() {
  const { status, login } = useAdmin();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  useEffect(() => {
    if (status === 'authenticated') router.replace('/admin/dashboard');
  }, [status, router]);
  return (
    <form
      className="admin-login-form"
      onSubmit={handleSubmit(async (values) => {
        setMessage('');
        try {
          await login(values);
          router.replace('/admin/dashboard');
        } catch (error) {
          const kind =
            error instanceof Error && 'kind' in error
              ? (error as { kind?: string }).kind
              : '';
          setMessage(
            kind === 'rate-limit'
              ? 'Previše pokušaja. Sačekajte i pokušajte ponovo.'
              : kind === 'network' || kind === 'timeout'
                ? 'API trenutno nije dostupan. Proverite vezu.'
                : 'Email ili lozinka nisu ispravni.',
          );
        }
      })}
      noValidate
    >
      <label>
        <span>Email</span>
        <input
          type="email"
          autoComplete="username"
          aria-invalid={!!errors.email}
          {...register('email')}
        />
        {errors.email && <small>{errors.email.message}</small>}
      </label>
      <label>
        <span>Lozinka</span>
        <input
          type="password"
          autoComplete="current-password"
          aria-invalid={!!errors.password}
          {...register('password')}
        />
        {errors.password && <small>{errors.password.message}</small>}
      </label>
      {message && (
        <p className="admin-form-error" role="alert">
          {message}
        </p>
      )}
      <button
        className="button button-primary"
        disabled={isSubmitting || status === 'loading'}
      >
        {isSubmitting ? 'Prijavljivanje…' : 'Prijavi se'}
      </button>
    </form>
  );
}
