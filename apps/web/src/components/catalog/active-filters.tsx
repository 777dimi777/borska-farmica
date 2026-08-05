import Link from 'next/link';
import type { Category } from '@/types/catalog';
import type { CatalogQuery } from '@/types/catalog-query';
import { catalogHref } from '@/lib/catalog/query';
const modeLabels = {
  ALWAYS: 'Dostupno cele godine',
  SEASONAL: 'Sezonska ponuda',
  MANUAL: 'Po dogovoru',
};
export function ActiveFilters({
  query,
  categories,
}: {
  query: CatalogQuery;
  categories: Category[];
}) {
  const chips: Array<[string, string, Partial<CatalogQuery>]> = [];
  if (query.search)
    chips.push(['search', `Pretraga: ${query.search}`, { search: undefined }]);
  if (query.category)
    chips.push([
      'category',
      categories.find((category) => category.slug === query.category)?.name ??
        query.category,
      { category: undefined },
    ]);
  if (query.inStock) chips.push(['stock', 'Na stanju', { inStock: undefined }]);
  if (query.featured)
    chips.push(['featured', 'Izdvojeno', { featured: undefined }]);
  if (query.availabilityMode)
    chips.push([
      'mode',
      modeLabels[query.availabilityMode],
      { availabilityMode: undefined },
    ]);
  if (!chips.length) return null;
  return (
    <div className="active-filters">
      {chips.map(([key, label, change]) => (
        <Link
          key={key}
          href={catalogHref(query, change)}
          aria-label={`Ukloni filter: ${label}`}
        >
          {label}
          <span aria-hidden="true">×</span>
        </Link>
      ))}
      <Link href="/proizvodi">Obriši sve</Link>
    </div>
  );
}
