import { randomUUID } from 'crypto';

const SAFE_REQUEST_ID = /^[A-Za-z0-9._-]{1,100}$/;
export function validRequestId(value: unknown): value is string {
  return typeof value === 'string' && SAFE_REQUEST_ID.test(value);
}
export function resolveRequestId(value: unknown): string {
  return validRequestId(value) ? value : randomUUID();
}
