import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
export const metadata: Metadata = {
  title: 'Kontakt',
  description: 'Adresa, Facebook i informacije za preuzimanje Borske Farmice.',
};
export default function Contact() {
  return (
    <div className="info-page">
      <Container>
        <p className="eyebrow">Kontakt i informacije</p>
        <h1>Pronađite Borsku Farmicu u Boru.</h1>
        <p className="info-lead">
          Potvrđen telefon i email još nisu objavljeni. Za aktuelne informacije
          možete koristiti našu Facebook stranicu ili informacije o lokacijama.
        </p>
        <div className="prose-grid">
          <section>
            <h2>Adresa</h2>
            <p>
              Nade Dimić 30, Bor
              <br />
              Odmah ispod Stovarišta Našković.
            </p>
          </section>
          <section>
            <h2>Facebook</h2>
            <a
              href="https://www.facebook.com/borska.farmica.3"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Posetite Borsku Farmicu na Facebooku (novi tab)"
            >
              facebook.com/borska.farmica.3
            </a>
          </section>
          <section>
            <h2>Gradska pijaca</h2>
            <p>Subotom na Gradskoj pijaci u Boru.</p>
          </section>
          <section>
            <h2>Plaćanje</h2>
            <p>Isključivo gotovinom pri ličnom preuzimanju.</p>
          </section>
        </div>
      </Container>
    </div>
  );
}
