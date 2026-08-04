import { describe, expect, it } from 'vitest';
import { safeCsvFilename } from './download';
describe('secure CSV filename', () => {
  it('podržava filename i forsira csv', () =>
    expect(
      safeCsvFilename('attachment; filename="izvestaj.csv"', 'fallback.csv'),
    ).toBe('izvestaj.csv'));
  it('podržava filename*', () =>
    expect(
      safeCsvFilename(
        "attachment; filename*=UTF-8''kupci%20bor.csv",
        'fallback.csv',
      ),
    ).toBe('kupci bor.csv'));
  it('odbacuje putanju, kontrolne znakove i pogrešnu ekstenziju', () => {
    expect(
      safeCsvFilename('attachment; filename="../../evil.exe"', 'bezbedno.csv'),
    ).toBe('bezbedno.csv');
    expect(safeCsvFilename(null, 'fallback.csv')).toBe('fallback.csv');
  });
});
