import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { createPaginationMetadata } from '../common/pagination/pagination';
import {
  AdminProductQueryDto,
  AdminProductSort,
  AdminProductStatus,
  AdminStockStatus,
} from './dto/admin-product-query.dto';
import {
  AdminProductDetailDto,
  AdminProductListDto,
} from './dto/admin-product-response.dto';
import {
  mapAdminProduct,
  mapAdminProductDetail,
} from './admin-products.mapper';

const select = {
  id: true,
  categoryId: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  status: true,
  isFeatured: true,
  isMainProduct: true,
  availabilityMode: true,
  isManuallyAvailable: true,
  seoTitle: true,
  seoDescription: true,
  createdAt: true,
  updatedAt: true,
  category: { select: { id: true, name: true, slug: true, isActive: true } },
  variants: {
    orderBy: [
      { isDefault: 'desc' as const },
      { sortOrder: 'asc' as const },
      { name: 'asc' as const },
    ],
  },
  images: {
    orderBy: [{ isPrimary: 'desc' as const }, { sortOrder: 'asc' as const }],
    select: {
      id: true,
      url: true,
      altText: true,
      isPrimary: true,
      sortOrder: true,
    },
  },
  availabilityWindows: { orderBy: [{ sortOrder: 'asc' as const }] },
};

@Injectable()
export class AdminProductsService {
  constructor(private readonly prisma: PrismaService) {}
  async findAll(q: AdminProductQueryDto): Promise<AdminProductListDto> {
    const stockIds =
      q.stockStatus === AdminStockStatus.ALL
        ? undefined
        : await this.stockProductIds(q.stockStatus);
    const where: Prisma.ProductWhereInput = {
      ...(stockIds && { id: { in: stockIds } }),
      ...(q.search && {
        OR: [
          { name: { contains: q.search, mode: 'insensitive' } },
          { slug: { contains: q.search, mode: 'insensitive' } },
          {
            variants: {
              some: { sku: { contains: q.search, mode: 'insensitive' } },
            },
          },
        ],
      }),
      ...(q.categoryId && { categoryId: q.categoryId }),
      ...(q.status !== AdminProductStatus.ALL && { status: q.status }),
      ...(q.featured !== undefined && { isFeatured: q.featured }),
      ...(q.mainProduct !== undefined && { isMainProduct: q.mainProduct }),
      ...(q.availabilityMode && { availabilityMode: q.availabilityMode }),
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy: this.order(q.sort),
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        select,
      }),
    ]);
    return {
      data: rows.map(mapAdminProduct),
      pagination: createPaginationMetadata(q.page, q.limit, total),
    };
  }
  async findOne(id: string): Promise<AdminProductDetailDto> {
    const row = await this.prisma.product.findUnique({ where: { id }, select });
    if (!row) throw new NotFoundException('Product not found.');
    return mapAdminProductDetail(row);
  }
  private order(
    sort: AdminProductSort,
  ): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case AdminProductSort.OLDEST:
        return [{ createdAt: 'asc' }, { id: 'asc' }];
      case AdminProductSort.NAME_ASC:
        return [{ name: 'asc' }, { id: 'asc' }];
      case AdminProductSort.NAME_DESC:
        return [{ name: 'desc' }, { id: 'asc' }];
      case AdminProductSort.UPDATED_DESC:
        return [{ updatedAt: 'desc' }, { id: 'asc' }];
      case AdminProductSort.STATUS:
        return [{ status: 'asc' }, { name: 'asc' }, { id: 'asc' }];
      default:
        return [{ createdAt: 'desc' }, { id: 'asc' }];
    }
  }
  private async stockProductIds(status: AdminStockStatus): Promise<string[]> {
    const rows = await this.prisma.$queryRaw<Array<{ id: string }>>(
      Prisma.sql`SELECT p.id FROM "Product" p WHERE CASE ${status} WHEN 'in_stock' THEN EXISTS (SELECT 1 FROM "ProductVariant" v WHERE v."productId"=p.id AND v."isActive" AND v."stockQuantity"-v."reservedQuantity">v."lowStockThreshold") WHEN 'low_stock' THEN EXISTS (SELECT 1 FROM "ProductVariant" v WHERE v."productId"=p.id AND v."isActive" AND v."stockQuantity"-v."reservedQuantity">0 AND v."stockQuantity"-v."reservedQuantity"<=v."lowStockThreshold") WHEN 'backorder' THEN EXISTS (SELECT 1 FROM "ProductVariant" v WHERE v."productId"=p.id AND v."isActive" AND v."allowBackorder" AND v."stockQuantity"-v."reservedQuantity"<=0) WHEN 'out_of_stock' THEN NOT EXISTS (SELECT 1 FROM "ProductVariant" v WHERE v."productId"=p.id AND v."isActive" AND (v."stockQuantity"-v."reservedQuantity">0 OR v."allowBackorder")) ELSE TRUE END`,
    );
    return rows.map((x) => x.id);
  }
}
