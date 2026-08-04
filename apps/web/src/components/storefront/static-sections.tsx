import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
export function StaticSections() {
  return (
    <>
      <Section className="seasonal">
        <Container className="seasonal-grid">
          <SectionHeading
            eyebrow="U ritmu sezone"
            title="Ponuda se menja kada priroda kaže da je vreme."
            description="Pored glavnih proizvoda, u ponudi se mogu naći sezonski plodovi i drugi proizvodi. Njihova dostupnost zavisi od sezone i trenutne ponude."
          />
          <div className="seasonal-lists">
            <div>
              <h3>Voće</h3>
              <p>Šljive, jabuke, kajsije, maline, kupine, kruške i smokve.</p>
            </div>
            <div>
              <h3>Povrće</h3>
              <p>Mladi, beli i crni luk, paradajz i krastavac.</p>
            </div>
            <div>
              <h3>Dodatno</h3>
              <p>Jaja, stajsko đubrivo i rakija — kada su u ponudi.</p>
            </div>
          </div>
        </Container>
      </Section>
      <Section>
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Zašto mi"
            title="Jednostavno, lokalno i direktno"
          />
          <div className="values-grid">
            {[
              [
                '01',
                'Lokalna ponuda',
                'Proizvodi Borske Farmice dostupni su kupcima u Boru.',
              ],
              [
                '02',
                'Jednostavno poručivanje',
                'Izaberete proizvode, pošaljete porudžbinu i sačekate potvrdu.',
              ],
              [
                '03',
                'Lično preuzimanje',
                'Preuzimanje na adresi ili na Gradskoj pijaci subotom.',
              ],
              [
                '04',
                'Sezonski izbor',
                'Ponuda prati sezonu i stvarnu dostupnost proizvoda.',
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
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
              'Izaberete proizvode.',
              'Pošaljete porudžbinu.',
              'Sačekate potvrdu Borske Farmice.',
              'Preuzmete i platite gotovinom.',
            ].map((x, i) => (
              <li key={x}>
                <span>{i + 1}</span>
                <strong>{x}</strong>
              </li>
            ))}
          </ol>
          <p className="steps-note">
            Kupovina zahteva korisnički nalog. Nema dostave ni online plaćanja —
            plaćanje je isključivo gotovinom prilikom preuzimanja.
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
              <p>Odmah ispod Stovarišta Našković.</p>
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
              <p>Proizvode možete kupiti na Gradskoj pijaci u Boru subotom.</p>
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
            <h2>Pogledajte šta je trenutno u ponudi.</h2>
            <p>
              Proverite dostupnost proizvoda, zatim planirajte lično
              preuzimanje.
            </p>
            <LinkButton href="#ponuda" variant="secondary">
              Pogledaj ponudu
            </LinkButton>
          </div>
        </Container>
      </Section>
    </>
  );
}
