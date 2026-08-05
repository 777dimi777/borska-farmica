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
import './account-menu.css';
import './contact-redesign.css';
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
  'Mleko, surutka, sirevi i sezonski proizvodi Borske Farmice. PoruÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âivanje uz liÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âno preuzimanje u Boru i na Gradskoj pijaci subotom.';
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default:
      'Borska Farmica | DomaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡i proizvodi iz Bora',
    template: '%s | Borska Farmica',
  },
  description,
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'sr_Latn_RS',
    siteName: 'Borska Farmica',
    title:
      'Borska Farmica | DomaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡i proizvodi iz Bora',
    description,
  },
  twitter: {
    card: 'summary',
    title:
      'Borska Farmica | DomaÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¡i proizvodi iz Bora',
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
          PreskoÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¾ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Âi
          na glavni
          sadrÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€šÃ‚Â¦ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¾aj
        </a>
        <AppProviders>
          <SiteChrome>{children}</SiteChrome>
        </AppProviders>
      </body>
    </html>
  );
}
