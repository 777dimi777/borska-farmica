'use client';
import Link from 'next/link';
import { BrowserApiError } from '@/lib/browser-api/client';
import { useAdminOrder } from './hooks';
import { OrderActions } from './order-actions';
import {
  actorLabel,
  eventLabel,
  formatDate,
  formatDateTime,
  formatRsd,
  paymentStatusLabel,
  statusLabel,
} from './formatters';
const reasonLabel: Record<string, string> = {
  CUSTOMER_REQUEST: 'Kupac je zatražio otkazivanje',
  ADMIN_ACTION: 'Admin je otkazao porudžbinu',
  CONFIRMATION_TIMEOUT: 'Sistem je otkazao zbog isteka roka',
  UNSPECIFIED: 'Razlog nije preciziran',
};
export function AdminOrderDetailView({ id }: { id: string }) {
  const order = useAdminOrder(id);
  if (order.isLoading)
    return (
      <div className="admin-order-detail orders-list-skeleton" role="status">
        Učitavanje porudžbine…
      </div>
    );
  if (order.isError) {
    const missing =
      order.error instanceof BrowserApiError &&
      order.error.kind === 'not-found';
    return (
      <section className="admin-order-detail orders-error" role="alert">
        <h1>
          {missing
            ? 'Porudžbina nije pronađena'
            : 'Porudžbina trenutno nije dostupna'}
        </h1>
        <p>
          {missing
            ? 'Proverite da li je link ispravan.'
            : 'Proverite vezu sa API servisom i pokušajte ponovo.'}
        </p>
        {!missing && (
          <button onClick={() => order.refetch()}>Pokušaj ponovo</button>
        )}
        <Link href="/admin/porudzbine">Nazad na porudžbine</Link>
      </section>
    );
  }
  if (!order.data) return null;
  const o = order.data;
  return (
    <div className="admin-order-detail">
      <nav className="admin-breadcrumb" aria-label="Putanja">
        <Link href="/admin/dashboard">Dashboard</Link>
        <span>/</span>
        <Link href="/admin/porudzbine">Porudžbine</Link>
        <span>/</span>
        <span aria-current="page">{o.orderNumber}</span>
      </nav>
      <header className="order-detail-head">
        <div>
          <p className="eyebrow">Porudžbina</p>
          <h1 tabIndex={-1}>{o.orderNumber}</h1>
          <p>Kreirana {formatDateTime(o.createdAt)}</p>
        </div>
        <div>
          <span className="order-badge">{statusLabel[o.status]}</span>
          <span className="order-badge">
            {paymentStatusLabel[o.paymentStatus]}
          </span>
        </div>
      </header>
      <div className="admin-order-layout">
        <div>
          <section className="order-detail-card">
            <h2>Kupac</h2>
            <p>
              <strong>
                {o.customerSnapshot.firstName} {o.customerSnapshot.lastName}
              </strong>
            </p>
            <p>
              <a href={`mailto:${o.customerSnapshot.email}`}>
                {o.customerSnapshot.email}
              </a>
              <br />
              <a href={`tel:${o.customerSnapshot.phone}`}>
                {o.customerSnapshot.phone}
              </a>
            </p>
          </section>
          <section className="order-detail-card">
            <h2>Preuzimanje</h2>
            <p>
              <strong>{o.pickup.name}</strong>
              <br />
              {o.pickup.address}
            </p>
            <p>
              {formatDate(o.pickup.requestedPickupDate)}
              {o.pickup.confirmedPickupAt && (
                <> · {formatDateTime(o.pickup.confirmedPickupAt)}</>
              )}
            </p>
            {o.pickup.code === 'BOR_CITY_MARKET' && (
              <p>Gradska pijaca Bor — subotom.</p>
            )}
            {o.pickup.instructions && <p>{o.pickup.instructions}</p>}
            {o.customerNote && (
              <p>
                <strong>Napomena kupca:</strong> {o.customerNote}
              </p>
            )}
          </section>
          <section className="order-detail-card">
            <h2>Stavke</h2>
            {o.items.map((i) => (
              <article className="admin-order-item" key={i.id}>
                <div>
                  <strong>{i.productName}</strong>
                  <span>
                    {i.categoryName} · {i.variantName}
                  </span>
                  <small>
                    SKU {i.sku} · pakovanje {i.packageAmount}{' '}
                    {i.measurementUnit}
                  </small>
                  <small>
                    {i.quantity} × {formatRsd(i.unitPrice)}
                  </small>
                </div>
                <strong>{formatRsd(i.lineTotal)}</strong>
              </article>
            ))}
            <dl className="order-totals">
              <div>
                <dt>Međuzbir</dt>
                <dd>{formatRsd(o.summary.subtotal)}</dd>
              </div>
              <div>
                <dt>Naknada</dt>
                <dd>{formatRsd(o.summary.fee)}</dd>
              </div>
              <div>
                <dt>Ukupno</dt>
                <dd>{formatRsd(o.summary.total)}</dd>
              </div>
            </dl>
          </section>
          <section className="order-detail-card">
            <h2>Plaćanje i rokovi</h2>
            <p>
              {o.paymentStatus === 'PAID'
                ? 'Plaćeno gotovinom'
                : 'Plaćanje gotovinom pri preuzimanju'}
            </p>
            <dl className="order-dates">
              <div>
                <dt>Rok potvrde</dt>
                <dd>
                  {o.confirmationExpiresAt
                    ? formatDateTime(o.confirmationExpiresAt)
                    : 'Nije zabeležen'}
                </dd>
              </div>
              {o.confirmedAt && (
                <div>
                  <dt>Potvrđena</dt>
                  <dd>{formatDateTime(o.confirmedAt)}</dd>
                </div>
              )}
              {o.preparingAt && (
                <div>
                  <dt>Priprema</dt>
                  <dd>{formatDateTime(o.preparingAt)}</dd>
                </div>
              )}
              {o.readyAt && (
                <div>
                  <dt>Spremna</dt>
                  <dd>{formatDateTime(o.readyAt)}</dd>
                </div>
              )}
              {o.completedAt && (
                <div>
                  <dt>Završena</dt>
                  <dd>{formatDateTime(o.completedAt)}</dd>
                </div>
              )}
              {o.cancelledAt && (
                <div>
                  <dt>Otkazana</dt>
                  <dd>{formatDateTime(o.cancelledAt)}</dd>
                </div>
              )}
            </dl>
            {o.status === 'CANCELLED' && (
              <div className="cancellation-info">
                <strong>
                  {reasonLabel[o.cancellationReason ?? 'UNSPECIFIED']}
                </strong>
                {o.cancellationNote && <p>{o.cancellationNote}</p>}
              </div>
            )}
          </section>
          <section className="order-detail-card">
            <h2>Rezervacije i zalihe</h2>
            <div className="reservation-list">
              {o.reservations.map((r, index) => (
                <article key={`${r.variantId}-${index}`}>
                  <strong>{r.stock.sku}</strong>
                  <span>
                    {r.quantity} rezervisano · {r.status}
                  </span>
                  <small>
                    Trenutno fizički {r.stock.physical}, rezervisano{' '}
                    {r.stock.reserved}, dostupno {r.stock.available}
                  </small>
                </article>
              ))}
            </div>
          </section>
          <section className="order-detail-card admin-order-timeline">
            <h2>Istorija događaja</h2>
            <ol>
              {o.timeline.map((e, index) => (
                <li key={`${e.type}-${e.createdAt}-${index}`}>
                  <strong>{eventLabel(e.type)}</strong>
                  <span>{actorLabel(e.actorType)}</span>
                  <time dateTime={e.createdAt}>
                    {formatDateTime(e.createdAt)}
                  </time>
                  {e.note && <p>{e.note}</p>}
                </li>
              ))}
            </ol>
          </section>
        </div>
        <OrderActions order={o} refetch={() => order.refetch()} />
      </div>
    </div>
  );
}
