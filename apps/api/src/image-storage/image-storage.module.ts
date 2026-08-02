import { Module } from '@nestjs/common';
import { CloudinaryImageStorageProvider } from './cloudinary-image-storage.provider';
import { IMAGE_STORAGE_PROVIDER } from './image-storage.types';
import { ImageProcessor } from './image-processor.service';
@Module({
  providers: [
    ImageProcessor,
    CloudinaryImageStorageProvider,
    {
      provide: IMAGE_STORAGE_PROVIDER,
      useExisting: CloudinaryImageStorageProvider,
    },
  ],
  exports: [ImageProcessor, IMAGE_STORAGE_PROVIDER],
})
export class ImageStorageModule {}
