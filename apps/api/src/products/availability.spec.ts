import { Prisma } from '../generated/prisma/client';
import {
  AvailabilityMode,
  AvailabilityWindowType,
} from '../generated/prisma/enums';
import { calculateAvailability, AvailabilityWindowInput } from './availability';

const d = (value: string) => new Prisma.Decimal(value);
const variant = (stock = '1', reserved = '0', allowBackorder = false) => ({
  stockQuantity: d(stock),
  reservedQuantity: d(reserved),
  allowBackorder,
});
const fixed = (
  start: string,
  end: string,
  label: string | null = null,
): AvailabilityWindowInput => ({
  type: AvailabilityWindowType.FIXED_DATE_RANGE,
  startsAt: new Date(`${start}T00:00:00.000Z`),
  endsAt: new Date(`${end}T00:00:00.000Z`),
  startMonth: null,
  startDay: null,
  endMonth: null,
  endDay: null,
  publicLabel: label,
});
const annual = (
  sm: number,
  sd: number,
  em: number,
  ed: number,
  label: string | null = null,
): AvailabilityWindowInput => ({
  type: AvailabilityWindowType.RECURRING_ANNUAL,
  startsAt: null,
  endsAt: null,
  startMonth: sm,
  startDay: sd,
  endMonth: em,
  endDay: ed,
  publicLabel: label,
});
const at = (date: string) => new Date(`${date}T12:00:00.000Z`);
const input = (
  mode: AvailabilityMode,
  windows: AvailabilityWindowInput[] = [],
  manuallyAvailable = true,
  variants = [variant()],
) => ({ mode, windows, manuallyAvailable, variants });

describe('calculateAvailability', () => {
  it('keeps ALWAYS available and ignores the manual flag', () =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.ALWAYS, [], false),
        at('2026-06-01'),
      ).currentlyAvailable,
    ).toBe(true));
  it.each([
    [true, true],
    [false, false],
  ])('uses MANUAL flag %s', (flag, expected) =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.MANUAL, [], flag),
        at('2026-06-01'),
      ).currentlyAvailable,
    ).toBe(expected),
  );
  it.each([
    ['2026-06-15', true],
    ['2026-05-31', false],
    ['2026-07-01', false],
  ])('handles fixed range at %s', (date, expected) =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.SEASONAL, [fixed('2026-06-01', '2026-06-30')]),
        at(date),
      ).currentlyAvailable,
    ).toBe(expected),
  );
  it.each([
    ['2026-07-15', true],
    ['2026-10-01', false],
  ])('handles annual range at %s', (date, expected) =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.SEASONAL, [annual(6, 1, 8, 31)]),
        at(date),
      ).currentlyAvailable,
    ).toBe(expected),
  );
  it.each([
    ['2026-12-15', true],
    ['2027-01-15', true],
    ['2026-06-01', false],
  ])('handles a year-crossing range at %s', (date, expected) =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.SEASONAL, [annual(11, 1, 2, 28)]),
        at(date),
      ).currentlyAvailable,
    ).toBe(expected),
  );
  it('supports February 29 in a leap year', () =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.SEASONAL, [annual(2, 29, 2, 29)]),
        at('2028-02-29'),
      ).currentlyAvailable,
    ).toBe(true));
  it('ignores an inactive window', () =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.SEASONAL, [
          { ...annual(1, 1, 12, 31), isActive: false },
        ]),
        at('2026-06-01'),
      ).currentlyAvailable,
    ).toBe(false));
  it('uses any matching window and the first matching label', () =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.SEASONAL, [
          annual(1, 1, 1, 2, 'No'),
          annual(6, 1, 6, 30, 'June'),
        ]),
        at('2026-06-15'),
      ).label,
    ).toBe('June'));
  it('keeps a seasonal product without windows unavailable', () =>
    expect(
      calculateAvailability(input(AvailabilityMode.SEASONAL), at('2026-06-01'))
        .currentlyAvailable,
    ).toBe(false));
  it('reports no physical stock when reservations consume it', () =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.ALWAYS, [], true, [variant('2', '2')]),
      ),
    ).toMatchObject({ inStock: false, purchasable: false }));
  it('permits backorder without claiming physical stock', () =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.ALWAYS, [], true, [variant('0', '0', true)]),
      ),
    ).toMatchObject({ inStock: false, purchasable: true }));
  it('uses the Europe/Belgrade calendar day near UTC midnight', () =>
    expect(
      calculateAvailability(
        input(AvailabilityMode.SEASONAL, [fixed('2026-08-02', '2026-08-02')]),
        new Date('2026-08-01T22:30:00.000Z'),
      ).currentlyAvailable,
    ).toBe(true));
});
