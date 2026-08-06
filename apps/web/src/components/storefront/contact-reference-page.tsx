'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { Container } from '@/components/ui/container';
import { useFeedback } from '@/components/providers/feedback-provider';

const facebook = 'https://www.facebook.com/borska.farmica.3';
const mapUrl =
  'https://www.google.com/maps/search/?api=1&query=Nade+Dimi%C4%87+30%2C+Bor';

export function ContactReferencePage() {
  const feedback = useFeedback();
  const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    const data = new FormData(event.currentTarget);
    const message = [
      `Ime: ${data.get('name')}`,
      `Tema: ${data.get('topic')}`,
      data.get('orderNumber')
        ? `Broj porudžbine: ${data.get('orderNumber')}`
        : '',
      `Poruka: ${data.get('message')}`,
    ]
      .filter(Boolean)
      .join('\n');
    try {
      await navigator.clipboard.writeText(message);
      feedback(
        'Poruka je kopirana. Nalepite je u Facebook razgovor.',
        'success',
      );
    } catch {
      feedback('Otvaramo Facebook stranicu za kontakt.', 'info');
    }
    window.open(facebook, '_blank', 'noopener,noreferrer');
    setBusy(false);
  };

  return (
    <main className="contact-reference-page">
      <section className="contact-reference-hero">
        <Container>
          <div className="contact-hero-copy">
            <nav>
              <Link href="/">Početna</Link>
              <span>/</span>
              <span>Kontakt</span>
            </nav>
            <p className="eyebrow">Tu smo za vas</p>
            <h1>
              Javite nam se.
              <br />
              Rado ćemo pomoći.
            </h1>
            <p>
              Imate pitanje o proizvodima, porudžbini ili preuzimanju? Pišite
              nam preko zvanične Facebook stranice.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pošaljite poruku →
              </a>
              <Link className="button button-secondary" href="/preuzimanje">
                Pogledajte lokacije
              </Link>
            </div>
            <small>Odgovaramo čim budemo u mogućnosti.</small>
          </div>
          <div className="contact-hero-photo">
            <Image
              src="/images/licno-preuzimanje.webp"
              alt="Borska Farmica u Boru"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 58vw"
            />
            <div>
              <span>♧</span>
              <strong>
                Tu smo da
                <br />
                pomognemo
              </strong>
            </div>
          </div>
        </Container>
      </section>

      <section className="contact-cards">
        <Container>
          <article>
            <span>f</span>
            <div>
              <h2>Facebook</h2>
              <p>Zvanična stranica Borske Farmice</p>
              <a href={facebook} target="_blank" rel="noopener noreferrer">
                Pošaljite poruku →
              </a>
            </div>
          </article>
          <article>
            <span>⌖</span>
            <div>
              <h2>Naša adresa</h2>
              <p>
                Nade Dimić 30, Bor
                <br />
                ispod Stovarišta Našković
              </p>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                Pogledajte mapu →
              </a>
            </div>
          </article>
          <article>
            <span>♜</span>
            <div>
              <h2>Gradska pijaca</h2>
              <p>
                Gradska pijaca Bor
                <br />
                svake subote
              </p>
              <Link href="/preuzimanje">Detalji preuzimanja →</Link>
            </div>
          </article>
          <article>
            <span>🛒</span>
            <div>
              <h2>Online porudžbina</h2>
              <p>Rezervišite proizvode iz kataloga</p>
              <Link href="/proizvodi">Pogledajte ponudu →</Link>
            </div>
          </article>
        </Container>
      </section>

      <section className="contact-form-section">
        <Container>
          <form onSubmit={submit}>
            <header>
              <p className="eyebrow">Napišite nam</p>
              <h2>Pripremite poruku</h2>
              <p>
                Forma priprema i kopira tekst, a zatim otvara našu zvaničnu
                Facebook stranicu.
              </p>
            </header>
            <div className="contact-form-grid">
              <label>
                <span>Ime i prezime *</span>
                <input required name="name" autoComplete="name" />
              </label>
              <label>
                <span>Tema *</span>
                <select required name="topic">
                  <option value="">Izaberite temu</option>
                  <option>Pitanje o proizvodu</option>
                  <option>Postojeća porudžbina</option>
                  <option>Preuzimanje</option>
                  <option>Drugo</option>
                </select>
              </label>
              <label>
                <span>Broj porudžbine</span>
                <input name="orderNumber" placeholder="Opciono" />
              </label>
              <label className="full">
                <span>Poruka *</span>
                <textarea
                  required
                  name="message"
                  rows={7}
                  placeholder="Napišite svoju poruku…"
                />
              </label>
            </div>
            <button className="button button-primary" disabled={busy}>
              {busy ? 'Pripremamo…' : 'Nastavi na Facebook →'}
            </button>
            <small>
              Poruka se ne čuva na sajtu i nije poslata dok je ne pošaljete u
              Facebook razgovoru.
            </small>
          </form>
          <aside>
            <p className="eyebrow">Kontakt podaci</p>
            <h2>Izaberite način koji vam odgovara.</h2>
            <p>
              Tu smo da pomognemo oko ponude, porudžbine i ličnog preuzimanja.
            </p>
            <dl>
              <div>
                <dt>Facebook</dt>
                <dd>
                  <a href={facebook} target="_blank" rel="noopener noreferrer">
                    Borska Farmica
                  </a>
                </dd>
              </div>
              <div>
                <dt>Adresa</dt>
                <dd>Nade Dimić 30, Bor</dd>
              </div>
              <div>
                <dt>Pijaca</dt>
                <dd>Gradska pijaca Bor — subotom</dd>
              </div>
              <div>
                <dt>Plaćanje</dt>
                <dd>Gotovina prilikom preuzimanja</dd>
              </div>
            </dl>
            <Image
              src="/images/ponuda-farme.webp"
              alt="Ponuda Borske Farmice"
              width={420}
              height={250}
            />
            <div className="existing-order-box">
              <h3>Pitanje o postojećoj porudžbini?</h3>
              <p>
                Pripremite broj porudžbine kako bismo lakše proverili detalje.
              </p>
              <Link
                className="button button-secondary"
                href="/nalog/porudzbine"
              >
                Pronađi porudžbinu →
              </Link>
            </div>
          </aside>
        </Container>
      </section>

      <section className="contact-map-section">
        <Container>
          <header>
            <p className="eyebrow">Lično preuzimanje</p>
            <h2>Pronađite nas u Boru</h2>
          </header>
          <div className="contact-map-layout">
            <a
              className="contact-map-embed"
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Otvori lokaciju Borske Farmice u Google mapama"
            >
              <iframe
                title="Mapa lokacije Borske Farmice"
                src="https://www.google.com/maps?q=Nade%20Dimi%C4%87%2030%2C%20Bor%2C%20Serbia&output=embed"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                tabIndex={-1}
              />
              <span>Otvori mapu</span>
            </a>
            <article>
              <span>⌖</span>
              <h3>Preuzimanje na adresi</h3>
              <p>Nade Dimić 30, odmah ispod Stovarišta Našković.</p>
              <span>◷</span>
              <h3>Po dogovorenom terminu</h3>
              <p>Pre dolaska sačekajte admin potvrdu porudžbine.</p>
              <a
                className="button button-primary"
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Otvori u mapama →
              </a>
            </article>
          </div>
        </Container>
      </section>

      <section className="contact-help-topics">
        <Container>
          <header>
            <p className="eyebrow">Pitajte nas</p>
            <h2>Kako vam možemo pomoći?</h2>
          </header>
          <div>
            {[
              [
                '♧',
                'Pitanja o proizvodima',
                'Sastav, dostupnost, pakovanja i aktuelna ponuda.',
              ],
              [
                '▤',
                'Porudžbine',
                'Status porudžbine, potvrda i izmene pre pripreme.',
              ],
              [
                '⌖',
                'Lično preuzimanje',
                'Lokacije, dogovoreni termin i subotnja pijaca.',
              ],
              [
                '♢',
                'Saradnja',
                'Predlozi, saradnja i druga pitanja za Farmicu.',
              ],
            ].map(([icon, title, text]) => (
              <article key={title}>
                <span>{icon}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <a href={facebook} target="_blank" rel="noopener noreferrer">
                  Saznajte više →
                </a>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="contact-response-section">
        <Container>
          <header>
            <p className="eyebrow">Lično i pažljivo</p>
            <h2>Odgovaramo čim možemo</h2>
          </header>
          <div className="contact-response-layout">
            <div className="contact-response-images">
              <Image
                src="/images/products/mladi-kozji-sir.webp"
                alt="Domaći sir"
                width={250}
                height={230}
              />
              <Image
                src="/images/products/kozje-mleko.webp"
                alt="Kozje mleko"
                width={250}
                height={230}
              />
              <Image
                src="/images/products/jaja.webp"
                alt="Domaća jaja"
                width={250}
                height={230}
              />
            </div>
            <ol>
              <li>
                <span>1</span>
                <div>
                  <strong>Pregledamo poruku</strong>
                  <p>Pažljivo čitamo pitanje i proveravamo detalje.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Javljamo se sa jasnim odgovorom</strong>
                  <p>Odgovaramo konkretno, bez skrivenih obećanja.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Zajedno rešavamo pitanje</strong>
                  <p>Cilj je da tačno znate sledeći korak.</p>
                </div>
              </li>
            </ol>
            <blockquote>
              „Iza svake poruke je stvarna osoba — zato odgovaramo pažljivo.“
            </blockquote>
          </div>
        </Container>
      </section>

      <section className="contact-faq">
        <Container>
          <header>
            <p className="eyebrow">Korisne informacije</p>
            <h2>Najčešća pitanja</h2>
          </header>
          <div>
            {[
              [
                'Kada mogu da očekujem odgovor?',
                'Odgovaramo čim budemo u mogućnosti preko zvanične Facebook stranice.',
              ],
              [
                'Kako mogu da proverim status porudžbine?',
                'Prijavite se i otvorite Moj nalog, zatim Moje porudžbine.',
              ],
              [
                'Mogu li da promenim porudžbinu?',
                'Javite se što pre. Izmena zavisi od trenutnog statusa i da li je priprema već počela.',
              ],
              [
                'Gde se preuzima porudžbina?',
                'Na Nade Dimić 30 po potvrđenom terminu ili na Gradskoj pijaci Bor subotom.',
              ],
              [
                'Da li vršite dostavu?',
                'Ne. Omogućeno je isključivo lično preuzimanje.',
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

      <section className="contact-social">
        <Container>
          <div>
            <p className="eyebrow">Novosti sa farmice</p>
            <h2>Pratite život na farmi</h2>
            <p>Nove proizvode i informacije o ponudi pratite na Facebooku.</p>
            <a
              className="button button-secondary"
              href={facebook}
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>
          </div>
          {[
            'farm-story-v2.webp',
            'products/mladi-kozji-sir.webp',
            'products/kozje-mleko.webp',
            'products/paradajz.webp',
          ].map((image) => (
            <div key={image}>
              <Image
                src={`/images/${image}`}
                alt="Borska Farmica"
                fill
                sizes="(max-width: 700px) 50vw, 18vw"
              />
            </div>
          ))}
        </Container>
      </section>
      <section className="contact-final-cta">
        <Container>
          <div>
            <p className="eyebrow">Razgovor je najbolji početak</p>
            <h2>Pišite nam kada imate pitanje.</h2>
            <div className="hero-actions">
              <a
                className="button button-secondary"
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                Pošaljite poruku →
              </a>
              <Link className="button button-secondary" href="/proizvodi">
                Pogledajte ponudu
              </Link>
            </div>
          </div>
          <Image
            src="/images/pakovanje-proizvoda.webp"
            alt="Borska Farmica"
            width={620}
            height={300}
          />
        </Container>
      </section>
    </main>
  );
}
