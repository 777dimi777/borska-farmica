'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BrowserApiError } from '@/lib/browser-api/client';
import { useAdmin } from '../admin-provider';
import { Confirm, Feedback, rsd } from '../catalog/common';
import {
  useCustomer,
  useCustomerControl,
  useCustomerOrders,
  useCustomers,
} from './hooks';
import { parseCustomerFilters, serializeCustomerFilters } from './query';
const status: Record<string, string> = {
    ACTIVE: 'Aktivan',
    DISABLED: 'Deaktiviran',
  },
  orderStatus: Record<string, string> = {
    PENDING_CONFIRMATION: 'Čeka potvrdu',
    CONFIRMED: 'Potvrđena',
    PREPARING: 'U pripremi',
    READY_FOR_PICKUP: 'Spremna',
    COMPLETED: 'Završena',
    CANCELLED: 'Otkazana',
  };
const fmt = (x: string | null) =>
  x ? new Date(x).toLocaleDateString('sr-RS') : '—';
export function CustomerList() {
  const p = useSearchParams(),
    router = useRouter(),
    f = useMemo(() => parseCustomerFilters(p), [p]),
    q = serializeCustomerFilters(f).toString(),
    list = useCustomers(q);
  const apply = (d: FormData) => {
    const n = new URLSearchParams();
    for (const k of [
      'search',
      'status',
      'createdFrom',
      'createdTo',
      'lastOrderFrom',
      'lastOrderTo',
      'sort',
    ])
      if (d.get(k)) n.set(k, String(d.get(k)));
    router.push(`/admin/kupci?${n}`);
  };
  const active = [
    f.search,
    f.status,
    f.createdFrom,
    f.createdTo,
    f.lastOrderFrom,
    f.lastOrderTo,
  ].filter(Boolean).length;
  return (
    <div className="admin-catalog-page">
      <header className="catalog-head">
        <div>
          <p className="eyebrow">Administracija</p>
          <h1>Kupci</h1>
          <p>Pregled naloga, porudžbina i aktivnih sesija.</p>
        </div>
      </header>
      <nav className="catalog-tabs">
        <Link aria-current={!f.status ? 'page' : undefined} href="/admin/kupci">
          Svi
        </Link>
        <Link
          aria-current={f.status === 'ACTIVE' ? 'page' : undefined}
          href="/admin/kupci?status=ACTIVE"
        >
          Aktivni
        </Link>
        <Link
          aria-current={f.status === 'DISABLED' ? 'page' : undefined}
          href="/admin/kupci?status=DISABLED"
        >
          Deaktivirani
        </Link>
      </nav>
      <form className="catalog-toolbar products" action={apply}>
        <label>
          Pretraga
          <input
            name="search"
            type="search"
            maxLength={120}
            defaultValue={f.search}
            placeholder="Ime, email ili telefon"
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={f.status ?? ''}>
            <option value="">Svi</option>
            <option value="ACTIVE">Aktivni</option>
            <option value="DISABLED">Deaktivirani</option>
          </select>
        </label>
        <label>
          Registracija od
          <input name="createdFrom" type="date" defaultValue={f.createdFrom} />
        </label>
        <label>
          Registracija do
          <input name="createdTo" type="date" defaultValue={f.createdTo} />
        </label>
        <label>
          Poslednja porudžbina od
          <input
            name="lastOrderFrom"
            type="date"
            defaultValue={f.lastOrderFrom}
          />
        </label>
        <label>
          Poslednja porudžbina do
          <input name="lastOrderTo" type="date" defaultValue={f.lastOrderTo} />
        </label>
        <label>
          Sortiranje
          <select name="sort" defaultValue={f.sort}>
            <option value="newest">Najnoviji</option>
            <option value="oldest">Najstariji</option>
            <option value="name_asc">Ime A–Š</option>
            <option value="name_desc">Ime Š–A</option>
            <option value="last_order_desc">Poslednja porudžbina</option>
            <option value="total_spent_desc">Ukupna potrošnja</option>
          </select>
        </label>
        <button>Primeni</button>
        {active > 0 && (
          <Link href="/admin/kupci">Obriši filtere ({active})</Link>
        )}
      </form>
      {list.isLoading ? (
        <p className="catalog-state" role="status">
          Učitavanje kupaca…
        </p>
      ) : list.isError ? (
        <section className="catalog-state" role="alert">
          <h2>Kupci nisu dostupni</h2>
          <button onClick={() => list.refetch()}>Pokušaj ponovo</button>
        </section>
      ) : !list.data?.data.length ? (
        <section className="catalog-state">
          <h2>{active ? 'Nema rezultata' : 'Još nema kupaca'}</h2>
          {active > 0 && <Link href="/admin/kupci">Obriši filtere</Link>}
        </section>
      ) : (
        <>
          <div className="catalog-table">
            <table>
              <thead>
                <tr>
                  <th>Kupac</th>
                  <th>Status</th>
                  <th>Registracija</th>
                  <th>Porudžbine</th>
                  <th>Potrošeno</th>
                  <th>Poslednja</th>
                  <th>Sesije</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.data.data.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <strong>{c.fullName}</strong>
                      <small>
                        {c.email}
                        <br />
                        {c.phone}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`catalog-badge ${c.status.toLowerCase()}`}
                      >
                        {status[c.status]}
                      </span>
                    </td>
                    <td>{fmt(c.createdAt)}</td>
                    <td>
                      {c.orderCount} · {c.completedOrderCount} završenih
                    </td>
                    <td>{rsd(c.totalSpent)}</td>
                    <td>{fmt(c.lastOrderAt)}</td>
                    <td>{c.activeSessionCount}</td>
                    <td>
                      <Link href={`/admin/kupci/${c.id}`}>Detalji</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="operation-mobile-cards">
            {list.data.data.map((c) => (
              <article key={c.id}>
                <h2>{c.fullName}</h2>
                <p>
                  {c.email}
                  <br />
                  {c.phone}
                </p>
                <p>
                  {status[c.status]} · {c.orderCount} porudžbina ·{' '}
                  {rsd(c.totalSpent)}
                </p>
                <Link href={`/admin/kupci/${c.id}`}>Detalji</Link>
              </article>
            ))}
          </div>
          <nav className="admin-pagination" aria-label="Stranice kupaca">
            {list.data.pagination.hasPreviousPage && (
              <Link
                href={`/admin/kupci?${serializeCustomerFilters({ ...f, page: f.page - 1 })}`}
              >
                Prethodna
              </Link>
            )}
            <span aria-current="page">
              {f.page} / {list.data.pagination.totalPages}
            </span>
            {list.data.pagination.hasNextPage && (
              <Link
                href={`/admin/kupci?${serializeCustomerFilters({ ...f, page: f.page + 1 })}`}
              >
                Sledeća
              </Link>
            )}
          </nav>
        </>
      )}
    </div>
  );
}
export function CustomerDetailView({ id }: { id: string }) {
  const { admin } = useAdmin(),
    detail = useCustomer(id),
    orders = useCustomerOrders(id, 'limit=12'),
    control = useCustomerControl(id),
    [action, setAction] = useState<
      'disable' | 'enable' | 'revoke-sessions' | null
    >(null),
    [notice, setNotice] = useState('');
  if (detail.isLoading)
    return (
      <p className="catalog-state" role="status">
        Učitavanje kupca…
      </p>
    );
  if (detail.isError || !detail.data) {
    const missing =
      detail.error instanceof BrowserApiError &&
      detail.error.kind === 'not-found';
    return (
      <section className="catalog-state" role="alert">
        <h1>{missing ? 'Kupac nije pronađen' : 'Kupac nije dostupan'}</h1>
        <Link href="/admin/kupci">Nazad na kupce</Link>
      </section>
    );
  }
  const c = detail.data;
  const act = () =>
    action &&
    control.mutate(action, {
      onSuccess: (r) => {
        setNotice(
          action === 'revoke-sessions'
            ? `Opozvano sesija: ${r.revokedSessions}.`
            : action === 'disable'
              ? 'Nalog je deaktiviran.'
              : 'Nalog je aktiviran; potreban je novi login.',
        );
        setAction(null);
      },
    });
  return (
    <div className="admin-catalog-page">
      <nav className="admin-breadcrumb">
        <Link href="/admin/kupci">Kupci</Link>
        <span>/</span>
        <span>{c.fullName}</span>
      </nav>
      <header className="catalog-head">
        <div>
          <p className="eyebrow">{status[c.status]}</p>
          <h1>{c.fullName}</h1>
          <p>
            {c.email} · {c.phone}
          </p>
        </div>
        {admin?.role === 'SUPER_ADMIN' && (
          <div className="catalog-head-actions">
            {c.status === 'ACTIVE' ? (
              <button className="danger" onClick={() => setAction('disable')}>
                Deaktiviraj nalog
              </button>
            ) : (
              <button onClick={() => setAction('enable')}>
                Aktiviraj nalog
              </button>
            )}
            <button onClick={() => setAction('revoke-sessions')}>
              Odjavi sa svih uređaja
            </button>
          </div>
        )}
      </header>
      <Feedback error={control.error} success={notice} />
      <div className="inventory-cards">
        <article>
          <span>Porudžbine</span>
          <strong>{c.orderCount}</strong>
        </article>
        <article>
          <span>Završene</span>
          <strong>{c.completedOrderCount}</strong>
        </article>
        <article>
          <span>Otkazane</span>
          <strong>{c.cancelledOrderCount}</strong>
        </article>
        <article>
          <span>Ukupno potrošeno</span>
          <strong>{rsd(c.totalSpent)}</strong>
        </article>
        <article>
          <span>Aktivne sesije</span>
          <strong>{c.activeSessionCount}</strong>
        </article>
      </div>
      <div className="operation-grid">
        <section className="catalog-panel">
          <h2>Podaci naloga</h2>
          <dl>
            <dt>Registracija</dt>
            <dd>{fmt(c.createdAt)}</dd>
            <dt>Poslednja izmena</dt>
            <dd>{fmt(c.updatedAt)}</dd>
            <dt>Poslednja prijava</dt>
            <dd>{fmt(c.lastLoginAt)}</dd>
            <dt>Poslednja porudžbina</dt>
            <dd>{fmt(c.lastOrderAt)}</dd>
          </dl>
        </section>
        <section className="catalog-panel">
          <h2>Raspodela statusa</h2>
          {Object.entries(c.orderStatusDistribution).map(([k, v]) => (
            <p key={k}>
              {orderStatus[k] ?? k}: <strong>{v}</strong>
            </p>
          ))}
        </section>
      </div>
      <section className="catalog-panel">
        <h2>Porudžbine kupca</h2>
        {orders.isLoading ? (
          <p role="status">Učitavanje porudžbina…</p>
        ) : orders.isError ? (
          <p role="alert">Porudžbine nisu dostupne.</p>
        ) : !orders.data?.data.length ? (
          <p>Nema porudžbina.</p>
        ) : (
          <div className="catalog-table">
            <table>
              <thead>
                <tr>
                  <th>Broj</th>
                  <th>Datum</th>
                  <th>Status</th>
                  <th>Plaćanje</th>
                  <th>Preuzimanje</th>
                  <th>Ukupno</th>
                </tr>
              </thead>
              <tbody>
                {orders.data.data.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link href={`/admin/porudzbine/${o.id}`}>
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td>{fmt(o.createdAt)}</td>
                    <td>{orderStatus[o.status] ?? o.status}</td>
                    <td>
                      {o.paymentStatus === 'PAID' ? 'Plaćeno' : 'Nije plaćeno'}
                    </td>
                    <td>{o.pickup?.name ?? '—'}</td>
                    <td>{rsd(o.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {action && (
        <Confirm
          title={
            action === 'disable'
              ? 'Deaktivirati nalog?'
              : action === 'enable'
                ? 'Aktivirati nalog?'
                : 'Odjaviti sa svih uređaja?'
          }
          danger={action === 'disable'}
          busy={control.isPending}
          onConfirm={act}
        >
          {action === 'disable'
            ? `Kupac ${c.fullName} više neće moći da se prijavi; sve sesije se opozivaju. Korpe, porudžbine, rezervacije i zalihe ostaju nepromenjene, a nalog se ne briše.`
            : action === 'enable'
              ? 'Kupac ponovo može da se prijavi. Stare sesije se ne vraćaju; potreban je novi login. Korpa i porudžbine ostaju.'
              : 'Sve aktivne customer sesije biće opozvane. Status naloga, korpa i porudžbine ostaju nepromenjeni; potreban je novi login.'}
        </Confirm>
      )}
    </div>
  );
}
