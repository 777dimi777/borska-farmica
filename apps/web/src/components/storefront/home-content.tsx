import type { Category, ProductPreview } from '@/types/catalog';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { CategoryCard } from './category-card';
import { ProductPreviewCard } from './product-preview-card';
import { EmptyState } from '@/components/ui/states';

export function HomeContent({
  categories,
  products,
}: {
  categories: Category[];
  products: ProductPreview[];
}) {
  return (
    <>
      <Section className="main-offer">
        <Container>
          <SectionHeading
            eyebrow="Izdvojeno"
            title="Odaberite iz naše ponude"
            description="Domaći proizvodi dostupni za lično preuzimanje u Boru."
          />
          <div className="category-grid category-showcase">
            {categories.slice(0, 6).map((category, index) => (
              <CategoryCard
                key={category.id}
                category={category}
                index={index}
              />
            ))}
          </div>
        </Container>
      </Section>
      <Section id="ponuda" className="products-section">
        <Container>
          <SectionHeading
            align="center"
            eyebrow="Sveže iz naše farmice"
            title="Trenutno u ponudi"
            description="Prikazane količine i dostupnost dolaze direktno iz kataloga."
          />
          <div className="product-grid home-product-grid">
            {products.length ? (
              products.map((product) => (
                <ProductPreviewCard key={product.id} product={product} />
              ))
            ) : (
              <EmptyState />
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
