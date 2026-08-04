import { describe, expect, it } from 'vitest';
import { actionLabel } from './audit';
describe('audit action labels', () => {
  it('prevodi poznatu akciju', () =>
    expect(actionLabel('customer.disabled')).toBe('Kupac deaktiviran'));
  it('ne skriva niti interpretira nepoznatu vrednost', () =>
    expect(actionLabel('<img src=x onerror=alert(1)>')).toBe(
      '<img src=x onerror=alert(1)>',
    ));
});
