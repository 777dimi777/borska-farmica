import { ConflictException } from '@nestjs/common';
import { belgradeCalendarDate, validatePickupDate } from './checkout-date';

describe('checkout pickup date', () => {
  const fridayNightUtc = new Date('2026-08-07T22:30:00.000Z');

  it('uses the Europe/Belgrade calendar date across a UTC rollover', () => {
    expect(belgradeCalendarDate(fridayNightUtc).toISOString()).toBe(
      '2026-08-08T00:00:00.000Z',
    );
  });

  it('accepts today at the farm and Saturday at the market', () => {
    expect(validatePickupDate('2026-08-08', null, fridayNightUtc)).toEqual(
      new Date('2026-08-08T00:00:00.000Z'),
    );
    expect(validatePickupDate('2026-08-08', 6, fridayNightUtc)).toEqual(
      new Date('2026-08-08T00:00:00.000Z'),
    );
  });

  it.each(['2026-08-07', '2026-08-09'])(
    'rejects non-Saturday market date %s',
    (date) => {
      expect(() => validatePickupDate(date, 6, fridayNightUtc)).toThrow(
        ConflictException,
      );
    },
  );

  it('rejects past and dates more than 60 days ahead', () => {
    expect(() =>
      validatePickupDate('2026-08-07', null, fridayNightUtc),
    ).toThrow('CHECKOUT_PICKUP_DATE_PAST');
    expect(() =>
      validatePickupDate('2026-10-08', null, fridayNightUtc),
    ).toThrow('CHECKOUT_PICKUP_DATE_TOO_FAR');
  });
});
