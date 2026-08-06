import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';

const mapUrl =
  'https://www.google.com/maps/search/?api=1&query=Nade+Dimi%C4%87+30%2C+Bor';
const marketMapUrl =
  'https://www.google.com/maps/search/?api=1&query=Zelena+pijaca%2C+Majdanpe%C4%8Dka+bb%2C+19210+Bor';

export function PickupContent() {
  return (
    <main className="pickup-reference-page">
      <section className="pickup-reference-hero">
        <Container>
          <div className="pickup-hero-copy">
            <nav aria-label="Putanja stranice">
              <Link href="/">Početna</Link>
              <span>/</span>
              <span>Preuzimanje</span>
            </nav>
            <p className="eyebrow">Lično preuzimanje u Boru</p>
            <h1>Sveže sa farmice, spremno za vas.</h1>
            <p>
              Poručite unapred, sačekajte potvrdu i preuzmite proizvode na našoj
              adresi ili subotom na Gradskoj pijaci Bor.
            </p>
            <div className="hero-actions">
              <LinkButton href="/proizvodi">Pogledaj ponudu →</LinkButton>
              <LinkButton href="#lokacije" variant="secondary">
                Pogledaj lokacije
              </LinkButton>
            </div>
            <div className="pickup-hero-notes">
              <span>✓ Admin potvrđuje</span>
              <span>✓ Gotovina uživo</span>
              <span>✓ Bez minimalnog iznosa</span>
            </div>
          </div>
          <div className="pickup-hero-photo">
            <Image
              src="/images/licno-preuzimanje.webp"
              alt="Proizvodi Borske Farmice spremni za lično preuzimanje"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 58vw"
            />
            <div>
              <span>⌖</span>
              <strong>
                Dve lokacije
                <br />u Boru
              </strong>
            </div>
          </div>
        </Container>
      </section>

      <section id="lokacije" className="pickup-option-section">
        <Container>
          <article>
            <a
              className="pickup-option-map"
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Otvori Nade Dimic 30 u Google mapama"
            >
              <iframe
                title="Mapa adrese Nade Dimic 30, Bor"
                src="https://www.google.com/maps?q=Nade%20Dimi%C4%87%2030%2C%20Bor%2C%20Serbia&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                tabIndex={-1}
              />
              <span>Ku&#263;a - Nade Dimi&#263; 30</span>
            </a>
            <div>
              <p className="eyebrow">Po potvrđenom terminu</p>
              <h2>Nade Dimić 30, Bor</h2>
              <p>
                Naša adresa je odmah ispod Stovarišta Našković. Dođite tek kada
                administrator potvrdi porudžbinu i termin.
              </p>
              <ul>
                <li>Bez naknade za preuzimanje</li>
                <li>Dogovoren termin</li>
                <li>Plaćanje gotovinom</li>
              </ul>
              <a
                className="button button-primary"
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Otvori mapu →
              </a>
            </div>
          </article>
          <article>
            <a
              className="pickup-option-map"
              href={marketMapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Otvori Gradsku pijacu Bor u Google mapama"
            >
              <iframe
                title="Mapa Zelene pijace u Boru"
                src="https://www.google.com/maps?q=Zelena%20pijaca%2C%20Majdanpe%C4%8Dka%20bb%2C%2019210%20Bor%2C%20Serbia&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                tabIndex={-1}
              />
              <span>Pijaca - Majdanpe&#269;ka bb</span>
            </a>
            <div>
              <p className="eyebrow">Svake subote</p>
              <h2>Gradska pijaca Bor</h2>
              <address>Majdanpe&#269;ka bb, 19210 Bor</address>
              <p>
                Posetite našu tezgu subotom i kupite ono što je tog dana
                dostupno. Veće i posebne porudžbine rezervišite unapred.
              </p>
              <ul>
                <li>Kupovina direktno na tezgi</li>
                <li>Ponuda zavisi od zaliha i sezone</li>
                <li>Gotovinsko plaćanje</li>
              </ul>
              <LinkButton href="/proizvodi">Proveri ponudu →</LinkButton>
            </div>
          </article>
        </Container>
      </section>

      <section className="pickup-map-section">
        <Container>
          <header>
            <p className="eyebrow">Gde nas nalazite</p>
            <h2>Dve jednostavne opcije u Boru</h2>
          </header>
          <div className="pickup-map-layout">
            <div className="pickup-location-photo">
              <Image
                src="/images/pastir-i-koze.webp"
                alt="Koze na zelenom pasnjaku Borske Farmice kod Bora"
                fill
                sizes="(max-width: 900px) 100vw, 55vw"
              />
              <div>
                <span>Bor, isto&#269;na Srbija</span>
                <strong>Doma&#263;e, lokalno i li&#269;no.</strong>
                <small>Dve sigurne lokacije za preuzimanje.</small>
              </div>
            </div>
            <div className="pickup-location-list">
              <article>
                <span>01</span>
                <div>
                  <h3>Preuzimanje na adresi</h3>
                  <strong>Nade Dimić 30, Bor</strong>
                  <p>
                    Odmah ispod Stovarišta Našković. Termin stiže nakon admin
                    potvrde.
                  </p>
                </div>
              </article>
              <article>
                <span>02</span>
                <div>
                  <h3>Subotnja pijaca</h3>
                  <strong>Gradska pijaca Bor</strong>
                  <p>
                    Dođite subotom do naše tezge ili unapred rezervišite
                    proizvode.
                  </p>
                </div>
              </article>
              <div className="pickup-location-actions">
                <a
                  className="button button-primary"
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mapa do ku&#263;e &#8594;
                </a>
                <a
                  className="button button-secondary"
                  href={marketMapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Mapa do pijace &#8594;
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="pickup-process-section">
        <Container>
          <header>
            <p className="eyebrow">Od korpe do preuzimanja</p>
            <h2>Kako funkcioniše porudžbina</h2>
          </header>
          <div className="pickup-process-grid">
            {[
              [
                '1',
                '🛒',
                'Izaberite proizvode',
                'Prijavite se i dodajte dostupne proizvode u korpu.',
              ],
              [
                '2',
                '⌖',
                'Izaberite lokaciju',
                'Odaberite adresu ili Gradsku pijacu subotom.',
              ],
              [
                '3',
                '✓',
                'Sačekajte potvrdu',
                'Administrator proverava zalihe, lokaciju i termin.',
              ],
              [
                '4',
                '▣',
                'Preuzmite i platite',
                'Dođite na dogovoreno mesto i platite gotovinom.',
              ],
            ].map(([n, icon, title, text]) => (
              <article key={n}>
                <span className="step-number">{n}</span>
                <i>{icon}</i>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="pickup-care-section">
        <Container>
          <div className="pickup-care-photo">
            <Image
              src="/images/pakovanje-proizvoda.webp"
              alt="Lokalna Borska Farmica"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="eyebrow">Spremno za vaš dolazak</p>
            <h2>Porudžbinu pripremamo tek nakon potvrde.</h2>
            <ul>
              <li>
                <strong>Proverena dostupnost</strong>
                <span>
                  Administrator potvrđuje da su izabrani proizvodi na stanju.
                </span>
              </li>
              <li>
                <strong>Pažljivo pripremljeno</strong>
                <span>
                  Porudžbina čeka na izabranoj lokaciji u dogovorenom terminu.
                </span>
              </li>
              <li>
                <strong>Jasno i bez skrivenih troškova</strong>
                <span>
                  Nema dostave, online naplate ni minimalnog iznosa porudžbine.
                </span>
              </li>
            </ul>
            <blockquote>
              „Porudžbina je spremna tek kada dobijete potvrdu.“
            </blockquote>
          </div>
        </Container>
      </section>

      <section className="pickup-details-section">
        <Container>
          <article>
            <p className="eyebrow">Lično preuzimanje</p>
            <h2>Nade Dimić 30</h2>
            <dl>
              <div>
                <dt>Lokacija</dt>
                <dd>Odmah ispod Stovarišta Našković</dd>
              </div>
              <div>
                <dt>Termin</dt>
                <dd>Po potvrdi porudžbine</dd>
              </div>
              <div>
                <dt>Plaćanje</dt>
                <dd>Isključivo gotovinom uživo</dd>
              </div>
            </dl>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer">
              Otvori Google mapu →
            </a>
          </article>
          <div className="pickup-details-photo">
            <Image
              src="/images/products/mladi-kozji-sir.webp"
              alt="Domaći proizvodi spremni za preuzimanje"
              fill
              sizes="(max-width: 700px) 100vw, 34vw"
            />
          </div>
          <article>
            <p className="eyebrow">Subotom</p>
            <h2>Gradska pijaca Bor</h2>
            <dl>
              <div>
                <dt>Dan</dt>
                <dd>Svake subote</dd>
              </div>
              <div>
                <dt>Kupovina</dt>
                <dd>Na tezgi ili uz rezervaciju</dd>
              </div>
              <div>
                <dt>Dostupnost</dt>
                <dd>Prema zalihama tog dana</dd>
              </div>
            </dl>
            <Link href="/proizvodi">Rezerviši iz ponude →</Link>
          </article>
        </Container>
      </section>

      <section className="pickup-payment-section">
        <Container>
          <header>
            <p className="eyebrow">Način plaćanja</p>
            <h2>Jednostavno i uživo</h2>
          </header>
          <div>
            <article>
              <span>▤</span>
              <h3>Gotovina pri preuzimanju</h3>
              <p>Plaćate tek kada lično preuzmete proizvode.</p>
            </article>
            <article>
              <span>⊘</span>
              <h3>Nema online naplate</h3>
              <p>Ne unosite karticu i nema plaćanja unapred.</p>
            </article>
            <article>
              <span>✓</span>
              <h3>Admin potvrda</h3>
              <p>Pre dolaska dobijate potvrdu porudžbine i termina.</p>
            </article>
          </div>
        </Container>
      </section>

      <section className="pickup-faq-section">
        <Container>
          <header>
            <p className="eyebrow">Korisne informacije</p>
            <h2>Česta pitanja o preuzimanju</h2>
          </header>
          <div>
            {[
              [
                'Da li vršite dostavu?',
                'Ne. Trenutno su dostupni samo lično preuzimanje na adresi i kupovina subotom na Gradskoj pijaci Bor.',
              ],
              [
                'Kada mogu doći na Nade Dimić 30?',
                'Nakon što administrator potvrdi porudžbinu i dogovoreni termin.',
              ],
              [
                'Mogu li da kupim bez online porudžbine?',
                'Na Gradskoj pijaci Bor subotom možete kupiti ono što je tog dana dostupno. Za sigurnu rezervaciju poručite unapred.',
              ],
              [
                'Kako se plaća?',
                'Isključivo gotovinom i uživo, prilikom preuzimanja.',
              ],
              [
                'Postoji li minimalni iznos?',
                'Ne, ne postoji minimalni iznos porudžbine.',
              ],
            ].map(([q, a], index) => (
              <details key={q} open={index === 0}>
                <summary>
                  {q}
                  <span>+</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </Container>
      </section>

      <section className="pickup-final-cta">
        <Container>
          <div>
            <p className="eyebrow">Domaće iz Bora</p>
            <h2>Vaša sledeća porudžbina čeka na pravom mestu.</h2>
            <p>Izaberite proizvode, lokaciju i sačekajte našu potvrdu.</p>
            <div className="hero-actions">
              <LinkButton href="/proizvodi" variant="secondary">
                Poručite sada →
              </LinkButton>
              <LinkButton href="/kontakt" variant="secondary">
                Pitajte nas
              </LinkButton>
            </div>
          </div>
          <Image
            src="/images/ponuda-farme.webp"
            alt="Ponuda Borske Farmice"
            width={600}
            height={300}
          />
        </Container>
      </section>
    </main>
  );
}
