import { AboutContent } from '@/components/storefront/info-pages';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'O nama',
  description: 'Saznajte viÅ¡e o lokalnoj ponudi Borske Farmice iz Bora.',
};
export default function About() {
  return <AboutContent />;
}
