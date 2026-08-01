import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { mapCategory } from './categories.mapper';
import { CategoryResponseDto } from './dto/category-response.dto';

const publicCategorySelect = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  _count: {
    select: {
      products: {
        where: {
          status: 'ACTIVE' as const,
          variants: { some: { isActive: true } },
        },
      },
    },
  },
};

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: publicCategorySelect,
    });
    return categories.map(mapCategory);
  }

  async findBySlug(slug: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findFirst({
      where: { slug, isActive: true },
      select: publicCategorySelect,
    });
    if (!category) throw new NotFoundException('Category not found.');
    return mapCategory(category);
  }
}
