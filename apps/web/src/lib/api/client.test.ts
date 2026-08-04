import { afterEach, describe, expect, it, vi } from 'vitest';
import { publicApiFetch, PublicApiError } from './client';
afterEach(() => vi.unstubAllGlobals());
describe('publicApiFetch', () => {
  it('mapira nedostupan API bez raw greške', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockRejectedValue(new Error('fetch failed secret')),
    );
    await expect(publicApiFetch('/categories')).rejects.toEqual(
      expect.objectContaining({ kind: 'unavailable' }),
    );
  });
  it('mapira 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response('', { status: 404 })),
    );
    await expect(publicApiFetch('/missing')).rejects.toBeInstanceOf(
      PublicApiError,
    );
  });
  it('vraća JSON uspešnog odgovora', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ ok: true }), { status: 200 }),
        ),
    );
    await expect(publicApiFetch<{ ok: boolean }>('/ok')).resolves.toEqual({
      ok: true,
    });
  });
});
