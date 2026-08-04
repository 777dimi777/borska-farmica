import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { CatalogToolbar, resultLabel } from './catalog-toolbar';
import { ActiveFilters } from './active-filters';
import { Pagination } from './pagination';
const query = {
  page: 2,
  limit: 12,
  search: 'sir',
  category: 'mlecni',
  inStock: true as const,
  sort: 'featured' as const,
};
describe('catalog UI', () => {
  it('search/sort', () => {
    render(<CatalogToolbar query={query} total={5} />);
    expect(screen.getByLabelText('Pretraži proizvode')).toHaveValue('sir');
    expect(screen.getByLabelText('Sortiranje')).toHaveValue('featured');
  });
  it('plural', () => {
    expect(resultLabel(0)).toMatch(/Nema/);
    expect(resultLabel(1)).toBe('1 proizvod');
    expect(resultLabel(5)).toBe('5 proizvoda');
  });
  it('active chips', () => {
    render(
      <ActiveFilters
        query={query}
        categories={[
          {
            id: '1',
            name: 'Mlečni',
            slug: 'mlecni',
            description: null,
            imageUrl: null,
            productCount: 2,
          },
        ]}
      />,
    );
    expect(screen.getByLabelText('Ukloni filter: Mlečni')).toBeInTheDocument();
  });
  it('pagination', () => {
    render(
      <Pagination
        query={query}
        pagination={{
          page: 2,
          limit: 12,
          total: 50,
          totalPages: 5,
          hasPreviousPage: true,
          hasNextPage: true,
        }}
      />,
    );
    expect(screen.getByRole('link', { name: '2' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(
      screen.getByRole('link', { name: 'Sledeća' }).getAttribute('href'),
    ).toContain('category=mlecni');
  });
});
