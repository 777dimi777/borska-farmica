import { BadRequestException } from '@nestjs/common';
import { createHash, randomBytes } from 'crypto';

const IDEMPOTENCY_KEY = /^[A-Za-z0-9._:-]{16,128}$/;
const ORDER_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function hashIdempotencyKey(value: string | undefined) {
  const key = value?.trim();
  if (!key || !IDEMPOTENCY_KEY.test(key))
    throw new BadRequestException('CHECKOUT_INVALID_IDEMPOTENCY_KEY');
  return createHash('sha256').update(key, 'utf8').digest('hex');
}

export function checkoutFingerprint(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(value), 'utf8')
    .digest('hex');
}

export function orderNumber(now = new Date(), bytes = randomBytes(8)) {
  const date = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, '0')}${String(now.getUTCDate()).padStart(2, '0')}`;
  let suffix = '';
  for (let index = 0; index < 8; index++)
    suffix += ORDER_ALPHABET[bytes[index] % ORDER_ALPHABET.length];
  return `BF-${date}-${suffix}`;
}
