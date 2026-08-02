import { BadRequestException, ConflictException } from '@nestjs/common';

export const BUSINESS_TIME_ZONE = 'Europe/Belgrade';
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

function dateParts(value: string) {
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new BadRequestException('CHECKOUT_INVALID_PICKUP_DATE');
  const year = Number(match[1]),
    month = Number(match[2]),
    day = Number(match[3]),
    date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  )
    throw new BadRequestException('CHECKOUT_INVALID_PICKUP_DATE');
  return { year, month, day, date };
}

export function belgradeCalendarDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return new Date(Date.UTC(value('year'), value('month') - 1, value('day')));
}

export function validatePickupDate(
  value: string,
  allowedWeekday: number | null,
  now = new Date(),
) {
  const requested = dateParts(value).date,
    today = belgradeCalendarDate(now),
    days = Math.round((requested.getTime() - today.getTime()) / 86_400_000),
    isoWeekday = requested.getUTCDay() || 7;
  if (days < 0) throw new ConflictException('CHECKOUT_PICKUP_DATE_PAST');
  if (days > 60) throw new ConflictException('CHECKOUT_PICKUP_DATE_TOO_FAR');
  if (allowedWeekday !== null && isoWeekday !== allowedWeekday)
    throw new ConflictException('CHECKOUT_PICKUP_WEEKDAY_NOT_ALLOWED');
  return requested;
}
