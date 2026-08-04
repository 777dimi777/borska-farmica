import { describe, expect, it } from 'vitest';
import {
  breadcrumbJsonLd,
  productJsonLd,
  safeJsonLd,
  schemaAvailability,
} from './product';
import type { ProductDetail } from '@/types/catalog';
const p: ProductDetail = {
  id: '1',
  name: 'Sir </script>',
  slug: 'sir',
  shortDescription: 'Opis',
  description: null,
  featured: false,
  mainProduct: true,
  category: { name: 'Sirevi', slug: 'sirevi' },
  variants: [
    {
      id: 'v',
      name: 'Komad',
      sku: 'SKU',
      price: '800.00',
      compareAtPrice: null,
      packageAmount: '1.000',
      unit: 'PIECE',
      default: true,
      inStock: false,
      purchasable: true,
    },
  ],
  images: [],
  availability: {
    mode: 'ALWAYS',
    currentlyAvailable: true,
    inStock: false,
    purchasable: true,
    label: null,
  },
  seo: { title: null, description: null },
};
describe('product SEO', () => {
  it('availability', () =>
    expect(schemaAvailability(p.variants[0])).toContain('BackOrder'));
  it('RSD without fake fields', () => {
    const v = productJsonLd(p, 'https://site/proizvodi/sir');
    expect(JSON.stringify(v)).toContain('"priceCurrency":"RSD"');
    expect(v).not.toHaveProperty('aggregateRating');
    expect(v).not.toHaveProperty('review');
  });
  it('breadcrumbs', () =>
    expect(breadcrumbJsonLd(p, 'https://site').itemListElement).toHaveLength(
      4,
    ));
  it('XSS safe', () =>
    expect(safeJsonLd(productJsonLd(p, 'https://site'))).not.toContain(
      '</script>',
    ));
});
