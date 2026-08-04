export function localBusinessJsonLd(url: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Borska Farmica',
    url,
    sameAs: ['https://www.facebook.com/borska.farmica.3'],
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Nade Dimić 30',
      addressLocality: 'Bor',
      addressCountry: 'RS',
    },
  };
}
export function safeJsonLd(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}
