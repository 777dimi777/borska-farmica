'use client';
import Link from 'next/link';
import { useRef } from 'react';
import { useAuth } from '@/features/auth/auth-provider';
import { useCart, useClearCart } from './hooks';
import { CartItems } from './cart-items';
import { formatRsd } from '@/lib/formatters/currency';
import { useFeedback } from '@/components/providers/feedback-provider';
export function CartPage() {
  const cart = useCart(),
    clear = useClearCart(),
    auth = useAuth(),
    dialog = useRef<HTMLDialogElement>(null),
    feedback = useFeedback();
  if (cart.isLoading) return <p>UÄitavanje korpeâ€¦</p>;
  if (cart.isError)
    return (
      <div role="alert">
        <p>Korpa trenutno nije dostupna.</p>
        <button onClick={() => void cart.refetch()}>PokuÅ¡ajte ponovo</button>
      </div>
    );
  if (!cart.data?.items.length)
    return (
      <div className="empty-cart">
        <h2>Korpa je prazna</h2>
        <p>Dodajte domaÄ‡e proizvode koji su vam potrebni.</p>
        <Link className="button button-primary" href="/proizvodi">
          Pogledajte proizvode
        </Link>
      </div>
    );
  return (
    <div className="cart-page-grid">
      <section>
        <div className="cart-page-head">
          <h2>Stavke ({cart.data.summary.distinctItemCount})</h2>
          <button
            className="text-button"
            onClick={() => dialog.current?.showModal()}
          >
            Isprazni korpu
          </button>
        </div>
        <CartItems items={cart.data.items} />
      </section>
      <aside className="cart-summary">
        <h2>Pregled korpe</h2>
        <p>
          <span>RazliÄitih stavki</span>
          <strong>{cart.data.summary.distinctItemCount}</strong>
        </p>
        <p className="summary-total">
          <span>Ukupno</span>
          <strong>{formatRsd(cart.data.summary.subtotal)}</strong>
        </p>
        <small>
          Cena i dostupnost ponovo se proveravaju pri poruÄivanju. PlaÄ‡anje je
          gotovinom pri preuzimanju.
        </small>
        <Link href="/preuzimanje">Informacije o preuzimanju</Link>
        {auth.status === 'anonymous' ? (
          <>
            <p>Za zavrÅ¡etak porudÅ¾bine potrebno je da se prijavite.</p>
            <Link
              className="button button-secondary"
              href="/prijava?returnTo=/korpa"
            >
              Prijavite se
            </Link>
          </>
        ) : auth.status === 'authenticated' ? (
          <p>Prijavljeni ste kao {auth.customer?.firstName}.</p>
        ) : null}
        <Link href="/proizvodi">Nastavite kupovinu</Link>
      </aside>
      <dialog ref={dialog} className="confirm-dialog">
        <h2>Ispraznite korpu?</h2>
        <p>Sve stavke biÄ‡e uklonjene iz korpe.</p>
        <div>
          <button onClick={() => dialog.current?.close()}>Odustani</button>
          <button
            className="button button-primary"
            disabled={clear.isPending}
            onClick={async () => {
              await clear.mutateAsync(undefined);
              dialog.current?.close();
              feedback('Korpa je ispraÅ¾njena.', 'success');
            }}
          >
            Isprazni korpu
          </button>
        </div>
      </dialog>
    </div>
  );
}
