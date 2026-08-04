'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAdmin } from '../admin-provider';
import { catalogApi } from './api';
import { Feedback, Confirm, rsd } from './common';
import {
  useCategories,
  useCatalogMutation,
  useProduct,
  useProducts,
} from './hooks';
import { parseProductFilters, serializeProductFilters } from './query';
import type { ProductInput, ProductStatus } from './types';
import { ProductTabs } from './product-tabs';
const statusLabel = {
  DRAFT: 'Nacrt',
  ACTIVE: 'Aktivan',
  ARCHIVED: 'Arhiviran',
};
export function ProductList() {
  const params = useSearchParams(),
    router = useRouter();
  const f = useMemo(() => parseProductFilters(params), [params]);
  const q = serializeProductFilters(f).toString();
  const products = useProducts(q),
    categories = useCategories('limit=48&sort=name_asc');
  const apply = (d: FormData) => {
    const n = new URLSearchParams();
    for (const k of [
      'search',
      'categoryId',
      'status',
      'stockStatus',
      'availabilityMode',
      'sort',
    ])
      if (d.get(k)) n.set(k, String(d.get(k)));
    for (const k of ['featured', 'mainProduct'])
      if (d.get(k)) n.set(k, String(d.get(k)));
    router.push(`/admin/proizvodi?${n}`);
  };
  return (
    <div className="admin-catalog-page">
      <header className="catalog-head">
        <div>
          <p className="eyebrow">Katalog</p>
          <h1>Proizvodi</h1>
          <p>Upravljajte objavom, sadržajem, ponudom i zalihama.</p>
        </div>
        <Link href="/admin/proizvodi/novi" className="button button-primary">
          Novi proizvod
        </Link>
      </header>
      <form className="catalog-toolbar products" action={apply}>
        <label>
          Pretraga
          <input name="search" type="search" defaultValue={f.search} />
        </label>
        <label>
          Kategorija
          <select name="categoryId" defaultValue={f.categoryId ?? ''}>
            <option value="">Sve</option>
            {categories.data?.data.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select name="status" defaultValue={f.status ?? ''}>
            <option value="">Svi</option>
            <option value="DRAFT">Nacrt</option>
            <option value="ACTIVE">Aktivan</option>
            <option value="ARCHIVED">Arhiviran</option>
          </select>
        </label>
        <label>
          Zalihe
          <select name="stockStatus" defaultValue={f.stockStatus ?? ''}>
            <option value="">Sve</option>
            <option value="in_stock">Na stanju</option>
            <option value="low_stock">Niske</option>
            <option value="out_of_stock">Nema</option>
            <option value="backorder">Backorder</option>
          </select>
        </label>
        <label>
          Dostupnost
          <select
            name="availabilityMode"
            defaultValue={f.availabilityMode ?? ''}
          >
            <option value="">Sve</option>
            <option value="ALWAYS">Uvek</option>
            <option value="MANUAL">Ručno</option>
            <option value="SEASONAL">Sezonski</option>
          </select>
        </label>
        <label>
          Izdvojeno
          <select
            name="featured"
            defaultValue={f.featured === undefined ? '' : String(f.featured)}
          >
            <option value="">Sve</option>
            <option value="true">Da</option>
            <option value="false">Ne</option>
          </select>
        </label>
        <label>
          Glavni proizvod
          <select
            name="mainProduct"
            defaultValue={
              f.mainProduct === undefined ? '' : String(f.mainProduct)
            }
          >
            <option value="">Sve</option>
            <option value="true">Da</option>
            <option value="false">Ne</option>
          </select>
        </label>
        <label>
          Sortiranje
          <select name="sort" defaultValue={f.sort}>
            <option value="newest">Najnovije</option>
            <option value="updated_desc">Skoro menjani</option>
            <option value="name_asc">Naziv A–Š</option>
            <option value="name_desc">Naziv Š–A</option>
            <option value="status">Status</option>
          </select>
        </label>
        <button>Primeni</button>
      </form>
      {products.isLoading ? (
        <p role="status" className="catalog-state">
          Učitavanje proizvoda…
        </p>
      ) : products.isError ? (
        <section role="alert" className="catalog-state">
          <h2>Proizvodi nisu dostupni</h2>
          <button onClick={() => products.refetch()}>Pokušaj ponovo</button>
        </section>
      ) : !products.data?.data.length ? (
        <section className="catalog-state">
          <h2>Nema proizvoda</h2>
          <p>Promenite filtere ili kreirajte novi proizvod.</p>
        </section>
      ) : (
        <>
          <p>{products.data.pagination.total} rezultata</p>
          <div className="catalog-table">
            <table>
              <caption className="sr-only">Proizvodi</caption>
              <thead>
                <tr>
                  <th>Proizvod</th>
                  <th>Kategorija</th>
                  <th>Status</th>
                  <th>Cena</th>
                  <th>Varijante</th>
                  <th>Zalihe</th>
                  <th>Oznake</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.data.data.map((x) => (
                  <tr key={x.id}>
                    <td>
                      <span className="catalog-product">
                        <span className="catalog-thumb">
                          {x.primaryImage ? (
                            <img src={x.primaryImage.url} alt="" />
                          ) : (
                            'BF'
                          )}
                        </span>
                        <Link href={`/admin/proizvodi/${x.id}`}>
                          {x.name}
                          <small>{x.slug}</small>
                        </Link>
                      </span>
                    </td>
                    <td>{x.category.name}</td>
                    <td>
                      <span
                        className={`catalog-badge ${x.status.toLowerCase()}`}
                      >
                        {statusLabel[x.status]}
                      </span>
                    </td>
                    <td>
                      {rsd(x.startingPrice)}
                      {x.highestPrice !== x.startingPrice && x.highestPrice
                        ? ` – ${rsd(x.highestPrice)}`
                        : ''}
                    </td>
                    <td>
                      {x.activeVariantCount}/{x.variantCount}
                    </td>
                    <td>
                      <span className={`catalog-badge ${x.stockStatus}`}>
                        {x.availableQuantity}
                      </span>
                    </td>
                    <td>
                      {x.featured && 'Izdvojeno '}
                      {x.mainProduct && 'Glavni'}
                    </td>
                    <td>
                      <Link href={`/admin/proizvodi/${x.id}`}>Uredi</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <nav className="admin-pagination">
            {products.data.pagination.hasPreviousPage && (
              <Link
                href={`/admin/proizvodi?${serializeProductFilters({ ...f, page: f.page - 1 })}`}
              >
                Prethodna
              </Link>
            )}
            <span>
              Strana {f.page} od {products.data.pagination.totalPages}
            </span>
            {products.data.pagination.hasNextPage && (
              <Link
                href={`/admin/proizvodi?${serializeProductFilters({ ...f, page: f.page + 1 })}`}
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
export function ProductCreate() {
  const router = useRouter();
  const categories = useCategories('limit=48&status=active&sort=name_asc');
  const create = useCatalogMutation((t, v: ProductInput) =>
    catalogApi.products.create(t, v),
  );
  return (
    <div className="admin-catalog-page narrow">
      <nav className="admin-breadcrumb">
        <Link href="/admin/proizvodi">Proizvodi</Link>
        <span>/</span>
        <span>Novi</span>
      </nav>
      <header className="catalog-head">
        <div>
          <p className="eyebrow">Katalog</p>
          <h1>Novi proizvod</h1>
          <p>
            Proizvod počinje kao nacrt. Varijante, slike i zalihe dodaju se
            nakon čuvanja.
          </p>
        </div>
      </header>
      <ProductForm
        categories={categories.data?.data ?? []}
        busy={create.isPending}
        error={create.error}
        onSubmit={(v) =>
          create.mutate(v, {
            onSuccess: (x) =>
              router.replace(`/admin/proizvodi/${x.id}?tab=varijante`),
          })
        }
      />
    </div>
  );
}
export function ProductEditor({ id }: { id: string }) {
  const params = useSearchParams(),
    router = useRouter(),
    { admin } = useAdmin();
  const product = useProduct(id),
    categories = useCategories('limit=48&sort=name_asc');
  const update = useCatalogMutation((t, v: Partial<ProductInput>) =>
    catalogApi.products.update(t, id, v),
  );
  const remove = useCatalogMutation((t: string) =>
    catalogApi.products.remove(t, id),
  );
  const [confirm, setConfirm] = useState<ProductStatus | null>(null);
  const [destroy, setDestroy] = useState(false);
  if (product.isLoading)
    return (
      <p className="catalog-state" role="status">
        Učitavanje proizvoda…
      </p>
    );
  if (product.isError || !product.data)
    return (
      <section className="catalog-state" role="alert">
        <h1>Proizvod nije dostupan</h1>
        <button onClick={() => product.refetch()}>Pokušaj ponovo</button>
      </section>
    );
  const x = product.data,
    tab = params.get('tab') ?? 'osnovno';
  const lifecycle = (s: ProductStatus) =>
    update.mutate({ status: s }, { onSuccess: () => setConfirm(null) });
  return (
    <div className="admin-catalog-page">
      <nav className="admin-breadcrumb">
        <Link href="/admin/proizvodi">Proizvodi</Link>
        <span>/</span>
        <span>{x.name}</span>
      </nav>
      <header className="catalog-head">
        <div>
          <p className="eyebrow">{statusLabel[x.status]}</p>
          <h1>{x.name}</h1>
          <p>
            {x.category.name} · {x.slug}
          </p>
        </div>
        <div className="catalog-head-actions">
          {x.status === 'DRAFT' && (
            <button onClick={() => setConfirm('ACTIVE')}>Objavi</button>
          )}
          {x.status === 'ACTIVE' && (
            <button onClick={() => setConfirm('ARCHIVED')}>Arhiviraj</button>
          )}
          {x.status === 'ARCHIVED' && (
            <button onClick={() => setConfirm('DRAFT')}>Vrati u nacrt</button>
          )}
          {admin?.role === 'SUPER_ADMIN' && (
            <button className="danger" onClick={() => setDestroy(true)}>
              Trajno obriši
            </button>
          )}
        </div>
      </header>
      <nav className="catalog-tabs" aria-label="Uređivanje proizvoda">
        {[
          ['osnovno', 'Osnovno'],
          ['varijante', 'Varijante'],
          ['slike', 'Slike'],
          ['dostupnost', 'Dostupnost'],
          ['zalihe', 'Zalihe'],
        ].map(([k, l]) => (
          <Link
            key={k}
            aria-current={tab === k ? 'page' : undefined}
            href={`/admin/proizvodi/${id}?tab=${k}`}
          >
            {l}
          </Link>
        ))}
      </nav>
      {tab === 'osnovno' ? (
        <ProductForm
          value={{ ...x, categoryId: x.category.id }}
          categories={categories.data?.data ?? []}
          busy={update.isPending}
          error={update.error}
          onSubmit={(v) => update.mutate(v)}
        />
      ) : (
        <ProductTabs tab={tab} product={x} />
      )}{' '}
      {confirm && (
        <Confirm
          title="Potvrditi promenu statusa?"
          busy={update.isPending}
          onConfirm={() => lifecycle(confirm)}
        >
          Status proizvoda biće promenjen u „{statusLabel[confirm]}”.
          Objavljivanje može biti odbijeno dok nedostaju obavezni sadržaji.
        </Confirm>
      )}
      {destroy && (
        <Confirm
          title="Trajno obrisati proizvod?"
          danger
          busy={remove.isPending}
          onConfirm={() =>
            remove.mutate(undefined, {
              onSuccess: () => router.replace('/admin/proizvodi'),
            })
          }
        >
          Ova SUPER_ADMIN akcija nema opoziv i API je može odbiti zbog istorije
          porudžbina.
        </Confirm>
      )}
    </div>
  );
}
function ProductForm({
  value,
  categories,
  busy,
  error,
  onSubmit,
}: {
  value?: Partial<ProductInput>;
  categories: { id: string; name: string }[];
  busy: boolean;
  error: unknown;
  onSubmit: (v: ProductInput) => void;
}) {
  return (
    <form
      className="catalog-form"
      action={(f) =>
        onSubmit({
          categoryId: String(f.get('categoryId')),
          name: String(f.get('name')),
          slug: String(f.get('slug')) || undefined,
          shortDescription: String(f.get('shortDescription')) || null,
          description: String(f.get('description')) || null,
          seoTitle: String(f.get('seoTitle')) || null,
          seoDescription: String(f.get('seoDescription')) || null,
          featured: f.get('featured') === 'on',
          mainProduct: f.get('mainProduct') === 'on',
          availabilityMode: String(
            f.get('availabilityMode'),
          ) as ProductInput['availabilityMode'],
          manuallyAvailable: f.get('manuallyAvailable') === 'on',
        })
      }
    >
      <label>
        Kategorija *
        <select
          required
          name="categoryId"
          defaultValue={value?.categoryId ?? ''}
        >
          <option value="">Izaberite</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Naziv *
        <input
          required
          minLength={2}
          maxLength={160}
          name="name"
          defaultValue={value?.name}
        />
      </label>
      <label>
        Slug
        <input name="slug" maxLength={180} defaultValue={value?.slug} />
      </label>
      <label>
        Dostupnost
        <select
          name="availabilityMode"
          defaultValue={value?.availabilityMode ?? 'ALWAYS'}
        >
          <option value="ALWAYS">Uvek dostupno</option>
          <option value="MANUAL">Ručna kontrola</option>
          <option value="SEASONAL">Sezonski periodi</option>
        </select>
      </label>
      <label className="full">
        Kratak opis
        <textarea
          name="shortDescription"
          maxLength={320}
          rows={3}
          defaultValue={value?.shortDescription ?? ''}
        />
      </label>
      <label className="full">
        Opis
        <textarea
          name="description"
          maxLength={10000}
          rows={9}
          defaultValue={value?.description ?? ''}
        />
      </label>
      <label>
        SEO naslov
        <input
          name="seoTitle"
          maxLength={70}
          defaultValue={value?.seoTitle ?? ''}
        />
      </label>
      <label>
        SEO opis
        <textarea
          name="seoDescription"
          maxLength={170}
          rows={3}
          defaultValue={value?.seoDescription ?? ''}
        />
      </label>
      <label className="check">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={value?.featured}
        />{' '}
        Izdvojen proizvod
      </label>
      <label className="check">
        <input
          type="checkbox"
          name="mainProduct"
          defaultChecked={value?.mainProduct}
        />{' '}
        Glavni proizvod
      </label>
      <label className="check">
        <input
          type="checkbox"
          name="manuallyAvailable"
          defaultChecked={value?.manuallyAvailable}
        />{' '}
        Ručno dostupan (MANUAL režim)
      </label>
      <Feedback error={error} />
      <div className="catalog-form-actions">
        <button disabled={busy}>
          {busy ? 'Čuvanje…' : 'Sačuvaj osnovne podatke'}
        </button>
      </div>
    </form>
  );
}
