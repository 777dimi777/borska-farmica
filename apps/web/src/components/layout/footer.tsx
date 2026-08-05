import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Brand } from './brand';

export function Footer() {
  return (
    <footer className="footer footer-redesign">
      <Container>
        <div className="footer-grid footer-grid-rich">
          <div className="footer-brand-column">
            <Brand inverse />
            <p>
              Lokalna ponuda kozjeg mleka, surutke, sireva, jaja i sezonskih
              proizvoda iz Bora.
            </p>
            <div className="footer-social" aria-label="Društvene mreže">
              <a
                href="https://www.facebook.com/borska.farmica.3"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Borska Farmica na Facebooku"
              >
                f
              </a>
              <span>◎</span>
              <span>▶</span>
            </div>
          </div>
          <div>
            <h2>Prodavnica</h2>
            <Link href="/proizvodi">Svi proizvodi</Link>
            <Link href="/proizvodi?category=mlecni-proizvodi">
              Mleko i surutka
            </Link>
            <Link href="/proizvodi?category=povrce">Sezonska ponuda</Link>
            <Link href="/proizvodi?category=rakija">Rakija</Link>
          </div>
          <div>
            <h2>Informacije</h2>
            <Link href="/o-nama">O nama</Link>
            <Link href="/preuzimanje">Preuzimanje</Link>
            <Link href="/kontakt">Kontakt</Link>
            <Link href="/nalog/porudzbine">Moje porudžbine</Link>
          </div>
          <div>
            <h2>Kontakt i lokacije</h2>
            <p>⌖ Nade Dimić 30, Bor</p>
            <p>Odmah ispod Stovarišta Našković</p>
            <p>Gradska pijaca Bor — subotom</p>
          </div>
          <div>
            <h2>Plaćanje</h2>
            <div className="cash-badge">GOTOVINA</div>
            <p>Plaćanje isključivo uživo, pri ličnom preuzimanju.</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Borska Farmica</span>
          <span>Domaće iz Bora, direktno do vas.</span>
        </div>
      </Container>
    </footer>
  );
}
