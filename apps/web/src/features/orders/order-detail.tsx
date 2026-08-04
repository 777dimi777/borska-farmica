'use client';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { useCancelOrder, useOrder } from './hooks';
import {
  cancellationLabel,
  formatBelgradeDate,
  formatPickupDate,
  orderStatusLabel,
  paymentLabel,
} from './formatters';
import { formatRsd } from '@/lib/formatters/currency';
import { useFeedback } from '@/components/providers/feedback-provider';
export function OrderDetailView({
  number,
  success = false,
}: {
  number: string;
  success?: boolean;
}) {
  const auth = useAuth(),
    router = useRouter(),
    order = useOrder(number),
    cancel = useCancelOrder(),
    dialog = useRef<HTMLDialogElement>(null),
    feedback = useFeedback();
  useEffect(() => {
    if (auth.status === 'anonymous')
      router.replace(
        `/prijava?returnTo=${encodeURIComponent(success ? `/porudzbina-uspesna/${number}` : `/nalog/porudzbine/${number}`)}`,
      );
  }, [auth.status, router, number, success]);
  if (auth.status === 'loading' || order.isLoading)
    return <div className="order-skeleton">Učitavanje porudžbine…</div>;
  if (auth.status !== 'authenticated') return null;
  if (order.isError || !order.data)
    return (
      <div role="alert">
        <p>Porudžbina nije pronađena ili trenutno nije dostupna.</p>
        <button onClick={() => void order.refetch()}>Pokušajte ponovo</button>
      </div>
    );
  const o = order.data;
  return (
    <div className="order-detail">
      {success && (
        <div className="order-success" role="status">
          <h2>Porudžbina je uspešno poslata</h2>
          <p>Čeka potvrdu Borske Farmice.</p>
        </div>
      )}
      <header>
        <p className="eyebrow">Porudžbina</p>
        <h1>{o.orderNumber}</h1>
        <span className="status-badge">{orderStatusLabel[o.status]}</span>
        <span>{paymentLabel(o.paymentStatus)}</span>
      </header>
      <div className="order-detail-grid">
        <section>
          <h2>Stavke</h2>
          {o.items.map((i, index) => (
            <article className="order-item" key={`${i.sku}-${index}`}>
              <div>
                <strong>{i.productName}</strong>
                <small>
                  {i.variantName} · {i.packageAmount} {i.measurementUnit}
                </small>
                <small>
                  {i.quantity} × {formatRsd(i.unitPrice)}
                </small>
              </div>
              <strong>{formatRsd(i.lineTotal)}</strong>
            </article>
          ))}
          <div className="summary-total">
            <span>Ukupno</span>
            <strong>{formatRsd(o.summary.total)}</strong>
          </div>
        </section>
        <aside>
          <h2>Preuzimanje</h2>
          <strong>{o.pickup.name}</strong>
          <p>{o.pickup.address}</p>
          <p>{formatPickupDate(o.pickup.requestedPickupDate)}</p>
          {o.pickup.instructions && <p>{o.pickup.instructions}</p>}
          <p>Gotovina pri preuzimanju</p>
          <h2>Kontakt</h2>
          <p>
            {o.customer.firstName} {o.customer.lastName}
            <br />
            {o.customer.email}
            <br />
            {o.customer.phone}
          </p>
        </aside>
      </div>
      <section className="timeline">
        <h2>Tok porudžbine</h2>
        <ol>
          {(o.timeline?.length
            ? o.timeline
            : [
                {
                  type: 'order.created',
                  fromStatus: null,
                  toStatus: 'PENDING_CONFIRMATION' as const,
                  note: null,
                  createdAt: o.createdAt,
                },
              ]
          ).map((e, i) => (
            <li key={`${e.type}-${i}`}>
              <strong>
                {e.toStatus
                  ? orderStatusLabel[e.toStatus]
                  : 'Porudžbina poslata'}
              </strong>
              <time dateTime={e.createdAt}>
                {formatBelgradeDate(e.createdAt)}
              </time>
            </li>
          ))}
        </ol>
        {o.confirmationExpiresAt && o.status === 'PENDING_CONFIRMATION' && (
          <p>
            Potvrda se očekuje do {formatBelgradeDate(o.confirmationExpiresAt)}.
            Ako ne bude potvrđena, sistem otkazuje porudžbinu i oslobađa
            rezervaciju.
          </p>
        )}
        {o.status === 'CANCELLED' && (
          <p>{cancellationLabel(o.cancellationReason)}</p>
        )}
      </section>
      {o.status === 'PENDING_CONFIRMATION' && (
        <button
          className="button button-ghost"
          onClick={() => dialog.current?.showModal()}
        >
          Otkaži porudžbinu
        </button>
      )}
      <nav className="order-links">
        <Link href={`/nalog/porudzbine/${encodeURIComponent(o.orderNumber)}`}>
          Detalji porudžbine
        </Link>
        <Link href="/nalog/porudzbine">Sve porudžbine</Link>
        <Link href="/proizvodi">Nazad u prodavnicu</Link>
      </nav>
      <dialog ref={dialog} className="confirm-dialog">
        <h2>Otkažite porudžbinu?</h2>
        <p>
          Rezervisana količina biće oslobođena. Ovu akciju ne možete poništiti
          kroz korisnički nalog.
        </p>
        <div>
          <button onClick={() => dialog.current?.close()}>Odustani</button>
          <button
            className="button button-primary"
            disabled={cancel.isPending}
            onClick={async () => {
              try {
                await cancel.mutateAsync({ number: o.orderNumber });
                dialog.current?.close();
                feedback('Porudžbina je otkazana.', 'success');
              } catch {
                dialog.current?.close();
                void order.refetch();
                feedback(
                  'Otkazivanje više nije moguće. Osvežili smo status.',
                  'error',
                );
              }
            }}
          >
            Otkaži porudžbinu
          </button>
        </div>
      </dialog>
    </div>
  );
}
