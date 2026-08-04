'use client';
import { useState } from 'react';
import type { ProductAvailability, ProductVariant } from '@/types/catalog';
import { formatRsd } from '@/lib/formatters/currency';
import { availabilityLabel, packageLabel } from '@/lib/formatters/product';
export function VariantSelector({
  variants,
  productAvailability,
}: {
  variants: ProductVariant[];
  productAvailability: ProductAvailability;
}) {
  const initial = Math.max(
    0,
    variants.findIndex((v) => v.default),
  );
  const [selected, setSelected] = useState(initial);
  const variant = variants[selected];
  if (!variant) return null;
  const status = availabilityLabel({
    ...productAvailability,
    inStock: variant.inStock,
    purchasable: variant.purchasable,
  });
  const compare =
    variant.compareAtPrice &&
    Number(variant.compareAtPrice) > Number(variant.price)
      ? variant.compareAtPrice
      : null;
  return (
    <div className="variant-panel">
      <div className="detail-price">
        <strong>{formatRsd(variant.price)}</strong>
        {compare && <del>{formatRsd(compare)}</del>}
      </div>
      {variants.length > 1 ? (
        <fieldset className="variant-options">
          <legend>Izaberite varijantu</legend>
          {variants.map((v, i) => (
            <label key={v.id} className={i === selected ? 'selected' : ''}>
              <input
                type="radio"
                name="variant"
                value={v.id}
                checked={i === selected}
                onChange={() => setSelected(i)}
              />
              <span>
                <strong>{v.name}</strong>
                <small>
                  {packageLabel(v)} · {formatRsd(v.price)}
                </small>
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="single-variant">
          <strong>{variant.name}</strong> · {packageLabel(variant)}
        </p>
      )}
      <p
        className={`availability-status ${variant.purchasable ? 'available' : ''}`}
      >
        <span aria-hidden="true" /> {status}
      </p>
    </div>
  );
}
