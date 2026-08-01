import { Prisma } from '../generated/prisma/client';
import {
  AvailabilityMode,
  AvailabilityWindowType,
} from '../generated/prisma/enums';
import {
  AvailabilityBusinessReason,
  AvailabilityStockReason,
  evaluateAvailability,
} from './availability';
const d = (x: string) => new Prisma.Decimal(x);
const variant = (stock = '1', reserved = '0', backorder = false) => ({
  stockQuantity: d(stock),
  reservedQuantity: d(reserved),
  allowBackorder: backorder,
});
const fixed = (
  id: string,
  start: string,
  end: string,
  label: string | null = null,
) => ({
  id,
  type: AvailabilityWindowType.FIXED_DATE_RANGE,
  startsAt: new Date(`${start}T00:00:00Z`),
  endsAt: new Date(`${end}T00:00:00Z`),
  startMonth: null,
  startDay: null,
  endMonth: null,
  endDay: null,
  publicLabel: label,
  isActive: true,
});
const recurring = (
  id: string,
  sm: number,
  sd: number,
  em: number,
  ed: number,
) => ({
  id,
  type: AvailabilityWindowType.RECURRING_ANNUAL,
  startsAt: null,
  endsAt: null,
  startMonth: sm,
  startDay: sd,
  endMonth: em,
  endDay: ed,
  publicLabel: id,
  isActive: true,
});
describe('availability preview evaluation', () => {
  it('returns ALWAYS and stock reasons', () =>
    expect(
      evaluateAvailability(
        {
          mode: AvailabilityMode.ALWAYS,
          manuallyAvailable: false,
          variants: [variant()],
          windows: [],
        },
        new Date('2026-01-01T12:00:00Z'),
      ),
    ).toMatchObject({
      businessReason: AvailabilityBusinessReason.ALWAYS_AVAILABLE,
      stockReason: AvailabilityStockReason.IN_STOCK,
      matchedWindowId: null,
    }));
  it.each([
    [true, AvailabilityBusinessReason.MANUALLY_AVAILABLE],
    [false, AvailabilityBusinessReason.MANUALLY_UNAVAILABLE],
  ])('explains MANUAL=%s', (flag, reason) =>
    expect(
      evaluateAvailability({
        mode: AvailabilityMode.MANUAL,
        manuallyAvailable: flag,
        variants: [variant()],
        windows: [],
      }).businessReason,
    ).toBe(reason),
  );
  it('matches a fixed range and exposes its id', () =>
    expect(
      evaluateAvailability(
        {
          mode: AvailabilityMode.SEASONAL,
          manuallyAvailable: true,
          variants: [variant()],
          windows: [fixed('fixed', '2026-06-01', '2026-06-30', 'June')],
        },
        new Date('2026-06-15T12:00:00Z'),
      ),
    ).toMatchObject({
      matchedWindowId: 'fixed',
      label: 'June',
      businessReason: AvailabilityBusinessReason.MATCHED_FIXED_WINDOW,
    }));
  it('matches recurring cross-year and preserves deterministic first match', () =>
    expect(
      evaluateAvailability(
        {
          mode: AvailabilityMode.SEASONAL,
          manuallyAvailable: true,
          variants: [variant()],
          windows: [
            recurring('first', 11, 1, 2, 28),
            recurring('second', 1, 1, 12, 31),
          ],
        },
        new Date('2027-01-15T12:00:00Z'),
      ).matchedWindowId,
    ).toBe('first'));
  it('distinguishes no active window from outside windows', () => {
    expect(
      evaluateAvailability({
        mode: AvailabilityMode.SEASONAL,
        manuallyAvailable: true,
        variants: [variant()],
        windows: [],
      }).businessReason,
    ).toBe(AvailabilityBusinessReason.NO_ACTIVE_WINDOW);
    expect(
      evaluateAvailability(
        {
          mode: AvailabilityMode.SEASONAL,
          manuallyAvailable: true,
          variants: [variant()],
          windows: [fixed('x', '2026-01-01', '2026-01-02')],
        },
        new Date('2026-02-01T12:00:00Z'),
      ).businessReason,
    ).toBe(AvailabilityBusinessReason.OUTSIDE_ALL_WINDOWS);
  });
  it('explains no variant, out of stock and backorder', () => {
    const base = {
      mode: AvailabilityMode.ALWAYS,
      manuallyAvailable: true,
      windows: [],
    };
    expect(evaluateAvailability({ ...base, variants: [] }).stockReason).toBe(
      AvailabilityStockReason.NO_ACTIVE_VARIANT,
    );
    expect(
      evaluateAvailability({ ...base, variants: [variant('0')] }).stockReason,
    ).toBe(AvailabilityStockReason.OUT_OF_STOCK);
    expect(
      evaluateAvailability({ ...base, variants: [variant('0', '0', true)] })
        .stockReason,
    ).toBe(AvailabilityStockReason.BACKORDER_AVAILABLE);
  });
  it('uses the Belgrade date at the UTC boundary', () =>
    expect(
      evaluateAvailability(
        {
          mode: AvailabilityMode.SEASONAL,
          manuallyAvailable: true,
          variants: [variant()],
          windows: [fixed('boundary', '2026-08-02', '2026-08-02')],
        },
        new Date('2026-08-01T22:30:00Z'),
      ),
    ).toMatchObject({
      businessDate: '2026-08-02',
      matchedWindowId: 'boundary',
    }));
});
