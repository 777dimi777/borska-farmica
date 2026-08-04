import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
vi.mock('@/features/cart/hooks', () => ({
  useAddCartItem: () => ({ isPending: false, mutateAsync: vi.fn() }),
}));
vi.mock('@/components/providers/feedback-provider', () => ({
  useFeedback: () => vi.fn(),
}));
import { ProductGallery } from './product-gallery';
import { VariantSelector } from './variant-selector';
const a = {
  mode: 'ALWAYS' as const,
  currentlyAvailable: true,
  inStock: true,
  purchasable: true,
  label: null,
};
const variants = [
  {
    id: '1',
    name: 'Mala',
    sku: 'A',
    price: '500.00',
    compareAtPrice: null,
    packageAmount: '0.500',
    unit: 'KILOGRAM' as const,
    default: true,
    inStock: true,
    purchasable: true,
  },
  {
    id: '2',
    name: 'Velika',
    sku: 'B',
    price: '900.00',
    compareAtPrice: '1000.00',
    packageAmount: '1.000',
    unit: 'KILOGRAM' as const,
    default: false,
    inStock: false,
    purchasable: true,
  },
];
describe('product detail', () => {
  it('no image fallback', () => {
    render(<ProductGallery images={[]} name="Sir" />);
    expect(screen.getByLabelText(/slika nije dostupna/)).toBeInTheDocument();
  });
  it('one image no thumbs', () => {
    render(
      <ProductGallery
        images={[
          {
            id: '1',
            url: 'https://res.cloudinary.com/a.jpg',
            altText: 'Sir',
            width: 400,
            height: 400,
            primary: true,
          },
        ]}
        name="Sir"
      />,
    );
    expect(screen.queryByRole('group')).not.toBeInTheDocument();
  });
  it('gallery selects thumbnail', async () => {
    const u = userEvent.setup();
    render(
      <ProductGallery
        images={[
          {
            id: '1',
            url: 'https://res.cloudinary.com/a.jpg',
            altText: 'Prva',
            width: 400,
            height: 400,
            primary: true,
          },
          {
            id: '2',
            url: 'https://res.cloudinary.com/b.jpg',
            altText: 'Druga',
            width: 400,
            height: 400,
            primary: false,
          },
        ]}
        name="Sir"
      />,
    );
    const b = screen.getByRole('button', { name: /sliku 2/ });
    await u.click(b);
    expect(b).toHaveAttribute('aria-pressed', 'true');
  });
  it('variant changes price and backorder status', async () => {
    const u = userEvent.setup();
    render(<VariantSelector variants={variants} productAvailability={a} />);
    await u.click(screen.getByLabelText(/Velika/));
    expect(screen.getAllByText(/900,00/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Dostupno za poru/)).toBeInTheDocument();
    expect(screen.getByText(/1.000,00/).tagName).toBe('DEL');
  });
  it('has functional cart control', () => {
    render(
      <VariantSelector variants={[variants[0]]} productAvailability={a} />,
    );
    expect(
      screen.getByRole('button', { name: /dodaj u korpu/i }),
    ).toBeEnabled();
  });
});
