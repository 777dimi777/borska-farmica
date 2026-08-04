'use client';
import { useState } from 'react';
import { catalogApi } from './api';
import { Confirm, Feedback } from './common';
import {
  useCatalogMutation,
  useMovements,
  usePreview,
  useWindows,
} from './hooks';
import type { ProductDetail, Window } from './types';
export function Availability({ product }: { product: ProductDetail }) {
  const windows = useWindows(product.id),
    preview = usePreview(product.id);
  const [editing, setEditing] = useState<Window | null | undefined>(undefined),
    [removeId, setRemoveId] = useState<string | null>(null);
  const save = useCatalogMutation(
    (t, v: { id?: string; body: Record<string, unknown> }) =>
      v.id
        ? catalogApi.availability.update(t, product.id, v.id, v.body)
        : catalogApi.availability.create(t, product.id, v.body),
  );
  const remove = useCatalogMutation((t, id: string) =>
    catalogApi.availability.remove(t, product.id, id),
  );
  const reorder = useCatalogMutation(
    (t, items: { id: string; sortOrder: number }[]) =>
      catalogApi.availability.reorder(t, product.id, items),
  );
  const shift = (i: number, d: number) => {
    if (!windows.data) return;
    const a = [...windows.data],
      j = i + d;
    if (j < 0 || j >= a.length) return;
    [a[i], a[j]] = [a[j], a[i]];
    reorder.mutate(a.map((x, n) => ({ id: x.id, sortOrder: n })));
  };
  return (
    <section className="catalog-panel">
      <header>
        <div>
          <h2>Dostupnost</h2>
          <p>
            Režim: <strong>{product.availabilityMode}</strong> · zona
            Europe/Belgrade.
          </p>
        </div>
        <button onClick={() => setEditing(null)}>Novi period</button>
      </header>
      {preview.data && (
        <article
          className={`availability-preview ${preview.data.purchasable ? 'ok' : 'warn'}`}
        >
          <h3>Pregled za {preview.data.businessDate}</h3>
          <p>
            {preview.data.purchasable
              ? 'Može da se kupi'
              : 'Trenutno nije za kupovinu'}{' '}
            · {preview.data.businessReason} · {preview.data.stockReason}
          </p>
          {preview.data.label && <strong>{preview.data.label}</strong>}
        </article>
      )}
      <Feedback
        error={
          windows.error ||
          preview.error ||
          save.error ||
          remove.error ||
          reorder.error
        }
      />
      {!windows.data?.length ? (
        <p className="catalog-state">
          Nema perioda. SEASONAL proizvod tada nije dostupan.
        </p>
      ) : (
        <div className="catalog-table">
          <table>
            <thead>
              <tr>
                <th>Redosled</th>
                <th>Tip</th>
                <th>Period</th>
                <th>Oznaka</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {windows.data.map((w, i) => (
                <tr key={w.id}>
                  <td>
                    <button disabled={i === 0} onClick={() => shift(i, -1)}>
                      ↑
                    </button>
                    <button
                      disabled={i === windows.data!.length - 1}
                      onClick={() => shift(i, 1)}
                    >
                      ↓
                    </button>
                  </td>
                  <td>
                    {w.type === 'FIXED_DATE_RANGE' ? 'Fiksni' : 'Godišnji'}
                  </td>
                  <td>
                    {w.type === 'FIXED_DATE_RANGE'
                      ? `${String(w.startsAt).slice(0, 10)} – ${String(w.endsAt).slice(0, 10)}`
                      : `${w.startDay}.${w.startMonth}. – ${w.endDay}.${w.endMonth}.`}
                  </td>
                  <td>{w.label ?? w.publicLabel ?? '—'}</td>
                  <td>{w.isActive ? 'Aktivan' : 'Neaktivan'}</td>
                  <td>
                    <button onClick={() => setEditing(w)}>Izmeni</button>
                    <button
                      className="link-danger"
                      onClick={() => setRemoveId(w.id)}
                    >
                      Obriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {editing !== undefined && (
        <WindowForm
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
      {removeId && (
        <Confirm
          title="Obrisati period?"
          danger
          busy={remove.isPending}
          onConfirm={() =>
            remove.mutate(removeId, { onSuccess: () => setRemoveId(null) })
          }
        >
          Sezonski proizvod bez odgovarajućeg aktivnog perioda neće biti
          dostupan.
        </Confirm>
      )}
    </section>
  );
}
function WindowForm({
  value,
  busy,
  error,
  close,
  submit,
}: {
  value: Window | null;
  busy: boolean;
  error: unknown;
  close: () => void;
  submit: (x: Record<string, unknown>) => void;
}) {
  const [type, setType] = useState(value?.type ?? 'FIXED_DATE_RANGE');
  return (
    <dialog open className="catalog-dialog">
      <form
        action={(f) => {
          const base = {
            type,
            isActive: f.get('isActive') === 'on',
            label: String(f.get('label')) || null,
            sortOrder: Number(f.get('sortOrder') || 0),
          };
          submit(
            type === 'FIXED_DATE_RANGE'
              ? {
                  ...base,
                  startsAt: String(f.get('startsAt')),
                  endsAt: String(f.get('endsAt')),
                }
              : {
                  ...base,
                  startMonth: Number(f.get('startMonth')),
                  startDay: Number(f.get('startDay')),
                  endMonth: Number(f.get('endMonth')),
                  endDay: Number(f.get('endDay')),
                },
          );
        }}
      >
        <header>
          <h2>{value ? 'Izmena perioda' : 'Novi period'}</h2>
          <button type="button" onClick={close}>
            ×
          </button>
        </header>
        <div className="catalog-form">
          <label>
            Tip
            <select
              value={type}
              onChange={(e) => setType(e.target.value as typeof type)}
            >
              <option value="FIXED_DATE_RANGE">Fiksni datumi</option>
              <option value="RECURRING_ANNUAL">Godišnje ponavljanje</option>
            </select>
          </label>
          {type === 'FIXED_DATE_RANGE' ? (
            <>
              <label>
                Početak *
                <input
                  required
                  type="date"
                  name="startsAt"
                  defaultValue={String(value?.startsAt ?? '').slice(0, 10)}
                />
              </label>
              <label>
                Kraj *
                <input
                  required
                  type="date"
                  name="endsAt"
                  defaultValue={String(value?.endsAt ?? '').slice(0, 10)}
                />
              </label>
            </>
          ) : (
            <>
              <label>
                Početni mesec
                <input
                  required
                  type="number"
                  min={1}
                  max={12}
                  name="startMonth"
                  defaultValue={value?.startMonth ?? 1}
                />
              </label>
              <label>
                Početni dan
                <input
                  required
                  type="number"
                  min={1}
                  max={31}
                  name="startDay"
                  defaultValue={value?.startDay ?? 1}
                />
              </label>
              <label>
                Krajnji mesec
                <input
                  required
                  type="number"
                  min={1}
                  max={12}
                  name="endMonth"
                  defaultValue={value?.endMonth ?? 12}
                />
              </label>
              <label>
                Krajnji dan
                <input
                  required
                  type="number"
                  min={1}
                  max={31}
                  name="endDay"
                  defaultValue={value?.endDay ?? 31}
                />
              </label>
            </>
          )}
          <label className="full">
            Javna oznaka
            <input
              name="label"
              maxLength={240}
              defaultValue={value?.label ?? value?.publicLabel ?? ''}
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
            Aktivan
          </label>
        </div>
        <Feedback error={error} />
        <footer>
          <button type="button" onClick={close}>
            Odustani
          </button>
          <button disabled={busy}>Sačuvaj</button>
        </footer>
      </form>
    </dialog>
  );
}
export function Inventory({ product }: { product: ProductDetail }) {
  const [selected, setSelected] = useState(product.variants[0]?.id ?? ''),
    variant = product.variants.find((v) => v.id === selected),
    history = useMovements(product.id, selected);
  type Input = {
    type: 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGE';
    quantity: string;
    reason?: string;
    reference?: string;
  };
  const [confirm, setConfirm] = useState<Input | null>(null);
  const adjust = useCatalogMutation((t, b: Input) =>
    catalogApi.inventory.adjust(t, product.id, selected, b),
  );
  return (
    <section className="catalog-panel">
      <header>
        <div>
          <h2>Zalihe</h2>
          <p>
            Fizičko stanje se menja evidentiranim movementom; rezervisano je
            read-only.
          </p>
        </div>
      </header>
      {!product.variants.length ? (
        <p className="catalog-state">
          Dodajte varijantu pre evidentiranja zaliha.
        </p>
      ) : (
        <>
          <label className="inventory-select">
            Varijanta
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              {product.variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} · {v.sku}
                </option>
              ))}
            </select>
          </label>
          {variant && (
            <div className="inventory-cards">
              <article>
                <span>Fizičko</span>
                <strong>{variant.stockQuantity}</strong>
              </article>
              <article>
                <span>Rezervisano</span>
                <strong>{variant.reservedQuantity}</strong>
              </article>
              <article>
                <span>Raspoloživo</span>
                <strong>{variant.availableQuantity}</strong>
              </article>
              <article>
                <span>Prag</span>
                <strong>{variant.lowStockThreshold}</strong>
              </article>
            </div>
          )}
          <InventoryForm
            busy={adjust.isPending}
            error={adjust.error}
            submit={setConfirm}
          />
          <h3>Istorija promena</h3>
          {history.isLoading ? (
            <p role="status">Učitavanje…</p>
          ) : history.isError ? (
            <p role="alert">Istorija nije dostupna.</p>
          ) : !history.data?.data.length ? (
            <p>Nema promena.</p>
          ) : (
            <div className="catalog-table">
              <table>
                <thead>
                  <tr>
                    <th>Vreme</th>
                    <th>Tip</th>
                    <th>Promena</th>
                    <th>Stanje posle</th>
                    <th>Razlog</th>
                  </tr>
                </thead>
                <tbody>
                  {history.data.data.map((m) => (
                    <tr key={m.id}>
                      <td>{new Date(m.createdAt).toLocaleString('sr-RS')}</td>
                      <td>{m.type}</td>
                      <td>{m.quantityDelta}</td>
                      <td>{m.balanceAfter ?? '—'}</td>
                      <td>
                        {m.reason ?? '—'}
                        <small>{m.reference}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
      {confirm && (
        <Confirm
          title="Potvrditi promenu zalihe?"
          busy={adjust.isPending}
          onConfirm={() =>
            adjust.mutate(confirm, { onSuccess: () => setConfirm(null) })
          }
        >
          {confirm.type} movement za {confirm.quantity}. Stanje se prikazuje tek
          nakon odgovora servera.
        </Confirm>
      )}
    </section>
  );
}
function InventoryForm({
  busy,
  error,
  submit,
}: {
  busy: boolean;
  error: unknown;
  submit: (x: {
    type: 'RESTOCK' | 'ADJUSTMENT' | 'DAMAGE';
    quantity: string;
    reason?: string;
    reference?: string;
  }) => void;
}) {
  const [type, setType] = useState<'RESTOCK' | 'ADJUSTMENT' | 'DAMAGE'>(
      'RESTOCK',
    ),
    [local, setLocal] = useState('');
  return (
    <form
      className="inventory-form"
      action={(f) => {
        const quantity = String(f.get('quantity')),
          reason = String(f.get('reason')).trim();
        if (
          !/^-?(0|[1-9]\d{0,9})(\.\d{1,3})?$/.test(quantity) ||
          Number(quantity) === 0
        ) {
          setLocal('Unesite validnu količinu različitu od nule.');
          return;
        }
        if (type !== 'ADJUSTMENT' && Number(quantity) < 0) {
          setLocal('Dopuna i otpis koriste pozitivnu apsolutnu količinu.');
          return;
        }
        if (type !== 'RESTOCK' && !reason) {
          setLocal('Razlog je obavezan za korekciju i otpis.');
          return;
        }
        submit({
          type,
          quantity,
          reason: reason || undefined,
          reference: String(f.get('reference')).trim() || undefined,
        });
      }}
    >
      <label>
        Tip
        <select
          value={type}
          onChange={(e) => setType(e.target.value as typeof type)}
        >
          <option value="RESTOCK">Dopuna</option>
          <option value="ADJUSTMENT">Korekcija (+/−)</option>
          <option value="DAMAGE">Otpis</option>
        </select>
      </label>
      <label>
        Količina *<input required name="quantity" inputMode="decimal" />
      </label>
      <label>
        Razlog {type !== 'RESTOCK' && '*'}
        <input name="reason" maxLength={500} />
      </label>
      <label>
        Referenca
        <input name="reference" maxLength={160} />
      </label>
      <button disabled={busy}>Pripremi</button>
      <Feedback error={error || local} />
      <p className="full">
        <small>
          SALE nije ručna opcija; nastaje isključivo završetkom porudžbine.
        </small>
      </p>
    </form>
  );
}
