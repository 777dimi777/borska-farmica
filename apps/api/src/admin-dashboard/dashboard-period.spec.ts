import { BadRequestException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { compareMetric, resolveDashboardPeriod } from './dashboard-period';

describe('dashboard period', () => {
  it('uses inclusive Belgrade dates and equal previous periods across DST', () => {
    const period = resolveDashboardPeriod(
      '2026-03-28',
      '2026-03-30',
      new Date('2026-04-01T12:00:00Z'),
    );
    expect(period).toMatchObject({
      from: '2026-03-28',
      to: '2026-03-30',
      days: 3,
      previous: { from: '2026-03-25', to: '2026-03-27' },
      timeZone: 'Europe/Belgrade',
    });
    expect(period.start.toISOString()).toBe('2026-03-27T23:00:00.000Z');
    expect(period.endExclusive.toISOString()).toBe('2026-03-30T22:00:00.000Z');
  });

  it('defaults to 30 business dates and rejects future and oversized ranges', () => {
    const period = resolveDashboardPeriod(
      undefined,
      undefined,
      new Date('2026-08-02T10:00:00Z'),
    );
    expect(period.from).toBe('2026-07-04');
    expect(period.to).toBe('2026-08-02');
    expect(period.days).toBe(30);
    expect(() =>
      resolveDashboardPeriod(
        '2026-08-01',
        '2026-08-03',
        new Date('2026-08-02T10:00:00Z'),
      ),
    ).toThrow(BadRequestException);
    expect(() =>
      resolveDashboardPeriod(
        '2025-01-01',
        '2026-08-02',
        new Date('2026-08-02T10:00:00Z'),
      ),
    ).toThrow(BadRequestException);
  });

  it('never emits invalid percentages when previous value is zero', () => {
    expect(
      compareMetric(new Prisma.Decimal('10.25'), new Prisma.Decimal(0)),
    ).toEqual({
      current: '10.25',
      previous: '0.00',
      absoluteChange: '10.25',
      percentageChange: null,
      trend: 'up',
    });
    expect(compareMetric(5, 10, 0).trend).toBe('down');
    expect(compareMetric(10, 10, 0).trend).toBe('flat');
  });
});
