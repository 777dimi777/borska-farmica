import type { Metadata } from 'next';
import { ContactReferencePage } from '@/components/storefront/contact-reference-page';

export const metadata: Metadata = {
  title: 'Kontakt',
  description:
    'Pošaljite poruku Borskoj Farmici na borskafarmica@gmail.com ili pronađite lokacije za lično preuzimanje u Boru.',
};

export default function Contact() {
  return <ContactReferencePage />;
}
