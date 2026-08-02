import { Prisma } from '../generated/prisma/client';
import {
  AvailabilityMode,
  MeasurementUnit,
  ProductStatus,
} from '../generated/prisma/enums';
import type { CartRecord } from '../cart/cart.mapper';
import { CheckoutValidationService } from './checkout-validation.service';

describe('CheckoutValidationService preview mapping', () => {
  const service = new CheckoutValidationService({} as never);
  const cart = {
    id: 'cart-id',
    currency: 'RSD',
    items: [
      {
        id: 'item-id',
        quantity: new Prisma.Decimal('2.000'),
        unitPriceAtAddition: new Prisma.Decimal('200.00'),
        variant: {
          id: 'variant-id',
          name: '1 l',
          price: new Prisma.Decimal('250.00'),
          packageAmount: new Prisma.Decimal('1.000'),
          measurementUnit: MeasurementUnit.LITER,
          minimumPurchaseQuantity: new Prisma.Decimal('1.000'),
          purchaseIncrement: new Prisma.Decimal('1.000'),
          stockQuantity: new Prisma.Decimal('10.000'),
          reservedQuantity: new Prisma.Decimal('1.000'),
          allowBackorder: false,
          isActive: true,
          product: {
            name: 'Kozje mleko',
            status: ProductStatus.ACTIVE,
            availabilityMode: AvailabilityMode.ALWAYS,
            isManuallyAvailable: true,
            category: { id: 'category-id', isActive: true },
            variants: [
              {
                stockQuantity: new Prisma.Decimal('10.000'),
                reservedQuantity: new Prisma.Decimal('1.000'),
                allowBackorder: false,
              },
            ],
            availabilityWindows: [],
            images: [],
          },
        },
      },
    ],
  } as unknown as CartRecord;

  it('uses current Decimal prices and returns a zero-fee RSD total', () => {
    const result = service.map(
      {
        firstName: 'Miloš',
        lastName: 'Dimić',
        email: 'm@example.test',
        phone: '+381641234567',
      },
      {
        id: 'pickup-id',
        code: 'FARM_HOME',
        name: 'Borska Farmica',
        address: 'Nade Dimić 30, Bor',
        instructions: null,
      },
      cart,
      new Date('2026-08-08T00:00:00.000Z'),
    );
    expect(result.valid).toBe(true);
    expect(result.items[0]).toMatchObject({
      unitPrice: '250.00',
      lineTotal: '500.00',
    });
    expect(result.summary).toEqual({
      subtotal: '500.00',
      fee: '0.00',
      total: '500.00',
      currency: 'RSD',
      paymentMethod: 'CASH_ON_PICKUP',
    });
  });

  it('rejects physical shortage even when backorder is enabled', () => {
    const shortage = cart;
    shortage.items[0].variant.stockQuantity = new Prisma.Decimal('1.000');
    shortage.items[0].variant.reservedQuantity = new Prisma.Decimal('0.000');
    shortage.items[0].variant.allowBackorder = true;
    const result = service.map(
      {
        firstName: 'M',
        lastName: 'D',
        email: 'm@example.test',
        phone: '+381641234567',
      },
      {
        id: 'pickup-id',
        code: 'FARM_HOME',
        name: 'Borska Farmica',
        address: 'Nade Dimić 30, Bor',
        instructions: null,
      },
      shortage,
      new Date('2026-08-08T00:00:00.000Z'),
    );
    expect(result.valid).toBe(false);
    expect(result.items[0].issues).toContain(
      'BACKORDER_CHECKOUT_NOT_SUPPORTED',
    );
  });
});
