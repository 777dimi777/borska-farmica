import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { ImageProcessor } from './image-processor.service';
describe('ImageProcessor', () => {
  const config = {
    get: jest.fn((key: string, fallback: unknown) => fallback),
  } as unknown as ConfigService;
  const processor = new ImageProcessor(config);
  it.each([
    ['jpeg', 'image/jpeg'],
    ['png', 'image/png'],
    ['webp', 'image/webp'],
  ] as const)('decodes %s and emits stripped webp', async (format, mime) => {
    const image = sharp({
      create: {
        width: 40,
        height: 20,
        channels: 4,
        background: { r: 10, g: 20, b: 30, alpha: 0.5 },
      },
    });
    const input = await (
      format === 'jpeg'
        ? image.jpeg()
        : format === 'png'
          ? image.png()
          : image.webp()
    ).toBuffer();
    const result = await processor.process(input, mime);
    expect(result).toMatchObject({ width: 40, height: 20, format: 'webp' });
    expect((await sharp(result.buffer).metadata()).format).toBe('webp');
  });
  it('rejects MIME mismatch, SVG and empty buffers', async () => {
    const jpeg = await sharp({
      create: { width: 2, height: 2, channels: 3, background: 'red' },
    })
      .jpeg()
      .toBuffer();
    await expect(processor.process(jpeg, 'image/png')).rejects.toThrow(
      'IMAGE_MIME_SIGNATURE_MISMATCH',
    );
    await expect(
      processor.process(Buffer.from('<svg/>'), 'image/svg+xml'),
    ).rejects.toThrow('IMAGE_FORMAT_UNSUPPORTED');
    await expect(
      processor.process(Buffer.alloc(0), 'image/png'),
    ).rejects.toThrow('IMAGE_FILE_EMPTY');
  });
  it('never enlarges a small image', async () => {
    const input = await sharp({
      create: { width: 10, height: 5, channels: 3, background: 'blue' },
    })
      .png()
      .toBuffer();
    const output = await processor.process(input, 'image/png');
    expect([output.width, output.height]).toEqual([10, 5]);
  });
});
