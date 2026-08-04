import type { Metadata } from 'next';
import { cache } from 'react';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { Badge } from '@/components/ui/badge';
import { LinkButton } from '@/components/ui/button';
import { ApiUnavailableState } from '@/components/ui/states';
import { Breadcrumbs } from '@/components/catalog/breadcrumbs';
import { ProductGallery } from '@/components/product/product-gallery';
import { VariantSelector } from '@/components/product/variant-selector';
import { ProductDescription } from '@/components/product/product-description';
import { ProductPreviewCard } from '@/components/storefront/product-preview-card';
import { getProduct, getProducts } from '@/lib/api/catalog';
import { PublicApiError } from '@/lib/api/client';
import { availabilityLabel } from '@/lib/formatters/product';
import { breadcrumbJsonLd, productJsonLd, safeJsonLd } from '@/lib/seo/product';
import { siteUrl } from '@/lib/config/env';
import type { ProductPreview } from '@/types/catalog';
const cachedProduct = cache(getProduct);
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const p = await cachedProduct(slug);
    const description = (
      p.seo.description ||
      p.description ||
      p.shortDescription ||
      `Proizvod ${p.name} iz ponude Borske Farmice.`
    )
      .replace(/\s+/g, ' ')
      .slice(0, 160);
    const image = p.images[0];
    return {
      title: p.seo.title || p.name,
      description,
      alternates: { canonical: `/proizvodi/${p.slug}` },
      openGraph: {
        title: p.seo.title || p.name,
        description,
        type: 'website',
        images: image
          ? [
              {
                url: image.url,
                width: image.width || undefined,
                height: image.height || undefined,
                alt: image.altText,
              },
            ]
          : undefined,
      },
    };
  } catch {
    return { title: 'Proizvod', robots: { index: false, follow: true } };
  }
}
export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  let product;
  try {
    product = await cachedProduct(slug);
  } catch (error) {
    if (error instanceof PublicApiError && error.kind === 'not-found')
      notFound();
    return (
      <section className="section">
        <Container>
          <ApiUnavailableState />
        </Container>
      </section>
    );
  }
  let related: ProductPreview[] = [];
  try {
    const r = await getProducts({
      category: product.category.slug,
      limit: 5,
      sort: 'featured',
    });
    related = r.data.filter((x) => x.slug !== product.slug).slice(0, 4);
  } catch {}
  const site = siteUrl();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(
            productJsonLd(product, `${site}/proizvodi/${product.slug}`),
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(breadcrumbJsonLd(product, site)),
        }}
      />
      <section className="product-detail">
        <Container>
          <Breadcrumbs
            items={[
              { label: 'Početna', href: '/' },
              { label: 'Proizvodi', href: '/proizvodi' },
              {
                label: product.category.name,
                href: `/proizvodi?category=${encodeURIComponent(product.category.slug)}`,
              },
              { label: product.name },
            ]}
          />
          <div className="product-detail-grid">
            <ProductGallery images={product.images} name={product.name} />
            <div className="product-info">
              <div className="detail-badges">
                {product.featured && <Badge tone="success">Izdvojeno</Badge>}
                {product.availability.mode === 'SEASONAL' && (
                  <Badge tone="warning">Sezonska ponuda</Badge>
                )}
                <span>{product.category.name}</span>
              </div>
              <h1>{product.name}</h1>
              {product.shortDescription && (
                <p className="detail-lead">{product.shortDescription}</p>
              )}
              <p className="detail-status">
                {availabilityLabel(product.availability)}
              </p>
              <VariantSelector
                variants={product.variants}
                productAvailability={product.availability}
              />
              <LinkButton href="/preuzimanje" variant="secondary">
                Kako funkcioniše preuzimanje
              </LinkButton>
              <div className="pickup-panel">
                <strong>Poručivanje i preuzimanje</strong>
                <p>
                  Porudžbinu potvrđuje Borska Farmica. Plaćanje je gotovinom;
                  preuzimanje na Nade Dimić 30 ili na Gradskoj pijaci Bor
                  subotom. Nema dostave ni online plaćanja.
                </p>
              </div>
            </div>
          </div>
          <ProductDescription description={product.description} />
        </Container>
      </section>
      {related.length > 0 && (
        <section className="section related">
          <Container>
            <p className="eyebrow">Još iz kategorije {product.category.name}</p>
            <h2>Povezani proizvodi</h2>
            <div className="product-grid">
              {related.map((p) => (
                <ProductPreviewCard key={p.id} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
