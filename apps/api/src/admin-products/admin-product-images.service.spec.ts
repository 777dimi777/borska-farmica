/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { ConflictException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import { PrismaService } from '../database/prisma.service';
import { ImageProcessor } from '../image-storage/image-processor.service';
import { FakeImageStorageProvider } from '../image-storage/testing/fake-image-storage.provider';
import { AdminProductImagesService } from './admin-product-images.service';

describe('AdminProductImagesService managed lifecycle', () => {
  const productId = '11111111-1111-4111-8111-111111111111';
  const imageId = '22222222-2222-4222-8222-222222222222';
  const context = { adminId: 'admin-1' };
  const processed = {
    buffer: Buffer.from('webp'),
    width: 320,
    height: 180,
    format: 'webp' as const,
    byteSize: 4,
  };
  const file = {
    buffer: Buffer.from('input'),
    mimetype: 'image/png',
  } as Express.Multer.File;

  let enabled = true;
  let maximum = 12;
  let count = 0;
  let createFailure: Error | undefined;
  let oldImage: Record<string, unknown> | null;
  let transactionCalls: number;
  let tx: {
    productImage: {
      count: jest.Mock;
      updateMany: jest.Mock;
      aggregate: jest.Mock;
      create: jest.Mock;
      findFirst: jest.Mock;
      delete: jest.Mock;
      update: jest.Mock;
    };
  };
  let prisma: {
    product: { findUnique: jest.Mock };
    productImage: { findFirst: jest.Mock };
    $transaction: jest.Mock;
  };
  let audit: { write: jest.Mock };
  let processor: { process: jest.Mock };
  let storage: FakeImageStorageProvider;
  let service: AdminProductImagesService;

  beforeEach(() => {
    enabled = true;
    maximum = 12;
    count = 0;
    createFailure = undefined;
    oldImage = null;
    transactionCalls = 0;
    tx = {
      productImage: {
        count: jest.fn(async () => count),
        updateMany: jest.fn(async () => ({ count: 1 })),
        aggregate: jest.fn(async () => ({ _max: { sortOrder: null } })),
        create: jest.fn(async ({ data }: { data: Record<string, unknown> }) => {
          if (createFailure) throw createFailure;
          return {
            id: imageId,
            ...data,
            createdAt: new Date('2026-01-01T00:00:00Z'),
            updatedAt: new Date('2026-01-01T00:00:00Z'),
          };
        }),
        findFirst: jest.fn(async () => oldImage),
        delete: jest.fn(async () => oldImage),
        update: jest.fn(async () => oldImage),
      },
    };
    prisma = {
      product: { findUnique: jest.fn(async () => ({ id: productId })) },
      productImage: { findFirst: jest.fn(async () => oldImage) },
      $transaction: jest.fn(
        async (callback: (client: typeof tx) => unknown) => {
          transactionCalls += 1;
          return callback(tx);
        },
      ),
    };
    audit = { write: jest.fn(async () => undefined) };
    processor = { process: jest.fn(async () => processed) };
    storage = new FakeImageStorageProvider();
    const config = {
      get: jest.fn((key: string, fallback: unknown) => {
        if (key === 'IMAGE_UPLOAD_ENABLED') return enabled;
        if (key === 'IMAGE_MAX_PER_PRODUCT') return maximum;
        return fallback;
      }),
    };
    service = new AdminProductImagesService(
      prisma as unknown as PrismaService,
      audit as unknown as AdminAuditService,
      processor as unknown as ImageProcessor,
      config as unknown as ConfigService,
      storage,
    );
  });

  it('returns 503 without processing when upload is disabled', async () => {
    enabled = false;
    await expect(
      service.upload(productId, file, 'Domaći sir', false, context),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(processor.process).not.toHaveBeenCalled();
    expect(storage.uploads).toHaveLength(0);
  });

  it('makes the first upload primary, appends it and writes sanitized audit', async () => {
    const result = await service.upload(
      productId,
      file,
      '  Domaći sir  ',
      false,
      context,
    );
    expect(result).toMatchObject({
      id: imageId,
      isPrimary: true,
      sortOrder: 0,
      altText: 'Domaći sir',
      storageProvider: 'CLOUDINARY',
    });
    expect(storage.uploads).toHaveLength(1);
    const changes = audit.write.mock.calls[0][2].changes;
    expect(changes).not.toHaveProperty('storageKey');
    expect(changes).not.toHaveProperty('buffer');
  });

  it('cleans up the uploaded asset when the image limit is reached', async () => {
    count = 12;
    maximum = 12;
    await expect(
      service.upload(productId, file, 'Domaći sir', false, context),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(storage.deletes).toEqual([`fake/products/${productId}/asset-1`]);
  });

  it('preserves the database error and calls compensating delete', async () => {
    createFailure = new Error('DATABASE_WRITE_FAILED');
    await expect(
      service.upload(productId, file, 'Domaći sir', false, context),
    ).rejects.toThrow('DATABASE_WRITE_FAILED');
    expect(storage.deletes).toEqual([`fake/products/${productId}/asset-1`]);
  });

  it('does not call remote delete for an external image', async () => {
    oldImage = {
      id: imageId,
      productId,
      url: 'https://example.com/image.jpg',
      altText: 'External image',
      isPrimary: false,
      sortOrder: 0,
      storageProvider: null,
      storageKey: null,
    };
    await service.remove(productId, imageId, context);
    expect(storage.deletes).toHaveLength(0);
    expect(transactionCalls).toBe(1);
  });

  it('blocks metadata deletion when managed remote delete fails', async () => {
    oldImage = {
      id: imageId,
      productId,
      storageProvider: 'CLOUDINARY',
      storageKey: 'managed-key',
    };
    storage.deleteMode = 'failure';
    await expect(service.remove(productId, imageId, context)).rejects.toThrow(
      'FAKE_DELETE_FAILED',
    );
    expect(transactionCalls).toBe(0);
    expect(tx.productImage.delete).not.toHaveBeenCalled();
  });

  it('treats managed not-found delete as idempotent success', async () => {
    oldImage = {
      id: imageId,
      productId,
      url: 'https://res.cloudinary.com/test/image.webp',
      altText: 'Managed image',
      isPrimary: false,
      sortOrder: 0,
      storageProvider: 'CLOUDINARY',
      storageKey: 'missing-key',
    };
    storage.deleteMode = 'not_found';
    await service.remove(productId, imageId, context);
    expect(storage.deletes).toEqual(['missing-key']);
    expect(tx.productImage.delete).toHaveBeenCalledWith({
      where: { id: imageId },
    });
  });
});
