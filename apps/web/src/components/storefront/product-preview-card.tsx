import Link from 'next/link';
import { formatRsd } from '@/lib/formatters/currency';
import { availabilityLabel } from '@/lib/formatters/product';
import type { ProductPreview } from '@/types/catalog';
import { ProductImage } from './product-image';

export function ProductPreviewCard({ product }: { product: ProductPreview }) {
  const available = product.availability.purchasable;
  const label = availabilityLabel(product.availability);
  return (
    <article className="offer-product-card">
      <div className="offer-product-media">
        <Link
          href={`/proizvodi/${product.slug}`}
          aria-label={`Pogledaj proizvod: ${product.name}`}
        >
          <ProductImage image={product.primaryImage} name={product.name} />
        </Link>
        <span
          className={`offer-stock ${available ? 'is-available' : 'is-unavailable'}`}
        >
          {label}
        </span>
        <span className="offer-favorite" aria-hidden="true">
          ♡
        </span>
      </div>
      <div className="offer-product-body">
        <Link href={`/proizvodi/${product.slug}`}>
          <h3>{product.name}</h3>
        </Link>
        <p>{product.packageLabel}</p>
        <strong>{formatRsd(product.startingPrice)}</strong>
        <Link
          className={`offer-cart-button${available ? '' : ' is-disabled'}`}
          href={`/proizvodi/${product.slug}`}
          aria-disabled={!available}
        >
          <span aria-hidden="true">🛒</span>
          {available ? 'Dodaj u korpu' : 'Trenutno nedostupno'}
        </Link>
      </div>
    </article>
  );
}
