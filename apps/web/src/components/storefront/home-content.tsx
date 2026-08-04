import type { Category, ProductPreview } from '@/types/catalog';
import { Container } from '@/components/ui/container';
import { Section } from '@/components/ui/section';
import { SectionHeading } from '@/components/ui/section-heading';
import { CategoryCard } from './category-card';
import { ProductPreviewCard } from './product-preview-card';
import { EmptyState } from '@/components/ui/states';
const mainNames = ['sir', 'mleko', 'surutka'];
export function HomeContent({
  categories,
  products,
}: {
  categories: Category[];
  products: ProductPreview[];
}) {
  const mains = mainNames
    .map((name) =>
      categories.find(
        (c) => c.slug.includes(name) || c.name.toLowerCase().includes(name),
      ),
    )
    .filter(Boolean) as Category[];
  const shown = mains.length ? mains : categories.slice(0, 3);
  return (
    <>
      <Section className="main-offer">
        <Container>
          <SectionHeading
            eyebrow="Glavni proizvodi"
            title="Naša glavna ponuda"
            description="Izaberite iz aktuelnih kategorija. Dostupnost pojedinačnih proizvoda prikazana je u ponudi."
          />
          <div className="category-grid">
            {shown.map((c, i) => (
              <CategoryCard key={c.id} category={c} index={i} />
            ))}
          </div>
        </Container>
      </Section>
      <Section id="ponuda" className="products-section">
        <Container>
          <SectionHeading
            eyebrow="Trenutna ponuda"
            title="Izdvojeni proizvodi"
            description="Stvarni podaci iz javnog kataloga, osveženi približno jednom u minutu."
          />
          <div className="product-grid">
            {products.length ? (
              products.map((p) => <ProductPreviewCard key={p.id} product={p} />)
            ) : (
              <EmptyState />
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
