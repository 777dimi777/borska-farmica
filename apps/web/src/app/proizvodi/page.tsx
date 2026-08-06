import type { Metadata } from 'next';
import Image from 'next/image';
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
  const params = await searchParams;
  const filtered = Object.keys(params).length > 0;
  return {
    title: 'Proizvodi',
    description: 'Pretražite aktuelnu ponudu proizvoda Borske Farmice.',
    alternates: { canonical: '/proizvodi' },
    robots: filtered
      ? { index: false, follow: true }
      : { index: true, follow: true },
  };
}

const categoryIcons: Record<string, string> = {
  'mlecni-proizvodi': '♙',
  voce: '♧',
  povrce: '♧',
  rakija: '♙',
  jaja: '◉',
  'stajsko-djubrivo': '♧',
};

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
      <nav className="offer-category-tabs" aria-label="Kategorije proizvoda">
        <Link href="/proizvodi" className={!query.category ? 'active' : ''}>
          <span>▦</span>
          <strong>Svi proizvodi</strong>
          <small>
            {categories.reduce((sum, item) => sum + item.productCount, 0)}{' '}
            proizvoda
          </small>
        </Link>
        {categories.slice(0, 5).map((category) => (
          <Link
            key={category.id}
            href={`/proizvodi?category=${encodeURIComponent(category.slug)}`}
            className={query.category === category.slug ? 'active' : ''}
          >
            <span>{categoryIcons[category.slug] ?? '♧'}</span>
            <strong>{category.name}</strong>
            <small>{category.productCount} proizvoda</small>
          </Link>
        ))}
      </nav>
      <div className="offer-toolbar-row">
        <div>
          <CatalogToolbar query={query} total={result.pagination.total} />
          <ActiveFilters query={query} categories={categories} />
        </div>
        <MobileFilters count={activeCount}>{filterUi}</MobileFilters>
      </div>
      <div className="offer-catalog-layout">
        <aside className="offer-filter-panel">
          <h2>Filtriraj ponudu</h2>
          {filterUi}
        </aside>
        <main>
          {result.data.length ? (
            <div className="offer-catalog-grid">
              {result.data.map((product) => (
                <ProductPreviewCard key={product.id} product={product} />
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
        </main>
      </div>
      <section className="offer-promo">
        <Image
          src="/images/ponuda-farme.webp"
          alt="Izbor proizvoda Borske Farmice"
          fill
          sizes="(max-width: 800px) 100vw, 45vw"
        />
        <div>
          <p className="eyebrow">Pomoć pri izboru</p>
          <h2>Ne znate šta da izaberete?</h2>
          <p>
            Pogledajte izdvojene proizvode i napravite kombinaciju za lično
            preuzimanje.
          </p>
          <Link href="/proizvodi?featured=true">Pogledaj izdvojeno →</Link>
        </div>
      </section>
      <section className="offer-benefits" aria-label="Prednosti kupovine">
        <article>
          <span>⌂</span>
          <div>
            <strong>Lokalna proizvodnja</strong>
            <small>Proizvedeno na našoj farmici u Boru</small>
          </div>
        </article>
        <article>
          <span>✓</span>
          <div>
            <strong>Proverena ponuda</strong>
            <small>Stvarna dostupnost iz kataloga</small>
          </div>
        </article>
        <article>
          <span>▣</span>
          <div>
            <strong>Lično preuzimanje</strong>
            <small>Nade Dimić 30 ili pijaca subotom</small>
          </div>
        </article>
        <article>
          <span>●</span>
          <div>
            <strong>Sigurno plaćanje</strong>
            <small>Gotovinom tek pri preuzimanju</small>
          </div>
        </article>
      </section>
    </CatalogShell>
  );
}

function CatalogShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <section className="offer-hero">
        <Container>
          <div className="offer-hero-copy">
            <Breadcrumbs
              items={[{ label: 'Početna', href: '/' }, { label: 'Proizvodi' }]}
            />
            <h1>Naša ponuda</h1>
            <p>
              Sveže, domaće i pažljivo pripremljeno — izaberite proizvode sa
              naše farmice.
            </p>
          </div>
          <div className="offer-hero-image">
            <Image
              src="/images/pravljenje-sira.webp"
              alt="Sir, mleko, surutka i sezonska ponuda"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 58vw"
            />
          </div>
        </Container>
      </section>
      <section className="offer-page">
        <Container>{children}</Container>
      </section>
    </>
  );
}
