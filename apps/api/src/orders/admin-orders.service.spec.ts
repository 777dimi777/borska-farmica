import { BadRequestException, ConflictException } from '@nestjs/common';
import type { AdminAuditService } from '../admin-audit/admin-audit.service';
import type { PrismaService } from '../database/prisma.service';
import { AdminOrdersService } from './admin-orders.service';

function setup(status: string) {
  const tx = {
      order: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'order-id',
          orderNumber: 'BF-20260802-23456789',
          status,
          requestedPickupDate: new Date('2026-08-08T00:00:00.000Z'),
          pickupLocation: { allowedWeekday: 6 },
        }),
      },
    },
    prisma = {
      $transaction: jest.fn(
        async (callback: (client: typeof tx) => Promise<unknown>) =>
          callback(tx),
      ),
    } as unknown as PrismaService,
    audit = { write: jest.fn() } as unknown as AdminAuditService;
  return new AdminOrdersService(prisma, audit, {
    cancelIn: jest.fn(),
  });
}

const context = { adminId: 'admin-id' };

describe('AdminOrdersService transition validation', () => {
  it('blocks every transition from COMPLETED', async () => {
    await expect(
      setup('COMPLETED').transition(
        'order-id',
        { targetStatus: 'CANCELLED', cancellationReason: 'No pickup' },
        context,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('requires confirmed pickup timestamp for confirmation', async () => {
    await expect(
      setup('PENDING_CONFIRMATION').transition(
        'order-id',
        { targetStatus: 'CONFIRMED' },
        context,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('requires explicit cash receipt for completion', async () => {
    await expect(
      setup('READY_FOR_PICKUP').transition(
        'order-id',
        { targetStatus: 'COMPLETED' },
        context,
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('does not allow skipping from CONFIRMED to READY_FOR_PICKUP', async () => {
    await expect(
      setup('CONFIRMED').transition(
        'order-id',
        { targetStatus: 'READY_FOR_PICKUP' },
        context,
      ),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
