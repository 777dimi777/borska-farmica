import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES,
  AuditContext,
} from '../admin-audit/admin-audit.types';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { ProductImageMutationDto } from './dto/content-mutation.dto';
const imageSelect = {
  id: true,
  productId: true,
  url: true,
  altText: true,
  isPrimary: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
};
@Injectable()
export class AdminProductImagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}
  private async product(id: string) {
    if (
      !(await this.prisma.product.findUnique({
        where: { id },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Product not found.');
  }
  list(productId: string) {
    return this.product(productId).then(() =>
      this.prisma.productImage.findMany({
        where: { productId },
        select: imageSelect,
        orderBy: [
          { isPrimary: 'desc' },
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
      }),
    );
  }
  async create(
    productId: string,
    dto: ProductImageMutationDto,
    c: AuditContext,
  ) {
    await this.product(productId);
    if (!dto.url || !dto.altText?.trim())
      throw new BadRequestException('url and altText are required.');
    return this.serial(async (tx) => {
      const count = await tx.productImage.count({ where: { productId } });
      const primary = count === 0 || dto.isPrimary === true;
      if (primary)
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      const last = await tx.productImage.aggregate({
        where: { productId },
        _max: { sortOrder: true },
      });
      const row = await tx.productImage.create({
        data: {
          productId,
          url: dto.url!,
          altText: dto.altText!.trim(),
          isPrimary: primary,
          sortOrder: dto.sortOrder ?? (last._max.sortOrder ?? -1) + 1,
        },
        select: imageSelect,
      });
      await this.audit.write(tx, c, {
        action: AUDIT_ACTIONS.PRODUCT_IMAGE_CREATED,
        resourceType: AUDIT_RESOURCE_TYPES.PRODUCT_IMAGE,
        resourceId: row.id,
        changes: { productId, url: row.url, isPrimary: row.isPrimary },
      });
      return row;
    });
  }
  async update(
    productId: string,
    id: string,
    dto: ProductImageMutationDto,
    c: AuditContext,
  ) {
    if (!Object.values(dto).some((v) => v !== undefined))
      throw new BadRequestException('At least one field is required.');
    if (dto.altText !== undefined && !dto.altText.trim())
      throw new BadRequestException('altText cannot be blank.');
    return this.serial(async (tx) => {
      const old = await tx.productImage.findFirst({
        where: { id, productId },
        select: imageSelect,
      });
      if (!old) throw new NotFoundException('Image not found.');
      if (old.isPrimary && dto.isPrimary === false)
        throw new ConflictException('Choose another primary image instead.');
      const data = {
        url: dto.url,
        altText: dto.altText?.trim(),
        sortOrder: dto.sortOrder,
        isPrimary: dto.isPrimary,
      };
      const effective = Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined),
      );
      if (
        Object.entries(effective).every(
          ([k, v]) => old[k as keyof typeof old] === v,
        )
      )
        return old;
      if (dto.isPrimary === true && !old.isPrimary)
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
      const row = await tx.productImage.update({
        where: { id },
        data: effective,
        select: imageSelect,
      });
      await this.audit.write(tx, c, {
        action:
          dto.isPrimary === true && !old.isPrimary
            ? AUDIT_ACTIONS.PRODUCT_IMAGE_PRIMARY_CHANGED
            : AUDIT_ACTIONS.PRODUCT_IMAGE_UPDATED,
        resourceType: AUDIT_RESOURCE_TYPES.PRODUCT_IMAGE,
        resourceId: id,
        changes: {
          before: {
            url: old.url,
            altText: old.altText,
            isPrimary: old.isPrimary,
            sortOrder: old.sortOrder,
          },
          after: {
            url: row.url,
            altText: row.altText,
            isPrimary: row.isPrimary,
            sortOrder: row.sortOrder,
          },
        },
      });
      return row;
    });
  }
  async remove(productId: string, id: string, c: AuditContext) {
    await this.serial(async (tx) => {
      const old = await tx.productImage.findFirst({
        where: { id, productId },
        select: imageSelect,
      });
      if (!old) throw new NotFoundException('Image not found.');
      await tx.productImage.delete({ where: { id } });
      let fallback: string | null = null;
      if (old.isPrimary) {
        const next = await tx.productImage.findFirst({
          where: { productId },
          orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }, { id: 'asc' }],
          select: { id: true },
        });
        if (next) {
          fallback = next.id;
          await tx.productImage.update({
            where: { id: next.id },
            data: { isPrimary: true },
          });
        }
      }
      await this.audit.write(tx, c, {
        action: AUDIT_ACTIONS.PRODUCT_IMAGE_DELETED,
        resourceType: AUDIT_RESOURCE_TYPES.PRODUCT_IMAGE,
        resourceId: id,
        changes: {
          productId,
          url: old.url,
          altText: old.altText,
          fallbackPrimaryId: fallback,
        },
      });
    });
  }
  async reorder(
    productId: string,
    dto: import('./dto/content-mutation.dto').ProductImageReorderDto,
    c: AuditContext,
  ) {
    const ids = dto.items.map((x) => x.id),
      orders = dto.items.map((x) => x.sortOrder);
    if (
      new Set(ids).size !== ids.length ||
      new Set(orders).size !== orders.length
    )
      throw new BadRequestException('Duplicate ids or sortOrder values.');
    return this.serial(async (tx) => {
      const rows = await tx.productImage.findMany({
        where: { productId, id: { in: ids } },
        select: { id: true, isPrimary: true },
      });
      if (rows.length !== ids.length)
        throw new NotFoundException('Image not found.');
      if (dto.primaryImageId && !rows.some((x) => x.id === dto.primaryImageId))
        throw new NotFoundException('Primary image not found.');
      for (const item of dto.items)
        await tx.productImage.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder },
        });
      const previous = rows.find((x) => x.isPrimary)?.id ?? null;
      if (dto.primaryImageId && dto.primaryImageId !== previous) {
        await tx.productImage.updateMany({
          where: { productId, isPrimary: true },
          data: { isPrimary: false },
        });
        await tx.productImage.update({
          where: { id: dto.primaryImageId },
          data: { isPrimary: true },
        });
      }
      await this.audit.write(tx, c, {
        action: AUDIT_ACTIONS.PRODUCT_IMAGE_REORDERED,
        resourceType: AUDIT_RESOURCE_TYPES.PRODUCT_IMAGE,
        resourceId: productId,
        changes: {
          items: dto.items.map(({ id, sortOrder }) => ({ id, sortOrder })),
          primaryBefore: previous,
          primaryAfter: dto.primaryImageId ?? previous,
        },
      });
      return tx.productImage.findMany({
        where: { productId },
        select: imageSelect,
        orderBy: [
          { isPrimary: 'desc' },
          { sortOrder: 'asc' },
          { createdAt: 'asc' },
          { id: 'asc' },
        ],
      });
    });
  }
  private async serial<T>(
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
  ): Promise<T> {
    for (let i = 0; ; i++) {
      try {
        return await this.prisma.$transaction(fn, {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        });
      } catch (e) {
        if (
          i < 2 &&
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === 'P2034'
        )
          continue;
        throw e;
      }
    }
  }
}
