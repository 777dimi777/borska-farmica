import { describe, it, expect } from 'vitest';
import { safeReturnTo } from './return-to';
describe('safeReturnTo', () => {
  it.each([
    ['/korpa', '/korpa'],
    ['https://evil.example', '/nalog'],
    ['//evil.example', '/nalog'],
    ['%2F%2Fevil.example', '/nalog'],
    ['/x%0ay', '/nalog'],
    ['', '/nalog'],
  ])('%s -> %s', (v, e) => expect(safeReturnTo(v)).toBe(e));
});
