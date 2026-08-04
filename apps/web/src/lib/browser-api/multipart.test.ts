import { afterEach, describe, expect, it, vi } from 'vitest';
import { browserApi } from './client';
afterEach(() => vi.restoreAllMocks());
describe('browserApi multipart', () => {
  it('šalje FormData bez ručnog content-type zaglavlja', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}'));
    const body = new FormData();
    body.set('altText', 'Domaći sir');
    await browserApi('/admin/products/id/images/upload', {
      method: 'POST',
      body,
    });
    const options = vi.mocked(fetch).mock.calls[0][1]!;
    expect(options.body).toBe(body);
    expect(options.headers).not.toHaveProperty('Content-Type');
  });
});
