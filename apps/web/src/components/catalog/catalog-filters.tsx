import Link from 'next/link';
import type { Category } from '@/types/catalog';
import type { CatalogQuery } from '@/types/catalog-query';
import { catalogHref } from '@/lib/catalog/query';
const modes = [
  ['ALWAYS', 'Dostupno tokom cele godine'],
  ['SEASONAL', 'Sezonska ponuda'],
  ['MANUAL', 'Dostupnost po dogovoru'],
] as const;
export function CatalogFilters({
  query,
  categories,
}: {
  query: CatalogQuery;
  categories: Category[];
}) {
  return (
    <div className="filter-groups">
      <fieldset>
        <legend>Kategorija</legend>
        <Link
          className={!query.category ? 'active' : ''}
          href={catalogHref(query, { category: undefined })}
        >
          Sve
        </Link>
        {categories.map((c) => (
          <Link
            key={c.id}
            className={query.category === c.slug ? 'active' : ''}
            href={catalogHref(query, { category: c.slug })}
          >
            {c.name}
          </Link>
        ))}
      </fieldset>
      <fieldset>
        <legend>Dostupnost</legend>
        <Link
          className={query.inStock ? 'active' : ''}
          href={catalogHref(query, {
            inStock: query.inStock ? undefined : true,
          })}
        >
          Na stanju
        </Link>
        <Link
          className={query.featured ? 'active' : ''}
          href={catalogHref(query, {
            featured: query.featured ? undefined : true,
          })}
        >
          Izdvojeni proizvodi
        </Link>
      </fieldset>
      <fieldset>
        <legend>Tip dostupnosti</legend>
        <Link
          className={!query.availabilityMode ? 'active' : ''}
          href={catalogHref(query, { availabilityMode: undefined })}
        >
          Svi
        </Link>
        {modes.map(([value, label]) => (
          <Link
            key={value}
            className={query.availabilityMode === value ? 'active' : ''}
            href={catalogHref(query, { availabilityMode: value })}
          >
            {label}
          </Link>
        ))}
      </fieldset>
      <Link className="clear-filters" href="/proizvodi">
        Obriši filtere
      </Link>
    </div>
  );
}
