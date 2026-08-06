import Image from 'next/image';
import Link from 'next/link';
import type { Category, ProductPreview } from '@/types/catalog';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { ProductPreviewCard } from './product-preview-card';
import { EmptyState } from '@/components/ui/states';

const offers = [
  {
    title: 'Mleko i surutka',
    text: 'Sveža ponuda za lično preuzimanje.',
    image: '/images/products/kozje-mleko.webp',
    category: 'mlecni-proizvodi',
  },
  {
    title: 'Domaći sirevi',
    text: 'Mladi sir i druga pakovanja iz ponude.',
    image: '/images/products/mladi-kozji-sir.webp',
    category: 'mlecni-proizvodi',
  },
  {
    title: 'Sezonska ponuda',
    text: 'Povrće i voće kada im je vreme.',
    image: '/images/products/paradajz.webp',
    category: 'povrce',
  },
];

export function HomeContent({
  products,
}: {
  categories: Category[];
  products: ProductPreview[];
}) {
  return (
    <>
      <Section className="reference-offers">
        <Container>
          <SectionHeading align="center" title="Iz naše ponude" />
          <div className="offer-cards">
            {offers.map((offer) => (
              <Link
                key={offer.title}
                href={`/proizvodi?kategorija=${offer.category}`}
                className="offer-card"
              >
                <Image
                  src={offer.image}
                  alt={offer.title}
                  fill
                  sizes="(max-width: 700px) 92vw, 31vw"
                />
                <div>
                  <h3>{offer.title}</h3>
                  <p>{offer.text}</p>
                  <span aria-hidden="true">→</span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
      <Section id="ponuda" className="reference-products">
        <Container>
          <SectionHeading
            align="center"
            title="Najtraženije ove nedelje"
            description="Dostupnost i cene preuzimaju se direktno iz aktuelnog kataloga."
          />
          <div className="product-grid home-product-grid">
            {products.length ? (
              products
                .slice(0, 4)
                .map((product) => (
                  <ProductPreviewCard key={product.id} product={product} />
                ))
            ) : (
              <EmptyState />
            )}
          </div>
          <div className="center-link">
            <Link href="/proizvodi">Pogledaj celu ponudu →</Link>
          </div>
        </Container>
      </Section>
    </>
  );
}
