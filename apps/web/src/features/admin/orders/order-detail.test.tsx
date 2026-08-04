import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { describe, expect, it, vi } from 'vitest';
import { BrowserApiError } from '@/lib/browser-api/client';
const mocks = vi.hoisted(() => ({ order: {} as Record<string, unknown> }));
vi.mock('./hooks', () => ({ useAdminOrder: () => mocks.order }));
vi.mock('./order-actions', () => ({
  OrderActions: () => (
    <aside>
      <h2>Akcije</h2>
    </aside>
  ),
}));
import { AdminOrderDetailView } from './order-detail';
const detail = {
  id: '00000000-0000-4000-8000-000000000002',
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
    firstName: 'Ana',
    lastName: 'Anić',
    email: 'ana@example.com',
    phone: '+381601234567',
  },
  status: 'CONFIRMED',
  paymentMethod: 'CASH_ON_PICKUP',
  paymentStatus: 'UNPAID',
  pickup: {
    id: 'p',
    code: 'BOR_CITY_MARKET',
    name: 'Gradska pijaca Bor',
    address: 'Bor',
    instructions: null,
    allowedWeekday: 6,
    sortOrder: 2,
    requestedPickupDate: '2026-08-08',
    confirmedPickupAt: '2026-08-08T08:00:00Z',
  },
  customerNote: 'Pozvati',
  cancellationReason: null,
  cancellationNote: null,
  items: [
    {
      id: 'i',
      productId: 'p',
      variantId: 'v',
      productName: 'Kozji sir',
      productSlug: 'sir',
      categoryName: 'Sirevi',
      categorySlug: 'sirevi',
      variantName: '500 g',
      sku: 'SIR-500',
      packageAmount: '0.500',
      measurementUnit: 'KILOGRAM',
      quantity: '1.000',
      unitPrice: '900.00',
      lineTotal: '900.00',
      imageUrl: null,
    },
  ],
  reservations: [
    {
      status: 'ACTIVE',
      variantId: 'v',
      quantity: '1.000',
      reservedAt: '2026-08-04T10:00:00Z',
      releasedAt: null,
      consumedAt: null,
      stock: {
        sku: 'SIR-500',
        physical: '5.000',
        reserved: '1.000',
        available: '4.000',
      },
    },
  ],
  timeline: [
    {
      type: 'order.created',
      fromStatus: null,
      toStatus: 'PENDING_CONFIRMATION',
      actorType: 'CUSTOMER',
      note: null,
      metadata: null,
      createdAt: '2026-08-04T10:00:00Z',
    },
    {
      type: 'order.confirmed',
      fromStatus: 'PENDING_CONFIRMATION',
      toStatus: 'CONFIRMED',
      actorType: 'ADMIN',
      note: 'Telefonom',
      metadata: null,
      createdAt: '2026-08-04T11:00:00Z',
    },
  ],
  summary: {
    subtotal: '900.00',
    fee: '0.00',
    total: '900.00',
    currency: 'RSD',
  },
  confirmationExpiresAt: '2026-08-05T10:00:00Z',
  confirmedAt: '2026-08-04T11:00:00Z',
  preparingAt: null,
  readyAt: null,
  completedAt: null,
  cancelledAt: null,
  createdAt: '2026-08-04T10:00:00Z',
  updatedAt: '2026-08-04T11:00:00Z',
};
describe('admin order detail', () => {
  it('prikazuje customer, pickup, snapshot, rezervaciju i timeline bez raw metadata', async () => {
    mocks.order = {
      isLoading: false,
      isError: false,
      data: detail,
      refetch: vi.fn(),
    };
    const { container } = render(<AdminOrderDetailView id={detail.id} />);
    expect(
      screen.getByRole('heading', { name: detail.orderNumber }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'ana@example.com' }),
    ).toHaveAttribute('href', 'mailto:ana@example.com');
    expect(
      screen.getByText(/Gradska pijaca Bor — subotom/),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sirevi · 500 g/)).toBeInTheDocument();
    expect(screen.getByText(/Admin je potvrdio/)).toBeInTheDocument();
    expect(container).not.toHaveTextContent('metadata');
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toHaveLength(0);
  });
  it('ima posebno loading stanje', () => {
    mocks.order = { isLoading: true };
    render(<AdminOrderDetailView id="x" />);
    expect(screen.getByRole('status')).toHaveTextContent('Učitavanje');
  });
  it('razlikuje 404 od API unavailable', () => {
    mocks.order = {
      isLoading: false,
      isError: true,
      error: new BrowserApiError('not-found', 404),
      refetch: vi.fn(),
    };
    const { rerender } = render(<AdminOrderDetailView id="x" />);
    expect(screen.getByText('Porudžbina nije pronađena')).toBeInTheDocument();
    mocks.order = {
      isLoading: false,
      isError: true,
      error: new BrowserApiError('unavailable', 503),
      refetch: vi.fn(),
    };
    rerender(<AdminOrderDetailView id="x" />);
    expect(
      screen.getByText('Porudžbina trenutno nije dostupna'),
    ).toBeInTheDocument();
  });
});
