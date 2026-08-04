import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type { AdminOrderDetail, OrderStatus } from './types';
const mutateAsync = vi.fn();
vi.mock('./hooks', () => ({
  useOrderTransition: () => ({ isPending: false, mutateAsync }),
}));
vi.mock('@/components/providers/feedback-provider', () => ({
  useFeedback: () => vi.fn(),
}));
import { OrderActions } from './order-actions';
const fixture = (status: OrderStatus): AdminOrderDetail => ({
  id: '00000000-0000-4000-8000-000000000001',
  orderNumber: 'BF-20260804-ABC12345',
  customerId: 'c',
  customerProfile: {
    id: 'c',
    email: 'ana@example.com',
    firstName: 'Ana',
    lastName: 'Anić',
    phone: '+381601234567',
    status: 'ACTIVE',
  },
  customerSnapshot: {
    email: 'ana@example.com',
    firstName: 'Ana',
    lastName: 'Anić',
    phone: '+381601234567',
  },
  status,
  paymentMethod: 'CASH_ON_PICKUP',
  paymentStatus: status === 'COMPLETED' ? 'PAID' : 'UNPAID',
  pickup: {
    id: 'p',
    code: 'FARM_HOME',
    name: 'Borska Farmica',
    address: 'Nade Dimić 30',
    instructions: null,
    allowedWeekday: null,
    sortOrder: 1,
    requestedPickupDate: '2026-08-08',
    confirmedPickupAt: null,
  },
  customerNote: null,
  cancellationReason: null,
  cancellationNote: null,
  items: [],
  reservations: [],
  timeline: [],
  summary: {
    subtotal: '1000.00',
    fee: '0.00',
    total: '1000.00',
    currency: 'RSD',
  },
  confirmationExpiresAt: '2026-08-05T12:00:00Z',
  confirmedAt: null,
  preparingAt: null,
  readyAt: null,
  completedAt: null,
  cancelledAt: null,
  createdAt: '2026-08-04T10:00:00Z',
  updatedAt: '2026-08-04T10:00:00Z',
});
beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute('open');
  };
});
describe('admin order actions', () => {
  it.each([
    ['PENDING_CONFIRMATION', 'Potvrdi porudžbinu'],
    ['CONFIRMED', 'Započni pripremu'],
    ['PREPARING', 'Označi kao spremnu'],
    ['READY_FOR_PICKUP', 'Završi i potvrdi naplatu'],
  ] as const)(
    'za %s prikazuje samo sledeći korak i cancellation',
    (status, label) => {
      render(<OrderActions order={fixture(status)} refetch={vi.fn()} />);
      expect(screen.getByRole('button', { name: label })).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Otkaži porudžbinu' }),
      ).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Započni pripremu' })).toBe(
        status === 'CONFIRMED'
          ? screen.getByRole('button', { name: 'Započni pripremu' })
          : null,
      );
    },
  );
  it.each(['COMPLETED', 'CANCELLED'] as const)(
    '%s nema mutation akcije',
    (status) => {
      render(<OrderActions order={fixture(status)} refetch={vi.fn()} />);
      expect(
        screen.queryByRole('button', {
          name: /Potvrdi|Započni|Označi|Završi|Otkaži/,
        }),
      ).not.toBeInTheDocument();
    },
  );
  it('completion zahteva eksplicitnu potvrdu gotovine', async () => {
    const user = userEvent.setup();
    render(
      <OrderActions order={fixture('READY_FOR_PICKUP')} refetch={vi.fn()} />,
    );
    await user.click(
      screen.getByRole('button', { name: 'Završi i potvrdi naplatu' }),
    );
    const submit = screen.getAllByRole('button', {
      name: 'Završi i potvrdi naplatu',
    })[1];
    expect(submit).toBeDisabled();
    await user.click(screen.getByRole('checkbox'));
    expect(submit).toBeEnabled();
  });
  it('cancellation zahteva napomenu i ograničena je na 500', async () => {
    render(<OrderActions order={fixture('CONFIRMED')} refetch={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: 'Otkaži porudžbinu' }));
    const note = screen.getByRole('textbox', { name: 'Razlog otkazivanja' });
    expect(note).toHaveAttribute('maxlength', '500');
    expect(
      screen.getByRole('button', { name: 'Trajno otkaži porudžbinu' }),
    ).toBeDisabled();
  });
  it('action panel i otvoren completion dialog nemaju osnovne axe prekršaje', async () => {
    const { container } = render(
      <OrderActions order={fixture('READY_FOR_PICKUP')} refetch={vi.fn()} />,
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Završi i potvrdi naplatu' }),
    );
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toHaveLength(0);
  });
});
