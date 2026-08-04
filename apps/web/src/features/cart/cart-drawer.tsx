'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useCart } from './hooks';
import { CartItems } from './cart-items';
import { formatRsd } from '@/lib/formatters/currency';
export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null),
    cart = useCart();
  useEffect(() => {
    const d = ref.current;
    if (open && !d?.open) d?.showModal();
    if (!open && d?.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="cart-drawer" onClose={onClose}>
      <div className="drawer-head">
        <h2>Vaša korpa</h2>
        <button onClick={() => ref.current?.close()} aria-label="Zatvori korpu">
          ×
        </button>
      </div>
      {cart.isLoading ? (
        <p>Učitavanje korpe…</p>
      ) : cart.isError ? (
        <p role="alert">Korpa trenutno nije dostupna.</p>
      ) : !cart.data?.items.length ? (
        <div className="empty-cart">
          <p>Korpa je prazna.</p>
          <Link
            className="button button-primary"
            href="/proizvodi"
            onClick={() => ref.current?.close()}
          >
            Pogledajte proizvode
          </Link>
        </div>
      ) : (
        <>
          <CartItems items={cart.data.items} compact />
          <div className="drawer-total">
            <span>Ukupno</span>
            <strong>{formatRsd(cart.data.summary.subtotal)}</strong>
          </div>
          <Link
            className="button button-primary"
            href="/korpa"
            onClick={() => ref.current?.close()}
          >
            Prikaži celu korpu
          </Link>
        </>
      )}
    </dialog>
  );
}
