import { describe, it, expect } from 'vitest';
import {
  displayQuantity,
  normalizeQuantity,
  shiftQuantity,
  validQuantity,
} from './quantity';
describe('quantity', () => {
  it('uses exact decimal arithmetic', () => {
    expect(shiftQuantity('0.500', '0.250', 1)).toBe('0.750');
    expect(shiftQuantity('1.000', '0.250', -1)).toBe('0.750');
  });
  it('normalizes comma and three decimals', () =>
    expect(normalizeQuantity('1,250')).toBe('1.250'));
  it.each(['1e2', 'NaN', 'Infinity', '-1', '0', '1.0001'])('rejects %s', (v) =>
    expect(normalizeQuantity(v)).toBeNull(),
  );
  it('checks minimum and increment', () => {
    expect(validQuantity('0.750', '0.500', '0.250')).toBe(true);
    expect(validQuantity('0.600', '0.500', '0.250')).toBe(false);
  });
  it('formats without zeros', () => {
    expect(displayQuantity('1.000')).toBe('1');
    expect(displayQuantity('0.500')).toBe('0,5');
  });
});
