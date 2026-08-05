import type { Metadata } from 'next';
import { Manrope, Cormorant_Garamond } from 'next/font/google';
import { SiteChrome } from '@/components/layout/site-chrome';
import { siteUrl } from '@/lib/config/env';
import { AppProviders } from '@/components/providers/app-providers';
import './globals.css';
import './storefront-polish.css';
import './catalog-redesign.css';
import './about-redesign.css';
import './pickup-redesign.css';
import './cart-redesign.css';
import './auth-redesign.css';
import './orders-redesign.css';
const sans = Manrope({
  variable: '--font-sans',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});
const serif = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin', 'latin-ext'],
  weight: ['500', '600', '700'],
  display: 'swap',
});
const description =
  'Mleko, surutka, sirevi i sezonski proizvodi Borske Farmice. PoruÃƒÆ’Ã¢â‚¬Å¾Ãƒâ€šÃ‚Âivanje uz liÃƒÆ’Ã¢â‚¬Å¾Ãƒâ€šÃ‚Âno preuzimanje u Boru i na Gradskoj pijaci subotom.';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default:
      'Borska Farmica | DomaÃƒÆ’Ã¢â‚¬Å¾ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡i proizvodi iz Bora',
    template: '%s | Borska Farmica',
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'sr_Latn_RS',
    siteName: 'Borska Farmica',
    title: 'Borska Farmica | DomaÃƒÆ’Ã¢â‚¬Å¾ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡i proizvodi iz Bora',
    description,
  },
  twitter: {
    card: 'summary',
    title: 'Borska Farmica | DomaÃƒÆ’Ã¢â‚¬Å¾ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¡i proizvodi iz Bora',
    description,
  },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr-Latn" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <a className="skip-link" href="#glavni-sadrzaj">
          PreskoÃƒÆ’Ã¢â‚¬Å¾Ãƒâ€šÃ‚Âi na glavni sadrÃƒÆ’Ã¢â‚¬Â¦Ãƒâ€šÃ‚Â¾aj
        </a>
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
