import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { afterEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  params: new URLSearchParams(),
  router: { push: vi.fn() },
  orders: {} as Record<string, unknown>,
}));
vi.mock('next/navigation', () => ({
  useSearchParams: () => mocks.params,
  useRouter: () => mocks.router,
}));
vi.mock('./hooks', () => ({
  useAdminOrders: () => mocks.orders,
  usePickupLocations: () => ({
    data: [
      { id: '00000000-0000-4000-8000-000000000001', name: 'Borska Farmica' },
    ],
  }),
}));
import { AdminOrderList } from './order-list';
const item = {
  id: '00000000-0000-4000-8000-000000000002',
  orderNumber: 'BF-20260804-ABC12345',
  customer: {
    firstName: 'Ana',
    lastName: 'Anić',
    email: 'ana@example.com',
    phone: '+381601234567',
  },
  status: 'PENDING_CONFIRMATION',
  paymentMethod: 'CASH_ON_PICKUP',
  paymentStatus: 'UNPAID',
  pickup: {
    id: '00000000-0000-4000-8000-000000000001',
    code: 'FARM_HOME',
    name: 'Borska Farmica',
  },
  requestedPickupDate: '2026-08-08',
  confirmedPickupAt: null,
  total: '1250.00',
  currency: 'RSD',
  itemCount: 2,
  attentionRequired: true,
  confirmationExpiresAt: '2099-08-05T12:00:00Z',
  createdAt: '2026-08-04T10:00:00Z',
  updatedAt: '2026-08-04T10:00:00Z',
};
afterEach(() => {
  cleanup();
  mocks.params = new URLSearchParams();
  vi.clearAllMocks();
});
describe('admin order listing', () => {
  it('prikazuje loading stanje', () => {
    mocks.orders = { isLoading: true, isError: false, refetch: vi.fn() };
    render(<AdminOrderList />);
    expect(screen.getByRole('status')).toHaveTextContent('Učitavanje');
  });
  it('razlikuje prazan filtrirani rezultat', () => {
    mocks.params = new URLSearchParams('status=CONFIRMED');
    mocks.orders = {
      isLoading: false,
      isError: false,
      data: { data: [], pagination: { total: 0, totalPages: 0 } },
      refetch: vi.fn(),
    };
    render(<AdminOrderList />);
    expect(
      screen.getByText('Nema rezultata za izabrane filtere'),
    ).toBeInTheDocument();
  });
  it('prikazuje tabelu/mobile sadržaj, RSD, detail link i rok', async () => {
    mocks.orders = {
      isLoading: false,
      isError: false,
      data: {
        data: [item],
        pagination: {
          page: 1,
          limit: 12,
          total: 1,
          totalPages: 1,
          hasPreviousPage: false,
          hasNextPage: false,
        },
      },
      refetch: vi.fn(),
    };
    const { container } = render(<AdminOrderList />);
    expect(
      screen.getByRole('table', { name: 'Admin pregled porudžbina' }),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText('BF-20260804-ABC12345')[0].closest('a'),
    ).toHaveAttribute('href', `/admin/porudzbine/${item.id}`);
    expect(screen.getAllByText(/1.250,00/).length).toBeGreaterThan(0);
    await waitFor(() =>
      expect(screen.getAllByText(/Potvrditi do/).length).toBeGreaterThan(0),
    );
    expect(
      (
        await axe(container, {
          rules: { 'color-contrast': { enabled: false } },
        })
      ).violations,
    ).toHaveLength(0);
  });
  it('prikazuje API unavailable odvojeno od empty', () => {
    mocks.orders = { isLoading: false, isError: true, refetch: vi.fn() };
    render(<AdminOrderList />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'trenutno nisu dostupne',
    );
  });
});
