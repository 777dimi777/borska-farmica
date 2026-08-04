import type { Metadata } from 'next';
import { AdminOrderDetailView } from '@/features/admin/orders/order-detail';
export const metadata: Metadata = {
  title: 'Detalji porudžbine',
  robots: { index: false, follow: false },
};
export default async function Page({
  params,
}: {
  params: Promise<{ orderIdentifier: string }>;
}) {
  const { orderIdentifier } = await params;
  return <AdminOrderDetailView id={orderIdentifier} />;
}
