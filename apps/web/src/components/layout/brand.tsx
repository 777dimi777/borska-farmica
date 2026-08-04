import Link from 'next/link';
export function Brand({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      className={`brand${inverse ? ' brand-inverse' : ''}`}
      aria-label="Borska Farmica — početna"
    >
      <span className="brand-mark" aria-hidden="true">
        BF
      </span>
      <span>
        <strong>Borska Farmica</strong>
        <small>Domaće iz Bora</small>
      </span>
    </Link>
  );
}
