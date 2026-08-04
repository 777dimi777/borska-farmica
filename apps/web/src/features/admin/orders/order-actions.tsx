'use client';
import { useRef, useState } from 'react';
import { BrowserApiError } from '@/lib/browser-api/client';
import { useFeedback } from '@/components/providers/feedback-provider';
import { useOrderTransition } from './hooks';
import type { AdminOrderDetail, TransitionInput } from './types';
import { primaryAction } from './transitions';
import { formatRsd, statusLabel } from './formatters';
type Props = { order: AdminOrderDetail; refetch: () => Promise<unknown> };
export function OrderActions({ order, refetch }: Props) {
  const transition = useOrderTransition();
  const feedback = useFeedback();
  const actionDialog = useRef<HTMLDialogElement>(null);
  const cancelDialog = useRef<HTMLDialogElement>(null);
  const [cash, setCash] = useState(false);
  const [cancelReason, setCancelReason] = useState('');
  const [confirmedPickupAt, setConfirmedPickupAt] = useState(
    `${order.pickup.requestedPickupDate}T12:00`,
  );
  const [message, setMessage] = useState('');
  const action = primaryAction[order.status];
  const handleError = async (error: unknown) => {
    await refetch();
    if (error instanceof BrowserApiError && error.kind === 'conflict') {
      setMessage(
        `Porudžbina je u međuvremenu promenjena. Prikaz je osvežen.${error.requestId ? ` Referenca: ${error.requestId}` : ''}`,
      );
      feedback('Porudžbina je promenjena. Prikaz je osvežen.', 'error');
    } else if (
      error instanceof BrowserApiError &&
      ['network', 'timeout'].includes(error.kind)
    ) {
      setMessage(
        'Nismo dobili potvrdu servera. Osvežili smo porudžbinu pre novog pokušaja.',
      );
      feedback(
        'Nije dobijena potvrda servera. Proverite trenutni status.',
        'error',
      );
    } else {
      setMessage(
        error instanceof BrowserApiError && error.kind === 'business'
          ? 'Akcija nije moguća zbog stanja zaliha ili porudžbine.'
          : 'Akcija trenutno nije uspela. Prikaz je osvežen.',
      );
      feedback('Akcija nije uspela.', 'error');
    }
  };
  const submit = async (
    body: TransitionInput,
    dialog: React.RefObject<HTMLDialogElement | null>,
    success: string,
  ) => {
    setMessage('');
    try {
      await transition.mutateAsync({ id: order.id, body });
      dialog.current?.close();
      setCash(false);
      feedback(success, 'success');
    } catch (error) {
      dialog.current?.close();
      await handleError(error);
    }
  };
  if (!action)
    return (
      <aside className="order-action-panel">
        <h2>Akcije</h2>
        <p>
          Porudžbina je u terminalnom statusu{' '}
          <strong>{statusLabel[order.status]}</strong>. Nema dostupnih izmena.
        </p>
        {message && (
          <p className="order-conflict" tabIndex={-1} role="alert">
            {message}
          </p>
        )}
      </aside>
    );
  return (
    <aside className="order-action-panel">
      <h2>Akcije</h2>
      {message && (
        <p className="order-conflict" tabIndex={-1} role="alert">
          {message}
        </p>
      )}
      <button
        className="button button-primary"
        disabled={transition.isPending}
        onClick={() => actionDialog.current?.showModal()}
      >
        {action.label}
      </button>
      <button
        className="button destructive"
        disabled={transition.isPending}
        onClick={() => cancelDialog.current?.showModal()}
      >
        Otkaži porudžbinu
      </button>
      <dialog ref={actionDialog} className="order-action-dialog">
        <h2>{action.label}</h2>
        <p>{action.description}</p>
        {action.target === 'CONFIRMED' && (
          <label>
            Dogovoreni datum i vreme preuzimanja
            <input
              type="datetime-local"
              value={confirmedPickupAt}
              min={`${order.pickup.requestedPickupDate}T00:00`}
              max={`${order.pickup.requestedPickupDate}T23:59`}
              onChange={(e) => setConfirmedPickupAt(e.target.value)}
            />
          </label>
        )}
        {action.target === 'COMPLETED' && (
          <div className="completion-summary">
            <p>
              <strong>{order.orderNumber}</strong>
            </p>
            <p>
              {order.customerSnapshot.firstName}{' '}
              {order.customerSnapshot.lastName}
            </p>
            <p>{order.pickup.name}</p>
            <p>
              <strong>{formatRsd(order.summary.total)}</strong>
            </p>
            <p>
              Status će postati COMPLETED/PAID. Fizička i rezervisana zaliha
              biće smanjene i nastaju SALE movements. Akcija se ne može
              ponoviti.
            </p>
            <label className="confirm-check">
              <input
                type="checkbox"
                checked={cash}
                onChange={(e) => setCash(e.target.checked)}
              />
              Potvrđujem da je porudžbina preuzeta i plaćena gotovinom.
            </label>
          </div>
        )}
        <div className="dialog-actions">
          <button onClick={() => actionDialog.current?.close()}>
            Odustani
          </button>
          <button
            className="button button-primary"
            disabled={
              transition.isPending ||
              (action.target === 'COMPLETED' && !cash) ||
              (action.target === 'CONFIRMED' && !confirmedPickupAt)
            }
            onClick={() => {
              const body: TransitionInput = { targetStatus: action.target };
              if (action.target === 'CONFIRMED')
                body.confirmedPickupAt = new Date(
                  confirmedPickupAt,
                ).toISOString();
              if (action.target === 'COMPLETED') body.cashReceived = true;
              void submit(
                body,
                actionDialog,
                action.target === 'COMPLETED'
                  ? 'Porudžbina je završena i gotovinsko plaćanje je potvrđeno.'
                  : action.target === 'READY_FOR_PICKUP'
                    ? 'Porudžbina je označena kao spremna.'
                    : action.target === 'PREPARING'
                      ? 'Priprema porudžbine je započeta.'
                      : 'Porudžbina je potvrđena.',
              );
            }}
          >
            {transition.isPending ? 'Čuvanje…' : action.label}
          </button>
        </div>
      </dialog>
      <dialog
        ref={cancelDialog}
        className="order-action-dialog destructive-dialog"
      >
        <h2>Otkaži porudžbinu</h2>
        <p>
          <strong>{order.orderNumber}</strong> je trenutno:{' '}
          {statusLabel[order.status]}.
        </p>
        <p>
          Aktivna rezervacija biće oslobođena. Fizička zaliha se neće smanjiti i
          akcija je terminalna.
        </p>
        <label>
          Razlog otkazivanja
          <textarea
            aria-label="Razlog otkazivanja"
            aria-describedby="cancellation-note-count"
            maxLength={500}
            required
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Kratka operativna napomena"
          />
          <small id="cancellation-note-count">{cancelReason.length}/500</small>
        </label>
        <div className="dialog-actions">
          <button onClick={() => cancelDialog.current?.close()}>
            Odustani
          </button>
          <button
            className="button destructive"
            disabled={transition.isPending || !cancelReason.trim()}
            onClick={() =>
              void submit(
                {
                  targetStatus: 'CANCELLED',
                  cancellationReason: cancelReason.trim(),
                },
                cancelDialog,
                'Porudžbina je otkazana, a rezervacija oslobođena.',
              )
            }
          >
            {transition.isPending ? 'Otkazivanje…' : 'Trajno otkaži porudžbinu'}
          </button>
        </div>
      </dialog>
    </aside>
  );
}
