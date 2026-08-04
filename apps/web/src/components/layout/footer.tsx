import Link from 'next/link';
import { Container } from '@/components/ui/container';
import { Brand } from './brand';
export function Footer() {
  return (
    <footer className="footer">
      <Container>
        <div className="footer-grid">
          <div>
            <Brand inverse />
            <p className="footer-copy">
              Lokalna ponuda mleka, surutke, sireva i sezonskih proizvoda uz
              lično preuzimanje u Boru.
            </p>
          </div>
          <div>
            <h2>Navigacija</h2>
            <Link href="/proizvodi">Proizvodi</Link>
            <Link href="/o-nama">O nama</Link>
            <Link href="/preuzimanje">Preuzimanje</Link>
            <Link href="/kontakt">Kontakt</Link>
          </div>
          <div>
            <h2>Preuzimanje</h2>
            <p>Nade Dimić 30, Bor</p>
            <p>Gradska pijaca Bor — subotom</p>
            <p>Plaćanje gotovinom pri preuzimanju</p>
          </div>
          <div>
            <h2>Pratite nas</h2>
            <a
              href="https://www.facebook.com/borska.farmica.3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Borska Farmica na Facebooku (otvara se u novom tabu)"
            >
              Facebook
            </a>
          </div>
        </div>
        <div className="footer-bottom">
          © {new Date().getFullYear()} Borska Farmica
        </div>
      </Container>
    </footer>
  );
}
