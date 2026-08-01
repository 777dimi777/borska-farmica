import { CategoryResponseDto } from './dto/category-response.dto';

export interface PublicCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  _count: { products: number };
}

export function mapCategory(record: PublicCategoryRecord): CategoryResponseDto {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    description: record.description,
    imageUrl: record.imageUrl,
    productCount: record._count.products,
  };
}
