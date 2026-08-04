import type { ButtonHTMLAttributes } from 'react';
import Link, { type LinkProps } from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
type Variant = 'primary' | 'secondary' | 'ghost';
export function Button({
  className,
  variant = 'primary',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      className={cn('button', `button-${variant}`, className)}
      {...props}
    />
  );
}
export function LinkButton({
  className,
  variant = 'primary',
  children,
  ...props
}: LinkProps & { className?: string; variant?: Variant; children: ReactNode }) {
  return (
    <Link className={cn('button', `button-${variant}`, className)} {...props}>
      {children}
    </Link>
  );
}
