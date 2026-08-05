'use client';
import { useState } from 'react';
import type { UseFormRegister } from 'react-hook-form';
import type { AuthFormValues } from './auth-form';
export function PasswordField({
  label,
  name,
  autoComplete,
  error,
  register,
}: {
  label: string;
  name: string;
  autoComplete: string;
  error?: string;
  register: UseFormRegister<AuthFormValues>;
}) {
  const [show, setShow] = useState(false);
  return (
    <label className="form-field">
      <span>{label}</span>
      <span className="password-wrap">
        <input
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...register(name as keyof AuthFormValues)}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? 'Sakrij lozinku' : 'Prikaži lozinku'}
        >
          {show ? 'Sakrij' : 'Prikaži'}
        </button>
      </span>
      {error && (
        <small id={`${name}-error`} className="field-error">
          {error}
        </small>
      )}
    </label>
  );
}
