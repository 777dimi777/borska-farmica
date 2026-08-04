import Link from 'next/link';
export default function NotFound() {
  return (
    <div className="error-page">
      <p className="eyebrow">404</p>
      <h1>Ova stranica nije u ponudi.</h1>
      <p>Adresa možda više ne postoji ili je pogrešno uneta.</p>
      <Link className="button button-primary" href="/">
        Nazad na početnu
      </Link>
    </div>
  );
}
