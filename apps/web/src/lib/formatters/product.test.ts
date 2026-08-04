import { describe, expect, it } from 'vitest';
import { availabilityLabel, packageLabel } from './product';
describe('product formatters', () => {
  it('package/unit', () =>
    expect(packageLabel({ packageAmount: '1.000', unit: 'LITER' })).toBe(
      '1 l',
    ));
  it.each([
    [
      { currentlyAvailable: false, inStock: false, purchasable: false },
      'Trenutno nije u ponudi',
    ],
    [
      { currentlyAvailable: true, inStock: false, purchasable: false },
      'Trenutno nema na stanju',
    ],
    [
      { currentlyAvailable: true, inStock: true, purchasable: true },
      'Dostupno',
    ],
    [
      { currentlyAvailable: true, inStock: false, purchasable: true },
      'Dostupno za poručivanje',
    ],
  ])('availability', (input, label) =>
    expect(availabilityLabel(input)).toBe(label),
  );
});
