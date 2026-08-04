import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { OrderDetailView } from '@/features/orders/order-detail';
export const metadata: Metadata = {
  title: 'Detalji porudžbine',
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ publicNumber: string }>;
}) {
  const { publicNumber } = await params;
  return (
    <Container className="order-page">
      <OrderDetailView number={publicNumber} />
    </Container>
  );
}
