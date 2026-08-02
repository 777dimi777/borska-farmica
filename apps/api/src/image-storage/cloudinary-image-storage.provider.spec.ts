/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { BadGatewayException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryImageStorageProvider } from './cloudinary-image-storage.provider';

jest.mock('cloudinary', () => ({
  v2: {
    config: jest.fn(),
    uploader: {
      upload_stream: jest.fn(),
      destroy: jest.fn(),
    },
  },
}));

describe('CloudinaryImageStorageProvider', () => {
  const input = {
    buffer: Buffer.from('processed-webp'),
    width: 640,
    height: 360,
    format: 'webp' as const,
    byteSize: 14,
  };
  const config = {
    get: jest.fn((key: string, fallback: unknown) => {
      const values: Record<string, string> = {
        CLOUDINARY_FOLDER: 'borska-farmica',
        CLOUDINARY_CLOUD_NAME: 'test-cloud',
        CLOUDINARY_API_KEY: 'test-key',
        CLOUDINARY_API_SECRET: 'test-secret',
      };
      return values[key] ?? fallback;
    }),
  } as unknown as ConfigService;

  beforeEach(() => jest.clearAllMocks());

  it('configures the SDK once and uploads with a server UUID and folder', async () => {
    const uploadStream = cloudinary.uploader.upload_stream as jest.Mock;
    uploadStream.mockImplementation(
      (
        options: Record<string, unknown>,
        callback: (error: unknown, result: Record<string, unknown>) => void,
      ) => ({
        end: jest.fn(() =>
          callback(null, {
            public_id: `borska-farmica/products/product-1/${String(options.public_id)}`,
            secure_url:
              'https://res.cloudinary.com/test/image/upload/asset.webp',
          }),
        ),
      }),
    );
    const provider = new CloudinaryImageStorageProvider(config);
    const result = await provider.upload(input, 'product-1');
    const options = uploadStream.mock.calls[0][0] as Record<string, unknown>;

    expect(cloudinary.config).toHaveBeenCalledWith(
      expect.objectContaining({ secure: true }),
    );
    expect(options).toMatchObject({
      resource_type: 'image',
      folder: 'borska-farmica/products/product-1',
      overwrite: false,
      format: 'webp',
    });
    expect(options.public_id).toEqual(expect.stringMatching(/^[0-9a-f-]{36}$/));
    expect(result).toEqual({
      provider: 'CLOUDINARY',
      storageKey: expect.stringContaining('borska-farmica/products/product-1/'),
      url: 'https://res.cloudinary.com/test/image/upload/asset.webp',
      width: 640,
      height: 360,
      format: 'webp',
      byteSize: 14,
    });
  });

  it('maps upload failures without exposing provider details', async () => {
    (cloudinary.uploader.upload_stream as jest.Mock).mockImplementation(
      (_options: unknown, callback: (error: Error) => void) => ({
        end: jest.fn(() => callback(new Error('credential detail'))),
      }),
    );
    const provider = new CloudinaryImageStorageProvider(config);
    await expect(provider.upload(input, 'product-1')).rejects.toEqual(
      expect.objectContaining<Partial<BadGatewayException>>({
        message: 'IMAGE_STORAGE_UPLOAD_FAILED',
      }),
    );
  });

  it('maps deleted, not-found and failed deletes', async () => {
    const destroy = cloudinary.uploader.destroy as jest.Mock;
    const provider = new CloudinaryImageStorageProvider(config);
    destroy.mockResolvedValueOnce({ result: 'ok' });
    await expect(provider.delete('key')).resolves.toBe('deleted');
    destroy.mockResolvedValueOnce({ result: 'not found' });
    await expect(provider.delete('key')).resolves.toBe('not_found');
    destroy.mockRejectedValueOnce(new Error('provider detail'));
    await expect(provider.delete('key')).rejects.toEqual(
      expect.objectContaining<Partial<BadGatewayException>>({
        message: 'IMAGE_STORAGE_DELETE_FAILED',
      }),
    );
  });
});
