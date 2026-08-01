import { AdminCategoryDto } from './dto/admin-category-response.dto';
export interface AdminCategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count: { products: number; activeProducts: number };
}
export const mapAdminCategory = (x: AdminCategoryRecord): AdminCategoryDto => ({
  id: x.id,
  name: x.name,
  slug: x.slug,
  description: x.description,
  imageUrl: x.imageUrl,
  isActive: x.isActive,
  sortOrder: x.sortOrder,
  productCount: x._count.products,
  activeProductCount: x._count.activeProducts,
  createdAt: x.createdAt,
  updatedAt: x.updatedAt,
});
