import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { CartPage } from '@/features/cart/cart-page';
export const metadata: Metadata = {
  title: 'Korpa',
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <Container className="cart-page">
      <p className="eyebrow">Vaš izbor</p>
      <h1>Korpa</h1>
      <CartPage />
    </Container>
  );
}
