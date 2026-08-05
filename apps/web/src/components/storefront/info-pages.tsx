import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
const facts = [
  ['Lokalno', 'Ponuda iz Bora, direktno od Borske Farmice.'],
  ['Stvarno dostupno', 'Katalog prati aktivne proizvode, sezonu i zalihe.'],
  ['Lično', 'Preuzimanje na adresi ili subotom na pijaci.'],
  ['Jednostavno', 'Gotovinsko plaćanje tek kada preuzmete proizvode.'],
];
export function AboutContent() {
  return (
    <main className="story-page">
      <section className="info-hero story-hero">
        <Container>
          <p className="eyebrow">Naša priča</p>
          <h1>Mala lokalna ponuda sa jasnim poreklom.</h1>
          <p className="info-lead">
            Borska Farmica povezuje domaće proizvode i kupce u Boru bez
            komplikovane dostave i skrivenih obećanja. U centru ponude su mleko,
            surutka i sirevi, a ostatak kataloga prati sezonu i ono što je
            zaista spremno.
          </p>
          <div className="hero-actions">
            <LinkButton href="/proizvodi">Pogledaj ponudu</LinkButton>
            <LinkButton href="/preuzimanje" variant="secondary">
              Kako preuzimate
            </LinkButton>
          </div>
        </Container>
      </section>
      <section className="info-band">
        <Container className="fact-strip">
          {facts.map(([t, d]) => (
            <article key={t}>
              <strong>{t}</strong>
              <span>{d}</span>
            </article>
          ))}
        </Container>
      </section>
      <section className="section">
        <Container className="editorial-grid">
          <div>
            <p className="eyebrow">Šta nam je važno</p>
            <h2>Ponuda koja ne glumi supermarket.</h2>
          </div>
          <div className="editorial-copy">
            <p>
              Ne prikazujemo proizvod kao dostupan samo zato što postoji u bazi.
              Aktivna varijanta, stvarno stanje zalihe i sezonski period zajedno
              određuju da li nešto može da se poruči.
            </p>
            <p>
              Kupac prvo bira iz aktuelne ponude. Borska Farmica zatim potvrđuje
              porudžbinu i dogovara preuzimanje. Tako i kupac i prodavac znaju
              šta se priprema i kada.
            </p>
          </div>
        </Container>
      </section>
      <section className="section muted-section">
        <Container>
          <div className="info-card-grid">
            <article>
              <span>01</span>
              <h2>Glavna ponuda</h2>
              <p>
                Mleko, surutka i sirevi imaju najveći značaj u katalogu, uz
                jasne varijante pakovanja i cenu.
              </p>
            </article>
            <article>
              <span>02</span>
              <h2>Sezonski proizvodi</h2>
              <p>
                Voće, povrće i dodatna ponuda pojavljuju se kada je njihov
                period i kada ih stvarno ima.
              </p>
            </article>
            <article>
              <span>03</span>
              <h2>Direktan odnos</h2>
              <p>
                Nema kurirske službe ni online naplate. Potvrda, preuzimanje i
                plaćanje ostaju neposredni.
              </p>
            </article>
          </div>
        </Container>
      </section>
      <section className="section">
        <Container className="quote-panel">
          <p>
            „Domaće“ za nas nije ukrasna reč. To znači da znate od koga
            kupujete, gde preuzimate i šta je tog dana stvarno dostupno.
          </p>
          <Link href="/kontakt">Kontaktirajte Borsku Farmicu →</Link>
        </Container>
      </section>
    </main>
  );
}
export function PickupContent() {
  return (
    <main className="story-page">
      <section className="info-hero pickup-hero">
        <Container>
          <p className="eyebrow">Preuzimanje u Boru</p>
          <h1>Poručite unapred. Preuzmite lično. Platite gotovinom.</h1>
          <p className="info-lead">
            Nema dostave i nema online plaćanja. Nakon slanja porudžbine
            sačekajte potvrdu Borske Farmice i tek tada planirajte dolazak.
          </p>
        </Container>
      </section>
      <section className="section">
        <Container>
          <div className="process-grid">
            {[
              ['1', 'Izaberite', 'Dodajte dostupne proizvode u korpu.'],
              [
                '2',
                'Pošaljite',
                'Prijavite se i izaberite lokaciju i željeni datum.',
              ],
              ['3', 'Sačekajte potvrdu', 'Admin proverava proizvode i termin.'],
              [
                '4',
                'Preuzmite',
                'Dođite na dogovoreno mesto i platite gotovinom.',
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span>{n}</span>
                <h2>{t}</h2>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <section className="section muted-section">
        <Container>
          <div className="pickup-location-grid">
            <article>
              <p className="card-kicker">Lično preuzimanje</p>
              <h2>Nade Dimić 30, Bor</h2>
              <p className="location-note">Odmah ispod Stovarišta Našković.</p>
              <ul>
                <li>Termin se potvrđuje nakon porudžbine</li>
                <li>Plaćanje isključivo gotovinom</li>
                <li>Porudžbina mora imati potvrđen status</li>
              </ul>
              <a
                className="button button-primary"
                href="https://www.google.com/maps/search/?api=1&query=Nade+Dimi%C4%87+30%2C+Bor"
                target="_blank"
                rel="noopener noreferrer"
              >
                Otvori mapu
              </a>
            </article>
            <article className="market-card">
              <p className="card-kicker">Svake subote</p>
              <h2>Gradska pijaca Bor</h2>
              <p className="location-note">
                Dođite do naše tezge i kupite proizvode koji su tog dana u
                ponudi.
              </p>
              <ul>
                <li>Subotnja prodaja na Gradskoj pijaci</li>
                <li>Za veću ili posebnu porudžbinu rezervišite unapred</li>
                <li>Dostupnost zavisi od ponude i zaliha</li>
              </ul>
              <LinkButton href="/proizvodi" variant="secondary">
                Proveri ponudu
              </LinkButton>
            </article>
          </div>
        </Container>
      </section>
      <section className="section">
        <Container className="faq-block">
          <div>
            <p className="eyebrow">Važne informacije</p>
            <h2>Pre nego što krenete</h2>
          </div>
          <div>
            {[
              [
                'Da li postoji dostava?',
                'Ne. Trenutno je omogućeno samo lično preuzimanje u Boru.',
              ],
              [
                'Da li mogu da platim karticom?',
                'Ne. Plaćanje je isključivo gotovinom prilikom preuzimanja.',
              ],
              [
                'Da li mogu odmah doći po robu?',
                'Sačekajte da administrator potvrdi porudžbinu i termin.',
              ],
              [
                'Da li mogu kupiti bez online porudžbine?',
                'Subotom možete doći na Gradsku pijacu i kupiti ono što je tog dana dostupno.',
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>
    </main>
  );
}
export function ContactContent() {
  return (
    <main className="story-page">
      <section className="info-hero contact-hero">
        <Container>
          <p className="eyebrow">Kontakt</p>
          <h1>Tu smo za pitanja o ponudi i preuzimanju.</h1>
          <p className="info-lead">
            Za aktuelne informacije, dogovor oko potvrđene porudžbine i novosti
            koristite našu Facebook stranicu ili posetite lokaciju u Boru.
          </p>
        </Container>
      </section>
      <section className="section">
        <Container className="contact-layout">
          <div className="contact-primary">
            <p className="card-kicker">Borska Farmica</p>
            <h2>Nade Dimić 30, Bor</h2>
            <p>Odmah ispod Stovarišta Našković.</p>
            <a
              className="button button-primary"
              href="https://www.google.com/maps/search/?api=1&query=Nade+Dimi%C4%87+30%2C+Bor"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pronađi na mapi
            </a>
          </div>
          <div className="contact-options">
            <article>
              <span>Facebook</span>
              <h2>Aktuelne objave</h2>
              <p>
                Pratite novosti i javite se preko zvanične Facebook stranice.
              </p>
              <a
                href="https://www.facebook.com/borska.farmica.3"
                target="_blank"
                rel="noopener noreferrer"
              >
                Otvori Facebook →
              </a>
            </article>
            <article>
              <span>Gradska pijaca</span>
              <h2>Subotom u Boru</h2>
              <p>Posetite nas subotom i pogledajte trenutnu ponudu na tezgi.</p>
              <Link href="/preuzimanje">Detalji preuzimanja →</Link>
            </article>
            <article>
              <span>Online porudžbina</span>
              <h2>Rezervišite proizvode</h2>
              <p>
                Izaberite proizvode, pošaljite porudžbinu i sačekajte potvrdu.
              </p>
              <Link href="/proizvodi">Otvori katalog →</Link>
            </article>
            <article>
              <span>Plaćanje</span>
              <h2>Gotovina pri preuzimanju</h2>
              <p>Ne tražimo podatke kartice i nema online naplate.</p>
            </article>
          </div>
        </Container>
      </section>
      <section className="section muted-section">
        <Container className="contact-note">
          <div>
            <p className="eyebrow">Napomena</p>
            <h2>Telefon i email još nisu javno potvrđeni.</h2>
          </div>
          <p>
            Ne objavljujemo izmišljene ili nepotvrđene kontakt podatke. Kada
            vlasnik potvrdi poslovni telefon i email, mogu se dodati u header,
            kontakt stranicu, strukturirane SEO podatke i potvrde porudžbine.
          </p>
        </Container>
      </section>
    </main>
  );
}
