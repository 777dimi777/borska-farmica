import { afterEach, describe, expect, it, vi } from 'vitest';
import { validatedUrl } from './env';
describe('frontend env', () => {
  afterEach(() => vi.unstubAllEnvs());
  it('prihvata HTTPS URL', () =>
    expect(
      validatedUrl('SITE', 'https://farmica.test/', 'http://localhost'),
    ).toBe('https://farmica.test'));
  it('odbija localhost u produkciji', () => {
    vi.stubEnv('NODE_ENV', 'production');
    expect(() =>
      validatedUrl('SITE', 'http://localhost:3000', 'http://localhost'),
    ).toThrow();
  });
  it('odbija nebezbedan protokol', () =>
    expect(() =>
      validatedUrl('SITE', 'javascript:alert(1)', 'http://localhost'),
    ).toThrow());
});
