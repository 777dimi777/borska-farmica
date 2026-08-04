'use client';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAdmin } from '../admin-provider';
import { BrowserApiError } from '@/lib/browser-api/client';
import { downloadAdminCsv } from './download';
import { operationKeys } from './query';
type Kind = 'customers' | 'orders' | 'inventory' | 'audit-logs';
const info: Record<Kind, { title: string; file: string; description: string }> =
  {
    customers: {
      title: 'Kupci',
      file: 'borska-farmica-kupci.csv',
      description: 'Profili i zbirne metrike kupaca. SUPER_ADMIN.',
    },
    orders: {
      title: 'Porudžbine',
      file: 'borska-farmica-porudzbine.csv',
      description:
        'Snapshot podaci, statusi, preuzimanje i iznosi. SUPER_ADMIN.',
    },
    inventory: {
      title: 'Zalihe',
      file: 'borska-farmica-zalihe.csv',
      description:
        'Proizvodi, SKU, fizičko i rezervisano stanje. ADMIN i SUPER_ADMIN.',
    },
    'audit-logs': {
      title: 'Audit logovi',
      file: 'borska-farmica-audit.csv',
      description: 'Redigovani administrativni događaji. SUPER_ADMIN.',
    },
  };
export function ExportsPage() {
  const { admin, authorized } = useAdmin(),
    qc = useQueryClient(),
    [pending, setPending] = useState<Kind | null>(null),
    [messages, setMessages] = useState<Record<string, string>>({});
  const kinds: Kind[] =
    admin?.role === 'SUPER_ADMIN'
      ? ['customers', 'orders', 'inventory', 'audit-logs']
      : ['inventory'];
  const go = async (kind: Kind, data: FormData) => {
    setPending(kind);
    setMessages((x) => ({ ...x, [kind]: '' }));
    const q = new URLSearchParams();
    for (const [k, v] of data.entries())
      if (String(v).trim()) q.set(k, String(v).trim());
    try {
      await authorized((t) =>
        downloadAdminCsv(
          t,
          `/admin/exports/${kind}.csv${q.size ? `?${q}` : ''}`,
          info[kind].file,
        ),
      );
      setMessages((x) => ({ ...x, [kind]: 'Preuzimanje je pokrenuto.' }));
      if (admin?.role === 'SUPER_ADMIN')
        await qc.invalidateQueries({ queryKey: operationKeys.audits });
    } catch (e) {
      const msg =
        e instanceof BrowserApiError && e.status === 422
          ? 'Izvoz sadrži više od 10.000 redova. Suzite period ili filtere i pokušajte ponovo.'
          : e instanceof BrowserApiError && e.kind === 'forbidden'
            ? 'Nemate dozvolu za ovaj izvoz.'
            : e instanceof BrowserApiError && e.requestId
              ? `Izvoz nije uspeo. Referenca: ${e.requestId}`
              : 'Izvoz nije uspeo. Proverite vezu i pokušajte ponovo.';
      setMessages((x) => ({ ...x, [kind]: msg }));
    } finally {
      setPending(null);
    }
  };
  return (
    <div className="admin-catalog-page">
      <header className="catalog-head">
        <div>
          <p className="eyebrow">Izveštaji</p>
          <h1>CSV izvozi</h1>
          <p>Bezbedno, autentifikovano preuzimanje do 10.000 redova.</p>
        </div>
      </header>
      <div className="export-grid">
        {kinds.map((k) => (
          <section className="catalog-panel" key={k}>
            <h2>{info[k].title}</h2>
            <p>{info[k].description}</p>
            <ExportFields kind={k} />
            <form action={(d) => go(k, d)}>
              {k === 'inventory' ? (
                <>
                  <label>
                    Pretraga / SKU
                    <input name="search" maxLength={120} />
                  </label>
                  <label>
                    Category slug
                    <input name="category" maxLength={180} />
                  </label>
                  <label>
                    Status proizvoda
                    <select name="productStatus">
                      <option value="">Svi</option>
                      <option value="DRAFT">Nacrt</option>
                      <option value="ACTIVE">Aktivan</option>
                      <option value="ARCHIVED">Arhiviran</option>
                    </select>
                  </label>
                  <label>
                    Stanje zaliha
                    <select name="stockStatus">
                      <option value="">Sve</option>
                      <option value="in_stock">Na stanju</option>
                      <option value="low_stock">Niske</option>
                      <option value="out_of_stock">Nema</option>
                      <option value="backorder">Backorder</option>
                    </select>
                  </label>
                </>
              ) : k === 'customers' ? (
                <>
                  <label>
                    Pretraga
                    <input name="search" maxLength={120} />
                  </label>
                  <label>
                    Status
                    <select name="status">
                      <option value="">Svi</option>
                      <option value="ACTIVE">Aktivni</option>
                      <option value="DISABLED">Deaktivirani</option>
                    </select>
                  </label>
                  <label>
                    Registracija od
                    <input type="date" name="createdFrom" />
                  </label>
                  <label>
                    Registracija do
                    <input type="date" name="createdTo" />
                  </label>
                </>
              ) : k === 'orders' ? (
                <>
                  <label>
                    Pretraga
                    <input name="search" maxLength={120} />
                  </label>
                  <label>
                    Status
                    <input name="status" placeholder="npr. COMPLETED" />
                  </label>
                  <label>
                    Plaćanje
                    <select name="paymentStatus">
                      <option value="">Sve</option>
                      <option value="PAID">Plaćeno</option>
                      <option value="UNPAID">Nije plaćeno</option>
                    </select>
                  </label>
                  <label>
                    Pickup UUID
                    <input name="pickupLocationId" />
                  </label>
                </>
              ) : (
                <>
                  <label>
                    Pretraga
                    <input name="search" maxLength={120} />
                  </label>
                  <label>
                    Akcija
                    <input name="action" maxLength={100} />
                  </label>
                  <label>
                    Tip resursa
                    <input name="resourceType" maxLength={80} />
                  </label>
                  <label>
                    Od
                    <input type="date" name="createdFrom" />
                  </label>
                  <label>
                    Do
                    <input type="date" name="createdTo" />
                  </label>
                </>
              )}
              <button disabled={pending === k}>
                {pending === k ? 'Priprema CSV-a…' : 'Preuzmi CSV'}
              </button>
              <p
                role={
                  messages[k]?.startsWith('Preuzimanje') ? 'status' : 'alert'
                }
              >
                {messages[k]}
              </p>
            </form>
          </section>
        ))}
      </div>
    </div>
  );
}
function ExportFields({ kind }: { kind: Kind }) {
  return (
    <p className="export-note">
      Aktivni filteri se šalju direktno backend export endpointu. CSV bytes, BOM
      i CRLF se ne menjaju u browseru. Tip: <code>{kind}</code>.
    </p>
  );
}
