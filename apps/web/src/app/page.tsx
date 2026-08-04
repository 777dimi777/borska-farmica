import { Hero } from '@/components/storefront/hero';
import { HomeContent } from '@/components/storefront/home-content';
import { StaticSections } from '@/components/storefront/static-sections';
import { ApiUnavailableState } from '@/components/ui/states';
import { Container } from '@/components/ui/container';
import { getHomepageCatalog } from '@/lib/api/catalog';
import { siteUrl } from '@/lib/config/env';
import { localBusinessJsonLd, safeJsonLd } from '@/lib/seo/local-business';
export default async function Home() {
  let catalog: null | Awaited<ReturnType<typeof getHomepageCatalog>> = null;
  try {
    catalog = await getHomepageCatalog();
  } catch {}
  const jsonLd = localBusinessJsonLd(siteUrl());
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(jsonLd),
        }}
      />
      <Hero product={catalog?.products[0]} />
      {catalog ? (
        <HomeContent
          categories={catalog.categories}
          products={catalog.products}
        />
      ) : (
        <section id="ponuda" className="section">
          <Container>
            <ApiUnavailableState />
          </Container>
        </section>
      )}
      <StaticSections />
    </>
  );
}
