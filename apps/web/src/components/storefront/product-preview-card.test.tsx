import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ProductPreviewCard } from './product-preview-card';
import type { ProductPreview } from '@/types/catalog';
const product: ProductPreview = {
  id: '1',
  name: 'Mladi sir',
  slug: 'mladi-sir',
  shortDescription: null,
  featured: true,
  mainProduct: true,
  category: { name: 'Sir', slug: 'sir' },
  primaryImage: null,
  startingPrice: '850.00',
  availability: {
    mode: 'ALWAYS',
    currentlyAvailable: true,
    inStock: true,
    purchasable: true,
    label: null,
  },
};
describe('ProductPreviewCard', () => {
  it('prikazuje cenu i dostupnost bez storage ključa', () => {
    render(<ProductPreviewCard product={product} />);
    expect(screen.getByText('Dostupno')).toBeInTheDocument();
    expect(screen.queryByText(/storage/i)).not.toBeInTheDocument();
  });
  it('prikazuje unavailable stanje', () => {
    render(
      <ProductPreviewCard
        product={{
          ...product,
          availability: {
            ...product.availability,
            currentlyAvailable: false,
            purchasable: false,
          },
        }}
      />,
    );
    expect(screen.getByText('Trenutno van ponude')).toBeInTheDocument();
  });
});
