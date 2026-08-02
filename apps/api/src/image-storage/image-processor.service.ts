import {
  Injectable,
  PayloadTooLargeException,
  UnprocessableEntityException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import type { ProcessedImage } from './image-storage.types';
@Injectable()
export class ImageProcessor {
  constructor(private readonly config: ConfigService) {}
  async process(buffer: Buffer, mime: string): Promise<ProcessedImage> {
    const max = this.config.get<number>('IMAGE_UPLOAD_MAX_BYTES', 8388608);
    if (!buffer.length)
      throw new UnsupportedMediaTypeException('IMAGE_FILE_EMPTY');
    if (buffer.length > max)
      throw new PayloadTooLargeException('IMAGE_FILE_TOO_LARGE');
    const jpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
      png = buffer
        .subarray(0, 8)
        .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
      webp =
        buffer.subarray(0, 4).toString() === 'RIFF' &&
        buffer.subarray(8, 12).toString() === 'WEBP';
    if (!jpeg && !png && !webp)
      throw new UnsupportedMediaTypeException('IMAGE_FORMAT_UNSUPPORTED');
    const expected = jpeg ? 'image/jpeg' : png ? 'image/png' : 'image/webp';
    if (mime !== expected)
      throw new UnsupportedMediaTypeException('IMAGE_MIME_SIGNATURE_MISMATCH');
    const maxW = this.config.get<number>('IMAGE_UPLOAD_MAX_WIDTH', 6000),
      maxH = this.config.get<number>('IMAGE_UPLOAD_MAX_HEIGHT', 6000),
      pixels = maxW * maxH;
    const image = sharp(buffer, {
      limitInputPixels: pixels,
      animated: false,
      failOn: 'warning',
    });
    const meta = await image.metadata();
    if (
      !meta.width ||
      !meta.height ||
      !['jpeg', 'png', 'webp'].includes(meta.format ?? '')
    )
      throw new UnsupportedMediaTypeException('IMAGE_DECODE_FAILED');
    if ((meta.pages ?? 1) > 1)
      throw new UnsupportedMediaTypeException('IMAGE_ANIMATION_UNSUPPORTED');
    if (meta.width > maxW || meta.height > maxH)
      throw new UnprocessableEntityException('IMAGE_DIMENSIONS_EXCEEDED');
    const dimension = this.config.get<number>(
      'IMAGE_OUTPUT_MAX_DIMENSION',
      2400,
    );
    const output = await image
      .rotate()
      .resize({
        width: dimension,
        height: dimension,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 85 })
      .toBuffer({ resolveWithObject: true });
    return {
      buffer: output.data,
      width: output.info.width,
      height: output.info.height,
      format: 'webp',
      byteSize: output.data.length,
    };
  }
}
