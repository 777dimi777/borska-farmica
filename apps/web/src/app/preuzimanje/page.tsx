import { PickupContent } from '@/components/storefront/info-pages';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Preuzimanje',
  description: 'Lokacije i naÄin preuzimanja proizvoda Borske Farmice u Boru.',
};
export default function Pickup() {
  return <PickupContent />;
}
