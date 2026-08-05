import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { createPaginationMetadata } from '../common/pagination/pagination';
import { ProductQueryDto } from './dto/product-query.dto';
import { ProductListResponseDto } from './dto/product-response.dto';
import { mapProductDetail } from './product-detail.mapper';
import { ProductDetailResponseDto } from './dto/product-detail-response.dto';
import { mapProductListItem } from './products.mapper';
import { ProductSort } from './product-sort.enum';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto): Promise<ProductListResponseDto> {
    const where: Prisma.ProductWhereInput = {
      status: 'ACTIVE',
      category: { isActive: true },
      variants: { some: { isActive: true } },
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { shortDescription: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
      ...(query.category && {
        category: { isActive: true, slug: query.category },
      }),
      ...(query.featured !== undefined && { isFeatured: query.featured }),
      ...(query.mainProduct !== undefined && {
        isMainProduct: query.mainProduct,
      }),
      ...(query.availabilityMode && {
        availabilityMode: query.availabilityMode,
      }),
    };
    if (query.inStock === true) {
      where.variants = {
        some: {
          isActive: true,
          OR: [
            { allowBackorder: true },
            {
              stockQuantity: {
                gt: this.prisma.productVariant.fields.reservedQuantity,
              },
            },
          ],
        },
      };
    }
    const orderBy = this.orderBy(query.sort);
    const [total, products] = await this.prisma.$transaction([
      this.prisma.product.count({ where }),
      this.prisma.product.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          name: true,
          slug: true,
          shortDescription: true,
          isFeatured: true,
          isMainProduct: true,
          availabilityMode: true,
          isManuallyAvailable: true,
          category: { select: { name: true, slug: true } },
          variants: {
            where: { isActive: true },
            orderBy: [{ price: 'asc' }, { sortOrder: 'asc' }],
            select: {
              name: true,
              price: true,
              stockQuantity: true,
              reservedQuantity: true,
              allowBackorder: true,
            },
          },
          images: {
            orderBy: [
              { isPrimary: 'desc' },
              { sortOrder: 'asc' },
              { createdAt: 'asc' },
              { id: 'asc' },
            ],
            take: 1,
            select: { url: true, altText: true, width: true, height: true },
          },
          availabilityWindows: {
            where: { isActive: true },
            orderBy: [{ sortOrder: 'asc' }],
            select: {
              type: true,
              startsAt: true,
              endsAt: true,
              startMonth: true,
              startDay: true,
              endMonth: true,
              endDay: true,
              publicLabel: true,
            },
          },
        },
      }),
    ]);
    return {
      data: products.map((product) => mapProductListItem(product)),
      pagination: createPaginationMetadata(query.page, query.limit, total),
    };
  }

  async findBySlug(slug: string): Promise<ProductDetailResponseDto> {
    const product = await this.prisma.product.findFirst({
      where: {
        slug,
        status: 'ACTIVE',
        category: { isActive: true },
        variants: { some: { isActive: true } },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        shortDescription: true,
        description: true,
        isFeatured: true,
        isMainProduct: true,
        availabilityMode: true,
        isManuallyAvailable: true,
        seoTitle: true,
        seoDescription: true,
        category: { select: { name: true, slug: true } },
        variants: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            compareAtPrice: true,
            packageAmount: true,
            minimumPurchaseQuantity: true,
            purchaseIncrement: true,
            measurementUnit: true,
            isDefault: true,
            stockQuantity: true,
            reservedQuantity: true,
            allowBackorder: true,
          },
        },
        images: {
          orderBy: [
            { isPrimary: 'desc' },
            { sortOrder: 'asc' },
            { createdAt: 'asc' },
            { id: 'asc' },
          ],
          select: {
            id: true,
            url: true,
            altText: true,
            isPrimary: true,
            width: true,
            height: true,
          },
        },
        availabilityWindows: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }],
          select: {
            type: true,
            startsAt: true,
            endsAt: true,
            startMonth: true,
            startDay: true,
            endMonth: true,
            endDay: true,
            publicLabel: true,
          },
        },
      },
    });
    if (!product) throw new NotFoundException('Product not found.');
    return mapProductDetail(product);
  }
  private orderBy(sort: ProductSort): Prisma.ProductOrderByWithRelationInput[] {
    switch (sort) {
      case ProductSort.NAME_ASC:
        return [{ name: 'asc' }];
      case ProductSort.NAME_DESC:
        return [{ name: 'desc' }];
      case ProductSort.FEATURED:
        return [
          { isFeatured: 'desc' },
          { isMainProduct: 'desc' },
          { createdAt: 'desc' },
        ];
      default:
        return [{ createdAt: 'desc' }];
    }
  }
}
