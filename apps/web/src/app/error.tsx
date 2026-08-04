'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="error-page">
      <p className="eyebrow">Došlo je do prekida</p>
      <h1>Stranica trenutno ne može da se prikaže.</h1>
      <p>Pokušajte ponovo ili se vratite na početnu stranicu.</p>
      <div>
        <Button onClick={reset}>Pokušaj ponovo</Button>
        <Link href="/">Nazad na početnu</Link>
      </div>
    </div>
  );
}
