'use client';
import Image from 'next/image';
import { useState } from 'react';
import type { ProductDetailImage } from '@/types/catalog';
export function ProductGallery({
  images,
  name,
}: {
  images: ProductDetailImage[];
  name: string;
}) {
  const ordered = [...images].sort(
    (a, b) => Number(b.primary) - Number(a.primary),
  );
  const [active, setActive] = useState(0);
  const image = ordered[active];
  if (!image)
    return (
      <div
        className="detail-image-fallback"
        aria-label={`${name} — slika nije dostupna`}
      >
        Borska
        <br />
        Farmica
      </div>
    );
  return (
    <div className="gallery">
      <div className="gallery-main">
        <Image
          src={image.url}
          alt={image.altText || name}
          width={image.width || 1000}
          height={image.height || 1000}
          sizes="(max-width: 768px) 94vw, 50vw"
          priority
        />
      </div>
      {ordered.length > 1 && (
        <div
          className="gallery-thumbs"
          role="group"
          aria-label="Izaberite sliku proizvoda"
        >
          {ordered.map((item, i) => (
            <button
              key={item.id}
              onClick={() => setActive(i)}
              aria-label={`Prikaži sliku ${i + 1}: ${item.altText || name}`}
              aria-pressed={i === active}
            >
              <Image src={item.url} alt="" width={96} height={96} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
