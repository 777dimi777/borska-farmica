import type { Metadata } from 'next';
import { CartReferencePage } from '@/features/cart/cart-reference-page';
import { getProducts } from '@/lib/api/catalog';
import type { ProductPreview } from '@/types/catalog';

export const metadata: Metadata = {
  title: 'Vaša korpa',
  robots: { index: false, follow: false },
};

export default async function Page() {
  let recommendations: ProductPreview[] = [];
  try {
    recommendations = (
      await getProducts({ limit: 4, sort: 'featured', inStock: true })
    ).data;
  } catch {}
  return <CartReferencePage recommendations={recommendations} />;
}
