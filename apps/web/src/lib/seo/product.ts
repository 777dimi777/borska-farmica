import type { ProductDetail, ProductVariant } from '@/types/catalog';
import { safeJsonLd } from './local-business';
export function schemaAvailability(
  v: Pick<ProductVariant, 'purchasable' | 'inStock'>,
) {
  return v.purchasable
    ? v.inStock
      ? 'https://schema.org/InStock'
      : 'https://schema.org/BackOrder'
    : 'https://schema.org/OutOfStock';
}
export function productJsonLd(product: ProductDetail, url: string) {
  const offers = product.variants.map((v) => ({
    '@type': 'Offer',
    url,
    price: v.price,
    priceCurrency: 'RSD',
    availability: schemaAvailability(v),
    itemCondition: 'https://schema.org/NewCondition',
    sku: v.sku,
    seller: { '@type': 'Organization', name: 'Borska Farmica' },
  }));
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || product.shortDescription || undefined,
    image: product.images.map((i) => i.url),
    brand: { '@type': 'Brand', name: 'Borska Farmica' },
    category: product.category.name,
    sku: product.variants[0]?.sku,
    offers: offers.length === 1 ? offers[0] : offers,
  };
}
export function breadcrumbJsonLd(product: ProductDetail, site: string) {
  const entries = [
    ['Početna', site],
    ['Proizvodi', `${site}/proizvodi`],
    [
      product.category.name,
      `${site}/proizvodi?category=${encodeURIComponent(product.category.slug)}`,
    ],
    [product.name, `${site}/proizvodi/${product.slug}`],
  ];
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: entries.map(([name, item], i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name,
      item,
    })),
  };
}
export { safeJsonLd };
