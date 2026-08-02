import { FakeImageStorageProvider } from './fake-image-storage.provider';

describe('FakeImageStorageProvider', () => {
  const image = {
    buffer: Buffer.from('processed'),
    width: 320,
    height: 180,
    format: 'webp' as const,
    byteSize: 9,
  };

  it('returns deterministic upload metadata and records calls', async () => {
    const provider = new FakeImageStorageProvider();
    await expect(provider.upload(image, 'product-1')).resolves.toEqual({
      provider: 'CLOUDINARY',
      storageKey: 'fake/products/product-1/asset-1',
      url: 'https://res.cloudinary.com/test/image/upload/fake/products/product-1/asset-1.webp',
      width: 320,
      height: 180,
      format: 'webp',
      byteSize: 9,
    });
    expect(provider.uploads).toEqual([
      { input: image, productId: 'product-1' },
    ]);
  });

  it('simulates upload and all delete outcomes', async () => {
    const provider = new FakeImageStorageProvider();
    provider.uploadMode = 'failure';
    await expect(provider.upload(image, 'product-1')).rejects.toThrow(
      'FAKE_UPLOAD_FAILED',
    );

    provider.deleteMode = 'not_found';
    await expect(provider.delete('missing')).resolves.toBe('not_found');
    provider.deleteMode = 'failure';
    await expect(provider.delete('broken')).rejects.toThrow(
      'FAKE_DELETE_FAILED',
    );
    expect(provider.deletes).toEqual(['missing', 'broken']);
  });
});
