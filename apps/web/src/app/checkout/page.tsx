import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { CheckoutPage } from '@/features/checkout/checkout-page';
export const metadata: Metadata = {
  title: 'Poručivanje',
  robots: { index: false, follow: false },
};
const iso = (date: Date) => date.toISOString().slice(0, 10);
export default function Page() {
  const today = new Date();
  const max = new Date(today);
  max.setDate(max.getDate() + 60);
  return (
    <Container className="checkout-page">
      <p className="eyebrow">Bezbedna porudžbina</p>
      <h1>Poručivanje</h1>
      <CheckoutPage today={iso(today)} maxDate={iso(max)} />
    </Container>
  );
}
