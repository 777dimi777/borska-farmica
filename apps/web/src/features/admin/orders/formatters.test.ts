import { describe, expect, it } from 'vitest';
import {
  actorLabel,
  eventLabel,
  formatRsd,
  paymentStatusLabel,
  statusLabel,
} from './formatters';
describe('admin order formatters', () => {
  it('prevodi status i payment bez oslanjanja na boju', () => {
    expect(statusLabel.READY_FOR_PICKUP).toBe('Spremna za preuzimanje');
    expect(paymentStatusLabel.PAID).toBe('Plaćeno gotovinom');
  });
  it('prevodi admin/customer/system događaje', () => {
    expect(eventLabel('order.cancelled_by_timeout')).toContain('isteka roka');
    expect(actorLabel('SYSTEM')).toBe('Sistem');
    expect(eventLabel('unknown')).not.toBe('unknown');
  });
  it('formatira backend Decimal string kao RSD', () =>
    expect(formatRsd('1234.50')).toMatch(/1[.\s]234,50/));
});
