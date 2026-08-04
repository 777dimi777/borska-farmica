import { describe, expect, it } from 'vitest';
import {
  cancellationLabel,
  orderStatusLabel,
  paymentLabel,
} from './formatters';
describe('order labels', () => {
  it('maps every customer status', () =>
    expect(Object.keys(orderStatusLabel)).toHaveLength(6));
  it('maps cash payment', () => {
    expect(paymentLabel('UNPAID')).toMatch(/preuzimanju/);
    expect(paymentLabel('PAID')).toMatch(/gotovinom/);
  });
  it('maps timeout cancellation', () =>
    expect(cancellationLabel('CONFIRMATION_TIMEOUT')).toMatch(/roku/));
});
