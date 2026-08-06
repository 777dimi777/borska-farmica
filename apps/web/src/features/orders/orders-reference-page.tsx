'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { formatRsd } from '@/lib/formatters/currency';
import { useOrder, useOrders } from './hooks';
import { formatBelgradeDate, orderStatusLabel } from './formatters';
import type { OrderListItem, OrderStatus } from './types';

const activeStatuses: OrderStatus[] = [
  'PENDING_CONFIRMATION',
  'CONFIRMED',
  'PREPARING',
  'READY_FOR_PICKUP',
];
const statusSteps: Array<{ status: OrderStatus; label: string; icon: string }> =
  [
    {
      status: 'PENDING_CONFIRMATION',
      label: 'Porudžbina primljena',
      icon: '▤',
    },
    { status: 'CONFIRMED', label: 'Potvrđena', icon: '✓' },
    { status: 'PREPARING', label: 'U pripremi', icon: '♨' },
    { status: 'READY_FOR_PICKUP', label: 'Spremna za preuzimanje', icon: '▣' },
    { status: 'COMPLETED', label: 'Preuzeto', icon: '✓' },
  ];

function statusIndex(status: OrderStatus) {
  if (status === 'CANCELLED') return -1;
  return statusSteps.findIndex((step) => step.status === status);
}

export function OrdersReferencePage({ page = 1 }: { page?: number }) {
  const auth = useAuth();
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus | ''>('');
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');
  const [search, setSearch] = useState('');
  const orders = useOrders({ page, status: status || undefined, sort });
  const active = orders.data?.data.find((order) =>
    activeStatuses.includes(order.status),
  );
  const activeDetail = useOrder(active?.orderNumber ?? '');

  useEffect(() => {
    if (auth.status === 'anonymous')
      router.replace('/prijava?returnTo=/nalog/porudzbine');
  }, [auth.status, router]);

  const history = useMemo(() => {
    const items = orders.data?.data ?? [];
    const needle = search.trim().toLocaleLowerCase('sr-Latn-RS');
    return items.filter(
      (order) =>
        order.orderNumber !== active?.orderNumber &&
        (!needle ||
          order.orderNumber.toLocaleLowerCase('sr-Latn-RS').includes(needle)),
    );
  }, [active?.orderNumber, orders.data?.data, search]);

  if (auth.status === 'loading' || orders.isLoading)
    return (
      <div className="account-orders-state">Učitavanje vaših porudžbina…</div>
    );
  if (auth.status !== 'authenticated' || !auth.customer) return null;
  if (orders.isError)
    return (
      <div className="account-orders-state" role="alert">
        <h1>Porudžbine trenutno nisu dostupne.</h1>
        <button
          className="button button-primary"
          onClick={() => void orders.refetch()}
        >
          Pokušajte ponovo
        </button>
      </div>
    );

  const customer = auth.customer;
  return (
    <main className="account-orders-page">
      <div className="container">
        <nav className="account-orders-breadcrumbs">
          <Link href="/">Početna</Link>
          <span>/</span>
          <Link href="/nalog">Moj nalog</Link>
          <span>/</span>
          <span>Moje porudžbine</span>
        </nav>
        <header className="account-orders-header">
          <div>
            <p className="eyebrow">Moj nalog</p>
            <h1>Moje porudžbine</h1>
            <p>
              Pratite aktivne porudžbine i pregledajte sve prethodne kupovine.
            </p>
          </div>
          <div className="account-greeting">
            <span>
              {customer.firstName.charAt(0)}
              {customer.lastName.charAt(0)}
            </span>
            <div>
              <strong>Zdravo, {customer.firstName}!</strong>
              <button
                onClick={async () => {
                  await auth.logout();
                  router.replace('/');
                }}
              >
                ↪ Odjavi se
              </button>
            </div>
          </div>
        </header>

        <div className="account-orders-layout">
          <aside className="account-sidebar">
            <div className="account-sidebar-user">
              <span>
                {customer.firstName.charAt(0)}
                {customer.lastName.charAt(0)}
              </span>
              <div>
                <strong>
                  {customer.firstName} {customer.lastName}
                </strong>
                <small>{customer.email}</small>
              </div>
            </div>
            <nav>
              <Link href="/nalog">
                ♙ <span>Pregled naloga</span>
              </Link>
              <Link className="active" href="/nalog/porudzbine">
                🛒 <span>Moje porudžbine</span>
              </Link>
              <Link href="/nalog#licni-podaci">
                ♙ <span>Lični podaci</span>
              </Link>
              <Link href="/preuzimanje">
                ⌖ <span>Lokacije preuzimanja</span>
              </Link>
              <Link href="/nalog#bezbednost">
                ▣ <span>Bezbednost</span>
              </Link>
            </nav>
            <button
              onClick={async () => {
                await auth.logout();
                router.replace('/');
              }}
            >
              ↪ Odjavi se
            </button>
            <div className="account-sidebar-art">♧</div>
          </aside>

          <div className="account-orders-content">
            <section className="active-order-section">
              <h2>Aktivna porudžbina</h2>
              {active ? (
                <ActiveOrderCard order={active} detail={activeDetail.data} />
              ) : (
                <div className="no-active-order">
                  <span>✓</span>
                  <div>
                    <h3>Trenutno nema aktivne porudžbine</h3>
                    <p>Nova porudžbina će se ovde pojaviti čim je pošaljete.</p>
                  </div>
                  <Link className="button button-primary" href="/proizvodi">
                    Pogledaj ponudu
                  </Link>
                </div>
              )}
            </section>

            <section className="order-history-section">
              <div className="order-history-title">
                <h2>Istorija porudžbina</h2>
                <span>{orders.data?.pagination.total ?? 0} ukupno</span>
              </div>
              <div className="order-history-filters">
                <label>
                  <span className="sr-only">Pretražite broj porudžbine</span>
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Pretražite broj porudžbine"
                  />
                </label>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as OrderStatus | '')
                  }
                  aria-label="Status porudžbine"
                >
                  <option value="">Svi statusi</option>
                  {Object.entries(orderStatusLabel).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={sort}
                  onChange={(event) =>
                    setSort(event.target.value as 'newest' | 'oldest')
                  }
                  aria-label="Redosled"
                >
                  <option value="newest">Najnovije prvo</option>
                  <option value="oldest">Najstarije prvo</option>
                </select>
                <button
                  onClick={() => {
                    setSearch('');
                    setStatus('');
                    setSort('newest');
                  }}
                >
                  Resetuj filtere ↻
                </button>
              </div>
              <div className="order-history-list">
                {history.length ? (
                  history.map((order) => (
                    <HistoryOrderRow key={order.orderNumber} order={order} />
                  ))
                ) : (
                  <div className="order-history-empty">
                    Nema porudžbina koje odgovaraju izabranim filterima.
                  </div>
                )}
              </div>
              {orders.data && orders.data.pagination.totalPages > 1 && (
                <nav
                  className="account-order-pagination"
                  aria-label="Paginacija porudžbina"
                >
                  <Link
                    aria-disabled={!orders.data.pagination.hasPreviousPage}
                    href={`/nalog/porudzbine?page=${Math.max(1, page - 1)}`}
                  >
                    ←
                  </Link>
                  <span>{page}</span>
                  <Link
                    aria-disabled={!orders.data.pagination.hasNextPage}
                    href={`/nalog/porudzbine?page=${Math.min(orders.data.pagination.totalPages, page + 1)}`}
                  >
                    →
                  </Link>
                </nav>
              )}
            </section>
          </div>
        </div>

        <section className="order-status-guide">
          <h2>Šta znače statusi?</h2>
          <div>
            {statusSteps.map((step) => (
              <article key={step.status}>
                <span>{step.icon}</span>
                <div>
                  <strong>{step.label}</strong>
                  <small>{statusDescription(step.status)}</small>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="order-help-banner">
          <div>
            <Image
              src="/images/licno-preuzimanje.webp"
              alt="Borska Farmica"
              fill
              sizes="(max-width: 700px) 100vw, 40vw"
            />
          </div>
          <div>
            <p className="eyebrow">Pomoć oko porudžbine</p>
            <h2>Imate pitanje o porudžbini?</h2>
            <p>
              Pripremite broj porudžbine i javite nam se preko zvanične Facebook
              stranice.
            </p>
            <div>
              <a
                className="button button-primary"
                href="https://www.facebook.com/borska.farmica.3"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kontaktirajte nas →
              </a>
              <Link className="button button-secondary" href="/preuzimanje">
                Lokacije preuzimanja
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function ActiveOrderCard({
  order,
  detail,
}: {
  order: OrderListItem;
  detail: ReturnType<typeof useOrder>['data'];
}) {
  const current = statusIndex(order.status);
  const images =
    detail?.items.filter((item) => item.imageUrl).slice(0, 3) ?? [];
  return (
    <article className="active-order-card">
      <header>
        <div>
          <h3>Porudžbina #{order.orderNumber}</h3>
          <time>{formatBelgradeDate(order.createdAt)}</time>
        </div>
        <span
          className={`order-status-pill status-${order.status.toLowerCase()}`}
        >
          {orderStatusLabel[order.status]}
        </span>
      </header>
      <div className="active-order-overview">
        <div>
          <small>Ukupno</small>
          <strong>{formatRsd(order.total)}</strong>
        </div>
        <div>
          <small>⌖ Lično preuzimanje</small>
          <strong>{order.pickup.name}</strong>
          <span>
            {order.confirmedPickupAt
              ? `Potvrđen termin: ${formatBelgradeDate(order.confirmedPickupAt)}`
              : `Željeni datum: ${formatBelgradeDate(order.requestedPickupDate)}`}
          </span>
        </div>
        <div className="active-order-images">
          {images.map((item, index) => (
            <Image
              key={`${item.sku}-${index}`}
              src={item.imageUrl!}
              alt={item.productName}
              width={72}
              height={72}
            />
          ))}
          {order.itemCount > images.length && (
            <span>+{order.itemCount - images.length}</span>
          )}
        </div>
        <Link
          className="button button-primary"
          href={`/nalog/porudzbine/${encodeURIComponent(order.orderNumber)}`}
        >
          Pogledaj detalje →
        </Link>
      </div>
      <div className="order-progress">
        {statusSteps.map((step, index) => (
          <div key={step.status} className={current >= index ? 'done' : ''}>
            <span>{step.icon}</span>
            <b>{step.label}</b>
          </div>
        ))}
      </div>
      <small className="active-order-updated">
        Poslednje ažuriranje:{' '}
        {formatBelgradeDate(order.confirmedPickupAt ?? order.createdAt)}
      </small>
    </article>
  );
}

function HistoryOrderRow({ order }: { order: OrderListItem }) {
  return (
    <article className={order.status === 'CANCELLED' ? 'cancelled' : ''}>
      <div>
        <strong>#{order.orderNumber}</strong>
        <time>{formatBelgradeDate(order.createdAt)}</time>
      </div>
      <div className="history-product-placeholder">
        <span>BF</span>
        <small>
          {order.itemCount} {order.itemCount === 1 ? 'proizvod' : 'proizvoda'}
        </small>
      </div>
      <div>
        <span>⌖</span>
        <small>{order.pickup.name}</small>
      </div>
      <span
        className={`order-status-pill status-${order.status.toLowerCase()}`}
      >
        {orderStatusLabel[order.status]}
      </span>
      <strong>{formatRsd(order.total)}</strong>
      <Link
        className="button button-secondary"
        href={`/nalog/porudzbine/${encodeURIComponent(order.orderNumber)}`}
      >
        Pogledaj detalje
      </Link>
    </article>
  );
}

function statusDescription(status: OrderStatus) {
  return (
    {
      PENDING_CONFIRMATION: 'Čeka proveru i potvrdu.',
      CONFIRMED: 'Porudžbina je potvrđena.',
      PREPARING: 'Proizvodi se pripremaju.',
      READY_FOR_PICKUP: 'Čeka vas na lokaciji.',
      COMPLETED: 'Kupovina je završena.',
      CANCELLED: 'Porudžbina je otkazana.',
    } as Record<OrderStatus, string>
  )[status];
}
