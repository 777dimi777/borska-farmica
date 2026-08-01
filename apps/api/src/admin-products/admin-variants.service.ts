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
import { CreateVariantDto, UpdateVariantDto } from './dto/variant-mutation.dto';
import { decimal } from './decimal';
import { AdminProductsService } from './admin-products.service';

@Injectable()
export class AdminVariantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
    private readonly products: AdminProductsService,
  ) {}
  async create(
    productId: string,
    dto: CreateVariantDto,
    context: AuditContext,
  ) {
    this.validate(dto);
    try {
      await this.prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
          where: { id: productId },
          include: { _count: { select: { variants: true } } },
        });
        if (!product) throw new NotFoundException('Product not found.');
        const isDefault =
          product._count.variants === 0 || dto.isDefault === true;
        if (isDefault)
          await tx.productVariant.updateMany({
            where: { productId, isDefault: true },
            data: { isDefault: false },
          });
        const row = await tx.productVariant.create({
          data: {
            productId,
            name: dto.name,
            sku: dto.sku,
            price: decimal(dto.price, 2),
            compareAtPrice:
              dto.compareAtPrice == null
                ? null
                : decimal(dto.compareAtPrice, 2),
            packageAmount: decimal(dto.packageAmount, 3),
            measurementUnit: dto.unit,
            lowStockThreshold: decimal(dto.lowStockThreshold, 3),
            minimumPurchaseQuantity: decimal(dto.minimumPurchaseQuantity, 3),
            purchaseIncrement: decimal(dto.purchaseIncrement, 3),
            allowBackorder: dto.allowBackorder ?? false,
            isDefault,
            isActive: dto.isActive ?? true,
            sortOrder: dto.sortOrder ?? 0,
          },
        });
        await this.audit.write(tx, context, {
          action: AUDIT_ACTIONS.PRODUCT_VARIANT_CREATED,
          resourceType: AUDIT_RESOURCE_TYPES.PRODUCT_VARIANT,
          resourceId: row.id,
          changes: {
            productId,
            sku: { after: row.sku },
            isDefault: { after: row.isDefault },
          },
        });
      });
      return this.products.findOne(productId);
    } catch (error) {
      this.mapError(error);
    }
  }
  async update(
    productId: string,
    variantId: string,
    dto: UpdateVariantDto,
    context: AuditContext,
  ) {
    if (!Object.values(dto).some((value) => value !== undefined))
      throw new BadRequestException('At least one field is required.');
    this.validate(dto);
    try {
      await this.prisma.$transaction(async (tx) => {
        const variant = await tx.productVariant.findFirst({
          where: { id: variantId, productId },
          include: { product: { include: { variants: true } } },
        });
        if (!variant) throw new NotFoundException('Product variant not found.');
        const activeOthers = variant.product.variants.filter(
          (x) => x.id !== variantId && x.isActive,
        );
        if (
          variant.product.status === 'ACTIVE' &&
          dto.isActive === false &&
          !activeOthers.length
        )
          throw new ConflictException(
            'Cannot deactivate the last active variant of an ACTIVE product.',
          );
        if (
          dto.isDefault === false &&
          variant.isDefault &&
          !activeOthers.some((x) => x.isDefault)
        )
          throw new ConflictException('Choose another default variant first.');
        if (dto.isActive === false && variant.isDefault) {
          const replacement = activeOthers.sort(
            (a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name),
          )[0];
          if (!replacement && variant.product.status === 'ACTIVE')
            throw new ConflictException(
              'An ACTIVE product requires a default active variant.',
            );
          if (replacement)
            await tx.productVariant.update({
              where: { id: replacement.id },
              data: { isDefault: true },
            });
        }
        if (dto.isDefault === true)
          await tx.productVariant.updateMany({
            where: { productId, isDefault: true, id: { not: variantId } },
            data: { isDefault: false },
          });
        const data: Prisma.ProductVariantUpdateInput = {};
        if (dto.name !== undefined) data.name = dto.name;
        if (dto.sku !== undefined) data.sku = dto.sku;
        if (dto.price !== undefined) data.price = decimal(dto.price, 2);
        if (dto.compareAtPrice !== undefined)
          data.compareAtPrice =
            dto.compareAtPrice == null ? null : decimal(dto.compareAtPrice, 2);
        if (dto.packageAmount !== undefined)
          data.packageAmount = decimal(dto.packageAmount, 3);
        if (dto.unit !== undefined) data.measurementUnit = dto.unit;
        if (dto.lowStockThreshold !== undefined)
          data.lowStockThreshold = decimal(dto.lowStockThreshold, 3);
        if (dto.minimumPurchaseQuantity !== undefined)
          data.minimumPurchaseQuantity = decimal(
            dto.minimumPurchaseQuantity,
            3,
          );
        if (dto.purchaseIncrement !== undefined)
          data.purchaseIncrement = decimal(dto.purchaseIncrement, 3);
        for (const key of [
          'allowBackorder',
          'isDefault',
          'isActive',
          'sortOrder',
        ] as const)
          if (dto[key] !== undefined) data[key] = dto[key];
        if (dto.isActive === false && variant.isDefault) data.isDefault = false;
        const row = await tx.productVariant.update({
          where: { id: variantId },
          data,
        });
        const action =
          dto.isDefault === true
            ? AUDIT_ACTIONS.PRODUCT_VARIANT_DEFAULT_CHANGED
            : dto.isActive === true && !variant.isActive
              ? AUDIT_ACTIONS.PRODUCT_VARIANT_ACTIVATED
              : dto.isActive === false && variant.isActive
                ? AUDIT_ACTIONS.PRODUCT_VARIANT_DEACTIVATED
                : AUDIT_ACTIONS.PRODUCT_VARIANT_UPDATED;
        await this.audit.write(tx, context, {
          action,
          resourceType: AUDIT_RESOURCE_TYPES.PRODUCT_VARIANT,
          resourceId: variantId,
          changes: {
            productId,
            before: this.snapshot(variant),
            after: this.snapshot(row),
          },
        });
      });
      return this.products.findOne(productId);
    } catch (error) {
      this.mapError(error);
    }
  }
  async remove(
    productId: string,
    variantId: string,
    context: AuditContext,
  ): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findFirst({
        where: { id: variantId, productId },
        include: {
          product: { include: { variants: true } },
          _count: { select: { inventoryMovements: true } },
        },
      });
      if (!variant) throw new NotFoundException('Product variant not found.');
      const remainingActive = variant.product.variants.filter(
        (x) => x.id !== variantId && x.isActive,
      );
      if (
        variant._count.inventoryMovements ||
        !variant.stockQuantity.isZero() ||
        !variant.reservedQuantity.isZero() ||
        (variant.product.status === 'ACTIVE' &&
          (!remainingActive.length ||
            (variant.isDefault && !remainingActive.some((x) => x.isDefault))))
      )
        throw new ConflictException(
          'Variant cannot be deleted; deactivate it instead.',
        );
      await tx.productVariant.delete({ where: { id: variantId } });
      await this.audit.write(tx, context, {
        action: AUDIT_ACTIONS.PRODUCT_VARIANT_DELETED,
        resourceType: AUDIT_RESOURCE_TYPES.PRODUCT_VARIANT,
        resourceId: variantId,
        changes: { snapshot: { productId, sku: variant.sku } },
      });
    });
  }
  private validate(dto: Partial<CreateVariantDto>) {
    const price = dto.price === undefined ? undefined : decimal(dto.price, 2);
    const compare =
      dto.compareAtPrice == null ? undefined : decimal(dto.compareAtPrice, 2);
    if (price?.lessThanOrEqualTo(0))
      throw new BadRequestException('Price must be greater than zero.');
    if (price && compare && compare.lessThanOrEqualTo(price))
      throw new BadRequestException(
        'Compare-at price must be greater than price.',
      );
    for (const key of [
      'packageAmount',
      'minimumPurchaseQuantity',
      'purchaseIncrement',
    ] as const)
      if (dto[key] !== undefined && decimal(dto[key], 3).lessThanOrEqualTo(0))
        throw new BadRequestException(`${key} must be greater than zero.`);
  }
  private snapshot(v: {
    sku: string;
    price: Prisma.Decimal;
    compareAtPrice: Prisma.Decimal | null;
    isActive: boolean;
    isDefault: boolean;
  }) {
    return {
      sku: v.sku,
      price: v.price.toFixed(2),
      compareAtPrice: v.compareAtPrice?.toFixed(2) ?? null,
      isActive: v.isActive,
      isDefault: v.isDefault,
    };
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
      throw new ConflictException('Variant SKU already exists.');
    throw error;
  }
}
