'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';
import { Container } from '@/components/ui/container';
import { ProductPreviewCard } from '@/components/storefront/product-preview-card';
import { useFeedback } from '@/components/providers/feedback-provider';
import { useAuth } from '@/features/auth/auth-provider';
import { formatRsd } from '@/lib/formatters/currency';
import type { ProductPreview } from '@/types/catalog';
import { useCart, useClearCart } from './hooks';
import { CartItems } from './cart-items';

export function CartReferencePage({
  recommendations,
}: {
  recommendations: ProductPreview[];
}) {
  const cart = useCart();
  const clear = useClearCart();
  const auth = useAuth();
  const dialog = useRef<HTMLDialogElement>(null);
  const feedback = useFeedback();

  if (cart.isLoading)
    return <div className="cart-reference-state">Učitavanje vaše korpe…</div>;
  if (cart.isError)
    return (
      <div className="cart-reference-state" role="alert">
        <h1>Korpa trenutno nije dostupna.</h1>
        <button
          className="button button-primary"
          onClick={() => void cart.refetch()}
        >
          Pokušajte ponovo
        </button>
      </div>
    );

  const data = cart.data;
  const valid = data?.items.every((item) => item.validation.valid) ?? false;
  const count = data?.summary.distinctItemCount ?? 0;

  return (
    <main className="cart-reference-page">
      <Container>
        <nav className="cart-breadcrumbs" aria-label="Putanja stranice">
          <Link href="/">Početna</Link>
          <span>/</span>
          <span>Korpa</span>
        </nav>
        <div className="cart-title-row">
          <div>
            <h1>Vaša korpa</h1>
            <p>Pregledajte proizvode pre nego što nastavite sa porudžbinom.</p>
          </div>
          <ol className="cart-checkout-steps" aria-label="Koraci poručivanja">
            <li className="active">
              <span>1</span>
              <b>Korpa</b>
            </li>
            <li>
              <span>2</span>
              <b>Podaci i preuzimanje</b>
            </li>
            <li>
              <span>3</span>
              <b>Potvrda</b>
            </li>
          </ol>
        </div>

        {!data?.items.length ? (
          <section className="cart-reference-empty">
            <span>🧺</span>
            <h2>Vaša korpa je prazna</h2>
            <p>Dodajte domaće proizvode koji su vam potrebni.</p>
            <Link className="button button-primary" href="/proizvodi">
              Pogledajte proizvode →
            </Link>
          </section>
        ) : (
          <div className="cart-reference-grid">
            <div>
              <section className="cart-products-panel">
                <header>
                  <h2>Proizvodi u korpi</h2>
                  <span>
                    {count} {count === 1 ? 'proizvod' : 'proizvoda'}
                  </span>
                </header>
                <CartItems items={data.items} />
                {!valid && (
                  <p className="cart-reference-warning">
                    ⚠ Proverite označene proizvode pre nastavka.
                  </p>
                )}
                <footer>
                  <Link className="button button-secondary" href="/proizvodi">
                    ← Nastavi kupovinu
                  </Link>
                  <button
                    className="text-button"
                    onClick={() => dialog.current?.showModal()}
                  >
                    Isprazni korpu
                  </button>
                </footer>
              </section>
              <section className="cart-note-panel">
                <span aria-hidden="true">♧</span>
                <div>
                  <h2>Napomena uz porudžbinu</h2>
                  <p>
                    Napomenu za pripremu ili preuzimanje možete dodati u
                    sledećem koraku.
                  </p>
                  <Link href="/preuzimanje">
                    Pogledajte detalje preuzimanja →
                  </Link>
                </div>
              </section>
            </div>

            <aside className="cart-reference-sidebar">
              <section className="cart-order-summary">
                <h2>Pregled porudžbine</h2>
                <p>
                  <span>Međuzbir</span>
                  <strong>{formatRsd(data.summary.subtotal)}</strong>
                </p>
                <p>
                  <span>Preuzimanje</span>
                  <strong>Besplatno</strong>
                </p>
                <hr />
                <p className="cart-reference-total">
                  <span>Ukupno</span>
                  <strong>{formatRsd(data.summary.subtotal)}</strong>
                </p>
                <small>Cena i dostupnost proveravaju se pri potvrdi.</small>
                {auth.status === 'anonymous' ? (
                  <>
                    <p className="cart-login-note">
                      Za završetak porudžbine potreban je nalog.
                    </p>
                    <Link
                      className="button button-primary"
                      href="/prijava?returnTo=/checkout"
                    >
                      Prijavite se i nastavite →
                    </Link>
                  </>
                ) : auth.status === 'authenticated' ? (
                  valid ? (
                    <Link className="button button-primary" href="/checkout">
                      Nastavi na podatke i preuzimanje →
                    </Link>
                  ) : (
                    <p className="cart-reference-warning">
                      Ispravite označene stavke.
                    </p>
                  )
                ) : null}
                <div className="cart-cash-note">
                  <span>▤</span>
                  <div>
                    <strong>Gotovina pri preuzimanju</strong>
                    <small>Nema online naplate niti unosa kartice.</small>
                  </div>
                </div>
              </section>
              <section className="cart-pickup-panel">
                <h2>Način preuzimanja</h2>
                <article>
                  <span>⌂</span>
                  <div>
                    <strong>Nade Dimić 30</strong>
                    <small>Po potvrđenom terminu</small>
                  </div>
                </article>
                <article>
                  <span>♜</span>
                  <div>
                    <strong>Gradska pijaca Bor</strong>
                    <small>Svake subote</small>
                  </div>
                </article>
                <p>Tačnu lokaciju i termin birate u sledećem koraku.</p>
              </section>
            </aside>
          </div>
        )}

        <section className="cart-benefit-band">
          <article>
            <span>♧</span>
            <div>
              <strong>Pažljivo pripremljeno</strong>
              <small>Proverena ponuda i dostupnost.</small>
            </div>
          </article>
          <article>
            <span>▤</span>
            <div>
              <strong>Gotovina uživo</strong>
              <small>Bez kartice i online naplate.</small>
            </div>
          </article>
          <article>
            <span>↻</span>
            <div>
              <strong>Jednostavna izmena</strong>
              <small>Količinu menjate direktno u korpi.</small>
            </div>
          </article>
          <article>
            <span>⌖</span>
            <div>
              <strong>Dve lokacije</strong>
              <small>Adresa ili pijaca subotom.</small>
            </div>
          </article>
        </section>

        {!!recommendations.length && (
          <section className="cart-recommendations">
            <header>
              <p className="eyebrow">Još iz naše ponude</p>
              <h2>Možda će vam se dopasti</h2>
            </header>
            <div>
              {recommendations.slice(0, 4).map((product) => (
                <ProductPreviewCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        )}

        <section className="cart-help-section">
          <div>
            <Image
              src="/images/pakovanje-proizvoda.webp"
              alt="Borska Farmica u Boru"
              fill
              sizes="(max-width: 700px) 100vw, 38vw"
            />
          </div>
          <div>
            <p className="eyebrow">Tu smo za vas</p>
            <h2>Treba vam pomoć sa porudžbinom?</h2>
            <p>
              Za pitanja o proizvodima, lokaciji i preuzimanju javite nam se
              preko zvanične Facebook stranice.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href="https://www.facebook.com/borska.farmica.3"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kontaktirajte nas →
              </a>
              <Link className="button button-secondary" href="/preuzimanje">
                Pogledajte preuzimanje →
              </Link>
            </div>
          </div>
        </section>
      </Container>

      <dialog ref={dialog} className="confirm-dialog">
        <h2>Ispraznite korpu?</h2>
        <p>Sve stavke biće uklonjene iz korpe.</p>
        <div>
          <button onClick={() => dialog.current?.close()}>Odustani</button>
          <button
            className="button button-primary"
            disabled={clear.isPending}
            onClick={async () => {
              await clear.mutateAsync(undefined);
              dialog.current?.close();
              feedback('Korpa je ispražnjena.', 'success');
            }}
          >
            Isprazni korpu
          </button>
        </div>
      </dialog>
    </main>
  );
}
