import Image from 'next/image';
import Link from 'next/link';

export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand${inverse ? ' brand-inverse' : ''}`}
      aria-label="Borska Farmica — početna"
    >
      <span className="brand-mark brand-mark-user">
        <Image
          src="/images/brand/borska-farmica-mark.webp"
          alt=""
          width={180}
          height={180}
          priority
        />
      </span>
      <span>
        <strong>Borska Farmica</strong>
        <small>Domaće iz Bora</small>
      </span>
    </Link>
  );
}
