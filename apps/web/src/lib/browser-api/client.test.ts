import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserApi } from './client';
afterEach(() => vi.restoreAllMocks());
describe('browserApi', () => {
  it('includes credentials and bearer only when provided', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));
    await browserApi('/account/me', { token: 'x' });
    expect(fetch).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({ Authorization: 'Bearer x' }),
      }),
    );
  });
  it('maps rate limit without retrying', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('{}', { status: 429 }),
    );
    await expect(browserApi('/auth/login')).rejects.toMatchObject({
      kind: 'rate-limit',
      status: 429,
    });
  });
});
