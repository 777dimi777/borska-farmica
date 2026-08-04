'use client';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { dashboardApi } from './api';
import { useAdmin } from './admin-provider';
import type {
  Attention,
  CategorySales,
  InventoryAlerts,
  InventorySummary,
  OrderFlow,
  OrdersByStatus,
  Overview,
  PickupSales,
  RecentOrders,
  RevenueSeries,
  Seasonal,
  TopProducts,
} from './types';
const money = (v: string | number) =>
  new Intl.NumberFormat('sr-Latn-RS', {
    style: 'currency',
    currency: 'RSD',
    maximumFractionDigits: 2,
  }).format(Number(v));
const number = (v: string | number, digits = 0) =>
  new Intl.NumberFormat('sr-Latn-RS', { maximumFractionDigits: digits }).format(
    Number(v),
  );
const date = (v: string) =>
  new Intl.DateTimeFormat('sr-Latn-RS', { dateStyle: 'medium' }).format(
    new Date(`${v.slice(0, 10)}T12:00:00`),
  );
const statusLabels: Record<string, string> = {
  PENDING_CONFIRMATION: 'Čeka potvrdu',
  CONFIRMED: 'Potvrđena',
  PREPARING: 'U pripremi',
  READY_FOR_PICKUP: 'Spremna',
  COMPLETED: 'Završena',
  CANCELLED: 'Otkazana',
  created: 'Kreirane',
  confirmed: 'Potvrđene',
  preparing: 'Priprema',
  readyForPickup: 'Spremne',
  completed: 'Završene',
  cancelled: 'Otkazane',
};
type Result<T> = {
  data?: T;
  isLoading: boolean;
  isError: boolean;
  refetch: () => unknown;
};
function Panel<T>({
  title,
  result,
  children,
}: {
  title: string;
  result: Result<T>;
  children: (data: T) => React.ReactNode;
}) {
  return (
    <section className="admin-panel">
      <header>
        <h2>{title}</h2>
        {result.isError && (
          <button onClick={() => result.refetch()}>Pokušaj ponovo</button>
        )}
      </header>
      {result.isLoading ? (
        <div className="admin-skeleton" role="status">
          Učitavanje…
        </div>
      ) : result.isError ? (
        <p className="admin-widget-error" role="alert">
          Ovaj deo trenutno nije dostupan.
        </p>
      ) : result.data ? (
        children(result.data)
      ) : (
        <p>Nema podataka.</p>
      )}
    </section>
  );
}
function BarList({
  rows,
}: {
  rows: { label: string; value: number; display: string }[];
}) {
  const max = Math.max(1, ...rows.map((x) => x.value));
  if (!rows.length) return <p>Nema podataka za izabrani period.</p>;
  return (
    <div className="admin-bars">
      {rows.map((row, i) => (
        <div key={`${row.label}-${i}`}>
          <span>{row.label}</span>
          <span className="bar-track" aria-hidden="true">
            <i style={{ width: `${Math.max(2, (row.value / max) * 100)}%` }} />
          </span>
          <strong>{row.display}</strong>
        </div>
      ))}
    </div>
  );
}
export function periodQuery(params: URLSearchParams) {
  const from = params.get('from');
  const to = params.get('to');
  const q = new URLSearchParams();
  if (from) q.set('from', from);
  if (to) q.set('to', to);
  return q;
}
export function Dashboard() {
  const router = useRouter();
  const params = useSearchParams();
  const qc = useQueryClient();
  const { authorized } = useAdmin();
  const [refreshing, setRefreshing] = useState(false);
  const period = useMemo(() => periodQuery(params), [params]);
  const periodString = period.toString();
  const granularity = params.get('granularity') ?? 'day';
  const common = periodString;
  const withGranularity = new URLSearchParams(period);
  withGranularity.set('granularity', granularity);
  const withLimit = new URLSearchParams(period);
  withLimit.set('limit', '10');
  withLimit.set('sort', 'revenue');
  const queries = useQueries({
    queries: [
      {
        queryKey: ['admin-dashboard', 'overview', common],
        queryFn: () => authorized((t) => dashboardApi.overview(t, common)),
      },
      {
        queryKey: ['admin-dashboard', 'revenue', withGranularity.toString()],
        queryFn: () =>
          authorized((t) =>
            dashboardApi.revenue(t, withGranularity.toString()),
          ),
      },
      {
        queryKey: ['admin-dashboard', 'statuses', common],
        queryFn: () => authorized((t) => dashboardApi.statuses(t, common)),
      },
      {
        queryKey: ['admin-dashboard', 'flow', common],
        queryFn: () => authorized((t) => dashboardApi.flow(t, common)),
      },
      {
        queryKey: ['admin-dashboard', 'products', withLimit.toString()],
        queryFn: () =>
          authorized((t) => dashboardApi.products(t, withLimit.toString())),
      },
      {
        queryKey: ['admin-dashboard', 'categories', common],
        queryFn: () => authorized((t) => dashboardApi.categories(t, common)),
      },
      {
        queryKey: ['admin-dashboard', 'pickups', common],
        queryFn: () => authorized((t) => dashboardApi.pickups(t, common)),
      },
      {
        queryKey: ['admin-dashboard', 'alerts'],
        queryFn: () => authorized(dashboardApi.alerts),
      },
      {
        queryKey: ['admin-dashboard', 'inventory'],
        queryFn: () => authorized(dashboardApi.inventory),
      },
      {
        queryKey: ['admin-dashboard', 'seasonal'],
        queryFn: () => authorized(dashboardApi.seasonal),
      },
      {
        queryKey: ['admin-dashboard', 'recent'],
        queryFn: () => authorized(dashboardApi.recent),
      },
      {
        queryKey: ['admin-dashboard', 'attention'],
        queryFn: () => authorized(dashboardApi.attention),
      },
    ],
  });
  const [
    overview,
    revenue,
    statuses,
    flow,
    products,
    categories,
    pickups,
    alerts,
    inventory,
    seasonal,
    recent,
    attention,
  ] = queries as [
    Result<Overview>,
    Result<RevenueSeries>,
    Result<OrdersByStatus>,
    Result<OrderFlow>,
    Result<TopProducts>,
    Result<CategorySales>,
    Result<PickupSales>,
    Result<InventoryAlerts>,
    Result<InventorySummary>,
    Result<Seasonal>,
    Result<RecentOrders>,
    Result<Attention>,
  ];
  const setDays = (days: number) => {
    const to = new Date();
    const from = new Date();
    from.setDate(to.getDate() - days + 1);
    router.replace(
      `/admin/dashboard?from=${from.toISOString().slice(0, 10)}&to=${to.toISOString().slice(0, 10)}&granularity=${days > 93 ? 'week' : 'day'}`,
    );
  };
  const custom = (form: FormData) => {
    const from = String(form.get('from') ?? '');
    const to = String(form.get('to') ?? '');
    if (from && to)
      router.replace(
        `/admin/dashboard?from=${from}&to=${to}&granularity=${granularity}`,
      );
  };
  const refresh = async () => {
    setRefreshing(true);
    await qc.invalidateQueries({ queryKey: ['admin-dashboard'] });
    setRefreshing(false);
  };
  return (
    <div className="admin-dashboard">
      <header className="dashboard-head">
        <div>
          <p className="eyebrow">Admin dashboard</p>
          <h1>Pregled poslovanja</h1>
          <p>
            {overview.data
              ? `${date(overview.data.period.from)} – ${date(overview.data.period.to)}`
              : 'Stvarni podaci iz baze, bez procena.'}
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={refresh}
          disabled={refreshing}
        >
          {refreshing ? 'Osvežavanje…' : 'Osveži podatke'}
        </button>
      </header>
      <section className="period-filter" aria-label="Period izveštaja">
        <div>
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}>
              {d} dana
            </button>
          ))}
        </div>
        <form action={custom}>
          <label>
            Od
            <input
              name="from"
              type="date"
              defaultValue={params.get('from') ?? ''}
            />
          </label>
          <label>
            Do
            <input
              name="to"
              type="date"
              defaultValue={params.get('to') ?? ''}
            />
          </label>
          <button>Primeni</button>
        </form>
      </section>
      <Panel title="Ključni pokazatelji" result={overview}>
        {(data) => (
          <>
            <div className="kpi-grid">
              {(
                [
                  ['revenue', 'Prihod', money],
                  ['completedOrders', 'Završene porudžbine', number],
                  ['averageOrderValue', 'Prosečna vrednost', money],
                  [
                    'itemsSold',
                    'Prodate jedinice',
                    (v: string | number) => number(v, 3),
                  ],
                  ['uniqueCustomers', 'Jedinstveni kupci', number],
                  ['cancelledOrders', 'Otkazane', number],
                ] as const
              ).map(([key, label, format]) => {
                const m = data.metrics[key];
                return (
                  <article key={key}>
                    <span>{label}</span>
                    <strong>{format(m.current)}</strong>
                    <small className={m.trend}>
                      {m.percentageChange === null
                        ? 'Nema prethodne osnove'
                        : `${m.trend === 'up' ? '▲' : m.trend === 'down' ? '▼' : '—'} ${number(m.percentageChange, 1)}%`}{' '}
                      prema prethodnom periodu
                    </small>
                  </article>
                );
              })}
            </div>
            <p className="pending-callout">
              <strong>{data.operational.pendingConfirmation}</strong> porudžbina
              čeka potvrdu.
            </p>
          </>
        )}
      </Panel>
      <div className="dashboard-two">
        <Panel title="Prihod kroz vreme" result={revenue}>
          {(data) => (
            <>
              <label className="granularity">
                Grupisanje
                <select
                  value={granularity}
                  onChange={(e) => {
                    const q = new URLSearchParams(params);
                    q.set('granularity', e.target.value);
                    router.replace(`/admin/dashboard?${q}`);
                  }}
                >
                  <option value="day">Dan</option>
                  <option value="week">Nedelja</option>
                  <option value="month">Mesec</option>
                </select>
              </label>
              <BarList
                rows={data.data.map((x) => ({
                  label: date(x.bucket),
                  value: Number(x.revenue),
                  display: money(x.revenue),
                }))}
              />
              <details>
                <summary>Tabelarni prikaz</summary>
                <table>
                  <thead>
                    <tr>
                      <th>Period</th>
                      <th>Prihod</th>
                      <th>Porudžbine</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.data.map((x) => (
                      <tr key={x.bucket}>
                        <td>{date(x.bucket)}</td>
                        <td>{money(x.revenue)}</td>
                        <td>{x.orders}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </>
          )}
        </Panel>
        <Panel title="Porudžbine po statusu" result={statuses}>
          {(data) => (
            <BarList
              rows={data.data.map((x) => ({
                label: statusLabels[x.status] ?? x.status,
                value: x.count,
                display: `${x.count} · ${number(x.percentage, 1)}%`,
              }))}
            />
          )}
        </Panel>
      </div>
      <div className="dashboard-two">
        <Panel title="Tok porudžbina" result={flow}>
          {(data) => (
            <BarList
              rows={Object.entries(data.data).map(([key, value]) => ({
                label: statusLabels[key] ?? key,
                value,
                display: String(value),
              }))}
            />
          )}
        </Panel>
        <Panel title="Prodaja po lokaciji" result={pickups}>
          {(data) => (
            <BarList
              rows={data.data.map((x) => ({
                label: x.name,
                value: Number(x.revenue),
                display: `${money(x.revenue)} · ${x.orders}`,
              }))}
            />
          )}
        </Panel>
      </div>
      <div className="dashboard-two">
        <Panel title="Najprodavaniji proizvodi" result={products}>
          {(data) => (
            <BarList
              rows={data.data.map((x) => ({
                label: x.productName,
                value: Number(x.revenue),
                display: `${money(x.revenue)} · ${number(x.quantity, 3)}`,
              }))}
            />
          )}
        </Panel>
        <Panel title="Prodaja po kategoriji" result={categories}>
          {(data) => (
            <BarList
              rows={data.data.map((x) => ({
                label: x.categoryName,
                value: Number(x.revenue),
                display: money(x.revenue),
              }))}
            />
          )}
        </Panel>
      </div>
      <div className="dashboard-two">
        <Panel title="Stavke koje traže pažnju" result={attention}>
          {(data) => (
            <div className="attention-grid">
              {Object.entries(data.counts).map(([key, value]) => (
                <article key={key}>
                  <strong>{value}</strong>
                  <span>
                    {{
                      pending: 'Čeka potvrdu',
                      stalePending: 'Dugo čeka',
                      confirmedToday: 'Potvrđeno danas',
                      ready: 'Spremno',
                      overduePickup: 'Kasni preuzimanje',
                      stockAlerts: 'Upozorenja zaliha',
                      seasonalWithoutWindows: 'Sezonski bez perioda',
                      activeWithoutImage: 'Bez slike',
                      activeWithoutVariant: 'Bez varijante',
                    }[key] ?? key}
                  </span>
                </article>
              ))}
            </div>
          )}
        </Panel>
        <Panel title="Pregled zaliha" result={inventory}>
          {(data) => (
            <>
              <p>
                <strong>{data.activeVariants}</strong> aktivnih varijanti
              </p>
              <div className="inventory-counts">
                <span>
                  Dostupno <b>{data.counts.inStock}</b>
                </span>
                <span>
                  Nisko <b>{data.counts.lowStock}</b>
                </span>
                <span>
                  Nema <b>{data.counts.outOfStock}</b>
                </span>
                <span>
                  Backorder <b>{data.counts.backorder}</b>
                </span>
              </div>
              {data.byMeasurementUnit.map((x) => (
                <p key={x.measurementUnit}>
                  {x.measurementUnit}: {number(x.availableQuantity, 3)} dostupno
                  / {number(x.stockQuantity, 3)} ukupno
                </p>
              ))}
            </>
          )}
        </Panel>
      </div>
      <Panel title="Upozorenja zaliha" result={alerts}>
        {(data) =>
          data.data.length ? (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Proizvod</th>
                    <th>SKU</th>
                    <th>Status</th>
                    <th>Dostupno</th>
                    <th>Rezervisano</th>
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((x) => (
                    <tr key={x.id}>
                      <td>
                        {x.product.name} — {x.name}
                      </td>
                      <td>{x.sku}</td>
                      <td>
                        {x.status}
                        {x.reservedPressure ? ' · pritisak rezervacija' : ''}
                      </td>
                      <td>
                        {number(x.availableQuantity, 3)} {x.measurementUnit}
                      </td>
                      <td>{number(x.reservedQuantity, 3)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Nema aktivnih upozorenja zaliha.</p>
          )
        }
      </Panel>
      <div className="dashboard-two">
        <Panel title="Nedavne porudžbine" result={recent}>
          {(data) =>
            data.data.length ? (
              <div className="recent-list">
                {data.data.map((x) => (
                  <article
                    key={x.id}
                    className={x.requiresAttention ? 'needs-attention' : ''}
                  >
                    <div>
                      <strong>{x.orderNumber}</strong>
                      <span>{x.customerName}</span>
                    </div>
                    <div>
                      <span>{statusLabels[x.status] ?? x.status}</span>
                      <strong>{money(x.total)}</strong>
                    </div>
                    <small>
                      {x.pickupLocation.name} · {date(x.createdAt)}
                    </small>
                  </article>
                ))}
              </div>
            ) : (
              <p>Još nema porudžbina.</p>
            )
          }
        </Panel>
        <Panel title="Sezonska dostupnost" result={seasonal}>
          {(data) =>
            data.data.length ? (
              <div className="seasonal-list">
                {data.data.map((x) => (
                  <article key={x.id}>
                    <span
                      className={x.currentlyAvailable ? 'dot available' : 'dot'}
                    />
                    <div>
                      <strong>{x.name}</strong>
                      <small>
                        {x.currentlyAvailable
                          ? 'Trenutno dostupno'
                          : x.nextAvailableDate
                            ? `Sledeće: ${date(x.nextAvailableDate)}`
                            : 'Nema dostupnosti u narednih 60 dana'}
                      </small>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p>Nema aktivnih sezonskih proizvoda.</p>
            )
          }
        </Panel>
      </div>
    </div>
  );
}
