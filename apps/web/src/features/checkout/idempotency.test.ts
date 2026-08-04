import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearIdempotency,
  idempotencyFor,
  idempotencyStorageKey,
  payloadFingerprint,
} from './idempotency';
describe('checkout idempotency', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });
  it('reuses key for same fingerprint and changes for new payload', () => {
    vi.spyOn(crypto, 'randomUUID')
      .mockReturnValueOnce('11111111-1111-4111-8111-111111111111')
      .mockReturnValueOnce('22222222-2222-4222-8222-222222222222');
    expect(idempotencyFor('a')).toBe(idempotencyFor('a'));
    expect(idempotencyFor('b')).not.toBe(idempotencyFor('a'));
  });
  it('stores no raw note or customer data', async () => {
    const f = await payloadFingerprint({
      items: [{ id: 'i', variantId: 'v', quantity: '0.500' }],
      pickupLocationId: 'p',
      requestedPickupDate: '2026-08-08',
      note: 'Privatna napomena',
    });
    idempotencyFor(f);
    const raw = sessionStorage.getItem(idempotencyStorageKey) ?? '';
    expect(raw).not.toContain('Privatna');
    expect(raw).not.toContain('token');
    expect(raw).not.toContain('email');
  });
  it('clears after success', () => {
    idempotencyFor('a');
    clearIdempotency();
    expect(sessionStorage.getItem(idempotencyStorageKey)).toBeNull();
  });
});
