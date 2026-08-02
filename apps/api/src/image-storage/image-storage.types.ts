export const IMAGE_STORAGE_PROVIDER = Symbol('IMAGE_STORAGE_PROVIDER');
export interface ProcessedImage {
  buffer: Buffer;
  width: number;
  height: number;
  format: 'webp';
  byteSize: number;
}
export interface StoredImage {
  provider: 'CLOUDINARY';
  storageKey: string;
  url: string;
  width: number;
  height: number;
  format: string;
  byteSize: number;
}
export interface ImageStorageProvider {
  upload(input: ProcessedImage, productId: string): Promise<StoredImage>;
  delete(storageKey: string): Promise<'deleted' | 'not_found'>;
}
