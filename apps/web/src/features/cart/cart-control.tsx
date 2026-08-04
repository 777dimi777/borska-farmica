'use client';
import Link from 'next/link';
import { useState } from 'react';
import { useCart } from './hooks';
import { CartDrawer } from './cart-drawer';
export function CartControl() {
  const [open, setOpen] = useState(false),
    cart = useCart(),
    n = cart.data?.summary.distinctItemCount;
  return (
    <>
      <button
        className="cart-control"
        onClick={() => setOpen(true)}
        aria-label={n === undefined ? 'Korpa se učitava' : `Korpa, ${n} stavke`}
      >
        <span aria-hidden>🛒</span>
        {n !== undefined && <span className="cart-badge">{n}</span>}
      </button>
      <Link className="sr-only" href="/korpa">
        Otvori stranicu korpe
      </Link>
      <CartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}
