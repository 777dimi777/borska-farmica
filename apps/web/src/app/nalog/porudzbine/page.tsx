import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { OrdersPage } from '@/features/orders/orders-page';
export const metadata: Metadata = {
  title: 'Moje porudžbine',
  robots: { index: false, follow: false },
};
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const p = Number((await searchParams).page);
  return (
    <Container className="orders-page">
      <p className="eyebrow">Vaša istorija</p>
      <h1>Moje porudžbine</h1>
      <OrdersPage page={Number.isInteger(p) && p > 0 ? p : 1} />
    </Container>
  );
}
