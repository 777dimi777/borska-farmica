import type { Metadata } from 'next';
import { ContactReferencePage } from '@/components/storefront/contact-reference-page';

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Kontaktirajte Borsku Farmicu preko zvanične Facebook stranice ili pronađite lokacije za lično preuzimanje u Boru.',
};

export default function Contact() {
  return <ContactReferencePage />;
}
