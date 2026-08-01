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
  id?: string;
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

export enum AvailabilityBusinessReason {
  ALWAYS_AVAILABLE = 'ALWAYS_AVAILABLE',
  MANUALLY_AVAILABLE = 'MANUALLY_AVAILABLE',
  MANUALLY_UNAVAILABLE = 'MANUALLY_UNAVAILABLE',
  MATCHED_FIXED_WINDOW = 'MATCHED_FIXED_WINDOW',
  MATCHED_RECURRING_WINDOW = 'MATCHED_RECURRING_WINDOW',
  NO_ACTIVE_WINDOW = 'NO_ACTIVE_WINDOW',
  OUTSIDE_ALL_WINDOWS = 'OUTSIDE_ALL_WINDOWS',
}
export enum AvailabilityStockReason {
  IN_STOCK = 'IN_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  BACKORDER_AVAILABLE = 'BACKORDER_AVAILABLE',
  NO_ACTIVE_VARIANT = 'NO_ACTIVE_VARIANT',
}
export interface AvailabilityEvaluation extends ProductAvailabilityDto {
  businessDate: string;
  matchedWindowId: string | null;
  businessReason: AvailabilityBusinessReason;
  stockReason: AvailabilityStockReason;
}
export function evaluateAvailability(
  input: AvailabilityInput,
  referenceTime = new Date(),
): AvailabilityEvaluation {
  const base = calculateAvailability(input, referenceTime);
  const current = belgradeDate(referenceTime);
  const matchingWindow =
    input.mode === AvailabilityMode.SEASONAL
      ? input.windows.find((window) => matchesWindow(window, current))
      : undefined;
  const activeWindowCount = input.windows.filter(
    (window) => window.isActive !== false,
  ).length;
  const businessReason =
    input.mode === AvailabilityMode.ALWAYS
      ? AvailabilityBusinessReason.ALWAYS_AVAILABLE
      : input.mode === AvailabilityMode.MANUAL
        ? input.manuallyAvailable
          ? AvailabilityBusinessReason.MANUALLY_AVAILABLE
          : AvailabilityBusinessReason.MANUALLY_UNAVAILABLE
        : matchingWindow
          ? matchingWindow.type === AvailabilityWindowType.FIXED_DATE_RANGE
            ? AvailabilityBusinessReason.MATCHED_FIXED_WINDOW
            : AvailabilityBusinessReason.MATCHED_RECURRING_WINDOW
          : activeWindowCount === 0
            ? AvailabilityBusinessReason.NO_ACTIVE_WINDOW
            : AvailabilityBusinessReason.OUTSIDE_ALL_WINDOWS;
  const sellableStock = input.variants.some(
    (variant) =>
      variant.allowBackorder ||
      variant.stockQuantity.greaterThan(variant.reservedQuantity),
  );
  const stockReason =
    input.variants.length === 0
      ? AvailabilityStockReason.NO_ACTIVE_VARIANT
      : base.inStock
        ? AvailabilityStockReason.IN_STOCK
        : sellableStock
          ? AvailabilityStockReason.BACKORDER_AVAILABLE
          : AvailabilityStockReason.OUT_OF_STOCK;
  return {
    ...base,
    businessDate: `${current.year.toString().padStart(4, '0')}-${current.month.toString().padStart(2, '0')}-${current.day.toString().padStart(2, '0')}`,
    matchedWindowId: matchingWindow?.id ?? null,
    businessReason,
    stockReason,
  };
}
