import Link from 'next/link';
import type { CatalogQuery } from '@/types/catalog-query';
import type { Pagination as PaginationType } from '@/types/catalog';
import { catalogHref } from '@/lib/catalog/query';
export function Pagination({
  query,
  pagination,
}: {
  query: CatalogQuery;
  pagination: PaginationType;
}) {
  if (pagination.totalPages <= 1) return null;
  const pages = Array.from(
    new Set(
      [
        1,
        pagination.page - 1,
        pagination.page,
        pagination.page + 1,
        pagination.totalPages,
      ].filter((x) => x > 0 && x <= pagination.totalPages),
    ),
  ).sort((a, b) => a - b);
  return (
    <nav className="pagination" aria-label="Paginacija proizvoda">
      <span>
        {pagination.hasPreviousPage ? (
          <Link href={catalogHref(query, { page: pagination.page - 1 }, false)}>
            Prethodna
          </Link>
        ) : (
          <span aria-disabled="true">Prethodna</span>
        )}
      </span>
      {pages.map((p, i) => (
        <span key={p}>
          {i > 0 && p - pages[i - 1] > 1 && <i>…</i>}
          <Link
            href={catalogHref(query, { page: p }, false)}
            aria-current={p === pagination.page ? 'page' : undefined}
          >
            {p}
          </Link>
        </span>
      ))}
      <span>
        {pagination.hasNextPage ? (
          <Link href={catalogHref(query, { page: pagination.page + 1 }, false)}>
            Sledeća
          </Link>
        ) : (
          <span aria-disabled="true">Sledeća</span>
        )}
      </span>
    </nav>
  );
}
