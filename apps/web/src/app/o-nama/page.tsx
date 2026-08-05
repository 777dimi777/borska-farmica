import { AboutContent } from '@/components/storefront/about-content';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'O nama',
  description:
    'Upoznajte Borsku Farmicu, našu priču, način rada i domaću proizvodnju u Boru.',
};
export default function About() {
  return <AboutContent />;
}
