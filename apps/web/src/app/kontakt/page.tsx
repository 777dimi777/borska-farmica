import { ContactContent } from '@/components/storefront/info-pages';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Adresa, Facebook i informacije za preuzimanje Borske Farmice.',
};
export default function Contact() {
  return <ContactContent />;
}
