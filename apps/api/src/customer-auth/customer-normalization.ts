import { BadRequestException } from '@nestjs/common';
import { parsePhoneNumberFromString } from 'libphonenumber-js';
export const normalizeCustomerEmail = (value: string) =>
  value.trim().toLowerCase();
export const normalizeCustomerName = (value: string) => value.trim();
export function normalizeSerbianPhone(value: string) {
  const phone = parsePhoneNumberFromString(value.trim(), 'RS');
  if (!phone?.isValid()) throw new BadRequestException('Invalid phone number.');
  return phone.number;
}
