'use client';
import { BrowserApiError } from '@/lib/browser-api/client';
export const rsd = (v: string | null) =>
  v === null
    ? '—'
    : new Intl.NumberFormat('sr-RS', {
        style: 'currency',
        currency: 'RSD',
      }).format(Number(v));
export const unit: Record<string, string> = {
  PIECE: 'kom',
  GRAM: 'g',
  KILOGRAM: 'kg',
  MILLILITER: 'ml',
  LITER: 'l',
};
export const errorMessage = (e: unknown) =>
  e instanceof BrowserApiError
    ? ((
        {
          validation: 'Proverite unete podatke.',
          forbidden: 'Nemate dozvolu za ovu akciju.',
          conflict: 'Izmena je u konfliktu sa trenutnim stanjem.',
          business: 'Poslovno pravilo ne dozvoljava ovu izmenu.',
          'rate-limit': 'Previše pokušaja. Pokušajte kasnije.',
          unavailable: 'Servis trenutno nije dostupan.',
          network: 'Nema veze sa API servisom.',
          timeout: 'Zahtev je istekao.',
        } as Record<string, string>
      )[e.kind] ?? 'Akcija nije uspela.')
    : 'Akcija nije uspela.';
export function Feedback({
  error,
  success,
}: {
  error?: unknown;
  success?: string;
}) {
  if (error)
    return (
      <p className="catalog-feedback error" role="alert">
        {errorMessage(error)}
      </p>
    );
  if (success)
    return (
      <p className="catalog-feedback success" role="status">
        {success}
      </p>
    );
  return null;
}
export function Confirm({
  title,
  children,
  onConfirm,
  busy = false,
  danger = false,
}: {
  title: string;
  children: React.ReactNode;
  onConfirm: () => void;
  busy?: boolean;
  danger?: boolean;
}) {
  return (
    <dialog open className="catalog-confirm">
      <form method="dialog">
        <h2>{title}</h2>
        <p>{children}</p>
        <div>
          <button>Odustani</button>
          <button
            type="button"
            className={danger ? 'danger' : ''}
            disabled={busy}
            onClick={onConfirm}
          >
            {busy ? 'Čuvanje…' : 'Potvrdi'}
          </button>
        </div>
      </form>
    </dialog>
  );
}
