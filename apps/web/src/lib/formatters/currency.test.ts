import { describe, expect, it } from 'vitest';
import { formatRsd } from './currency';
describe('formatRsd', () => {
  it('formatira cenu sa dve decimale u RSD', () => {
    expect(formatRsd('850.00')).toMatch(/850,00/);
    expect(formatRsd('850.00')).toMatch(/RSD|дин/);
  });
  it('bezbedno obrađuje pogrešnu vrednost', () =>
    expect(formatRsd('x')).toBe('Cena na upit'));
});
