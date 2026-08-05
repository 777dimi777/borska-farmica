import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import type { ProductPreview } from '@/types/catalog';

export function Hero({ product }: { product?: ProductPreview }) {
  return (
    <section className="farm-home-hero">
      <Image
        className="farm-home-hero-image"
        src="/images/farm-hero.webp"
        alt="Kozji sir, mleko, surutka i sezonsko povrće Borske Farmice"
        fill
        priority
        sizes="100vw"
      />
      <div className="farm-home-hero-shade" />
      <Container className="farm-home-hero-inner">
        <div className="farm-home-hero-copy">
          <p className="eyebrow">Domaće iz Bora</p>
          <h1>Iz naše farmice pravo na vaš sto.</h1>
          <p>
            Kozji sir, sveže mleko, surutka i sezonski proizvodi. Poručite
            online, a platite gotovinom pri ličnom preuzimanju.
          </p>
          <div className="hero-actions">
            <LinkButton href="/proizvodi">Pogledaj proizvode</LinkButton>
            <LinkButton href="/o-nama" variant="secondary">
              Naša priča
            </LinkButton>
          </div>
        </div>
        <aside className="availability-board" aria-label="Danas dostupno">
          <p>
            <span aria-hidden="true">●</span> Danas dostupno
          </p>
          <ul>
            <li>
              <span>Mladi kozji sir</span>
              <strong>na stanju</strong>
            </li>
            <li>
              <span>Kozje mleko</span>
              <strong>na stanju</strong>
            </li>
            <li>
              <span>Surutka</span>
              <strong>na stanju</strong>
            </li>
            <li>
              <span>Jaja</span>
              <strong>na stanju</strong>
            </li>
            <li>
              <span>Sezonska ponuda</span>
              <strong>aktuelna</strong>
            </li>
          </ul>
          <small>
            {product
              ? `Izdvojeno: ${product.name}`
              : 'Ponuda se ažurira kroz admin panel'}
          </small>
        </aside>
      </Container>
    </section>
  );
}
