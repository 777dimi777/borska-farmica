'use client';
import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/auth-provider';
import { useOrders } from './hooks';
import {
  formatBelgradeDate,
  orderStatusLabel,
  paymentLabel,
} from './formatters';
import { formatRsd } from '@/lib/formatters/currency';
export function OrdersPage({ page = 1 }: { page?: number }) {
  const auth = useAuth(),
    router = useRouter(),
    q = useOrders({ page });
  useEffect(() => {
    if (auth.status === 'anonymous')
      router.replace('/prijava?returnTo=/nalog/porudzbine');
  }, [auth.status, router]);
  if (auth.status === 'loading' || q.isLoading)
    return <div className="order-skeleton">Učitavanje porudžbina…</div>;
  if (auth.status !== 'authenticated') return null;
  if (q.isError)
    return (
      <div role="alert">
        <p>Porudžbine trenutno nisu dostupne.</p>
        <button onClick={() => void q.refetch()}>Pokušajte ponovo</button>
      </div>
    );
  if (!q.data?.data.length)
    return (
      <div className="empty-cart">
        <h2>Još nemate porudžbine</h2>
        <Link href="/proizvodi">Pogledajte proizvode</Link>
      </div>
    );
  return (
    <>
      <div className="orders-list">
        {q.data.data.map((o) => (
          <article key={o.orderNumber}>
            <div>
              <Link
                href={`/nalog/porudzbine/${encodeURIComponent(o.orderNumber)}`}
              >
                <strong>{o.orderNumber}</strong>
              </Link>
              <time>{formatBelgradeDate(o.createdAt)}</time>
            </div>
            <div>
              <span className="status-badge">{orderStatusLabel[o.status]}</span>
              <span>{paymentLabel(o.paymentStatus)}</span>
            </div>
            <div>
              <span>
                {o.pickup.name} · {o.itemCount} stavki
              </span>
              <strong>{formatRsd(o.total)}</strong>
            </div>
          </article>
        ))}
      </div>
      {q.data.pagination.totalPages > 1 && (
        <nav className="pagination" aria-label="Paginacija porudžbina">
          {page > 1 && (
            <Link href={`/nalog/porudzbine?page=${page - 1}`}>Prethodna</Link>
          )}
          <span>
            Strana {page} od {q.data.pagination.totalPages}
          </span>
          {page < q.data.pagination.totalPages && (
            <Link href={`/nalog/porudzbine?page=${page + 1}`}>Sledeća</Link>
          )}
        </nav>
      )}
    </>
  );
}
