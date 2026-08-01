import { Prisma } from '../generated/prisma/client';
import { productStockStatus, variantStockStatus } from './admin-product-stock';
import { AdminStockStatus } from './dto/admin-product-query.dto';
const v = (
  stock: string,
  reserved: string,
  threshold: string,
  backorder = false,
  isActive = true,
) => ({
  isActive,
  stockQuantity: new Prisma.Decimal(stock),
  reservedQuantity: new Prisma.Decimal(reserved),
  lowStockThreshold: new Prisma.Decimal(threshold),
  allowBackorder: backorder,
});
describe('admin stock status', () => {
  it.each([
    [v('10', '1', '5'), AdminStockStatus.IN_STOCK],
    [v('5', '1', '5'), AdminStockStatus.LOW_STOCK],
    [v('1', '1', '0'), AdminStockStatus.OUT_OF_STOCK],
    [v('0', '0', '0', true), AdminStockStatus.BACKORDER],
  ])('classifies a variant', (variant, expected) =>
    expect(variantStockStatus(variant)).toBe(expected),
  );
  it('ignores inactive variants and uses deterministic product precedence', () =>
    expect(
      productStockStatus([
        v('100', '0', '0', false, false),
        v('0', '0', '0', true),
      ]),
    ).toBe(AdminStockStatus.BACKORDER));
  it('treats products without active variants as out of stock', () =>
    expect(productStockStatus([])).toBe(AdminStockStatus.OUT_OF_STOCK));
});
