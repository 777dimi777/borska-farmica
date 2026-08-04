'use client';
import { QueryProvider } from './query-provider';
import { AuthProvider } from '@/features/auth/auth-provider';
import { FeedbackProvider } from './feedback-provider';
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <FeedbackProvider>{children}</FeedbackProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
