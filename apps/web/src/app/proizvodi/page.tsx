import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Container } from '@/components/ui/container';
import { ProductPreviewCard } from '@/components/storefront/product-preview-card';
import { ApiUnavailableState, EmptyState } from '@/components/ui/states';
import { Breadcrumbs } from '@/components/catalog/breadcrumbs';
import { CatalogFilters } from '@/components/catalog/catalog-filters';
import { CatalogToolbar } from '@/components/catalog/catalog-toolbar';
import { ActiveFilters } from '@/components/catalog/active-filters';
import { MobileFilters } from '@/components/catalog/mobile-filters';
import { Pagination } from '@/components/catalog/pagination';
import { getCategories, getProducts } from '@/lib/api/catalog';
import { parseCatalogQuery, serializeCatalogQuery } from '@/lib/catalog/query';
import type { SearchParams } from '@/types/catalog-query';
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const p = await searchParams;
  const filtered = Object.keys(p).length > 0;
  return {
    title: 'Proizvodi',
    description: 'Pretražite aktuelnu ponudu proizvoda Borske Farmice.',
    alternates: { canonical: '/proizvodi' },
    robots: filtered
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}
export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = parseCatalogQuery(await searchParams);
  const [categoriesResult, productsResult] = await Promise.allSettled([
    getCategories(),
    getProducts(query),
  ]);
  const categories =
    categoriesResult.status === 'fulfilled' ? categoriesResult.value : [];
  if (productsResult.status === 'rejected')
    return (
      <CatalogShell>
        <ApiUnavailableState />
      </CatalogShell>
    );
  const result = productsResult.value;
  if (
    result.pagination.totalPages > 0 &&
    query.page > result.pagination.totalPages
  )
    redirect(
      `/proizvodi?${serializeCatalogQuery({ ...query, page: result.pagination.totalPages })}`,
    );
  const activeCount = [
    query.search,
    query.category,
    query.inStock,
    query.featured,
    query.availabilityMode,
  ].filter(Boolean).length;
  const filterUi = <CatalogFilters query={query} categories={categories} />;
  return (
    <CatalogShell>
      <div className="category-shortcuts">
        <Link href="/proizvodi" className={!query.category ? 'active' : ''}>
          Sve
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/proizvodi?category=${encodeURIComponent(c.slug)}`}
            className={query.category === c.slug ? 'active' : ''}
          >
            {c.name}
          </Link>
        ))}
      </div>
      <CatalogToolbar query={query} total={result.pagination.total} />
      <ActiveFilters query={query} categories={categories} />
      <MobileFilters count={activeCount}>{filterUi}</MobileFilters>
      <div className="catalog-layout">
        <aside>{filterUi}</aside>
        <div>
          {result.data.length ? (
            <div className="catalog-grid">
              {result.data.map((p) => (
                <ProductPreviewCard key={p.id} product={p} />
              ))}
            </div>
          ) : result.pagination.total === 0 && activeCount === 0 ? (
            <EmptyState />
          ) : (
            <div className="state-card">
              <h2>Nema proizvoda za izabrane filtere.</h2>
              <p>Promenite pretragu ili obrišite aktivne filtere.</p>
              <Link className="button button-primary" href="/proizvodi">
                Obriši filtere
              </Link>
            </div>
          )}
          <Pagination query={query} pagination={result.pagination} />
        </div>
      </div>
      <div className="catalog-info">
        <strong>Kupovina i preuzimanje</strong>
        <p>
          Porudžbinu potvrđuje Borska Farmica. Plaćanje je gotovinom, uz lično
          preuzimanje u Boru ili na Gradskoj pijaci subotom.
        </p>
      </div>
    </CatalogShell>
  );
}
function CatalogShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <section className="catalog-hero">
        <Container>
          <Breadcrumbs
            items={[{ label: 'Početna', href: '/' }, { label: 'Proizvodi' }]}
          />
          <p className="eyebrow">Aktuelni katalog</p>
          <h1>Domaća ponuda Borske Farmice</h1>
          <p>
            Dostupnost sezonskih proizvoda zavisi od perioda i trenutnih zaliha.
          </p>
        </Container>
      </section>
      <section className="section catalog-page">
        <Container>{children}</Container>
      </section>
    </>
  );
}
