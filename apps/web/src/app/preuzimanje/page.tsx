import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
export const metadata: Metadata = {
  title: 'Preuzimanje',
  description: 'Lokacije i način preuzimanja proizvoda Borske Farmice u Boru.',
};
export default function Pickup() {
  return (
    <div className="info-page">
      <Container>
        <p className="eyebrow">Preuzimanje</p>
        <h1>Preuzmite porudžbinu lično u Boru.</h1>
        <p className="info-lead">
          Nakon slanja porudžbine sačekajte potvrdu Borske Farmice. Plaćanje je
          isključivo gotovinom prilikom preuzimanja.
        </p>
        <div className="location-grid">
          <article>
            <p className="card-kicker">Lokacija 01</p>
            <h2>Nade Dimić 30, Bor</h2>
            <p>Odmah ispod Stovarišta Našković.</p>
            <a
              href="https://www.google.com/maps/search/?api=1&query=Nade+Dimi%C4%87+30%2C+Bor"
              target="_blank"
              rel="noopener noreferrer"
            >
              Otvori Google Maps pretragu
            </a>
          </article>
          <article>
            <p className="card-kicker">Lokacija 02</p>
            <h2>Gradska pijaca Bor</h2>
            <p>
              Subotom možete doći na Gradsku pijacu u Boru i kupiti ono što je u
              ponudi.
            </p>
          </article>
        </div>
        <div className="notice">
          <strong>Važno:</strong> nema dostave ni online plaćanja. Kupovina kroz
          budući storefront zahtevaće korisnički nalog, a admin potvrđuje
          porudžbinu.
        </div>
      </Container>
    </div>
  );
}
