import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';

const months = [
  ['Maj', 'Jagode'],
  ['Jun', 'Paradajz · krastavac'],
  ['Jul', 'Maline · kupine'],
  ['Avgust', 'Paradajz · kajsije'],
  ['Septembar', 'Grožđe'],
  ['Oktobar', 'Bundeva'],
];

export function StaticSections() {
  return (
    <>
      <Section className="season-calendar">
        <Container>
          <div className="season-calendar-inner">
            <strong>Sezonski kalendar</strong>
            <div className="season-months">
              {months.map(([month, produce]) => (
                <div key={month}>
                  <span>{month}</span>
                  <small>{produce}</small>
                </div>
              ))}
            </div>
            <LinkButton href="/proizvodi" variant="secondary">
              Pogledaj ponudu
            </LinkButton>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Zašto Borska Farmica"
            title="Lokalno, jednostavno i bez skrivenih koraka"
          />
          <div className="values-grid">
            {[
              ['01', 'Lokalna ponuda', 'Proizvodi dostupni kupcima u Boru.'],
              [
                '02',
                'Jasno poručivanje',
                'Izaberete proizvode, pošaljete porudžbinu i sačekate potvrdu.',
              ],
              [
                '03',
                'Lično preuzimanje',
                'Na adresi Nade Dimić 30 ili subotom na Gradskoj pijaci Bor.',
              ],
              [
                '04',
                'Gotovinsko plaćanje',
                'Plaćate uživo tek kada preuzmete porudžbinu.',
              ],
            ].map(([number, title, description]) => (
              <article key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </Container>
      </Section>
      <Section className="steps">
        <Container>
          <SectionHeading
            eyebrow="Kako funkcioniše"
            title="Od izbora do preuzimanja u četiri koraka"
          />
          <ol>
            {[
              'Napravite nalog i izaberete proizvode.',
              'Pošaljete porudžbinu.',
              'Sačekate potvrdu Borske Farmice.',
              'Preuzmete i platite gotovinom.',
            ].map((item, index) => (
              <li key={item}>
                <span>{index + 1}</span>
                <strong>{item}</strong>
              </li>
            ))}
          </ol>
          <p className="steps-note">
            Kupovina zahteva korisnički nalog. Nema online plaćanja — plaćanje
            je isključivo gotovinom prilikom preuzimanja.
          </p>
        </Container>
      </Section>
      <Section id="lokacije">
        <Container>
          <SectionHeading
            eyebrow="Preuzimanje"
            title="Dve jednostavne opcije u Boru"
          />
          <div className="location-grid">
            <article>
              <p className="card-kicker">Lično preuzimanje</p>
              <h3>Borska Farmica — Nade Dimić 30, Bor</h3>
              <p>
                Odmah ispod Stovarišta Našković. Termin potvrđujemo nakon
                poručivanja.
              </p>
              <a
                href="https://www.google.com/maps/search/?api=1&query=Nade+Dimi%C4%87+30%2C+Bor"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pronađi adresu na mapi
              </a>
            </article>
            <article>
              <p className="card-kicker">Subotom</p>
              <h3>Gradska pijaca Bor</h3>
              <p>
                Porudžbinu možete preuzeti ili proizvode kupiti direktno na
                pijaci subotom.
              </p>
              <LinkButton href="/preuzimanje" variant="secondary">
                Detalji preuzimanja
              </LinkButton>
            </article>
          </div>
        </Container>
      </Section>
      <Section className="final-cta">
        <Container>
          <div>
            <p className="eyebrow">Aktuelna ponuda</p>
            <h2>Pogledajte šta je trenutno dostupno.</h2>
            <p>Proverite proizvode i planirajte lično preuzimanje.</p>
            <LinkButton href="/proizvodi" variant="secondary">
              Pogledaj ponudu
            </LinkButton>
          </div>
        </Container>
      </Section>
    </>
  );
}
