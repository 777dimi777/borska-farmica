import Image from 'next/image';
import type { ProductImage as ProductImageType } from '@/types/catalog';
export function ProductImage({
  image,
  name,
  priority = false,
}: {
  image: ProductImageType | null;
  name: string;
  priority?: boolean;
}) {
  if (!image)
    return (
      <div
        className="image-fallback"
        aria-label={`${name} — slika nije dostupna`}
      >
        <span aria-hidden="true">
          Borska
          <br />
          Farmica
        </span>
      </div>
    );
  return (
    <Image
      src={image.url}
      alt={image.altText || name}
      width={image.width || 800}
      height={image.height || 800}
      sizes="(max-width: 640px) 92vw, (max-width: 1024px) 45vw, 280px"
      priority={priority}
      className="product-image"
    />
  );
}
