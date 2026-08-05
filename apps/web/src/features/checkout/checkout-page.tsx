'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/auth-provider';
import { useCart, cartKey } from '@/features/cart/hooks';
import {
  usePickupLocations,
  useCheckoutPreview,
  useCreateOrder,
} from './hooks';
import type { CheckoutPayload } from './types';
import {
  payloadFingerprint,
  idempotencyFor,
  clearIdempotency,
} from './idempotency';
import { formatRsd } from '@/lib/formatters/currency';
import { BrowserApiError } from '@/lib/browser-api/client';
import { orderKeys } from '@/features/orders/hooks';
export function CheckoutPage({
  today,
  maxDate,
}: {
  today: string;
  maxDate: string;
}) {
  const auth = useAuth(),
    router = useRouter(),
    cart = useCart(),
    pickups = usePickupLocations(),
    create = useCreateOrder(),
    qc = useQueryClient();
  const [pickup, setPickup] = useState(''),
    [date, setDate] = useState(''),
    [note, setNote] = useState(''),
    [previewPayload, setPreviewPayload] = useState<CheckoutPayload | null>(
      null,
    ),
    [error, setError] = useState('');
  const summary = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (auth.status === 'anonymous')
      router.replace('/prijava?returnTo=/checkout');
  }, [auth.status, router]);
  const selected = pickups.data?.find((x) => x.id === pickup);
  const payload = useMemo<CheckoutPayload | null>(
    () =>
      pickup && date
        ? {
            pickupLocationId: pickup,
            requestedPickupDate: date,
            ...(note.trim() ? { customerNote: note.trim() } : {}),
          }
        : null,
    [pickup, date, note],
  );
  const preview = useCheckoutPreview(previewPayload, !!previewPayload);
  const invalidate = () => {
    setPreviewPayload(null);
    setError('');
  };
  if (auth.status === 'loading')
    return <div className="checkout-skeleton">Učitavanje checkout-a…</div>;
  if (auth.status !== 'authenticated') return null;
  if (cart.isLoading || pickups.isLoading)
    return (
      <div className="checkout-skeleton">Proveravamo korpu i lokacije…</div>
    );
  if (cart.isError || pickups.isError)
    return (
      <div role="alert">
        <p>Checkout podaci trenutno nisu dostupni.</p>
        <button
          onClick={() => {
            void cart.refetch();
            void pickups.refetch();
          }}
        >
          Pokušajte ponovo
        </button>
      </div>
    );
  if (!cart.data?.items.length)
    return (
      <div className="empty-cart">
        <h2>Korpa je prazna</h2>
        <Link href="/proizvodi">Pogledajte proizvode</Link>
        <Link href="/korpa">Nazad na korpu</Link>
      </div>
    );
  const invalid = cart.data.items.some((i) => !i.validation.valid);
  const submit = async () => {
    if (!payload || !preview.data?.valid) return;
    setError('');
    try {
      const fp = await payloadFingerprint({
        items: cart.data.items.map((i) => ({
          id: i.id,
          variantId: i.variant.id,
          quantity: i.quantity,
        })),
        pickupLocationId: payload.pickupLocationId,
        requestedPickupDate: payload.requestedPickupDate,
        note: payload.customerNote,
      });
      const key = idempotencyFor(fp);
      const order = await create.mutateAsync({ payload, key });
      clearIdempotency();
      await qc.invalidateQueries({ queryKey: cartKey });
      await qc.invalidateQueries({ queryKey: orderKeys.all });
      router.replace(
        `/porudzbina-uspesna/${encodeURIComponent(order.orderNumber)}`,
      );
    } catch (e) {
      setError(
        e instanceof BrowserApiError && ['network', 'timeout'].includes(e.kind)
          ? 'Nismo dobili potvrdu servera. Pokušajte ponovo — isti bezbedni zahtev neće napraviti duplu porudžbinu.'
          : 'Porudžbina nije poslata. Podaci su se možda promenili; proverite preview i pokušajte ponovo.',
      );
      summary.current?.focus();
    }
  };
  return (
    <div className="checkout-grid">
      <section>
        <ol className="checkout-steps" aria-label="Koraci poručivanja">
          <li>1. Nalog i korpa</li>
          <li>2. Preuzimanje</li>
          <li>3. Pregled</li>
        </ol>
        {invalid && (
          <div className="form-summary" role="alert">
            <p>Korpa sadrži stavku koju morate ispraviti.</p>
            <Link href="/korpa">Ispravite korpu</Link>
          </div>
        )}
        <section className="checkout-section">
          <h2>Kontakt podaci</h2>
          <p>
            <strong>
              {auth.customer?.firstName} {auth.customer?.lastName}
            </strong>
            <br />
            {auth.customer?.email}
            <br />
            {auth.customer?.phone}
          </p>
          <Link href="/nalog">Izmenite podatke</Link>
        </section>
        <section className="checkout-section">
          <h2>Preuzimanje</h2>
          <fieldset disabled={invalid}>
            <legend>Izaberite lokaciju</legend>
            <div className="pickup-options">
              {pickups.data?.map((p) => (
                <label key={p.id} className={pickup === p.id ? 'selected' : ''}>
                  <input
                    type="radio"
                    name="pickup"
                    value={p.id}
                    checked={pickup === p.id}
                    onChange={() => {
                      setPickup(p.id);
                      setDate('');
                      invalidate();
                    }}
                  />
                  <span>
                    <strong>{p.name}</strong>
                    <small>{p.address}</small>
                    {p.instructions && <small>{p.instructions}</small>}
                    {p.allowedWeekday === 6 && (
                      <small>Preuzimanje subotom</small>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          {selected && (
            <label className="form-field">
              <span>Željeni datum preuzimanja</span>
              <input
                type="date"
                min={today}
                max={maxDate}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  invalidate();
                }}
              />
              <small>
                {selected.allowedWeekday === 6
                  ? 'Za Gradsku pijacu izaberite subotu.'
                  : 'Tačan termin potvrđujemo telefonom.'}
              </small>
            </label>
          )}
          <label className="form-field">
            <span>Napomena za Borsku Farmicu — opciono</span>
            <textarea
              maxLength={500}
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                invalidate();
              }}
            />
            <small>{note.length}/500</small>
          </label>
        </section>
        <section className="checkout-section">
          <h2>Plaćanje</h2>
          <strong>Gotovina pri preuzimanju</strong>
          <p>Nema online naplate niti unosa kartice. Iznos plaćate uživo.</p>
        </section>
        <button
          className="button button-secondary"
          disabled={!payload || invalid || preview.isFetching}
          onClick={() => setPreviewPayload(payload)}
        >
          {preview.isFetching ? 'Provera…' : 'Prikaži serverski pregled'}
        </button>
      </section>
      <aside className="checkout-preview">
        {preview.isError && (
          <div role="alert">
            Preview nije uspeo. Proverite datum, lokaciju i korpu.
          </div>
        )}
        {preview.data && (
          <>
            <h2>Pregled porudžbine</h2>
            {preview.data.items.map((i) => (
              <div className="preview-item" key={i.cartItemId}>
                <span>
                  {i.productName} — {i.variantName}
                  <small>
                    {i.quantity} × {formatRsd(i.unitPrice)}
                  </small>
                </span>
                <strong>{formatRsd(i.lineTotal)}</strong>
                {!i.available && (
                  <small>Stavka trenutno blokira poručivanje.</small>
                )}
              </div>
            ))}
            <div className="summary-total">
              <span>Ukupno</span>
              <strong>{formatRsd(preview.data.summary.total)}</strong>
            </div>
            {!preview.data.valid && (
              <div className="form-summary">
                Preview sadrži probleme. Vratite se u korpu.
              </div>
            )}
            <button
              className="button button-primary"
              disabled={!preview.data.valid || create.isPending}
              onClick={() => void submit()}
            >
              {create.isPending ? 'Slanje…' : 'Pošalji porudžbinu'}
            </button>
          </>
        )}
        {error && (
          <div
            ref={summary}
            tabIndex={-1}
            className="form-summary"
            role="alert"
          >
            {error}
          </div>
        )}
      </aside>
    </div>
  );
}
