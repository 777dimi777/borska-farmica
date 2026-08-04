import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { formatRsd } from '@/lib/formatters/currency';
import { availabilityLabel } from '@/lib/formatters/product';
import type { ProductPreview } from '@/types/catalog';
import { ProductImage } from './product-image';
export function ProductPreviewCard({ product }: { product: ProductPreview }) {
  const a = product.availability;
  const label = availabilityLabel(a);
  return (
    <article className="product-card">
      <Link
        className="product-card-link"
        href={`/proizvodi/${product.slug}`}
        aria-label={`Pogledaj proizvod: ${product.name}`}
      />
      <div className="product-card-media">
        <ProductImage image={product.primaryImage} name={product.name} />
        <Badge
          tone={
            a.purchasable
              ? 'success'
              : a.currentlyAvailable
                ? 'warning'
                : 'neutral'
          }
        >
          {label}
        </Badge>
      </div>
      <div className="product-card-body">
        <p className="card-kicker">{product.category.name}</p>
        <h3>{product.name}</h3>
        {product.shortDescription && <p>{product.shortDescription}</p>}
        <div className="product-card-footer">
          <span>
            od <strong>{formatRsd(product.startingPrice)}</strong>
          </span>
          {a.label && <small>{a.label}</small>}
        </div>
      </div>
    </article>
  );
}
