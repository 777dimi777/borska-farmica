/* eslint-disable @typescript-eslint/require-await */
import type {
  ImageStorageProvider,
  ProcessedImage,
  StoredImage,
} from '../image-storage.types';

export type FakeUploadMode = 'success' | 'failure';
export type FakeDeleteMode = 'deleted' | 'not_found' | 'failure';

export class FakeImageStorageProvider implements ImageStorageProvider {
  uploadMode: FakeUploadMode = 'success';
  deleteMode: FakeDeleteMode = 'deleted';
  readonly uploads: Array<{ input: ProcessedImage; productId: string }> = [];
  readonly deletes: string[] = [];

  async upload(input: ProcessedImage, productId: string): Promise<StoredImage> {
    this.uploads.push({ input, productId });
    if (this.uploadMode === 'failure') throw new Error('FAKE_UPLOAD_FAILED');
    return {
      provider: 'CLOUDINARY',
      storageKey: `fake/products/${productId}/asset-${this.uploads.length}`,
      url: `https://res.cloudinary.com/test/image/upload/fake/products/${productId}/asset-${this.uploads.length}.webp`,
      width: input.width,
      height: input.height,
      format: input.format,
      byteSize: input.byteSize,
    };
  }

  async delete(storageKey: string): Promise<'deleted' | 'not_found'> {
    this.deletes.push(storageKey);
    if (this.deleteMode === 'failure') throw new Error('FAKE_DELETE_FAILED');
    return this.deleteMode;
  }

  reset(): void {
    this.uploadMode = 'success';
    this.deleteMode = 'deleted';
    this.uploads.length = 0;
    this.deletes.length = 0;
  }
}
