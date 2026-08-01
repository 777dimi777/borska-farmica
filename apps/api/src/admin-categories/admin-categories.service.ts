import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
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
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES,
  AuditContext,
} from '../admin-audit/admin-audit.types';
import {
  CreateCategoryDto,
  ReorderCategoriesDto,
  UpdateCategoryDto,
} from './dto/category-mutation.dto';
import { categorySlug } from './category-slug';
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
    },
  },
};
@Injectable()
export class AdminCategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}
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
    const [total, rows, activeCounts] = await this.prisma.$transaction([
      this.prisma.category.count({ where }),
      this.prisma.category.findMany({
        where,
        orderBy,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        select,
      }),
      this.prisma.product.groupBy({
        by: ['categoryId'],
        orderBy: { categoryId: 'asc' },
        where: { status: 'ACTIVE', category: where },
        _count: { _all: true },
      }),
    ]);
    const active = new Map(
      activeCounts.map((x) => [
        x.categoryId,
        (x._count as { _all: number })._all,
      ]),
    );
    return {
      data: rows.map((row) => mapAdminCategory(row, active.get(row.id) ?? 0)),
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
      ...mapAdminCategory(row, counts.ACTIVE ?? 0),
      draftProductCount: counts.DRAFT ?? 0,
      archivedProductCount: counts.ARCHIVED ?? 0,
    };
  }
  async create(dto: CreateCategoryDto, context: AuditContext) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const slug = categorySlug(dto.slug ?? dto.name);
        if (!slug) throw new BadRequestException('Slug cannot be empty.');
        const sortOrder =
          dto.sortOrder ??
          ((await tx.category.aggregate({ _max: { sortOrder: true } }))._max
            .sortOrder ?? -1) + 1;
        const row = await tx.category.create({
          data: {
            name: dto.name,
            slug,
            description: dto.description ?? null,
            imageUrl: dto.imageUrl ?? null,
            isActive: dto.isActive ?? true,
            sortOrder,
          },
          select,
        });
        await this.audit.write(tx, context, {
          action: AUDIT_ACTIONS.CATEGORY_CREATED,
          resourceType: AUDIT_RESOURCE_TYPES.CATEGORY,
          resourceId: row.id,
          changes: { name: { after: row.name }, slug: { after: row.slug } },
        });
        return mapAdminCategory(row);
      });
    } catch (e) {
      this.mapError(e);
    }
  }
  async update(id: string, dto: UpdateCategoryDto, context: AuditContext) {
    if (!Object.keys(dto).length)
      throw new BadRequestException('At least one field is required.');
    try {
      return await this.prisma.$transaction(async (tx) => {
        const before = await tx.category.findUnique({ where: { id }, select });
        if (!before) throw new NotFoundException('Category not found.');
        const data: Record<string, unknown> = { ...dto };
        if (dto.slug !== undefined) {
          const slug = categorySlug(dto.slug);
          if (!slug) throw new BadRequestException('Slug cannot be empty.');
          data.slug = slug;
        }
        const changes: Record<string, { before: unknown; after: unknown }> = {};
        for (const [key, value] of Object.entries(data)) {
          if (
            value !== undefined &&
            before[key as keyof typeof before] !== value
          )
            changes[key] = {
              before: before[key as keyof typeof before],
              after: value,
            };
        }
        if (!Object.keys(changes).length) return mapAdminCategory(before);
        const row = await tx.category.update({ where: { id }, data, select });
        const action =
          'isActive' in changes
            ? row.isActive
              ? AUDIT_ACTIONS.CATEGORY_ACTIVATED
              : AUDIT_ACTIONS.CATEGORY_DEACTIVATED
            : AUDIT_ACTIONS.CATEGORY_UPDATED;
        await this.audit.write(tx, context, {
          action,
          resourceType: AUDIT_RESOURCE_TYPES.CATEGORY,
          resourceId: id,
          changes: changes as Prisma.InputJsonValue,
        });
        return mapAdminCategory(row);
      });
    } catch (e) {
      this.mapError(e);
    }
  }
  async reorder(dto: ReorderCategoriesDto, context: AuditContext) {
    return this.prisma.$transaction(async (tx) => {
      const ids = dto.items.map((x) => x.id);
      const before = await tx.category.findMany({
        where: { id: { in: ids } },
        select: { id: true, sortOrder: true },
      });
      if (before.length !== ids.length)
        throw new NotFoundException('One or more categories were not found.');
      for (const item of dto.items)
        await tx.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        });
      await this.audit.write(tx, context, {
        action: AUDIT_ACTIONS.CATEGORY_REORDERED,
        resourceType: AUDIT_RESOURCE_TYPES.CATEGORY,
        changes: {
          items: dto.items.map((x) => ({
            id: x.id,
            before: before.find((y) => y.id === x.id)?.sortOrder,
            after: x.sortOrder,
          })),
        },
      });
      return tx.category.findMany({
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        select,
      });
    });
  }
  async remove(id: string, context: AuditContext): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const row = await tx.category.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          slug: true,
          _count: { select: { products: true } },
        },
      });
      if (!row) throw new NotFoundException('Category not found.');
      if (row._count.products > 0)
        throw new ConflictException(
          'Deactivate categories that contain products.',
        );
      await tx.category.delete({ where: { id } });
      await this.audit.write(tx, context, {
        action: AUDIT_ACTIONS.CATEGORY_DELETED,
        resourceType: AUDIT_RESOURCE_TYPES.CATEGORY,
        resourceId: id,
        changes: { snapshot: { name: row.name, slug: row.slug } },
      });
    });
  }
  private mapError(error: unknown): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException
    )
      throw error;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
      throw new ConflictException('Category name or slug already exists.');
    throw error;
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
