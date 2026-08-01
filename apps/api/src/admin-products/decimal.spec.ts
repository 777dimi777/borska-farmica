import { BadRequestException } from '@nestjs/common';
import { decimal, signedQuantity } from './decimal';
describe('precise decimal parser', () => {
  it.each([
    ['0', 2, '0.00'],
    ['250.00', 2, '250.00'],
    ['0.5', 3, '0.500'],
    ['999999999.999', 3, '999999999.999'],
  ])('normalizes %s at scale %s', (input, scale, output) =>
    expect(decimal(input, scale as 2 | 3).toFixed(scale as 2 | 3)).toBe(output),
  );
  it.each(['1e3', 'NaN', 'Infinity', '-1', '01.00', '1.234'])(
    'rejects invalid prices: %s',
    (input) => expect(() => decimal(input, 2)).toThrow(BadRequestException),
  );
  it.each(['0.0001', '1000000000.000', '+1'])(
    'rejects invalid quantities: %s',
    (input) => expect(() => decimal(input, 3)).toThrow(BadRequestException),
  );
  it('accepts signed non-zero candidates without using floats', () =>
    expect(signedQuantity('-0.125').toFixed(3)).toBe('-0.125'));
});
