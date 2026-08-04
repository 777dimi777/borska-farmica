'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdmin } from '../admin-provider';
import { catalogApi } from './api';
import { Feedback, Confirm } from './common';
import { useCategories, useCategory, useCatalogMutation } from './hooks';
import type { Category, CategoryInput } from './types';
const query = (p: URLSearchParams) => {
  const q = new URLSearchParams();
  q.set('limit', '48');
  for (const k of ['page', 'search', 'status', 'sort'])
    if (p.get(k)) q.set(k, p.get(k)!);
  return q.toString();
};
export function CategoryList() {
  const { admin } = useAdmin();
  const params = useSearchParams(),
    router = useRouter();
  const q = useMemo(() => query(params), [params]);
  const list = useCategories(q);
  const [confirm, setConfirm] = useState<Category | null>(null);
  const save = useCatalogMutation(
    (t, v: { id: string; body: Partial<CategoryInput> }) =>
      catalogApi.categories.update(t, v.id, v.body),
  );
  const remove = useCatalogMutation((t, id: string) =>
    catalogApi.categories.remove(t, id),
  );
  const reorder = useCatalogMutation(
    (t, items: { id: string; sortOrder: number }[]) =>
      catalogApi.categories.reorder(t, items),
  );
  const move = (index: number, delta: number) => {
    if (!list.data) return;
    const rows = [...list.data.data],
      target = index + delta;
    if (target < 0 || target >= rows.length) return;
    [rows[index], rows[target]] = [rows[target], rows[index]];
    reorder.mutate(rows.map((x, i) => ({ id: x.id, sortOrder: i })));
  };
  return (
    <div className="admin-catalog-page">
      <header className="catalog-head">
        <div>
          <p className="eyebrow">Katalog</p>
          <h1>Kategorije</h1>
          <p>Organizujte javnu ponudu i vidljivost grupa proizvoda.</p>
        </div>
        <Link className="button button-primary" href="/admin/kategorije/nova">
          Nova kategorija
        </Link>
      </header>
      <form
        className="catalog-toolbar"
        action={(f) => {
          const x = new URLSearchParams();
          for (const k of ['search', 'status', 'sort'])
            if (f.get(k)) x.set(k, String(f.get(k)));
          router.push(`/admin/kategorije?${x}`);
        }}
      >
        <label>
          Pretraga
          <input
            name="search"
            type="search"
            defaultValue={params.get('search') ?? ''}
          />
        </label>
        <label>
          Status
          <select name="status" defaultValue={params.get('status') ?? 'all'}>
            <option value="all">Sve</option>
            <option value="active">Aktivne</option>
            <option value="inactive">Neaktivne</option>
          </select>
        </label>
        <label>
          Redosled
          <select name="sort" defaultValue={params.get('sort') ?? 'sort_order'}>
            <option value="sort_order">Ručni redosled</option>
            <option value="name_asc">Naziv A–Š</option>
            <option value="name_desc">Naziv Š–A</option>
            <option value="newest">Najnovije</option>
          </select>
        </label>
        <button>Primeni</button>
      </form>
      <Feedback
        error={list.error || save.error || remove.error || reorder.error}
      />
      {list.isLoading ? (
        <p role="status" className="catalog-state">
          Učitavanje kategorija…
        </p>
      ) : list.isError ? (
        <p role="alert" className="catalog-state">
          Kategorije nisu dostupne.{' '}
          <button onClick={() => list.refetch()}>Pokušaj ponovo</button>
        </p>
      ) : !list.data?.data.length ? (
        <section className="catalog-state">
          <h2>Nema kategorija</h2>
          <p>Kreirajte prvu kategoriju ili promenite filtere.</p>
        </section>
      ) : (
        <div className="catalog-table">
          <table>
            <caption className="sr-only">Kategorije</caption>
            <thead>
              <tr>
                <th>Redosled</th>
                <th>Naziv</th>
                <th>Slug</th>
                <th>Proizvodi</th>
                <th>Status</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {list.data.data.map((c, i) => (
                <tr key={c.id}>
                  <td>
                    <button
                      aria-label={`Pomeri ${c.name} gore`}
                      disabled={i === 0 || reorder.isPending}
                      onClick={() => move(i, -1)}
                    >
                      ↑
                    </button>
                    <button
                      aria-label={`Pomeri ${c.name} dole`}
                      disabled={
                        i === list.data!.data.length - 1 || reorder.isPending
                      }
                      onClick={() => move(i, 1)}
                    >
                      ↓
                    </button>
                  </td>
                  <td>
                    <Link href={`/admin/kategorije/${c.id}`}>{c.name}</Link>
                  </td>
                  <td>{c.slug}</td>
                  <td>
                    {c.activeProductCount} aktivnih / {c.productCount}
                  </td>
                  <td>
                    <button
                      className="catalog-switch"
                      aria-pressed={c.isActive}
                      disabled={save.isPending}
                      onClick={() =>
                        save.mutate({
                          id: c.id,
                          body: { isActive: !c.isActive },
                        })
                      }
                    >
                      {c.isActive ? 'Aktivna' : 'Skrivena'}
                    </button>
                  </td>
                  <td>
                    <Link href={`/admin/kategorije/${c.id}`}>Izmeni</Link>{' '}
                    {admin?.role === 'SUPER_ADMIN' && (
                      <button
                        className="link-danger"
                        onClick={() => setConfirm(c)}
                      >
                        Obriši
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {confirm && (
        <Confirm
          title="Obrisati kategoriju?"
          danger
          busy={remove.isPending}
          onConfirm={() =>
            remove.mutate(confirm.id, { onSuccess: () => setConfirm(null) })
          }
        >
          Kategorija „{confirm.name}” biće trajno obrisana. API će sprečiti
          brisanje ako sadrži proizvode.
        </Confirm>
      )}
    </div>
  );
}
export function CategoryEditor({ id }: { id?: string }) {
  const router = useRouter();
  const { admin } = useAdmin();
  const detail = useCategory(id ?? '');
  const mutate = useCatalogMutation((t, v: CategoryInput) =>
    id
      ? catalogApi.categories.update(t, id, v)
      : catalogApi.categories.create(t, v),
  );
  const remove = useCatalogMutation((t, x: string) =>
    catalogApi.categories.remove(t, x),
  );
  const [confirm, setConfirm] = useState(false);
  if (id && detail.isLoading)
    return (
      <p className="catalog-state" role="status">
        Učitavanje kategorije…
      </p>
    );
  const c = detail.data;
  return (
    <div className="admin-catalog-page narrow">
      <nav className="admin-breadcrumb">
        <Link href="/admin/kategorije">Kategorije</Link>
        <span>/</span>
        <span>{c?.name ?? 'Nova'}</span>
      </nav>
      <header className="catalog-head">
        <div>
          <p className="eyebrow">Kategorija</p>
          <h1>{c ? 'Izmena kategorije' : 'Nova kategorija'}</h1>
        </div>
      </header>
      <form
        className="catalog-form"
        action={(f) => {
          const body: CategoryInput = {
            name: String(f.get('name')),
            slug: String(f.get('slug')) || undefined,
            description: String(f.get('description')) || null,
            imageUrl: String(f.get('imageUrl')) || null,
            isActive: f.get('isActive') === 'on',
            sortOrder: Number(f.get('sortOrder') || 0),
          };
          mutate.mutate(body, {
            onSuccess: (x) => router.replace(`/admin/kategorije/${x.id}`),
          });
        }}
      >
        <label>
          Naziv *
          <input
            name="name"
            required
            minLength={2}
            maxLength={80}
            defaultValue={c?.name}
          />
        </label>
        <label>
          Slug
          <input name="slug" maxLength={120} defaultValue={c?.slug} />
          <small>Ostavite prazno za automatsko generisanje.</small>
        </label>
        <label className="full">
          Opis
          <textarea
            name="description"
            maxLength={2000}
            rows={5}
            defaultValue={c?.description ?? ''}
          />
        </label>
        <label className="full">
          HTTPS URL slike
          <input name="imageUrl" type="url" defaultValue={c?.imageUrl ?? ''} />
        </label>
        <label>
          Redosled
          <input
            name="sortOrder"
            type="number"
            min={0}
            max={1000000}
            defaultValue={c?.sortOrder ?? 0}
          />
        </label>
        <label className="check">
          <input
            name="isActive"
            type="checkbox"
            defaultChecked={c?.isActive ?? true}
          />{' '}
          Aktivna u prodavnici
        </label>
        <Feedback error={mutate.error} />
        <div className="catalog-form-actions">
          <Link href="/admin/kategorije">Odustani</Link>
          <button disabled={mutate.isPending}>
            {mutate.isPending ? 'Čuvanje…' : 'Sačuvaj'}
          </button>
        </div>
      </form>
      {c && (
        <aside className="catalog-summary">
          <h2>Sadržaj</h2>
          <p>
            {c.productCount} proizvoda · {c.activeProductCount} aktivnih ·{' '}
            {c.draftProductCount ?? 0} nacrta · {c.archivedProductCount ?? 0}{' '}
            arhiviranih
          </p>
          {admin?.role === 'SUPER_ADMIN' && (
            <button className="danger" onClick={() => setConfirm(true)}>
              Trajno obriši
            </button>
          )}
        </aside>
      )}
      {confirm && c && (
        <Confirm
          title="Trajno obrisati kategoriju?"
          danger
          busy={remove.isPending}
          onConfirm={() =>
            remove.mutate(c.id, {
              onSuccess: () => router.replace('/admin/kategorije'),
            })
          }
        >
          Ova akcija nema opoziv i uspeva samo kada kategorija nema proizvode.
        </Confirm>
      )}
    </div>
  );
}
