import type { Metadata } from 'next';
import { AuthReferencePage } from '@/features/auth/auth-reference-page';

export const metadata: Metadata = {
  title: 'Prijava',
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AuthReferencePage mode="login" />;
}
