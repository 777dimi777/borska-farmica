import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { Container } from '@/components/ui/container';
import { AuthForm } from './auth-form';

export function AuthReferencePage({ mode }: { mode: 'login' | 'register' }) {
  const login = mode === 'login';
  return (
    <main
      className={`auth-reference-page ${login ? 'is-login' : 'is-register'}`}
    >
      <Container>
        <nav className="auth-breadcrumbs" aria-label="Putanja stranice">
          <Link href="/">Početna</Link>
          <span>/</span>
          <span>{login ? 'Prijava' : 'Registracija'}</span>
        </nav>
        <section className="auth-reference-card">
          <div className="auth-visual-panel">
            <Image
              src="/images/farm-story-v2.webp"
              alt="Borska Farmica u zelenom okruženju Bora"
              fill
              priority
              sizes="(max-width: 800px) 100vw, 55vw"
            />
            <div className="auth-visual-shade" />
            <div className="auth-visual-content">
              <div className="auth-visual-brand">
                <Image
                  src="/images/brand/borska-farmica-mark.webp"
                  alt=""
                  width={54}
                  height={54}
                />
                <strong>
                  Borska
                  <br />
                  Farmica
                </strong>
              </div>
              <h1>
                {login ? (
                  <>
                    Dobro došli
                    <br />
                    nazad u Farmicu.
                  </>
                ) : (
                  <>
                    Napravite nalog
                    <br />
                    za lakšu kupovinu.
                  </>
                )}
              </h1>
              <p>
                {login
                  ? 'Vaše porudžbine, podaci i omiljeni domaći proizvodi na jednom mestu.'
                  : 'Sačuvajte svoje podatke i jednostavnije pratite svaku porudžbinu.'}
              </p>
              <ul>
                <li>Brže poručivanje</li>
                <li>Praćenje porudžbina</li>
                <li>Sačuvani podaci za preuzimanje</li>
              </ul>
            </div>
          </div>
          <div className="auth-form-panel">
            <p className="eyebrow">Moj nalog</p>
            <h2>{login ? 'Prijavite se' : 'Napravite nalog'}</h2>
            <p>
              {login
                ? 'Unesite svoje podatke i nastavite tamo gde ste stali.'
                : 'Unesite podatke potrebne za bezbednu kupovinu i preuzimanje.'}
            </p>
            <Suspense
              fallback={
                <div className="auth-form-loading">Učitavanje forme…</div>
              }
            >
              <AuthForm mode={mode} />
            </Suspense>
            <div className="auth-safe-note">
              <span>♢</span> Vaši podaci se koriste samo za upravljanje nalogom
              i porudžbinama.
            </div>
            <div className="auth-form-divider">
              <span>ili</span>
            </div>
            <div className="auth-alternate-box">
              <h3>{login ? 'Još nemate nalog?' : 'Već imate nalog?'}</h3>
              <p>
                {login
                  ? 'Napravite nalog za brže poručivanje i pregled istorije.'
                  : 'Prijavite se na postojeći nalog i nastavite kupovinu.'}
              </p>
              <Link
                className="button button-secondary"
                href={login ? '/registracija' : '/prijava'}
              >
                {login ? 'Napravite nalog' : 'Prijavite se'}
              </Link>
            </div>
            <p className="auth-shop-return">
              Samo želite da razgledate?{' '}
              <Link href="/proizvodi">Vratite se u prodavnicu.</Link>
            </p>
          </div>
        </section>

        <section className="auth-benefits-band">
          <article>
            <span>▣</span>
            <div>
              <strong>Sigurna prijava</strong>
              <small>Lozinka se obrađuje bezbedno.</small>
            </div>
          </article>
          <article>
            <span>♢</span>
            <div>
              <strong>Podaci se ne dele</strong>
              <small>Vaši lični podaci ostaju uz nalog.</small>
            </div>
          </article>
          <article>
            <span>♙</span>
            <div>
              <strong>Jednostavno upravljanje</strong>
              <small>Pregled podataka i porudžbina.</small>
            </div>
          </article>
          <article>
            <span>⌖</span>
            <div>
              <strong>Lično preuzimanje</strong>
              <small>Adresa ili pijaca subotom.</small>
            </div>
          </article>
        </section>

        <section className="auth-help-band">
          <div className="auth-help-icon">☎</div>
          <div>
            <p className="eyebrow">Tu smo da pomognemo</p>
            <h2>Problem sa {login ? 'prijavom' : 'registracijom'}?</h2>
            <p>
              Za pitanja o nalogu ili porudžbini javite nam se preko zvanične
              Facebook stranice.
            </p>
          </div>
          <a
            className="button button-primary"
            href="https://www.facebook.com/borska.farmica.3"
            target="_blank"
            rel="noopener noreferrer"
          >
            Kontaktirajte nas →
          </a>
          <Link className="button button-secondary" href="/preuzimanje">
            Preuzimanje i lokacije
          </Link>
          <div className="auth-help-photo">
            <Image
              src="/images/farm-hero.webp"
              alt="Proizvodi Borske Farmice"
              fill
              sizes="(max-width: 700px) 100vw, 30vw"
            />
          </div>
        </section>
      </Container>
    </main>
  );
}
