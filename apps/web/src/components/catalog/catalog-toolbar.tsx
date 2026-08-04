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
      <form action="/proizvodi" method="get" role="search">
        <label htmlFor="catalog-search" className="sr-only">
          Pretraži proizvode
        </label>
        {Array.from(preserved).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <input
          id="catalog-search"
          type="search"
          name="search"
          defaultValue={query.search}
          maxLength={100}
          placeholder="Pretraži proizvode"
        />
        <button type="submit">Pretraži</button>
        {query.search && (
          <Link
            href={catalogHref(query, { search: undefined })}
            aria-label="Obriši pretragu"
          >
            Obriši
          </Link>
        )}
      </form>
      <form action="/proizvodi" method="get">
        <label htmlFor="catalog-sort">Sortiranje</label>
        {Array.from(
          serializeCatalogQuery({ ...query, page: 1, sort: undefined }),
        ).map(([k, v]) => (
          <input key={k} type="hidden" name={k} value={v} />
        ))}
        <select id="catalog-sort" name="sort" defaultValue={query.sort}>
          <option value="featured">Prvo izdvojeni</option>
          <option value="newest">Najnovije</option>
          <option value="name_asc">Naziv A–Ž</option>
          <option value="name_desc">Naziv Ž–A</option>
        </select>
        <button type="submit">Primeni</button>
      </form>
      <p aria-live="polite">{resultLabel(total)}</p>
    </div>
  );
}
export function resultLabel(total: number) {
  if (total === 0) return 'Nema pronađenih proizvoda';
  if (total === 1) return '1 proizvod';
  return `${total} proizvoda`;
}
