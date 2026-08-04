import type { ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils/cn';
export function Section({
  className,
  ...props
}: ComponentPropsWithoutRef<'section'>) {
  return <section className={cn('section', className)} {...props} />;
}
