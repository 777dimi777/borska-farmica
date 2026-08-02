import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import type {
  ImageStorageProvider,
  ProcessedImage,
  StoredImage,
} from './image-storage.types';
@Injectable()
export class CloudinaryImageStorageProvider implements ImageStorageProvider {
  private readonly folder: string;
  constructor(private readonly config: ConfigService) {
    this.folder = config.get<string>('CLOUDINARY_FOLDER', 'borska-farmica');
    cloudinary.config({
      cloud_name: config.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: config.get<string>('CLOUDINARY_API_KEY'),
      api_secret: config.get<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }
  upload(input: ProcessedImage, productId: string): Promise<StoredImage> {
    const publicId = randomUUID();
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'image',
          folder: this.folder + '/products/' + productId,
          public_id: publicId,
          overwrite: false,
          format: 'webp',
        },
        (error, result) => {
          if (error || !result?.secure_url)
            return reject(
              new BadGatewayException('IMAGE_STORAGE_UPLOAD_FAILED'),
            );
          resolve({
            provider: 'CLOUDINARY',
            storageKey: result.public_id,
            url: result.secure_url,
            width: input.width,
            height: input.height,
            format: input.format,
            byteSize: input.byteSize,
          });
        },
      );
      stream.end(input.buffer);
    });
  }
  async delete(storageKey: string) {
    try {
      const result = (await cloudinary.uploader.destroy(storageKey, {
        resource_type: 'image',
        invalidate: true,
      })) as { result?: string };
      return result.result === 'not found' ? 'not_found' : 'deleted';
    } catch {
      throw new BadGatewayException('IMAGE_STORAGE_DELETE_FAILED');
    }
  }
}
