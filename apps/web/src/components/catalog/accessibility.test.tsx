import { render } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it } from 'vitest';
import { CatalogToolbar } from './catalog-toolbar';
import { Pagination } from './pagination';
import { VariantSelector } from '@/components/product/variant-selector';
const rules = { rules: { 'color-contrast': { enabled: false } } };
describe('catalog accessibility', () => {
  it('toolbar and pagination have no basic violations', async () => {
    const { container } = render(
      <>
        <CatalogToolbar
          query={{ page: 1, limit: 12, sort: 'featured' }}
          total={12}
        />
        <Pagination
          query={{ page: 1, limit: 12, sort: 'featured' }}
          pagination={{
            page: 1,
            limit: 12,
            total: 24,
            totalPages: 2,
            hasPreviousPage: false,
            hasNextPage: true,
          }}
        />
      </>,
    );
    expect((await axe(container, rules)).violations).toHaveLength(0);
  });
  it('variant selector has no basic violations', async () => {
    const { container } = render(
      <VariantSelector
        variants={[
          {
            id: '1',
            name: 'Komad',
            sku: 'A',
            price: '500.00',
            compareAtPrice: null,
            packageAmount: '1.000',
            unit: 'PIECE',
            default: true,
            inStock: true,
            purchasable: true,
          },
        ]}
        productAvailability={{
          mode: 'ALWAYS',
          currentlyAvailable: true,
          inStock: true,
          purchasable: true,
          label: null,
        }}
      />,
    );
    expect((await axe(container, rules)).violations).toHaveLength(0);
  });
});
