import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
export const PRICE_PATTERN = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/;
export const QUANTITY_PATTERN = /^(?:0|[1-9]\d{0,8})(?:\.\d{1,3})?$/;
export const SIGNED_QUANTITY_PATTERN = /^-?(?:0|[1-9]\d{0,8})(?:\.\d{1,3})?$/;
export function decimal(value: string, scale: 2 | 3): Prisma.Decimal {
  const pattern = scale === 2 ? PRICE_PATTERN : QUANTITY_PATTERN;
  if (!pattern.test(value))
    throw new BadRequestException(`Invalid decimal with scale ${scale}.`);
  return new Prisma.Decimal(value);
}
export function signedQuantity(value: string): Prisma.Decimal {
  if (!SIGNED_QUANTITY_PATTERN.test(value))
    throw new BadRequestException('Invalid signed quantity.');
  return new Prisma.Decimal(value);
}
