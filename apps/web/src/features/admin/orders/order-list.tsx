'use client';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdminOrders, usePickupLocations } from './hooks';
import {
  ORDER_STATUSES,
  parseOrderFilters,
  serializeOrderFilters,
  updateOrderFilters,
  type OrderFilters,
} from './query';
import {
  formatDate,
  formatDateTime,
  formatRsd,
  paymentStatusLabel,
  statusLabel,
} from './formatters';
const tabs: [string, OrderFilters['status']][] = [
  ['Sve', undefined],
  ['Čekaju potvrdu', 'PENDING_CONFIRMATION'],
  ['Potvrđene', 'CONFIRMED'],
  ['U pripremi', 'PREPARING'],
  ['Spremne', 'READY_FOR_PICKUP'],
  ['Završene', 'COMPLETED'],
  ['Otkazane', 'CANCELLED'],
];
function url(
  filters: OrderFilters,
  patch: Partial<OrderFilters>,
  reset = true,
) {
  const q = updateOrderFilters(filters, patch, reset).toString();
  return `/admin/porudzbine${q ? `?${q}` : ''}`;
}
function Deadline({ value }: { value: string | null }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const timer = window.setTimeout(() => setNow(Date.now()), 0);
    return () => window.clearTimeout(timer);
  }, []);
  if (!value || now === null) return null;
  const remaining = new Date(value).getTime() - now;
  return (
    <small
      className={
        remaining <= 0
          ? 'deadline expired'
          : remaining < 3_600_000 * 3
            ? 'deadline soon'
            : 'deadline'
      }
    >
      {remaining <= 0
        ? 'Rok za potvrdu je istekao — osvežite status.'
        : `Potvrditi do ${formatDateTime(value)}`}
    </small>
  );
}
function FilterFields({
  filters,
  pickups,
}: {
  filters: OrderFilters;
  pickups: ReturnType<typeof usePickupLocations>['data'];
}) {
  return (
    <>
      <label>
        Status
        <select name="status" defaultValue={filters.status ?? ''}>
          <option value="">Svi statusi</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {statusLabel[s]}
            </option>
          ))}
        </select>
      </label>
      <label>
        Plaćanje
        <select name="paymentStatus" defaultValue={filters.paymentStatus ?? ''}>
          <option value="">Sva plaćanja</option>
          <option value="UNPAID">Nije plaćeno</option>
          <option value="PAID">Plaćeno</option>
        </select>
      </label>
      <label>
        Lokacija
        <select
          name="pickupLocationId"
          defaultValue={filters.pickupLocationId ?? ''}
        >
          <option value="">Sve lokacije</option>
          {pickups?.map((x) => (
            <option key={x.id} value={x.id}>
              {x.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Kreirano od
        <input
          type="date"
          name="createdAtFrom"
          defaultValue={filters.createdAtFrom ?? ''}
        />
      </label>
      <label>
        Kreirano do
        <input
          type="date"
          name="createdAtTo"
          defaultValue={filters.createdAtTo ?? ''}
        />
      </label>
      <label>
        Sortiranje
        <select name="sort" defaultValue={filters.sort}>
          <option value="newest">Najnovije</option>
          <option value="oldest">Najstarije</option>
          <option value="pickup_date">Datum preuzimanja</option>
          <option value="status">Status</option>
        </select>
      </label>
    </>
  );
}
function OrderRows({
  items,
}: {
  items: NonNullable<ReturnType<typeof useAdminOrders>['data']>['data'];
}) {
  return (
    <>
      {items.map((o) => (
        <tr key={o.id}>
          <td>
            <Link href={`/admin/porudzbine/${o.id}`}>{o.orderNumber}</Link>
            {o.status === 'PENDING_CONFIRMATION' && (
              <Deadline value={o.confirmationExpiresAt} />
            )}
          </td>
          <td>
            {o.customer.firstName} {o.customer.lastName}
          </td>
          <td>{formatDateTime(o.createdAt)}</td>
          <td>
            {o.pickup.name}
            <small>{formatDate(o.requestedPickupDate)}</small>
          </td>
          <td>
            <span className={`order-badge status-${o.status.toLowerCase()}`}>
              {statusLabel[o.status]}
            </span>
          </td>
          <td>
            <span className="order-badge">
              {paymentStatusLabel[o.paymentStatus]}
            </span>
          </td>
          <td>{formatRsd(o.total)}</td>
          <td>
            <Link href={`/admin/porudzbine/${o.id}`}>Detalji</Link>
          </td>
        </tr>
      ))}
    </>
  );
}
export function AdminOrderList() {
  const params = useSearchParams();
  const router = useRouter();
  const filters = useMemo(() => parseOrderFilters(params), [params]);
  const orders = useAdminOrders(filters);
  const pickups = usePickupLocations();
  const dialog = useRef<HTMLDialogElement>(null);
  const apply = (form: FormData) => {
    const q = new URLSearchParams();
    for (const [key, value] of form.entries())
      if (String(value).trim()) q.set(key, String(value).trim());
    const parsed = parseOrderFilters(q);
    router.push(
      `/admin/porudzbine?${serializeOrderFilters({ ...parsed, page: 1 })}`,
    );
    dialog.current?.close();
  };
  const active = [
    filters.search && ['search', 'Pretraga', filters.search],
    filters.status && ['status', 'Status', statusLabel[filters.status]],
    filters.paymentStatus && [
      'paymentStatus',
      'Plaćanje',
      paymentStatusLabel[filters.paymentStatus],
    ],
    filters.pickupLocationId && [
      'pickupLocationId',
      'Lokacija',
      pickups.data?.find((x) => x.id === filters.pickupLocationId)?.name ??
        'Izabrana',
    ],
    filters.createdAtFrom && ['createdAtFrom', 'Od', filters.createdAtFrom],
    filters.createdAtTo && ['createdAtTo', 'Do', filters.createdAtTo],
  ].filter(Boolean) as [keyof OrderFilters, string, string][];
  return (
    <div className="admin-orders-page">
      <header className="orders-page-head">
        <div>
          <p className="eyebrow">Operativni centar</p>
          <h1>Porudžbine</h1>
          <p>
            Pregledajte, potvrdite i pratite porudžbine do ličnog preuzimanja.
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={() => orders.refetch()}
        >
          Osveži
        </button>
      </header>
      <nav className="order-tabs" aria-label="Status porudžbine">
        {tabs.map(([label, status]) => (
          <Link
            key={label}
            className={filters.status === status ? 'active' : ''}
            href={url(filters, { status })}
          >
            {label}
          </Link>
        ))}
      </nav>
      <section className="orders-toolbar" aria-label="Pretraga i filteri">
        <form
          action={(form) => {
            const search = String(form.get('search') ?? '')
              .trim()
              .slice(0, 120);
            router.push(url(filters, { search }));
          }}
        >
          <label htmlFor="order-search">Pretraga porudžbina</label>
          <div>
            <input
              id="order-search"
              name="search"
              type="search"
              maxLength={120}
              defaultValue={filters.search}
              placeholder="Broj porudžbine, kupac, email ili telefon"
            />
            <button>Pretraži</button>
          </div>
        </form>
        <button
          className="mobile-order-filters"
          onClick={() => dialog.current?.showModal()}
        >
          Filteri
        </button>
        <form className="desktop-order-filters" action={apply}>
          <FilterFields filters={filters} pickups={pickups.data} />
          <button>Primeni</button>
        </form>
      </section>
      <dialog className="order-filter-dialog" ref={dialog}>
        <header>
          <h2>Filteri</h2>
          <button
            onClick={() => dialog.current?.close()}
            aria-label="Zatvori filtere"
          >
            ×
          </button>
        </header>
        <form action={apply}>
          <FilterFields filters={filters} pickups={pickups.data} />
          <div>
            <button type="button" onClick={() => dialog.current?.close()}>
              Odustani
            </button>
            <button className="button button-primary">Primeni</button>
          </div>
        </form>
      </dialog>
      {active.length > 0 && (
        <div className="order-filter-chips" aria-label="Aktivni filteri">
          {active.map(([key, label, value]) => (
            <Link
              key={key}
              href={url(filters, {
                [key]: key === 'search' ? '' : undefined,
              } as Partial<OrderFilters>)}
              aria-label={`Ukloni filter ${label}`}
            >
              {label}: {value} ×
            </Link>
          ))}
          <Link href="/admin/porudzbine">Obriši filtere</Link>
        </div>
      )}
      {orders.isLoading ? (
        <div className="orders-list-skeleton" role="status">
          Učitavanje porudžbina…
        </div>
      ) : orders.isError ? (
        <section className="orders-error" role="alert">
          <h2>Porudžbine trenutno nisu dostupne</h2>
          <p>Proverite vezu sa API servisom i pokušajte ponovo.</p>
          <button onClick={() => orders.refetch()}>Pokušaj ponovo</button>
        </section>
      ) : orders.data && orders.data.data.length ? (
        <>
          <p className="orders-result-count">
            {orders.data.pagination.total} rezultata
          </p>
          <div className="order-table-wrap">
            <table>
              <caption className="sr-only">Admin pregled porudžbina</caption>
              <thead>
                <tr>
                  <th>Broj</th>
                  <th>Kupac</th>
                  <th>Kreirano</th>
                  <th>Preuzimanje</th>
                  <th>Status</th>
                  <th>Plaćanje</th>
                  <th>Ukupno</th>
                  <th>Akcija</th>
                </tr>
              </thead>
              <tbody>
                <OrderRows items={orders.data.data} />
              </tbody>
            </table>
          </div>
          <div className="order-mobile-cards">
            {orders.data.data.map((o) => (
              <article key={o.id}>
                <header>
                  <Link href={`/admin/porudzbine/${o.id}`}>
                    {o.orderNumber}
                  </Link>
                  <strong>{formatRsd(o.total)}</strong>
                </header>
                <p>
                  {o.customer.firstName} {o.customer.lastName}
                </p>
                <p>
                  {o.pickup.name} · {formatDate(o.requestedPickupDate)}
                </p>
                <div>
                  <span className="order-badge">{statusLabel[o.status]}</span>
                  <span className="order-badge">
                    {paymentStatusLabel[o.paymentStatus]}
                  </span>
                </div>
                {o.status === 'PENDING_CONFIRMATION' && (
                  <Deadline value={o.confirmationExpiresAt} />
                )}
                <Link href={`/admin/porudzbine/${o.id}`}>Detalji</Link>
              </article>
            ))}
          </div>
          <Pagination filters={filters} pagination={orders.data.pagination} />
        </>
      ) : (
        <section className="orders-empty">
          <h2>
            {active.length
              ? 'Nema rezultata za izabrane filtere'
              : 'Još nema porudžbina'}
          </h2>
          <p>
            {active.length
              ? 'Uklonite neki filter ili promenite pretragu.'
              : 'Nove porudžbine će se pojaviti ovde.'}
          </p>
          {active.length > 0 && (
            <Link href="/admin/porudzbine">Obriši filtere</Link>
          )}
        </section>
      )}
    </div>
  );
}
function Pagination({
  filters,
  pagination,
}: {
  filters: OrderFilters;
  pagination: {
    page: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}) {
  if (pagination.totalPages <= 1) return null;
  const pages = Array.from(
    { length: pagination.totalPages },
    (_, i) => i + 1,
  ).filter(
    (p) =>
      p === 1 ||
      p === pagination.totalPages ||
      Math.abs(p - pagination.page) <= 1,
  );
  return (
    <nav className="admin-pagination" aria-label="Stranice porudžbina">
      {pagination.hasPreviousPage ? (
        <Link href={url(filters, { page: pagination.page - 1 }, false)}>
          Prethodna
        </Link>
      ) : (
        <span aria-disabled="true">Prethodna</span>
      )}
      {pages.map((p, i) => (
        <span key={p}>
          {i > 0 && p - pages[i - 1] > 1 && <i>…</i>}
          <Link
            aria-current={p === pagination.page ? 'page' : undefined}
            href={url(filters, { page: p }, false)}
          >
            {p}
          </Link>
        </span>
      ))}
      {pagination.hasNextPage ? (
        <Link href={url(filters, { page: pagination.page + 1 }, false)}>
          Sledeća
        </Link>
      ) : (
        <span aria-disabled="true">Sledeća</span>
      )}
    </nav>
  );
}
