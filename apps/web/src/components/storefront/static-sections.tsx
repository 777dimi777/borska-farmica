import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';

export function StaticSections() {
  return (
    <>
      <Section className="farm-story-section">
        <Container className="farm-story-grid">
          <div className="farm-story-photo">
            <Image
              src="/images/farm-story-v2.webp"
              alt="Farmer sa kozama na pašnjaku"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </div>
          <div className="farm-story-copy">
            <p className="eyebrow">Naša priča</p>
            <h2>Od pašnjaka do vašeg stola</h2>
            <p>
              Borska Farmica je lokalna porodična priča iz Bora. Želimo da kupci
              jasno vide šta je trenutno dostupno, jednostavno poruče i lično
              preuzmu proizvode bez skrivenih koraka.
            </p>
            <div className="story-values">
              <div>
                <strong>100%</strong>
                <span>lokalna ponuda</span>
              </div>
              <div>
                <strong>Sveže</strong>
                <span>stanje iz kataloga</span>
              </div>
              <div>
                <strong>Direktno</strong>
                <span>lično preuzimanje</span>
              </div>
            </div>
            <LinkButton href="/o-nama">Saznaj više o nama →</LinkButton>
          </div>
        </Container>
      </Section>
      <Section className="order-how">
        <Container>
          <SectionHeading align="center" title="Kako poručiti" />
          <div className="order-steps">
            {[
              ['01', 'Izaberi proizvode', 'Dodaj proizvode u korpu.'],
              [
                '02',
                'Potvrdi porudžbinu',
                'Prijavi se i odaberi mesto preuzimanja.',
              ],
              [
                '03',
                'Sačekaj potvrdu',
                'Admin potvrđuje da je porudžbina spremna.',
              ],
              [
                '04',
                'Preuzmi i plati',
                'Plaćanje je gotovinom pri preuzimanju.',
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <div className="step-drawing" aria-hidden="true">
                  {n === '01' ? '⌑' : n === '02' ? '✓' : n === '03' ? '◷' : '⌂'}
                </div>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="season-feature">
        <Container>
          <div className="season-feature-inner">
            <Image
              src="/images/seasonal-banner-v2.webp"
              alt="Sezonsko povrće i voće"
              fill
              sizes="100vw"
            />
            <div>
              <p className="eyebrow">U ritmu sezone</p>
              <h2>Svežina koju donosi priroda</h2>
              <p>
                Voće i povrće dolaze u ponudu kada im je pravo vreme. Aktuelno
                stanje uvek proverite u katalogu.
              </p>
              <LinkButton href="/proizvodi">
                Pogledaj sezonsku ponudu →
              </LinkButton>
            </div>
          </div>
        </Container>
      </Section>
      <Section className="pickup-confidence">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Bez izmišljenih obećanja"
            title="Sve što treba da znate pre poručivanja"
          />
          <div className="confidence-grid">
            <article>
              <strong>Nade Dimić 30</strong>
              <p>Lično preuzimanje odmah ispod Stovarišta Našković.</p>
            </article>
            <article>
              <strong>Gradska pijaca Bor</strong>
              <p>Subotom nas možete pronaći na gradskoj pijaci.</p>
            </article>
            <article>
              <strong>Gotovinsko plaćanje</strong>
              <p>Nema online naplate. Plaćate kada preuzmete proizvode.</p>
            </article>
          </div>
        </Container>
      </Section>
      <Section className="home-contact-band">
        <Container>
          <div>
            <h2>Budite deo naše male farmice</h2>
            <p>
              Imate pitanje o proizvodima ili preuzimanju? Pogledajte kontakt i
              aktuelne informacije.
            </p>
            <Link href="/kontakt">Kontaktirajte nas →</Link>
          </div>
          <div className="mini-gallery">
            <Image
              src="/images/products/kozje-mleko.webp"
              alt="Kozje mleko"
              fill
              sizes="180px"
            />
            <Image
              src="/images/products/mladi-kozji-sir.webp"
              alt="Mladi kozji sir"
              fill
              sizes="180px"
            />
            <Image
              src="/images/products/maline.webp"
              alt="Maline"
              fill
              sizes="180px"
            />
          </div>
        </Container>
      </Section>
    </>
  );
}
