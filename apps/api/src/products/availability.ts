import { Prisma } from '../generated/prisma/client';
import {
  AvailabilityMode,
  AvailabilityWindowType,
} from '../generated/prisma/enums';
import { ProductAvailabilityDto } from './dto/product-response.dto';

const BUSINESS_TIME_ZONE = 'Europe/Belgrade';
export interface AvailabilityVariant {
  stockQuantity: Prisma.Decimal;
  reservedQuantity: Prisma.Decimal;
  allowBackorder: boolean;
}
export interface AvailabilityWindowInput {
  isActive?: boolean;
  type: AvailabilityWindowType;
  startsAt: Date | null;
  endsAt: Date | null;
  startMonth: number | null;
  startDay: number | null;
  endMonth: number | null;
  endDay: number | null;
  publicLabel: string | null;
}
export interface AvailabilityInput {
  mode: AvailabilityMode;
  manuallyAvailable: boolean;
  variants: AvailabilityVariant[];
  windows: AvailabilityWindowInput[];
}

type CalendarDate = { year: number; month: number; day: number };
function belgradeDate(referenceTime: Date): CalendarDate {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: BUSINESS_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(referenceTime);
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((part) => part.type === type)?.value);
  return { year: value('year'), month: value('month'), day: value('day') };
}
function dateNumber(date: CalendarDate): number {
  return date.year * 10000 + date.month * 100 + date.day;
}
function databaseDateNumber(date: Date): number {
  return (
    date.getUTCFullYear() * 10000 +
    (date.getUTCMonth() + 1) * 100 +
    date.getUTCDate()
  );
}
function validMonthDay(year: number, month: number, day: number): boolean {
  const value = new Date(Date.UTC(year, month - 1, day));
  return (
    value.getUTCFullYear() === year &&
    value.getUTCMonth() === month - 1 &&
    value.getUTCDate() === day
  );
}
function matchesWindow(
  window: AvailabilityWindowInput,
  current: CalendarDate,
): boolean {
  if (window.isActive === false) return false;
  if (window.type === AvailabilityWindowType.FIXED_DATE_RANGE) {
    if (!window.startsAt || !window.endsAt) return false;
    const currentValue = dateNumber(current);
    return (
      currentValue >= databaseDateNumber(window.startsAt) &&
      currentValue <= databaseDateNumber(window.endsAt)
    );
  }
  if (
    window.startMonth === null ||
    window.startDay === null ||
    window.endMonth === null ||
    window.endDay === null
  )
    return false;
  if (
    !validMonthDay(current.year, window.startMonth, window.startDay) ||
    !validMonthDay(current.year, window.endMonth, window.endDay)
  )
    return false;
  const currentValue = current.month * 100 + current.day;
  const start = window.startMonth * 100 + window.startDay;
  const end = window.endMonth * 100 + window.endDay;
  return start <= end
    ? currentValue >= start && currentValue <= end
    : currentValue >= start || currentValue <= end;
}

export function calculateAvailability(
  input: AvailabilityInput,
  referenceTime = new Date(),
): ProductAvailabilityDto {
  const physicalStock = input.variants.some((variant) =>
    variant.stockQuantity.greaterThan(variant.reservedQuantity),
  );
  const sellableStock = input.variants.some(
    (variant) =>
      variant.allowBackorder ||
      variant.stockQuantity.greaterThan(variant.reservedQuantity),
  );
  const matchingWindow =
    input.mode === AvailabilityMode.SEASONAL
      ? input.windows.find((window) =>
          matchesWindow(window, belgradeDate(referenceTime)),
        )
      : undefined;
  const currentlyAvailable =
    input.mode === AvailabilityMode.ALWAYS ||
    (input.mode === AvailabilityMode.MANUAL && input.manuallyAvailable) ||
    (input.mode === AvailabilityMode.SEASONAL && matchingWindow !== undefined);
  return {
    mode: input.mode,
    currentlyAvailable,
    inStock: physicalStock,
    purchasable: currentlyAvailable && sellableStock,
    label: matchingWindow?.publicLabel ?? null,
  };
}
