import { Prisma } from '../generated/prisma/client';
import { emptyCart, validQuantity } from './cart.mapper';
import { CartIdentityService } from './cart-identity.service';
describe('cart domain rules', () => {
  it('hashes a token deterministically without retaining raw credentials', () => {
    const service = new CartIdentityService(
      {} as never,
      { getOrThrow: () => 30 } as never,
    );
    const hash = service.hash('x'.repeat(43));
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hash).not.toContain('x'.repeat(10));
  });
  it('uses fractional Decimal minimum/increment rules', () => {
    expect(
      validQuantity(
        new Prisma.Decimal('0.750'),
        new Prisma.Decimal('0.500'),
        new Prisma.Decimal('0.250'),
      ),
    ).toBe(true);
    expect(
      validQuantity(
        new Prisma.Decimal('0.600'),
        new Prisma.Decimal('0.500'),
        new Prisma.Decimal('0.250'),
      ),
    ).toBe(false);
  });
  it('returns the canonical empty response', () =>
    expect(emptyCart()).toEqual({
      items: [],
      summary: {
        distinctItemCount: 0,
        totalQuantity: '0.000',
        subtotal: '0.00',
        currency: 'RSD',
      },
      expiresAt: null,
    }));
});
