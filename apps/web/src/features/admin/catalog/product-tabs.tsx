'use client';
import { useState } from 'react';
import { useAdmin } from '../admin-provider';
import { catalogApi } from './api';
import { Feedback, Confirm, rsd, unit } from './common';
import { useCatalogMutation, useImages } from './hooks';
import type { ProductDetail, Variant, VariantInput } from './types';
import { Availability, Inventory } from './product-extra';
export function ProductTabs({
  tab,
  product,
}: {
  tab: string;
  product: ProductDetail;
}) {
  if (tab === 'varijante') return <Variants product={product} />;
  if (tab === 'slike') return <Images product={product} />;
  if (tab === 'dostupnost') return <Availability product={product} />;
  if (tab === 'zalihe') return <Inventory product={product} />;
  return null;
}
const decimal = /^(0|[1-9]\d{0,9})(\.\d{1,3})?$/;
const money = /^(0|[1-9]\d{0,9})(\.\d{1,2})?$/;
function Variants({ product }: { product: ProductDetail }) {
  const { admin } = useAdmin();
  const [editing, setEditing] = useState<Variant | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<Variant | null>(null);
  const save = useCatalogMutation(
    (t, v: { id?: string; body: VariantInput }) =>
      v.id
        ? catalogApi.variants.update(t, product.id, v.id, v.body)
        : catalogApi.variants.create(t, product.id, v.body),
  );
  const remove = useCatalogMutation((t, id: string) =>
    catalogApi.variants.remove(t, product.id, id),
  );
  return (
    <section className="catalog-panel">
      <header>
        <div>
          <h2>Varijante</h2>
          <p>
            Cene, pakovanja, SKU i pravila kupovine. Sve količine šalju se kao
            decimalni stringovi.
          </p>
        </div>
        <button onClick={() => setEditing(null)}>Nova varijanta</button>
      </header>
      <Feedback error={save.error || remove.error} />
      {!product.variants.length ? (
        <p className="catalog-state">
          Nema varijanti. Dodajte prvu da biste kasnije mogli objaviti proizvod.
        </p>
      ) : (
        <div className="catalog-table">
          <table>
            <thead>
              <tr>
                <th>Naziv / SKU</th>
                <th>Cena</th>
                <th>Pakovanje</th>
                <th>Kupovina</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {product.variants.map((v) => (
                <tr key={v.id}>
                  <td>
                    {v.name}
                    <small>
                      {v.sku}
                      {v.isDefault ? ' · podrazumevana' : ''}
                    </small>
                  </td>
                  <td>
                    {rsd(v.price)}
                    {v.compareAtPrice && (
                      <small>Pre {rsd(v.compareAtPrice)}</small>
                    )}
                  </td>
                  <td>
                    {v.packageAmount} {unit[v.unit]}
                  </td>
                  <td>
                    min {v.minimumPurchaseQuantity} · korak{' '}
                    {v.purchaseIncrement}
                  </td>
                  <td>
                    {v.isActive ? 'Aktivna' : 'Neaktivna'}
                    {v.allowBackorder ? ' · backorder' : ''}
                  </td>
                  <td>
                    <button onClick={() => setEditing(v)}>Izmeni</button>
                    {admin?.role === 'SUPER_ADMIN' && (
                      <button
                        className="link-danger"
                        onClick={() => setDeleting(v)}
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
      {editing !== undefined && (
        <VariantForm
          value={editing}
          busy={save.isPending}
          error={save.error}
          close={() => setEditing(undefined)}
          submit={(body) =>
            save.mutate(
              { id: editing?.id, body },
              { onSuccess: () => setEditing(undefined) },
            )
          }
        />
      )}{' '}
      {deleting && (
        <Confirm
          title="Trajno obrisati varijantu?"
          danger
          busy={remove.isPending}
          onConfirm={() =>
            remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })
          }
        >
          Varijanta „{deleting.name}” biće obrisana samo ako backend pravila to
          dozvole.
        </Confirm>
      )}
    </section>
  );
}
function VariantForm({
  value,
  busy,
  error,
  close,
  submit,
}: {
  value: Variant | null;
  busy: boolean;
  error: unknown;
  close: () => void;
  submit: (x: VariantInput) => void;
}) {
  const [local, setLocal] = useState('');
  return (
    <dialog open className="catalog-dialog">
      <form
        action={(f) => {
          const price = String(f.get('price')),
            packageAmount = String(f.get('packageAmount')),
            threshold = String(f.get('lowStockThreshold')),
            minimum = String(f.get('minimumPurchaseQuantity')),
            increment = String(f.get('purchaseIncrement'));
          if (
            !money.test(price) ||
            ![packageAmount, threshold, minimum, increment].every((x) =>
              decimal.test(x),
            )
          ) {
            setLocal('Decimalne vrednosti nisu u ispravnom formatu.');
            return;
          }
          submit({
            name: String(f.get('name')),
            sku: String(f.get('sku')).toUpperCase(),
            price,
            compareAtPrice: String(f.get('compareAtPrice')) || null,
            packageAmount,
            unit: String(f.get('unit')) as VariantInput['unit'],
            lowStockThreshold: threshold,
            minimumPurchaseQuantity: minimum,
            purchaseIncrement: increment,
            allowBackorder: f.get('allowBackorder') === 'on',
            isDefault: f.get('isDefault') === 'on',
            isActive: f.get('isActive') === 'on',
            sortOrder: Number(f.get('sortOrder') || 0),
          });
        }}
      >
        <header>
          <h2>{value ? 'Izmena varijante' : 'Nova varijanta'}</h2>
          <button type="button" aria-label="Zatvori" onClick={close}>
            ×
          </button>
        </header>
        <div className="catalog-form">
          <label>
            Naziv *
            <input
              required
              name="name"
              maxLength={120}
              defaultValue={value?.name}
            />
          </label>
          <label>
            SKU *
            <input
              required
              name="sku"
              pattern="[A-Za-z0-9_-]+"
              defaultValue={value?.sku}
            />
          </label>
          <label>
            Cena (RSD) *
            <input
              required
              inputMode="decimal"
              name="price"
              defaultValue={value?.price ?? '0.00'}
            />
          </label>
          <label>
            Uporedna cena
            <input
              inputMode="decimal"
              name="compareAtPrice"
              defaultValue={value?.compareAtPrice ?? ''}
            />
          </label>
          <label>
            Količina pakovanja *
            <input
              required
              inputMode="decimal"
              name="packageAmount"
              defaultValue={value?.packageAmount ?? '1.000'}
            />
          </label>
          <label>
            Jedinica
            <select name="unit" defaultValue={value?.unit ?? 'PIECE'}>
              {Object.entries(unit).map(([k, v]) => (
                <option value={k} key={k}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label>
            Prag niske zalihe *
            <input
              required
              name="lowStockThreshold"
              defaultValue={value?.lowStockThreshold ?? '0.000'}
            />
          </label>
          <label>
            Minimalna kupovina *
            <input
              required
              name="minimumPurchaseQuantity"
              defaultValue={value?.minimumPurchaseQuantity ?? '1.000'}
            />
          </label>
          <label>
            Korak kupovine *
            <input
              required
              name="purchaseIncrement"
              defaultValue={value?.purchaseIncrement ?? '1.000'}
            />
          </label>
          <label>
            Redosled
            <input
              type="number"
              min={0}
              name="sortOrder"
              defaultValue={value?.sortOrder ?? 0}
            />
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={value?.isActive ?? true}
            />{' '}
            Aktivna
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="isDefault"
              defaultChecked={value?.isDefault}
            />{' '}
            Podrazumevana
          </label>
          <label className="check">
            <input
              type="checkbox"
              name="allowBackorder"
              defaultChecked={value?.allowBackorder}
            />{' '}
            Dozvoli backorder
          </label>
        </div>
        <Feedback error={error || local} />
        <footer>
          <button type="button" onClick={close}>
            Odustani
          </button>
          <button disabled={busy}>{busy ? 'Čuvanje…' : 'Sačuvaj'}</button>
        </footer>
      </form>
    </dialog>
  );
}
function Images({ product }: { product: ProductDetail }) {
  const images = useImages(product.id);
  const [action, setAction] = useState<'upload' | 'url' | null>(null);
  const [removeId, setRemoveId] = useState<string | null>(null);
  const mutate = useCatalogMutation<
    unknown,
    {
      kind: string;
      id?: string;
      body?: FormData | { url: string; altText: string; isPrimary: boolean };
    }
  >(
    (
      t,
      v: {
        kind: string;
        id?: string;
        body?: FormData | { url: string; altText: string; isPrimary: boolean };
      },
    ) =>
      v.kind === 'remove'
        ? catalogApi.images.remove(t, product.id, v.id!)
        : v.kind === 'primary'
          ? catalogApi.images.update(t, product.id, v.id!, { isPrimary: true })
          : v.kind === 'upload'
            ? catalogApi.images.upload(t, product.id, v.body as FormData)
            : catalogApi.images.create(
                t,
                product.id,
                v.body as { url: string; altText: string; isPrimary: boolean },
              ),
  );
  const move = useCatalogMutation(
    (t, v: { items: { id: string; sortOrder: number }[]; primary?: string }) =>
      catalogApi.images.reorder(t, product.id, v.items, v.primary),
  );
  const shift = (i: number, d: number) => {
    if (!images.data) return;
    const a = [...images.data],
      j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    move.mutate({ items: a.map((x, n) => ({ id: x.id, sortOrder: n })) });
  };
  return (
    <section className="catalog-panel">
      <header>
        <div>
          <h2>Slike</h2>
          <p>
            Do 12 slika. JPEG, PNG ili WebP do 8 MB; server optimizuje upload.
          </p>
        </div>
        <div>
          <button onClick={() => setAction('upload')}>Otpremi sliku</button>
          <button onClick={() => setAction('url')}>Dodaj HTTPS URL</button>
        </div>
      </header>
      <Feedback error={images.error || mutate.error || move.error} />
      {images.isLoading ? (
        <p role="status">Učitavanje slika…</p>
      ) : !images.data?.length ? (
        <p className="catalog-state">Proizvod još nema sliku.</p>
      ) : (
        <div className="image-grid">
          {images.data.map((x, i) => (
            <article key={x.id}>
              <img src={x.url} alt={x.altText} />
              <div>
                <strong>
                  {x.primary || x.isPrimary ? 'Primarna' : 'Slika'}
                </strong>
                <p>{x.altText}</p>
                {x.width && (
                  <small>
                    {x.width}×{x.height} · {x.format}
                  </small>
                )}
                <div>
                  <button
                    aria-label="Pomeri sliku levo"
                    disabled={i === 0}
                    onClick={() => shift(i, -1)}
                  >
                    ←
                  </button>
                  <button
                    aria-label="Pomeri sliku desno"
                    disabled={i === images.data!.length - 1}
                    onClick={() => shift(i, 1)}
                  >
                    →
                  </button>
                  {!(x.primary || x.isPrimary) && (
                    <button
                      onClick={() =>
                        mutate.mutate({ kind: 'primary', id: x.id })
                      }
                    >
                      Postavi primarnu
                    </button>
                  )}
                  <button
                    className="link-danger"
                    onClick={() => setRemoveId(x.id)}
                  >
                    Obriši
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
      {action && (
        <ImageForm
          kind={action}
          busy={mutate.isPending}
          error={mutate.error}
          close={() => setAction(null)}
          submit={(body) =>
            mutate.mutate(
              { kind: action, body },
              { onSuccess: () => setAction(null) },
            )
          }
        />
      )}{' '}
      {removeId && (
        <Confirm
          title="Obrisati sliku?"
          danger
          busy={mutate.isPending}
          onConfirm={() =>
            mutate.mutate(
              { kind: 'remove', id: removeId },
              { onSuccess: () => setRemoveId(null) },
            )
          }
        >
          Managed slika biće uklonjena i iz cloud storage-a; external URL briše
          samo metadata zapis.
        </Confirm>
      )}
    </section>
  );
}
function ImageForm({
  kind,
  busy,
  error,
  close,
  submit,
}: {
  kind: 'upload' | 'url';
  busy: boolean;
  error: unknown;
  close: () => void;
  submit: (
    x: FormData | { url: string; altText: string; isPrimary: boolean },
  ) => void;
}) {
  const [local, setLocal] = useState('');
  return (
    <dialog open className="catalog-dialog">
      <form
        action={(f) => {
          const alt = String(f.get('altText')).trim();
          if (alt.length < 3) {
            setLocal('Alt tekst mora imati najmanje 3 znaka.');
            return;
          }
          if (kind === 'upload') {
            const file = f.get('file');
            if (!(file instanceof File) || !file.size) {
              setLocal('Izaberite sliku.');
              return;
            }
            if (
              file.size > 8_388_608 ||
              !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
            ) {
              setLocal('Dozvoljeni su JPEG, PNG i WebP fajlovi do 8 MB.');
              return;
            }
            const body = new FormData();
            body.set('file', file);
            body.set('altText', alt);
            body.set('isPrimary', String(f.get('isPrimary') === 'on'));
            submit(body);
          } else
            submit({
              url: String(f.get('url')),
              altText: alt,
              isPrimary: f.get('isPrimary') === 'on',
            });
        }}
      >
        <header>
          <h2>{kind === 'upload' ? 'Otpremi sliku' : 'Dodaj external URL'}</h2>
          <button type="button" onClick={close}>
            ×
          </button>
        </header>
        <div className="catalog-form">
          {kind === 'upload' ? (
            <label className="full">
              Slika *
              <input
                required
                type="file"
                name="file"
                accept="image/jpeg,image/png,image/webp"
              />
            </label>
          ) : (
            <label className="full">
              HTTPS URL *
              <input required type="url" name="url" pattern="https://.*" />
            </label>
          )}
          <label className="full">
            Alt tekst *
            <input required minLength={3} maxLength={160} name="altText" />
          </label>
          <label className="check">
            <input type="checkbox" name="isPrimary" /> Postavi kao primarnu
          </label>
        </div>
        <Feedback error={error || local} />
        <footer>
          <button type="button" onClick={close}>
            Odustani
          </button>
          <button disabled={busy}>{busy ? 'Slanje…' : 'Sačuvaj'}</button>
        </footer>
      </form>
    </dialog>
  );
}
