import { BadRequestException } from '@nestjs/common';
import {
  checkoutFingerprint,
  hashIdempotencyKey,
  orderNumber,
} from './checkout-idempotency';

describe('checkout idempotency and order number', () => {
  it('hashes valid keys without exposing the raw value', () => {
    const first = hashIdempotencyKey('client-request-0001');
    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).not.toContain('client-request-0001');
    expect(first).toBe(hashIdempotencyKey('client-request-0001'));
  });

  it.each(['short', 'contains space 123456', 'x'.repeat(129)])(
    'rejects invalid idempotency key %s',
    (key) => expect(() => hashIdempotencyKey(key)).toThrow(BadRequestException),
  );

  it('creates deterministic canonical fingerprints for normalized input', () => {
    expect(checkoutFingerprint({ a: 1, b: '2' })).toBe(
      checkoutFingerprint({ a: 1, b: '2' }),
    );
    expect(checkoutFingerprint({ a: 1 })).not.toBe(
      checkoutFingerprint({ a: 2 }),
    );
  });

  it('creates uppercase non-sequential public order numbers', () => {
    const value = orderNumber(
      new Date('2026-08-02T12:00:00.000Z'),
      Buffer.from([0, 1, 2, 3, 4, 5, 6, 7]),
    );
    expect(value).toBe('BF-20260802-23456789');
    expect(value).toMatch(/^BF-\d{8}-[23456789A-HJ-NP-Z]{8}$/);
  });
});
