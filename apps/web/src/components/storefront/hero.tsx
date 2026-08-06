import Image from 'next/image';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import type { ProductPreview } from '@/types/catalog';

export function Hero({ product }: { product?: ProductPreview }) {
  return (
    <section className="reference-hero">
      <Image
        className="reference-hero-photo"
        src="/images/farm-hero.webp"
        alt="Sveži sir, mleko, surutka i povrće Borske Farmice"
        fill
        priority
        sizes="100vw"
      />
      <div className="reference-hero-paper" />
      <Container className="reference-hero-inner">
        <div className="reference-hero-copy">
          <p className="eyebrow">Domaće iz Bora</p>
          <h1>
            Pravo sa naše farme.
            <br />
            Sveže, domaće, iskreno.
          </h1>
          <p>
            Naša porodična ponuda donosi mleko, surutku, sireve, jaja i sezonske
            plodove direktno kupcima u Boru. Bez prečica. Bez komplikacija.
          </p>
          <div className="hero-actions">
            <LinkButton href="/proizvodi">Pogledaj proizvode →</LinkButton>
            <LinkButton href="/o-nama" variant="secondary">
              Naša priča →
            </LinkButton>
          </div>
          <div className="hero-proof">
            <span>BF</span>
            <span>BF</span>
            <span>BF</span>
            <p>
              <strong>Lokalna kupovina</strong>
              <small>Direktno od Borske Farmice</small>
            </p>
          </div>
        </div>
        <div className="hero-badges" aria-label="Prednosti proizvoda">
          <span>
            <b>100%</b> domaća ponuda
          </span>
          <span>
            <b>Sveže</b> pripremljeno
          </span>
        </div>
      </Container>
      <Container className="hero-trust-strip">
        {[
          ['⌂', 'Lokalna ponuda', 'Preuzimanje u Boru'],
          ['✓', 'Jasna dostupnost', 'Stanje iz kataloga'],
          ['▣', 'Lično preuzimanje', 'Na adresi ili pijaci'],
          ['●', 'Gotovina', 'Plaćanje uživo'],
        ].map(([icon, title, text]) => (
          <div key={title}>
            <i>{icon}</i>
            <p>
              <strong>{title}</strong>
              <small>{text}</small>
            </p>
          </div>
        ))}
      </Container>
    </section>
  );
}
