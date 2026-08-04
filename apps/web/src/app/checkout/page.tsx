import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { CheckoutPage } from '@/features/checkout/checkout-page';
export const metadata: Metadata = {
  title: 'PoruÃƒâ€žÃ‚Âivanje',
  robots: { index: false, follow: false },
};
const iso = (date: Date) => date.toISOString().slice(0, 10);
export default function Page() {
  const today = new Date();
  const max = new Date(today);
  max.setDate(max.getDate() + 60);
  return (
    <Container className="checkout-page">
      <p className="eyebrow">Bezbedna porudÃƒâ€¦Ã‚Â¾bina</p>
      <h1>PoruÃƒâ€žÃ‚Âivanje</h1>
      <CheckoutPage today={iso(today)} maxDate={iso(max)} />
    </Container>
  );
}
