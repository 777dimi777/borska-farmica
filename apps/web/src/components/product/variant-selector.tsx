'use client';
import { useState } from 'react';
import type { ProductAvailability, ProductVariant } from '@/types/catalog';
import { formatRsd } from '@/lib/formatters/currency';
import { availabilityLabel, packageLabel } from '@/lib/formatters/product';
import {
  displayQuantity,
  shiftQuantity,
  validQuantity,
} from '@/features/cart/quantity';
import { useAddCartItem } from '@/features/cart/hooks';
import { useFeedback } from '@/components/providers/feedback-provider';
import { BrowserApiError } from '@/lib/browser-api/client';
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
  const add = useAddCartItem(),
    feedback = useFeedback();
  const [quantity, setQuantity] = useState(
    variant?.minimumPurchaseQuantity ?? '1.000',
  );
  if (!variant) return null;
  const select = (i: number) => {
    setSelected(i);
    setQuantity(variants[i].minimumPurchaseQuantity ?? '1.000');
  };
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
  const valid = validQuantity(
      quantity,
      variant.minimumPurchaseQuantity ?? '1.000',
      variant.purchaseIncrement ?? '1.000',
    ),
    canAdd =
      productAvailability.currentlyAvailable && variant.purchasable && valid;
  const submit = async () => {
    try {
      await add.mutateAsync({
        variantId: variant.id,
        quantity: quantity.replace(',', '.'),
      });
      feedback('Proizvod je dodat u korpu.', 'success');
    } catch (e) {
      feedback(
        e instanceof BrowserApiError &&
          ['conflict', 'business'].includes(e.kind)
          ? 'Cena ili dostupnost su promenjeni. OsveÅ¾ite podatke i pokuÅ¡ajte ponovo.'
          : 'Proizvod trenutno nije moguÄ‡e dodati.',
        'error',
      );
    }
  };
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
                onChange={() => select(i)}
              />
              <span>
                <strong>{v.name}</strong>
                <small>
                  {packageLabel(v)} Â· {formatRsd(v.price)}
                </small>
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="single-variant">
          <strong>{variant.name}</strong> Â· {packageLabel(variant)}
        </p>
      )}
      <p
        className={`availability-status ${variant.purchasable ? 'available' : ''}`}
      >
        <span aria-hidden="true" /> {status}
      </p>
      <div className="purchase-controls">
        <div className="quantity-control">
          <button
            type="button"
            aria-label="Smanji koliÄinu"
            onClick={() =>
              setQuantity(
                shiftQuantity(
                  quantity,
                  variant.purchaseIncrement ?? '1.000',
                  -1,
                ),
              )
            }
          >
            âˆ’
          </button>
          <label>
            <span>KoliÄina</span>
            <input
              inputMode="decimal"
              value={quantity.replace('.', ',')}
              aria-invalid={!valid}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </label>
          <button
            type="button"
            aria-label="PoveÄ‡aj koliÄinu"
            onClick={() =>
              setQuantity(
                shiftQuantity(
                  quantity,
                  variant.purchaseIncrement ?? '1.000',
                  1,
                ),
              )
            }
          >
            +
          </button>
        </div>
        <small>
          Minimum {displayQuantity(variant.minimumPurchaseQuantity ?? '1.000')},
          korak {displayQuantity(variant.purchaseIncrement ?? '1.000')}
        </small>
        <button
          className="button button-primary"
          disabled={!canAdd || add.isPending}
          onClick={() => void submit()}
        >
          {add.isPending ? 'Dodavanjeâ€¦' : 'Dodaj u korpu'}
        </button>
        {!canAdd && (
          <p className="field-error">
            {!variant.purchasable ? status : 'Unesite dozvoljenu koliÄinu.'}
          </p>
        )}
      </div>
    </div>
  );
}
