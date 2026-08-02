import { BadRequestException } from '@nestjs/common';

export const DASHBOARD_TIME_ZONE = 'Europe/Belgrade';
export const DASHBOARD_MAX_DAYS = 366;
const DAY_MS = 86_400_000;

export interface DashboardPeriod {
  from: string;
  to: string;
  start: Date;
  endExclusive: Date;
  days: number;
  previous: {
    from: string;
    to: string;
    start: Date;
    endExclusive: Date;
  };
  timeZone: typeof DASHBOARD_TIME_ZONE;
}

interface CalendarDate {
  year: number;
  month: number;
  day: number;
}

function parseDate(value: string): CalendarDate {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value))
    throw new BadRequestException('DASHBOARD_DATE_INVALID');
  const [year, month, day] = value.split('-').map(Number);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (
    check.getUTCFullYear() !== year ||
    check.getUTCMonth() !== month - 1 ||
    check.getUTCDate() !== day
  )
    throw new BadRequestException('DASHBOARD_DATE_INVALID');
  return { year, month, day };
}

function formatDate(date: CalendarDate): string {
  return [date.year, date.month, date.day]
    .map((value, index) => value.toString().padStart(index === 0 ? 4 : 2, '0'))
    .join('-');
}

function addDays(value: string, amount: number): string {
  const date = parseDate(value);
  const shifted = new Date(
    Date.UTC(date.year, date.month - 1, date.day + amount),
  );
  return formatDate({
    year: shifted.getUTCFullYear(),
    month: shifted.getUTCMonth() + 1,
    day: shifted.getUTCDate(),
  });
}

export function belgradeBusinessDate(reference = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: DASHBOARD_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(reference);
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';
  return read('year') + '-' + read('month') + '-' + read('day');
}

function zonedMidnight(value: string): Date {
  const target = parseDate(value);
  let timestamp = Date.UTC(target.year, target.month - 1, target.day);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: DASHBOARD_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  for (let attempt = 0; attempt < 3; attempt++) {
    const parts = formatter.formatToParts(new Date(timestamp));
    const read = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value);
    const displayed = Date.UTC(
      read('year'),
      read('month') - 1,
      read('day'),
      read('hour'),
      read('minute'),
      read('second'),
    );
    const wanted = Date.UTC(target.year, target.month - 1, target.day);
    timestamp += wanted - displayed;
  }
  return new Date(timestamp);
}

function distanceDays(from: string, to: string): number {
  const first = parseDate(from);
  const last = parseDate(to);
  return (
    Math.floor(
      (Date.UTC(last.year, last.month - 1, last.day) -
        Date.UTC(first.year, first.month - 1, first.day)) /
        DAY_MS,
    ) + 1
  );
}

export function resolveDashboardPeriod(
  from?: string,
  to?: string,
  reference = new Date(),
): DashboardPeriod {
  const today = belgradeBusinessDate(reference);
  const resolvedTo = to ?? today;
  const resolvedFrom = from ?? addDays(resolvedTo, -29);
  parseDate(resolvedFrom);
  parseDate(resolvedTo);
  if (resolvedTo > today)
    throw new BadRequestException('DASHBOARD_FUTURE_DATE_NOT_ALLOWED');
  const days = distanceDays(resolvedFrom, resolvedTo);
  if (days < 1) throw new BadRequestException('DASHBOARD_DATE_RANGE_INVALID');
  if (days > DASHBOARD_MAX_DAYS)
    throw new BadRequestException('DASHBOARD_DATE_RANGE_TOO_LARGE');
  const previousTo = addDays(resolvedFrom, -1);
  const previousFrom = addDays(previousTo, -(days - 1));
  return {
    from: resolvedFrom,
    to: resolvedTo,
    start: zonedMidnight(resolvedFrom),
    endExclusive: zonedMidnight(addDays(resolvedTo, 1)),
    days,
    previous: {
      from: previousFrom,
      to: previousTo,
      start: zonedMidnight(previousFrom),
      endExclusive: zonedMidnight(resolvedFrom),
    },
    timeZone: DASHBOARD_TIME_ZONE,
  };
}

export interface MetricComparison {
  current: string;
  previous: string;
  absoluteChange: string;
  percentageChange: string | null;
  trend: 'up' | 'down' | 'flat';
}

export function compareMetric(
  current: number,
  previous: number,
  fractionDigits = 2,
): MetricComparison {
  const absolute = current - previous;
  const format = (value: number) => value.toFixed(fractionDigits);
  return {
    current: format(current),
    previous: format(previous),
    absoluteChange: format(absolute),
    percentageChange:
      previous === 0 ? null : ((absolute / previous) * 100).toFixed(2),
    trend: absolute > 0 ? 'up' : absolute < 0 ? 'down' : 'flat',
  };
}
