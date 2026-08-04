import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadAdminCsv } from './download';
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe('authenticated CSV download', () => {
  it('čuva bytes, šalje Bearer/credentials i uvek revoke-uje URL', async () => {
    const bytes = new Uint8Array([0xef, 0xbb, 0xbf, 97, 44, 98, 13, 10]);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(bytes, {
          headers: {
            'Content-Disposition': 'attachment; filename="safe.csv"',
            'Content-Type': 'text/csv',
          },
        }),
      ),
    );
    let captured: Blob | null = null;
    const create = vi.fn((blob: Blob) => {
        captured = blob;
        return 'blob:test';
      }),
      revoke = vi.fn();
    Object.defineProperty(URL, 'createObjectURL', {
      value: create,
      configurable: true,
    });
    Object.defineProperty(URL, 'revokeObjectURL', {
      value: revoke,
      configurable: true,
    });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const result = await downloadAdminCsv(
      'admin-token',
      '/admin/exports/inventory.csv',
      'fallback.csv',
    );
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/admin/exports/inventory.csv'),
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          Authorization: 'Bearer admin-token',
        }),
      }),
    );
    expect(captured).not.toBeNull();
    expect(Array.from(new Uint8Array(await captured!.arrayBuffer()))).toEqual(
      Array.from(bytes),
    );
    expect(result.name).toBe('safe.csv');
    expect(revoke).toHaveBeenCalledWith('blob:test');
    expect(document.querySelector('a[download]')).toBeNull();
  });
});
