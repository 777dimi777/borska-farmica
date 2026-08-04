import type { Metadata } from 'next';
import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
export const metadata: Metadata = {
  title: 'O nama',
  description: 'Saznajte više o lokalnoj ponudi Borske Farmice iz Bora.',
};
export default function About() {
  return (
    <div className="info-page">
      <Container>
        <p className="eyebrow">O Borskoj Farmici</p>
        <h1>Lokalna ponuda, direktan odnos sa kupcima.</h1>
        <p className="info-lead">
          Borska Farmica okuplja glavnu ponudu mleka, surutke i sireva, uz jaja,
          rakiju i sezonske plodove kada su dostupni.
        </p>
        <div className="prose-grid">
          <section>
            <h2>Ponuda koja prati dostupnost</h2>
            <p>
              Aktuelni katalog jasno pokazuje šta je trenutno dostupno. Sezonska
              ponuda se menja tokom godine i zato ne obećavamo proizvode pre
              nego što su stvarno u ponudi.
            </p>
          </section>
          <section>
            <h2>Jednostavno preuzimanje</h2>
            <p>
              Porudžbinu potvrđuje Borska Farmica, a kupac je preuzima lično na
              adresi ili proizvode kupuje na Gradskoj pijaci u Boru subotom.
            </p>
          </section>
        </div>
        <LinkButton href="/#ponuda">Pogledaj ponudu</LinkButton>
      </Container>
    </div>
  );
}
