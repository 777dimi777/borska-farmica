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
import { createPaginationMetadata } from '../common/pagination/pagination';
import {
  InventoryAdjustmentDto,
  InventoryMovementQueryDto,
  ManualInventoryType,
} from './dto/inventory.dto';
import { signedQuantity } from './decimal';
import { variantStockStatus } from './admin-product-stock';

@Injectable()
export class AdminInventoryService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}
  async history(
    productId: string,
    variantId: string,
    q: InventoryMovementQueryDto,
  ) {
    await this.variant(productId, variantId);
    const where: Prisma.InventoryMovementWhereInput = {
      variantId,
      ...(q.type && { type: q.type }),
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.inventoryMovement.count({ where }),
      this.prisma.inventoryMovement.findMany({
        where,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        skip: (q.page - 1) * q.limit,
        take: q.limit,
      }),
    ]);
    return {
      data: rows.map((x) => ({
        id: x.id,
        type: x.type,
        quantityDelta: x.quantityDelta.toFixed(3),
        balanceAfter: x.resultingStock?.toFixed(3) ?? null,
        reason: x.reason,
        reference: x.reference,
        createdAt: x.createdAt,
      })),
      pagination: createPaginationMetadata(q.page, q.limit, total),
    };
  }
  async adjust(
    productId: string,
    variantId: string,
    dto: InventoryAdjustmentDto,
    context: AuditContext,
  ) {
    const input = signedQuantity(dto.quantity);
    if (input.isZero())
      throw new BadRequestException('Quantity must not be zero.');
    if (dto.type !== ManualInventoryType.ADJUSTMENT && input.isNegative())
      throw new BadRequestException(
        'RESTOCK and DAMAGE quantity must be positive.',
      );
    const delta =
      dto.type === ManualInventoryType.DAMAGE ? input.negated() : input;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await this.prisma.$transaction(
          async (tx) => {
            const variant = await tx.productVariant.findFirst({
              where: { id: variantId, productId },
            });
            if (!variant)
              throw new NotFoundException('Product variant not found.');
            const after = variant.stockQuantity.plus(delta);
            if (after.isNegative() || after.lessThan(variant.reservedQuantity))
              throw new ConflictException(
                'Adjustment would make stock negative or lower than reserved stock.',
              );
            const updated = await tx.productVariant.update({
              where: { id: variantId },
              data: { stockQuantity: after },
            });
            const movement = await tx.inventoryMovement.create({
              data: {
                variantId,
                type: dto.type,
                quantityDelta: delta,
                resultingStock: after,
                reason: dto.reason ?? null,
                reference: dto.reference ?? null,
              },
            });
            const action =
              dto.type === ManualInventoryType.RESTOCK
                ? AUDIT_ACTIONS.INVENTORY_RESTOCKED
                : dto.type === ManualInventoryType.DAMAGE
                  ? AUDIT_ACTIONS.INVENTORY_DAMAGED
                  : AUDIT_ACTIONS.INVENTORY_ADJUSTED;
            await this.audit.write(tx, context, {
              action,
              resourceType: AUDIT_RESOURCE_TYPES.INVENTORY,
              resourceId: variantId,
              changes: {
                productId,
                beforeStock: variant.stockQuantity.toFixed(3),
                delta: delta.toFixed(3),
                afterStock: after.toFixed(3),
                reason: dto.reason ?? null,
                reference: dto.reference ?? null,
              },
            });
            const available = updated.stockQuantity.minus(
              updated.reservedQuantity,
            );
            return {
              variantId,
              stockQuantity: updated.stockQuantity.toFixed(3),
              reservedQuantity: updated.reservedQuantity.toFixed(3),
              availableQuantity: available.toFixed(3),
              lowStockThreshold: updated.lowStockThreshold.toFixed(3),
              stockStatus: variantStockStatus(updated),
              movement: {
                id: movement.id,
                type: movement.type,
                quantityDelta: movement.quantityDelta.toFixed(3),
                balanceAfter: movement.resultingStock?.toFixed(3) ?? null,
                reason: movement.reason,
                reference: movement.reference,
                createdAt: movement.createdAt,
              },
              updatedAt: updated.updatedAt,
            };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (!(
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2034' &&
          attempt < 3
        ))
          throw error;
      }
    }
    throw new ConflictException(
      'Inventory adjustment conflict; retry the request.',
    );
  }
  private async variant(productId: string, variantId: string) {
    const row = await this.prisma.productVariant.findFirst({
      where: { id: variantId, productId },
      select: { id: true },
    });
    if (!row) throw new NotFoundException('Product variant not found.');
    return row;
  }
}
