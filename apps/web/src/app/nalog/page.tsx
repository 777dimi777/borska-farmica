import type { Metadata } from 'next';
import { AccountPanel } from '@/features/auth/account-panel';
import { Container } from '@/components/ui/container';
export const metadata: Metadata = {
  title: 'Moj nalog',
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Container className="account-page">
      <p className="eyebrow">Vaši podaci</p>
      <h1>Moj nalog</h1>
      <AccountPanel />
    </Container>
  );
}
