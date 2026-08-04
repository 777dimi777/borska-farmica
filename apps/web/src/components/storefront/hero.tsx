import { Container } from '@/components/ui/container';
import { LinkButton } from '@/components/ui/button';
import type { ProductPreview } from '@/types/catalog';
import { ProductImage } from './product-image';
export function Hero({ product }: { product?: ProductPreview }) {
  return (
    <section className="hero">
      <Container className="hero-grid">
        <div className="hero-copy">
          <p className="eyebrow">Domaće iz Bora</p>
          <h1>Od naše farme do vašeg stola.</h1>
          <p className="hero-lead">
            Mleko, surutka i sirevi iz lokalne ponude Borske Farmice, uz jaja,
            rakiju i sezonske plodove kada im je pravo vreme.
          </p>
          <div className="hero-actions">
            <LinkButton href="/proizvodi">Pogledaj ponudu</LinkButton>
            <LinkButton href="/preuzimanje" variant="secondary">
              Kako funkcioniše preuzimanje
            </LinkButton>
          </div>
          <ul className="hero-facts">
            <li>
              <strong>Lično</strong>
              <span>preuzimanje</span>
            </li>
            <li>
              <strong>Gotovina</strong>
              <span>pri preuzimanju</span>
            </li>
            <li>
              <strong>Subotom</strong>
              <span>Gradska pijaca Bor</span>
            </li>
          </ul>
        </div>
        <div className="hero-visual">
          {product ? (
            <>
              <ProductImage
                image={product.primaryImage}
                name={product.name}
                priority
              />
              <div className="hero-product">
                <span>Izdvojeno iz ponude</span>
                <strong>{product.name}</strong>
              </div>
            </>
          ) : (
            <div
              className="hero-art"
              aria-label="Mleko, surutka i sir — glavna ponuda Borske Farmice"
            >
              <span>Mleko</span>
              <span>Surutka</span>
              <span>Sir</span>
              <i />
            </div>
          )}
        </div>
      </Container>
    </section>
  );
}
