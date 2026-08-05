import Image from 'next/image';
import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';

const values = [
  [
    '♙',
    'Briga o životinjama',
    'Životinje su deo svakodnevnog rada i odgovornosti.',
  ],
  [
    '♧',
    'Poštena proizvodnja',
    'Bez izmišljenih obećanja i bez skrivanja dostupnosti.',
  ],
  ['⌂', 'Lokalno i odgovorno', 'Ponuda je namenjena kupcima u Boru i okolini.'],
  [
    '✺',
    'Kvalitet bez prečica',
    'Radi se pažljivo, u ritmu stvarne proizvodnje i sezone.',
  ],
];

export function AboutContent() {
  return (
    <main className="about-reference-page">
      <section className="about-reference-hero">
        <Container>
          <div className="about-hero-copy">
            <nav aria-label="Putanja stranice">
              <Link href="/">Početna</Link>
              <span>/</span>
              <span>O nama</span>
            </nav>
            <p className="eyebrow">Naša priča</p>
            <h1>Mala farmica, velika ljubav prema domaćem.</h1>
            <p>
              Borska Farmica povezuje pažljivo pripremljene proizvode i kupce u
              Boru. Ponuda prati ono što je stvarno dostupno, bez suvišnih
              koraka i skrivenih obećanja.
            </p>
            <div className="hero-actions">
              <LinkButton href="#nasa-prica">Upoznajte farmicu →</LinkButton>
              <LinkButton href="/proizvodi" variant="secondary">
                Pogledaj proizvode
              </LinkButton>
            </div>
            <div className="about-hero-notes">
              <span>♡ Lokalna ponuda</span>
              <span>• Bor i okolina</span>
            </div>
          </div>
          <div className="about-hero-photo">
            <Image
              src="/images/farm-story-v2.webp"
              alt="Borska Farmica u zelenom okruženju Bora"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 58vw"
            />
            <div>
              <span>♧</span>
              <strong>
                Od srca,
                <br />
                svakog dana
              </strong>
            </div>
          </div>
        </Container>
      </section>

      <section className="about-fact-band">
        <Container>
          {[
            [
              '◎',
              'Porodična farmica',
              'Mala lokalna ponuda, sa pažnjom i posvećeno.',
            ],
            [
              '♧',
              'Domaće iz Bora',
              'Proizvodi i preuzimanje povezani sa lokalnom zajednicom.',
            ],
            [
              '☼',
              'U ritmu dana',
              'Ponuda zavisi od zaliha, pripreme i sezone.',
            ],
            [
              '⌖',
              'Bor, Srbija',
              'Preuzimanje na adresi ili subotom na pijaci.',
            ],
          ].map(([icon, title, text]) => (
            <article key={title}>
              <span>{icon}</span>
              <div>
                <strong>{title}</strong>
                <small>{text}</small>
              </div>
            </article>
          ))}
        </Container>
      </section>

      <section id="nasa-prica" className="about-story-section">
        <Container>
          <div className="about-story-photo">
            <Image
              src="/images/farm-story-v2.webp"
              alt="Prirodno okruženje Borske Farmice"
              fill
              sizes="(max-width: 800px) 100vw, 48vw"
            />
          </div>
          <div className="about-story-copy">
            <p className="eyebrow">Kako gradimo Borsku Farmicu</p>
            <h2>Lokalna ponuda koja raste korak po korak.</h2>
            <p>
              Borska Farmica ne pokušava da glumi veliki supermarket. U centru
              su mleko, surutka i sirevi, uz jaja, sezonsko voće, povrće i druge
              proizvode kada ih stvarno ima.
            </p>
            <p>
              Kupac bira iz aktuelnog kataloga, porudžbina se proverava i
              potvrđuje, a proizvodi se preuzimaju lično. Tako je ceo put od
              ponude do stola jasan.
            </p>
            <blockquote>
              „Najvažnije nam je da kupac zna šta je dostupno, gde preuzima i
              kada je porudžbina potvrđena.“
            </blockquote>
          </div>
        </Container>
      </section>

      <section className="about-values-section">
        <Container>
          <header>
            <p className="eyebrow">Ono što nam je važno</p>
            <h2>Vrednosti koje živimo</h2>
          </header>
          <div>
            {values.map(([icon, title, text]) => (
              <article key={title}>
                <span>{icon}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="about-day-section">
        <Container>
          <header>
            <p className="eyebrow">Od pripreme do preuzimanja</p>
            <h2>Jedan dan na našoj farmici</h2>
          </header>
          <div className="about-day-cards">
            <article>
              <div>
                <Image
                  src="/images/products/kozje-mleko.webp"
                  alt="Sveže kozje mleko"
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                />
              </div>
              <span>06:00</span>
              <h3>Početak dana</h3>
              <p>
                Provera proizvoda, zaliha i onoga što tog dana može da se
                ponudi.
              </p>
            </article>
            <article>
              <div>
                <Image
                  src="/images/products/mladi-kozji-sir.webp"
                  alt="Priprema mladog kozjeg sira"
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                />
              </div>
              <span>09:00</span>
              <h3>Priprema proizvoda</h3>
              <p>
                Pakovanja, varijante i količine pripremaju se za potvrđene
                porudžbine.
              </p>
            </article>
            <article>
              <div>
                <Image
                  src="/images/products/jaja.webp"
                  alt="Domaća jaja spremna za preuzimanje"
                  fill
                  sizes="(max-width: 700px) 100vw, 33vw"
                />
              </div>
              <span>Po dogovoru</span>
              <h3>Lično preuzimanje</h3>
              <p>
                Kupac preuzima potvrđenu porudžbinu i plaća gotovinom uživo.
              </p>
            </article>
          </div>
        </Container>
      </section>

      <section className="about-roles-section">
        <Container>
          <header>
            <p className="eyebrow">Iza svake porudžbine</p>
            <h2>Poslovi koji drže farmicu</h2>
          </header>
          <div>
            <article>
              <span>01</span>
              <div>
                <h3>Briga i proizvodnja</h3>
                <p>Svakodnevni rad, praćenje proizvoda i realne dostupnosti.</p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Priprema i kvalitet</h3>
                <p>Pakovanje i provera onoga što je spremno za kupca.</p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Porudžbine i preuzimanje</h3>
                <p>Potvrda termina, lokacije i neposredan kontakt sa kupcem.</p>
              </div>
            </article>
          </div>
        </Container>
      </section>

      <section className="about-origin-section">
        <Container>
          <div className="about-origin-photo">
            <Image
              src="/images/farm-hero.webp"
              alt="Sir, mleko i surutka Borske Farmice"
              fill
              sizes="(max-width: 800px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="eyebrow">Od farmice do stola</p>
            <h2>Znate odakle dolazi svaki zalogaj.</h2>
            <ul>
              <li>
                <strong>Jasna ponuda</strong>
                <span>Vidite aktivne proizvode, pakovanja i cenu.</span>
              </li>
              <li>
                <strong>Stvarna dostupnost</strong>
                <span>Zaliha i sezona određuju šta može da se poruči.</span>
              </li>
              <li>
                <strong>Direktno preuzimanje</strong>
                <span>Bez kurira i bez online naplate.</span>
              </li>
            </ul>
            <LinkButton href="/proizvodi">Istraži ponudu →</LinkButton>
          </div>
        </Container>
      </section>

      <section className="about-location-section">
        <Container>
          <div>
            <p className="eyebrow">Naš dom je u Boru</p>
            <h2>Lokalno i blizu.</h2>
            <p>
              Porudžbine se preuzimaju na adresi Nade Dimić 30, odmah ispod
              Stovarišta Našković, ili subotom na Gradskoj pijaci Bor.
            </p>
            <div className="about-location-list">
              <span>⌖ Nade Dimić 30, Bor</span>
              <span>⌖ Gradska pijaca Bor — subotom</span>
            </div>
            <LinkButton href="/kontakt">Kontaktirajte nas →</LinkButton>
          </div>
          <div
            className="about-map-art"
            aria-label="Ilustracija lokacije u Boru"
          >
            <span>⌖</span>
            <strong>Bor, Srbija</strong>
            <i />
            <i />
            <i />
          </div>
        </Container>
      </section>

      <section className="about-trust-section">
        <Container>
          <header>
            <p className="eyebrow">Jasan odnos sa kupcima</p>
            <h2>Zašto je kupovina jednostavna</h2>
          </header>
          <div>
            {[
              [
                '01',
                'Aktuelan katalog',
                'Prikazuje se ono što je aktivno i dostupno.',
              ],
              [
                '02',
                'Potvrda porudžbine',
                'Administrator proverava proizvode i termin.',
              ],
              [
                '03',
                'Plaćanje pri preuzimanju',
                'Gotovina tek kada preuzmete proizvode.',
              ],
            ].map(([number, title, text]) => (
              <article key={number}>
                <span>{number}</span>
                <strong>{title}</strong>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="about-final-cta">
        <Container>
          <div>
            <p className="eyebrow">Domaće iz Bora</p>
            <h2>Dođite da zajedno čuvamo ukus domaćeg.</h2>
            <p>
              Pogledajte šta je trenutno dostupno i izaberite lokaciju ličnog
              preuzimanja.
            </p>
            <div className="hero-actions">
              <LinkButton href="/proizvodi" variant="secondary">
                Pogledaj proizvode →
              </LinkButton>
              <LinkButton href="/kontakt" variant="secondary">
                Pišite nam
              </LinkButton>
            </div>
          </div>
          <Image
            src="/images/farm-hero.webp"
            alt="Proizvodi Borske Farmice"
            width={900}
            height={600}
          />
        </Container>
      </section>
    </main>
  );
}
