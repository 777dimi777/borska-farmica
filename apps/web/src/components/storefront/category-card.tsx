import Link from 'next/link';
import type { Category } from '@/types/catalog';
const descriptions: Record<string, string> = {
  sir: 'Različite vrste sireva iz trenutne ponude.',
  mleko: 'Mleko dostupno prema aktuelnoj ponudi.',
  surutka: 'Surutka za lično preuzimanje u Boru.',
};
export function CategoryCard({
  category,
  index = 0,
}: {
  category: Category;
  index?: number;
}) {
  const key = Object.keys(descriptions).find(
    (k) => category.slug.includes(k) || category.name.toLowerCase().includes(k),
  );
  return (
    <article className="category-card">
      <Link
        className="category-card-link"
        href={`/proizvodi?category=${encodeURIComponent(category.slug)}`}
        aria-label={`Pogledaj kategoriju: ${category.name}`}
      />
      <span className="category-number">0{index + 1}</span>
      <div>
        <h3>{category.name}</h3>
        <p>
          {category.description ||
            descriptions[key || ''] ||
            'Pogledajte proizvode iz ove kategorije.'}
        </p>
        {category.productCount > 0 && (
          <small>
            {category.productCount}{' '}
            {category.productCount === 1 ? 'proizvod' : 'proizvoda'}
          </small>
        )}
      </div>
    </article>
  );
}
