'use client';
import { usePathname } from 'next/navigation';
import { QueryProvider } from './query-provider';
import { AuthProvider } from '@/features/auth/auth-provider';
import { FeedbackProvider } from './feedback-provider';
export function AppProviders({ children }: { children: React.ReactNode }) {
  if (usePathname().startsWith('/admin'))
    return <FeedbackProvider>{children}</FeedbackProvider>;
  return (
    <QueryProvider>
      <AuthProvider>
        <FeedbackProvider>{children}</FeedbackProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
