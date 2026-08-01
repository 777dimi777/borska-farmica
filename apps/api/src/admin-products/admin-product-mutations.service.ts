import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES,
  AuditContext,
} from '../admin-audit/admin-audit.types';
import { canonicalSlug } from '../common/slug';
import { CreateProductDto, UpdateProductDto } from './dto/product-mutation.dto';
import { AdminProductsService } from './admin-products.service';
import { ProductStatus } from '../generated/prisma/enums';

@Injectable()
export class AdminProductMutationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
    private readonly queries: AdminProductsService,
  ) {}
  async create(dto: CreateProductDto, context: AuditContext) {
    try {
      const id = await this.prisma.$transaction(async (tx) => {
        await this.category(tx, dto.categoryId);
        const slug = canonicalSlug(dto.slug ?? dto.name);
        if (!slug) throw new BadRequestException('Slug cannot be empty.');
        const row = await tx.product.create({
          data: {
            categoryId: dto.categoryId,
            name: dto.name,
            slug,
            shortDescription: dto.shortDescription ?? null,
            description: dto.description ?? null,
            isFeatured: dto.featured ?? false,
            isMainProduct: dto.mainProduct ?? false,
            availabilityMode: dto.availabilityMode ?? 'ALWAYS',
            isManuallyAvailable: dto.manuallyAvailable ?? true,
            seoTitle: dto.seoTitle ?? null,
            seoDescription: dto.seoDescription ?? null,
            status: 'DRAFT',
          },
        });
        await this.audit.write(tx, context, {
          action: AUDIT_ACTIONS.PRODUCT_CREATED,
          resourceType: AUDIT_RESOURCE_TYPES.PRODUCT,
          resourceId: row.id,
          changes: {
            name: { after: row.name },
            slug: { after: row.slug },
            status: { after: row.status },
          },
        });
        return row.id;
      });
      return this.queries.findOne(id);
    } catch (error) {
      this.mapError(error);
    }
  }
  async update(id: string, dto: UpdateProductDto, context: AuditContext) {
    if (!Object.values(dto).some((value) => value !== undefined))
      throw new BadRequestException('At least one field is required.');
    try {
      await this.prisma.$transaction(async (tx) => {
        const before = await tx.product.findUnique({
          where: { id },
          include: {
            category: true,
            variants: {
              orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }, { id: 'asc' }],
            },
          },
        });
        if (!before) throw new NotFoundException('Product not found.');
        if (dto.categoryId) await this.category(tx, dto.categoryId);
        const targetStatus = dto.status ?? before.status;
        const targetCategoryId = dto.categoryId ?? before.categoryId;
        const category =
          targetCategoryId === before.categoryId
            ? before.category
            : await tx.category.findUnique({ where: { id: targetCategoryId } });
        this.transition(before.status, targetStatus);
        if (targetStatus === ProductStatus.ACTIVE) {
          if (!category?.isActive)
            throw new ConflictException(
              'Active products require an active category.',
            );
          const active = before.variants.filter((v) => v.isActive);
          if (
            !active.length ||
            active.some((v) => v.price.lessThanOrEqualTo(0))
          )
            throw new ConflictException(
              'Active products require an active variant with a positive price.',
            );
          const defaults = active.filter((v) => v.isDefault);
          if (defaults.length > 1)
            throw new ConflictException(
              'Product has multiple default variants.',
            );
          if (!defaults.length)
            await tx.productVariant.update({
              where: { id: active[0].id },
              data: { isDefault: true },
            });
        }
        const data: Prisma.ProductUpdateInput = {};
        const map: Array<
          [keyof UpdateProductDto, keyof Prisma.ProductUpdateInput]
        > = [
          ['name', 'name'],
          ['shortDescription', 'shortDescription'],
          ['description', 'description'],
          ['featured', 'isFeatured'],
          ['mainProduct', 'isMainProduct'],
          ['availabilityMode', 'availabilityMode'],
          ['manuallyAvailable', 'isManuallyAvailable'],
          ['seoTitle', 'seoTitle'],
          ['seoDescription', 'seoDescription'],
          ['status', 'status'],
        ];
        for (const [source, target] of map)
          if (dto[source] !== undefined)
            (data as Record<string, unknown>)[target] = dto[source];
        if (dto.categoryId !== undefined)
          data.category = { connect: { id: dto.categoryId } };
        if (dto.slug !== undefined) {
          const slug = canonicalSlug(dto.slug);
          if (!slug) throw new BadRequestException('Slug cannot be empty.');
          data.slug = slug;
        }
        const comparable = { ...data } as Record<string, unknown>;
        delete comparable.category;
        const changes: Record<string, { before: unknown; after: unknown }> = {};
        for (const [key, after] of Object.entries(comparable)) {
          const beforeKey =
            key === 'isFeatured'
              ? 'isFeatured'
              : key === 'isMainProduct'
                ? 'isMainProduct'
                : key === 'isManuallyAvailable'
                  ? 'isManuallyAvailable'
                  : key;
          if (before[beforeKey as keyof typeof before] !== after)
            changes[key] = {
              before: before[beforeKey as keyof typeof before],
              after,
            };
        }
        if (dto.categoryId && dto.categoryId !== before.categoryId)
          changes.categoryId = {
            before: before.categoryId,
            after: dto.categoryId,
          };
        if (!Object.keys(changes).length) return;
        await tx.product.update({ where: { id }, data });
        const action =
          dto.status === ProductStatus.ACTIVE
            ? AUDIT_ACTIONS.PRODUCT_PUBLISHED
            : dto.status === ProductStatus.ARCHIVED
              ? AUDIT_ACTIONS.PRODUCT_ARCHIVED
              : dto.status === ProductStatus.DRAFT &&
                  before.status !== ProductStatus.DRAFT
                ? AUDIT_ACTIONS.PRODUCT_MOVED_TO_DRAFT
                : AUDIT_ACTIONS.PRODUCT_UPDATED;
        await this.audit.write(tx, context, {
          action,
          resourceType: AUDIT_RESOURCE_TYPES.PRODUCT,
          resourceId: id,
          changes: changes as Prisma.InputJsonValue,
        });
      });
      return this.queries.findOne(id);
    } catch (error) {
      this.mapError(error);
    }
  }
  async remove(id: string, context: AuditContext): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const row = await tx.product.findUnique({
        where: { id },
        include: {
          _count: {
            select: { variants: true, images: true, availabilityWindows: true },
          },
        },
      });
      if (!row) throw new NotFoundException('Product not found.');
      if (
        row.status !== ProductStatus.DRAFT ||
        row._count.variants ||
        row._count.images ||
        row._count.availabilityWindows
      )
        throw new ConflictException(
          'Only an empty DRAFT product can be deleted; archive it instead.',
        );
      await tx.product.delete({ where: { id } });
      await this.audit.write(tx, context, {
        action: AUDIT_ACTIONS.PRODUCT_DELETED,
        resourceType: AUDIT_RESOURCE_TYPES.PRODUCT,
        resourceId: id,
        changes: { snapshot: { name: row.name, slug: row.slug } },
      });
    });
  }
  private async category(tx: Prisma.TransactionClient, id: string) {
    if (
      !(await tx.category.findUnique({ where: { id }, select: { id: true } }))
    )
      throw new NotFoundException('Category not found.');
  }
  private transition(from: ProductStatus, to: ProductStatus) {
    if (from === to) return;
    const allowed: Record<ProductStatus, ProductStatus[]> = {
      DRAFT: [ProductStatus.ACTIVE, ProductStatus.ARCHIVED],
      ACTIVE: [ProductStatus.DRAFT, ProductStatus.ARCHIVED],
      ARCHIVED: [ProductStatus.DRAFT],
    };
    if (!allowed[from].includes(to))
      throw new ConflictException(
        `Invalid product status transition: ${from} -> ${to}.`,
      );
  }
  private mapError(error: unknown): never {
    if (
      error instanceof BadRequestException ||
      error instanceof ConflictException ||
      error instanceof NotFoundException
    )
      throw error;
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
      throw new ConflictException('Product slug already exists.');
    throw error;
  }
}
