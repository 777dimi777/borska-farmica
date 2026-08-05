import type { Metadata } from 'next';
import { OrdersReferencePage } from '@/features/orders/orders-reference-page';

export const metadata: Metadata = {
  title: 'Moje porudžbine',
  robots: { index: false, follow: false },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const requestedPage = Number((await searchParams).page);
  const page =
    Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  return <OrdersReferencePage page={page} />;
}
