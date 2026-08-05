import Link from 'next/link';
import type { CatalogQuery } from '@/types/catalog-query';
import { catalogHref, serializeCatalogQuery } from '@/lib/catalog/query';

export function CatalogToolbar({
  query,
  total,
}: {
  query: CatalogQuery;
  total: number;
}) {
  const preserved = serializeCatalogQuery({
    ...query,
    page: 1,
    search: undefined,
    sort: undefined,
  });
  return (
    <div className="catalog-toolbar">
      <p aria-live="polite">Pronađeno {resultLabel(total)}</p>
      <form
        className="catalog-search"
        action="/proizvodi"
        method="get"
        role="search"
      >
        <label htmlFor="catalog-search" className="sr-only">
          Pretraži proizvode
        </label>
        {Array.from(preserved).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <input
          id="catalog-search"
          type="search"
          name="search"
          defaultValue={query.search}
          maxLength={100}
          placeholder="Pretraži proizvode..."
        />
        <button type="submit" aria-label="Pretraži">
          ⌕
        </button>
        {query.search && (
          <Link href={catalogHref(query, { search: undefined })}>Obriši</Link>
        )}
      </form>
      <form className="catalog-sort" action="/proizvodi" method="get">
        <label htmlFor="catalog-sort" className="sr-only">
          Sortiranje
        </label>
        <span className="catalog-sort-visible" aria-hidden="true">
          Sortiraj:
        </span>
        {Array.from(
          serializeCatalogQuery({ ...query, page: 1, sort: undefined }),
        ).map(([key, value]) => (
          <input key={key} type="hidden" name={key} value={value} />
        ))}
        <select id="catalog-sort" name="sort" defaultValue={query.sort}>
          <option value="featured">Izdvojeno</option>
          <option value="newest">Najnovije</option>
          <option value="name_asc">Naziv A–Ž</option>
          <option value="name_desc">Naziv Ž–A</option>
        </select>
        <button type="submit">Primeni</button>
      </form>
    </div>
  );
}
export function resultLabel(total: number) {
  if (total === 0) return 'Nema pronađenih proizvoda';
  return total === 1 ? '1 proizvod' : `${total} proizvoda`;
}
