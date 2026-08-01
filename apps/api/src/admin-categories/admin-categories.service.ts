import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { createPaginationMetadata } from '../common/pagination/pagination';
import {
  AdminCategoryQueryDto,
  AdminCategorySort,
  AdminCategoryStatus,
} from './dto/admin-category-query.dto';
import {
  AdminCategoryDetailDto,
  AdminCategoryListDto,
} from './dto/admin-category-response.dto';
import { mapAdminCategory } from './admin-categories.mapper';
const select = {
  id: true,
  name: true,
  slug: true,
  description: true,
  imageUrl: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      products: true,
      activeProducts: { where: { status: 'ACTIVE' as const } },
    },
  },
};
@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(q: AdminCategoryQueryDto): Promise<AdminCategoryListDto> {
    const where: Prisma.CategoryWhereInput = {
      ...(q.search && {
        OR: [
          { name: { contains: q.search, mode: 'insensitive' } },
          { slug: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
      ...(q.status !== AdminCategoryStatus.ALL && {
        isActive: q.status === AdminCategoryStatus.ACTIVE,
      }),
    };
    const orderBy = this.order(q.sort);
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        orderBy,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        select,
      }),
    ]);
    return {
      data: rows.map(mapAdminCategory),
      pagination: createPaginationMetadata(q.page, q.limit, total),
    };
  }
  async findOne(id: string): Promise<AdminCategoryDetailDto> {
    const [row, statuses] = await this.prisma.$transaction([
      this.prisma.category.findUnique({ where: { id }, select }),
      this.prisma.product.groupBy({
        by: ['status'],
        orderBy: { status: 'asc' },
        where: { categoryId: id },
        _count: { _all: true },
      }),
    ]);
    if (!row) throw new NotFoundException('Category not found.');
    const statusRows = statuses as Array<{
      status: string;
      _count: { _all: number };
    }>;
    const counts: Record<string, number> = {};
    for (const item of statusRows) counts[item.status] = item._count._all;
    return {
      ...mapAdminCategory(row),
      draftProductCount: counts.DRAFT ?? 0,
      archivedProductCount: counts.ARCHIVED ?? 0,
    };
  }
  private order(
    sort: AdminCategorySort,
  ): Prisma.CategoryOrderByWithRelationInput[] {
    switch (sort) {
      case AdminCategorySort.NAME_ASC:
        return [{ name: 'asc' }];
      case AdminCategorySort.NAME_DESC:
        return [{ name: 'desc' }];
      case AdminCategorySort.NEWEST:
        return [{ createdAt: 'desc' }];
      case AdminCategorySort.OLDEST:
        return [{ createdAt: 'asc' }];
      default:
        return [{ sortOrder: 'asc' }, { name: 'asc' }];
    }
  }
}
