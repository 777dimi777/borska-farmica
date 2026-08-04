'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { formatRsd } from '@/lib/formatters/currency';
import { displayQuantity, shiftQuantity, validQuantity } from './quantity';
import { useRemoveCartItem, useUpdateCartItem } from './hooks';
import type { CartItem } from './types';
import { useFeedback } from '@/components/providers/feedback-provider';
import { packageLabel } from '@/lib/formatters/product';
export function CartItems({
  items,
  compact = false,
}: {
  items: CartItem[];
  compact?: boolean;
}) {
  const update = useUpdateCartItem(),
    remove = useRemoveCartItem(),
    feedback = useFeedback();
  return (
    <div className="cart-items">
      {items.map((i) => (
        <CartRow
          key={i.id}
          item={i}
          compact={compact}
          busy={update.isPending || remove.isPending}
          onUpdate={async (q) => {
            await update.mutateAsync({ id: i.id, quantity: q });
            feedback('Količina je ažurirana.', 'success');
          }}
          onRemove={async () => {
            await remove.mutateAsync(i.id);
            feedback('Proizvod je uklonjen.', 'success');
          }}
        />
      ))}
    </div>
  );
}
function CartRow({
  item: i,
  compact,
  busy,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  compact: boolean;
  busy: boolean;
  onUpdate: (q: string) => Promise<void>;
  onRemove: () => Promise<void>;
}) {
  const [q, setQ] = useState(i.quantity);
  const commit = async (v: string) => {
    if (
      validQuantity(
        v,
        i.variant.minimumPurchaseQuantity,
        i.variant.purchaseIncrement,
      )
    )
      await onUpdate(v.replace(',', '.'));
  };
  const issue = !i.validation.valid;
  return (
    <article className={`cart-row ${issue ? 'invalid' : ''}`}>
      {i.image ? (
        <Image src={i.image.url} alt={i.image.altText} width={96} height={96} />
      ) : (
        <div className="cart-image-fallback">BF</div>
      )}
      <div className="cart-row-main">
        <Link href={`/proizvodi/${i.product.slug}`}>
          <strong>{i.product.name}</strong>
        </Link>
        <small>
          {i.variant.name} · {packageLabel(i.variant)}
        </small>
        {i.priceChanged && (
          <p className="cart-warning">
            Cena je promenjena: <del>{formatRsd(i.unitPriceAtAddition)}</del>{' '}
            {formatRsd(i.currentUnitPrice)}
          </p>
        )}
        {issue && (
          <p className="cart-warning">
            Stavku je potrebno proveriti pre poručivanja.
          </p>
        )}
        {!compact && (
          <div className="quantity-control">
            <button
              disabled={busy}
              aria-label={`Smanji količinu za ${i.product.name}`}
              onClick={() => {
                const v = shiftQuantity(q, i.variant.purchaseIncrement, -1);
                setQ(v);
                void commit(v);
              }}
            >
              −
            </button>
            <label>
              <span className="sr-only">Količina za {i.product.name}</span>
              <input
                value={q.replace('.', ',')}
                inputMode="decimal"
                onChange={(e) => setQ(e.target.value)}
                onBlur={() => void commit(q)}
              />
            </label>
            <button
              disabled={busy}
              aria-label={`Povećaj količinu za ${i.product.name}`}
              onClick={() => {
                const v = shiftQuantity(q, i.variant.purchaseIncrement, 1);
                setQ(v);
                void commit(v);
              }}
            >
              +
            </button>
          </div>
        )}
        <button
          className="text-button"
          disabled={busy}
          aria-label={`Ukloni ${i.product.name} iz korpe`}
          onClick={() => void onRemove()}
        >
          Ukloni
        </button>
      </div>
      <div className="cart-row-price">
        <span>
          {displayQuantity(i.quantity)} × {formatRsd(i.currentUnitPrice)}
        </span>
        <strong>{formatRsd(i.lineTotal)}</strong>
      </div>
    </article>
  );
}
