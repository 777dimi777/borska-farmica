/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { AdminInventoryService } from './admin-inventory.service';
import { ManualInventoryType } from './dto/inventory.dto';
const d = (x: string) => new Prisma.Decimal(x);
describe('AdminInventoryService', () => {
  const findFirst = jest.fn(),
    update = jest.fn(),
    create = jest.fn(),
    auditWrite = jest.fn();
  const tx = {
    productVariant: { findFirst, update },
    inventoryMovement: { create },
  };
  const prisma = {
    $transaction: jest.fn(async (callback: (client: typeof tx) => unknown) =>
      callback(tx),
    ),
  };
  const service = new AdminInventoryService(prisma as never, {
    write: auditWrite,
  });
  beforeEach(() => {
    jest.clearAllMocks();
    findFirst.mockResolvedValue({
      id: 'v',
      productId: 'p',
      stockQuantity: d('10'),
      reservedQuantity: d('2'),
      lowStockThreshold: d('3'),
      allowBackorder: false,
      isActive: true,
    });
    update.mockImplementation(({ data }) =>
      Promise.resolve({
        ...findFirst.mock.results[0]?.value,
        stockQuantity: data.stockQuantity,
        reservedQuantity: d('2'),
        lowStockThreshold: d('3'),
        allowBackorder: false,
        isActive: true,
        updatedAt: new Date(0),
      }),
    );
    create.mockImplementation(({ data }) =>
      Promise.resolve({ id: 'm', ...data, createdAt: new Date(0) }),
    );
  });
  it.each([
    [ManualInventoryType.RESTOCK, '5.000', '15.000', '5.000'],
    [ManualInventoryType.DAMAGE, '3.000', '7.000', '-3.000'],
    [ManualInventoryType.ADJUSTMENT, '-1.500', '8.500', '-1.500'],
  ])(
    'applies %s with precise Decimal values',
    async (type, quantity, stock, delta) => {
      const result = await service.adjust(
        'p',
        'v',
        {
          type,
          quantity,
          reason: type === ManualInventoryType.RESTOCK ? undefined : 'reason',
        },
        { adminId: 'a' },
      );
      expect(result).toMatchObject({
        stockQuantity: stock,
        reservedQuantity: '2.000',
        movement: { quantityDelta: delta, balanceAfter: stock },
      });
      expect(create).toHaveBeenCalledTimes(1);
      expect(auditWrite).toHaveBeenCalledTimes(1);
    },
  );
  it('rejects zero and invalid sign before opening a transaction', async () => {
    await expect(
      service.adjust(
        'p',
        'v',
        { type: ManualInventoryType.RESTOCK, quantity: '0' },
        { adminId: 'a' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
    await expect(
      service.adjust(
        'p',
        'v',
        { type: ManualInventoryType.DAMAGE, quantity: '-1' },
        { adminId: 'a' },
      ),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
  it('rejects stock below reserved and creates no movement/audit', async () => {
    await expect(
      service.adjust(
        'p',
        'v',
        {
          type: ManualInventoryType.ADJUSTMENT,
          quantity: '-9',
          reason: 'count',
        },
        { adminId: 'a' },
      ),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(create).not.toHaveBeenCalled();
    expect(auditWrite).not.toHaveBeenCalled();
  });
  it('rejects a product/variant mismatch', async () => {
    findFirst.mockResolvedValueOnce(null);
    await expect(
      service.adjust(
        'p',
        'v',
        { type: ManualInventoryType.RESTOCK, quantity: '1' },
        { adminId: 'a' },
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
