import { ConfigService } from '@nestjs/config';
import { OrderNotificationService } from './order-notification.service';

const order = {
  orderNumber: 'BF-TEST-001',
  customer: {
    firstName: 'Miloš',
    lastName: 'Dimitrijević',
    email: 'kupac@example.com',
    phone: '+381601234567',
  },
  pickup: {
    name: 'Borska Farmica',
    address: 'Nade Dimić 30, Bor',
    requestedPickupDate: '2026-08-15',
  },
  customerNote: 'Pozovite pre dolaska.',
  items: [
    {
      productName: 'Mladi kozji sir',
      variantName: '300 g',
      packageAmount: '300.000',
      measurementUnit: 'G',
      quantity: '2.000',
      lineTotal: '1040.00',
    },
  ],
  summary: { total: '1040.00', currency: 'RSD' },
};

describe('OrderNotificationService', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('sends a complete admin notification through Resend', async () => {
    const fetchMock = jest.fn().mockResolvedValue({ ok: true, status: 200 });
    global.fetch = fetchMock as typeof fetch;
    const config = {
      get: jest.fn(
        (key: string, fallback?: unknown) =>
          ({
            RESEND_API_KEY: 're_test',
            ORDER_NOTIFICATION_EMAIL_TO: 'borskafarmica@gmail.com',
            CONTACT_EMAIL_FROM: 'Borska Farmica <onboarding@resend.dev>',
            FRONTEND_URL: 'https://farmica.example',
          })[key] ?? fallback,
      ),
    } as unknown as ConfigService;

    await new OrderNotificationService(config).orderCreated(order);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const request = fetchMock.mock.calls[0]![1] as RequestInit;
    const payload = JSON.parse(String(request.body)) as Record<string, unknown>;
    expect(payload).toEqual(
      expect.objectContaining({
        to: ['borskafarmica@gmail.com'],
        reply_to: 'kupac@example.com',
        subject: expect.stringContaining('BF-TEST-001'),
      }),
    );
    expect(payload.text).toContain('Mladi kozji sir');
    expect(payload.html).toContain('/admin/porudzbine/BF-TEST-001');
  });

  it('never throws when Resend is unavailable', async () => {
    global.fetch = jest
      .fn()
      .mockRejectedValue(new Error('network')) as typeof fetch;
    const config = {
      get: jest.fn((key: string, fallback?: unknown) =>
        key === 'RESEND_API_KEY' ? 're_test' : fallback,
      ),
    } as unknown as ConfigService;

    await expect(
      new OrderNotificationService(config).orderCreated(order),
    ).resolves.toBeUndefined();
  });

  it('does not call Resend when email is not configured', async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as typeof fetch;
    const config = {
      get: jest.fn(() => undefined),
    } as unknown as ConfigService;

    await new OrderNotificationService(config).orderCreated(order);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
