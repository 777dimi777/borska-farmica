/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unnecessary-type-assertion */
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { MaintenanceService } from './maintenance.service';
import { OrderCancellationService } from './order-cancellation.service';
import { TimeProvider } from './time-provider';

describe('MaintenanceService', () => {
  const now = new Date('2026-08-02T12:00:00.000Z');
  let prisma: Record<string, unknown>;
  let cancellation: { cancelIn: jest.Mock };
  let service: MaintenanceService;
  let orderCandidates: Array<{ id: string }>;
  let cartCandidates: Array<{ id: string }>;
  let staleCarts: Array<{ id: string }>;
  let customerSessions: Array<{ id: string }>;
  let adminSessions: Array<{ id: string }>;

  beforeEach(() => {
    orderCandidates = [];
    cartCandidates = [];
    staleCarts = [];
    customerSessions = [];
    adminSessions = [];
    cancellation = {
      cancelIn: jest.fn(async () => ({ releasedReservationCount: 1 })),
    };
    const cartFind = jest.fn(
      async ({ where }: { where: Record<string, unknown> }) =>
        where.status === 'ACTIVE' ? cartCandidates : staleCarts,
    );
    prisma = {
      order: { findMany: jest.fn(async () => orderCandidates.splice(0)) },
      cart: {
        findMany: cartFind,
        updateMany: jest.fn(async () => ({ count: cartCandidates.length })),
        deleteMany: jest.fn(async () => ({ count: staleCarts.length })),
      },
      customerSession: {
        findMany: jest.fn(async () => customerSessions),
        deleteMany: jest.fn(async () => ({ count: customerSessions.length })),
      },
      adminSession: {
        findMany: jest.fn(async () => adminSessions),
        deleteMany: jest.fn(async () => ({ count: adminSessions.length })),
      },
      $transaction: jest.fn(async (arg: unknown) => {
        if (typeof arg === 'function') return arg({});
        return Promise.all(arg as Promise<unknown>[]);
      }),
    };
    const config = {
      get: jest.fn((key: string, fallback: unknown) => {
        const values: Record<string, number> = {
          MAINTENANCE_BATCH_SIZE: 100,
          MAINTENANCE_MAX_BATCHES: 10,
          CART_RETENTION_DAYS: 30,
          SESSION_RETENTION_DAYS: 90,
        };
        return values[key] ?? fallback;
      }),
    };
    service = new MaintenanceService(
      prisma as unknown as PrismaService,
      config as unknown as ConfigService,
      { now: () => now } as TimeProvider,
      cancellation as unknown as OrderCancellationService,
    );
  });

  it('expires each due order once with the fixed deadline time', async () => {
    orderCandidates = [{ id: 'order-1' }, { id: 'order-2' }];
    const result = await service.expireOrders();
    expect(result).toMatchObject({ scanned: 2, processed: 2, failed: 0 });
    expect(cancellation.cancelIn).toHaveBeenCalledTimes(2);
    expect(cancellation.cancelIn.mock.calls[0][1]).toMatchObject({
      reason: 'CONFIRMATION_TIMEOUT',
      actorType: 'SYSTEM',
      expiresAtOrBefore: now,
    });
  });

  it('dry-run scans orders without starting a transaction', async () => {
    orderCandidates = [{ id: 'order-1' }];
    const result = await service.expireOrders(true);
    expect(result).toMatchObject({ scanned: 1, processed: 0, skipped: 1 });
    expect(prisma.$transaction).not.toHaveBeenCalled();
  });

  it('expires active carts and removes only selected retained carts', async () => {
    cartCandidates = [{ id: 'cart-active-expired' }];
    staleCarts = [{ id: 'cart-old-expired' }];
    const result = await service.cleanCarts();
    expect(result.processed).toBe(2);
    expect(
      (prisma.cart as { updateMany: jest.Mock }).updateMany,
    ).toHaveBeenCalled();
    expect(
      (prisma.cart as { deleteMany: jest.Mock }).deleteMany,
    ).toHaveBeenCalled();
  });

  it('session cleanup deletes only IDs selected by retention queries', async () => {
    customerSessions = [{ id: 'customer-old' }];
    adminSessions = [{ id: 'admin-old' }];
    const result = await service.cleanSessions();
    expect(result).toMatchObject({ scanned: 2, processed: 2 });
    expect(
      (prisma.customerSession as { deleteMany: jest.Mock }).deleteMany,
    ).toHaveBeenCalledWith({ where: { id: { in: ['customer-old'] } } });
  });
});
