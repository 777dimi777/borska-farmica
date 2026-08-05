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
        ? `Broj porudÅ¾bine: ${data.get('orderNumber')}`
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
              <Link href="/">PoÄetna</Link>
              <span>/</span>
              <span>Kontakt</span>
            </nav>
            <p className="eyebrow">Tu smo za vas</p>
            <h1>
              Javite nam se.
              <br />
              Rado Ä‡emo pomoÄ‡i.
            </h1>
            <p>
              Imate pitanje o proizvodima, porudÅ¾bini ili preuzimanju? PiÅ¡ite
              nam preko zvaniÄne Facebook stranice.
            </p>
            <div className="hero-actions">
              <a
                className="button button-primary"
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                PoÅ¡aljite poruku â†’
              </a>
              <Link className="button button-secondary" href="/preuzimanje">
                Pogledajte lokacije
              </Link>
            </div>
            <small>Odgovaramo Äim budemo u moguÄ‡nosti.</small>
          </div>
          <div className="contact-hero-photo">
            <Image
              src="/images/farm-story-v2.webp"
              alt="Borska Farmica u Boru"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 58vw"
            />
            <div>
              <span>â™§</span>
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
              <p>ZvaniÄna stranica Borske Farmice</p>
              <a href={facebook} target="_blank" rel="noopener noreferrer">
                PoÅ¡aljite poruku â†’
              </a>
            </div>
          </article>
          <article>
            <span>âŒ–</span>
            <div>
              <h2>NaÅ¡a adresa</h2>
              <p>
                Nade DimiÄ‡ 30, Bor
                <br />
                ispod StovariÅ¡ta NaÅ¡koviÄ‡
              </p>
              <a href={mapUrl} target="_blank" rel="noopener noreferrer">
                Pogledajte mapu â†’
              </a>
            </div>
          </article>
          <article>
            <span>â™œ</span>
            <div>
              <h2>Gradska pijaca</h2>
              <p>
                Gradska pijaca Bor
                <br />
                svake subote
              </p>
              <Link href="/preuzimanje">Detalji preuzimanja â†’</Link>
            </div>
          </article>
          <article>
            <span>ðŸ›’</span>
            <div>
              <h2>Online porudÅ¾bina</h2>
              <p>RezerviÅ¡ite proizvode iz kataloga</p>
              <Link href="/proizvodi">Pogledajte ponudu â†’</Link>
            </div>
          </article>
        </Container>
      </section>

      <section className="contact-form-section">
        <Container>
          <form onSubmit={submit}>
            <header>
              <p className="eyebrow">NapiÅ¡ite nam</p>
              <h2>Pripremite poruku</h2>
              <p>
                Forma priprema i kopira tekst, a zatim otvara naÅ¡u zvaniÄnu
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
                  <option>PostojeÄ‡a porudÅ¾bina</option>
                  <option>Preuzimanje</option>
                  <option>Drugo</option>
                </select>
              </label>
              <label>
                <span>Broj porudÅ¾bine</span>
                <input name="orderNumber" placeholder="Opciono" />
              </label>
              <label className="full">
                <span>Poruka *</span>
                <textarea
                  required
                  name="message"
                  rows={7}
                  placeholder="NapiÅ¡ite svoju porukuâ€¦"
                />
              </label>
            </div>
            <button className="button button-primary" disabled={busy}>
              {busy ? 'Pripremamoâ€¦' : 'Nastavi na Facebook â†’'}
            </button>
            <small>
              Poruka se ne Äuva na sajtu i nije poslata dok je ne poÅ¡aljete u
              Facebook razgovoru.
            </small>
          </form>
          <aside>
            <p className="eyebrow">Kontakt podaci</p>
            <h2>Izaberite naÄin koji vam odgovara.</h2>
            <p>
              Tu smo da pomognemo oko ponude, porudÅ¾bine i liÄnog preuzimanja.
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
                <dd>Nade DimiÄ‡ 30, Bor</dd>
              </div>
              <div>
                <dt>Pijaca</dt>
                <dd>Gradska pijaca Bor â€” subotom</dd>
              </div>
              <div>
                <dt>PlaÄ‡anje</dt>
                <dd>Gotovina prilikom preuzimanja</dd>
              </div>
            </dl>
            <Image
              src="/images/farm-hero.webp"
              alt="Ponuda Borske Farmice"
              width={420}
              height={250}
            />
            <div className="existing-order-box">
              <h3>Pitanje o postojeÄ‡oj porudÅ¾bini?</h3>
              <p>
                Pripremite broj porudÅ¾bine kako bismo lakÅ¡e proverili detalje.
              </p>
              <Link
                className="button button-secondary"
                href="/nalog/porudzbine"
              >
                PronaÄ‘i porudÅ¾binu â†’
              </Link>
            </div>
          </aside>
        </Container>
      </section>

      <section className="contact-map-section">
        <Container>
          <header>
            <p className="eyebrow">LiÄno preuzimanje</p>
            <h2>PronaÄ‘ite nas u Boru</h2>
          </header>
          <div className="contact-map-layout">
            <div className="contact-map-art">
              <i />
              <i />
              <i />
              <span>
                âŒ– <strong>Borska Farmica</strong>
                <small>Nade DimiÄ‡ 30, Bor</small>
              </span>
              <b>Bor</b>
            </div>
            <article>
              <span>âŒ–</span>
              <h3>Preuzimanje na adresi</h3>
              <p>Nade DimiÄ‡ 30, odmah ispod StovariÅ¡ta NaÅ¡koviÄ‡.</p>
              <span>â—·</span>
              <h3>Po dogovorenom terminu</h3>
              <p>Pre dolaska saÄekajte admin potvrdu porudÅ¾bine.</p>
              <a
                className="button button-primary"
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Otvori u mapama â†’
              </a>
            </article>
          </div>
        </Container>
      </section>

      <section className="contact-help-topics">
        <Container>
          <header>
            <p className="eyebrow">Pitajte nas</p>
            <h2>Kako vam moÅ¾emo pomoÄ‡i?</h2>
          </header>
          <div>
            {[
              [
                'â™§',
                'Pitanja o proizvodima',
                'Sastav, dostupnost, pakovanja i aktuelna ponuda.',
              ],
              [
                'â–¤',
                'PorudÅ¾bine',
                'Status porudÅ¾bine, potvrda i izmene pre pripreme.',
              ],
              [
                'âŒ–',
                'LiÄno preuzimanje',
                'Lokacije, dogovoreni termin i subotnja pijaca.',
              ],
              [
                'â™¢',
                'Saradnja',
                'Predlozi, saradnja i druga pitanja za Farmicu.',
              ],
            ].map(([icon, title, text]) => (
              <article key={title}>
                <span>{icon}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <a href={facebook} target="_blank" rel="noopener noreferrer">
                  Saznajte viÅ¡e â†’
                </a>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="contact-response-section">
        <Container>
          <header>
            <p className="eyebrow">LiÄno i paÅ¾ljivo</p>
            <h2>Odgovaramo Äim moÅ¾emo</h2>
          </header>
          <div className="contact-response-layout">
            <div className="contact-response-images">
              <Image
                src="/images/products/mladi-kozji-sir.webp"
                alt="DomaÄ‡i sir"
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
                alt="DomaÄ‡a jaja"
                width={250}
                height={230}
              />
            </div>
            <ol>
              <li>
                <span>1</span>
                <div>
                  <strong>Pregledamo poruku</strong>
                  <p>PaÅ¾ljivo Äitamo pitanje i proveravamo detalje.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Javljamo se sa jasnim odgovorom</strong>
                  <p>Odgovaramo konkretno, bez skrivenih obeÄ‡anja.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Zajedno reÅ¡avamo pitanje</strong>
                  <p>Cilj je da taÄno znate sledeÄ‡i korak.</p>
                </div>
              </li>
            </ol>
            <blockquote>
              â€žIza svake poruke je stvarna osoba â€” zato odgovaramo
              paÅ¾ljivo.â€œ
            </blockquote>
          </div>
        </Container>
      </section>

      <section className="contact-faq">
        <Container>
          <header>
            <p className="eyebrow">Korisne informacije</p>
            <h2>NajÄeÅ¡Ä‡a pitanja</h2>
          </header>
          <div>
            {[
              [
                'Kada mogu da oÄekujem odgovor?',
                'Odgovaramo Äim budemo u moguÄ‡nosti preko zvaniÄne Facebook stranice.',
              ],
              [
                'Kako mogu da proverim status porudÅ¾bine?',
                'Prijavite se i otvorite Moj nalog, zatim Moje porudÅ¾bine.',
              ],
              [
                'Mogu li da promenim porudÅ¾binu?',
                'Javite se Å¡to pre. Izmena zavisi od trenutnog statusa i da li je priprema veÄ‡ poÄela.',
              ],
              [
                'Gde se preuzima porudÅ¾bina?',
                'Na Nade DimiÄ‡ 30 po potvrÄ‘enom terminu ili na Gradskoj pijaci Bor subotom.',
              ],
              [
                'Da li vrÅ¡ite dostavu?',
                'Ne. OmoguÄ‡eno je iskljuÄivo liÄno preuzimanje.',
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
            <h2>Pratite Å¾ivot na farmi</h2>
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
            <p className="eyebrow">Razgovor je najbolji poÄetak</p>
            <h2>PiÅ¡ite nam kada imate pitanje.</h2>
            <div className="hero-actions">
              <a
                className="button button-secondary"
                href={facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                PoÅ¡aljite poruku â†’
              </a>
              <Link className="button button-secondary" href="/proizvodi">
                Pogledajte ponudu
              </Link>
            </div>
          </div>
          <Image
            src="/images/farm-hero.webp"
            alt="Borska Farmica"
            width={620}
            height={300}
          />
        </Container>
      </section>
    </main>
  );
}
