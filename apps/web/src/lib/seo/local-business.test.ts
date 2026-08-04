import { describe, expect, it } from 'vitest';
import { localBusinessJsonLd, safeJsonLd } from './local-business';
describe('LocalBusiness JSON-LD', () => {
  it('sadrži samo potvrđene podatke', () => {
    const value = localBusinessJsonLd('https://farmica.test');
    expect(value).not.toHaveProperty('telephone');
    expect(value).not.toHaveProperty('openingHours');
    expect(value).not.toHaveProperty('geo');
    expect(value.address.streetAddress).toBe('Nade Dimić 30');
  });
  it('escapuje HTML početak', () =>
    expect(safeJsonLd({ x: '</script>' })).not.toContain('</script>'));
});
