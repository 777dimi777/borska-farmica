import { PickupContent } from '@/components/storefront/pickup-content';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Preuzimanje',
  description:
    'Lično preuzimanje proizvoda Borske Farmice na adresi Nade Dimić 30 ili subotom na Gradskoj pijaci Bor.',
};
export default function Pickup() {
  return <PickupContent />;
}
