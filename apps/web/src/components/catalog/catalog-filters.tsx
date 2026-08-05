import Link from 'next/link';
import type { Category } from '@/types/catalog';
import type { CatalogQuery } from '@/types/catalog-query';
import { catalogHref } from '@/lib/catalog/query';

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
        <legend>Kategorije</legend>
        <Link
          className={!query.category ? 'active' : ''}
          href={catalogHref(query, { category: undefined })}
        >
          <span className="filter-check" />
          Svi proizvodi
        </Link>
        {categories.map((category) => (
          <Link
            key={category.id}
            className={query.category === category.slug ? 'active' : ''}
            href={catalogHref(query, { category: category.slug })}
          >
            <span className="filter-check" />
            {category.name}
            <small>{category.productCount}</small>
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
          <span className="filter-check" />
          Na stanju
        </Link>
        <Link
          className={query.featured ? 'active' : ''}
          href={catalogHref(query, {
            featured: query.featured ? undefined : true,
          })}
        >
          <span className="filter-check" />
          Izdvojeni proizvodi
        </Link>
        <Link
          className={query.availabilityMode === 'SEASONAL' ? 'active' : ''}
          href={catalogHref(query, {
            availabilityMode:
              query.availabilityMode === 'SEASONAL' ? undefined : 'SEASONAL',
          })}
        >
          <span className="filter-check" />
          Sezonski dostupno
        </Link>
      </fieldset>
      <Link className="filter-apply" href={catalogHref(query, {})}>
        Primeni filtere
      </Link>
      <Link className="clear-filters" href="/proizvodi">
        Poništi sve
      </Link>
    </div>
  );
}
