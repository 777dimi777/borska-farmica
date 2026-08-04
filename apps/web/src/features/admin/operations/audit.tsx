'use client';
import Link from 'next/link';
import { useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdmin } from '../admin-provider';
import { useAudit, useAuditList } from './hooks';
import { parseAuditFilters, serializeAuditFilters } from './query';
const labels: Record<string, string> = {
  'customer.disabled': 'Kupac deaktiviran',
  'customer.enabled': 'Kupac aktiviran',
  'customer.sessions_revoked': 'Customer sesije opozvane',
  'customer.exported': 'Kupci izvezeni',
  'orders.exported': 'Porudžbine izvezene',
  'inventory.exported': 'Zalihe izvezene',
  'audit_logs.exported': 'Audit izvezen',
  'product.created': 'Proizvod kreiran',
  'product.updated': 'Proizvod izmenjen',
  'category.created': 'Kategorija kreirana',
  'order.completed': 'Porudžbina završena',
};
export const actionLabel = (x: string) => labels[x] ?? x;
const summary = (x: unknown) => {
  if (!x) return '—';
  const s = JSON.stringify(x);
  return s.length > 110 ? s.slice(0, 107) + '…' : s;
};
export function AuditGuard({ children }: { children: React.ReactNode }) {
  const { admin, status } = useAdmin();
  if (status === 'loading')
    return (
      <p className="catalog-state" role="status">
        Provera dozvole…
      </p>
    );
  if (admin?.role !== 'SUPER_ADMIN')
    return (
      <section className="catalog-state" role="alert">
        <h1>Pristup nije dozvoljen</h1>
        <p>Audit logovi su dostupni samo super administratoru.</p>
        <Link href="/admin/dashboard">Nazad na dashboard</Link>
      </section>
    );
  return children;
}
export function AuditList() {
  const { admin } = useAdmin(),
    p = useSearchParams(),
    router = useRouter(),
    f = useMemo(() => parseAuditFilters(p), [p]),
    q = serializeAuditFilters(f).toString(),
    list = useAuditList(q, admin?.role === 'SUPER_ADMIN');
  return (
    <div className="admin-catalog-page">
      <header className="catalog-head">
        <div>
          <p className="eyebrow">SUPER_ADMIN</p>
          <h1>Audit logovi</h1>
          <p>Read-only istorija redigovanih administrativnih događaja.</p>
        </div>
      </header>
      <form
        className="catalog-toolbar products"
        action={(d) => {
          const n = new URLSearchParams();
          for (const k of [
            'search',
            'action',
            'resourceType',
            'resourceId',
            'adminId',
            'createdFrom',
            'createdTo',
            'sort',
          ])
            if (d.get(k)) n.set(k, String(d.get(k)));
          router.push(`/admin/audit?${n}`);
        }}
      >
        <label>
          Pretraga
          <input name="search" maxLength={120} defaultValue={f.search} />
        </label>
        <label>
          Akcija
          <input name="action" maxLength={100} defaultValue={f.action} />
        </label>
        <label>
          Tip resursa
          <input
            name="resourceType"
            maxLength={80}
            defaultValue={f.resourceType}
          />
        </label>
        <label>
          Resource UUID
          <input name="resourceId" defaultValue={f.resourceId} />
        </label>
        <label>
          Admin UUID
          <input name="adminId" defaultValue={f.adminId} />
        </label>
        <label>
          Od
          <input type="date" name="createdFrom" defaultValue={f.createdFrom} />
        </label>
        <label>
          Do
          <input type="date" name="createdTo" defaultValue={f.createdTo} />
        </label>
        <label>
          Sortiranje
          <select name="sort" defaultValue={f.sort}>
            <option value="newest">Najnovije</option>
            <option value="oldest">Najstarije</option>
          </select>
        </label>
        <button>Primeni</button>
        <Link href="/admin/audit">Reset</Link>
      </form>
      {list.isLoading ? (
        <p role="status" className="catalog-state">
          Učitavanje audit logova…
        </p>
      ) : list.isError ? (
        <section className="catalog-state" role="alert">
          <h2>Audit nije dostupan</h2>
          <button onClick={() => list.refetch()}>Pokušaj ponovo</button>
        </section>
      ) : !list.data?.data.length ? (
        <p className="catalog-state">Nema audit zapisa za izabrane filtere.</p>
      ) : (
        <>
          <div className="catalog-table">
            <table>
              <thead>
                <tr>
                  <th>Vreme</th>
                  <th>Admin</th>
                  <th>Akcija</th>
                  <th>Resurs</th>
                  <th>Metadata</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {list.data.data.map((a) => (
                  <tr key={a.id}>
                    <td>{new Date(a.createdAt).toLocaleString('sr-RS')}</td>
                    <td>
                      {a.admin.email}
                      <small>{a.admin.role}</small>
                    </td>
                    <td>
                      <code>{actionLabel(a.action)}</code>
                    </td>
                    <td>
                      {a.resourceType}
                      <small>{a.resourceId}</small>
                    </td>
                    <td>
                      <code>{summary(a.changes)}</code>
                    </td>
                    <td>
                      <Link href={`/admin/audit/${a.id}`}>Detalji</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="admin-pagination">
            {list.data.pagination.hasPreviousPage && (
              <Link
                href={`/admin/audit?${serializeAuditFilters({ ...f, page: f.page - 1 })}`}
              >
                Prethodna
              </Link>
            )}
            <span aria-current="page">
              {f.page} / {list.data.pagination.totalPages}
            </span>
            {list.data.pagination.hasNextPage && (
              <Link
                href={`/admin/audit?${serializeAuditFilters({ ...f, page: f.page + 1 })}`}
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
export function AuditDetail({ id }: { id: string }) {
  const { admin } = useAdmin(),
    audit = useAudit(id, admin?.role === 'SUPER_ADMIN');
  if (audit.isLoading)
    return (
      <p className="catalog-state" role="status">
        Učitavanje zapisa…
      </p>
    );
  if (audit.isError || !audit.data)
    return (
      <section className="catalog-state" role="alert">
        <h1>Audit zapis nije dostupan</h1>
        <Link href="/admin/audit">Nazad</Link>
      </section>
    );
  const a = audit.data;
  return (
    <div className="admin-catalog-page narrow">
      <nav className="admin-breadcrumb">
        <Link href="/admin/audit">Audit</Link>
        <span>/</span>
        <span>{a.id}</span>
      </nav>
      <header className="catalog-head">
        <div>
          <p className="eyebrow">
            {new Date(a.createdAt).toLocaleString('sr-RS')}
          </p>
          <h1>{actionLabel(a.action)}</h1>
          <p>
            {a.admin.email} · {a.admin.role}
          </p>
        </div>
      </header>
      <section className="catalog-panel">
        <dl>
          <dt>Audit ID</dt>
          <dd>
            <code>{a.id}</code>
          </dd>
          <dt>Resurs</dt>
          <dd>
            {a.resourceType} · <code>{a.resourceId ?? '—'}</code>
          </dd>
          <dt>IP adresa</dt>
          <dd>{a.ipAddress ?? '—'}</dd>
          <dt>User agent</dt>
          <dd>{a.userAgent ?? '—'}</dd>
        </dl>
        <h2>Redigovani metadata podaci</h2>
        <pre className="audit-json">{JSON.stringify(a.changes, null, 2)}</pre>
      </section>
    </div>
  );
}
