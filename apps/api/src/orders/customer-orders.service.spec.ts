import { ConflictException, NotFoundException } from '@nestjs/common';
import type { PrismaService } from '../database/prisma.service';
import { CustomerOrdersService } from './customer-orders.service';

function serviceWith(prisma: object) {
  return new CustomerOrdersService(prisma as PrismaService);
}

describe('CustomerOrdersService', () => {
  it('scopes details by both customer and order number', async () => {
    const findFirst = jest.fn().mockResolvedValue(null),
      service = serviceWith({ order: { findFirst } });
    await expect(
      service.detail('customer-a', 'BF-20260802-23456789'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          customerId: 'customer-a',
          orderNumber: 'BF-20260802-23456789',
        },
      }),
    );
  });

  it('blocks customer cancellation after admin confirmation', async () => {
    const tx = {
        order: {
          findFirst: jest.fn().mockResolvedValue({
            id: 'order-id',
            status: 'CONFIRMED',
          }),
        },
      },
      prisma = {
        $transaction: jest.fn(
          async (callback: (client: typeof tx) => Promise<unknown>) =>
            callback(tx),
        ),
      },
      service = serviceWith(prisma);
    await expect(
      service.cancel('customer-a', 'BF-20260802-23456789', {}),
    ).rejects.toBeInstanceOf(ConflictException);
  });
});
