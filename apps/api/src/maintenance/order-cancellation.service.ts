import { ConflictException, Injectable } from '@nestjs/common';
import {
  Prisma,
  OrderActorType,
  OrderCancellationReason,
  OrderStatus,
} from '../generated/prisma/client';

export interface CancelOrderInput {
  orderId: string;
  expectedStatuses: OrderStatus[];
  now: Date;
  reason: OrderCancellationReason;
  note?: string | null;
  actorType: OrderActorType;
  adminId?: string;
  customerId?: string;
  eventType: string;
  expiresAtOrBefore?: Date;
}

@Injectable()
export class OrderCancellationService {
  async cancelIn(tx: Prisma.TransactionClient, input: CancelOrderInput) {
    await tx.$queryRaw(Prisma.sql`
      SELECT "id" FROM "Order" WHERE "id" = ${input.orderId}::uuid FOR UPDATE
    `);
    const order = await tx.order.findUnique({
      where: { id: input.orderId },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        confirmationExpiresAt: true,
      },
    });
    if (!order || !input.expectedStatuses.includes(order.status))
      throw new ConflictException('ORDER_STATUS_CONFLICT');
    if (
      input.expiresAtOrBefore &&
      (!order.confirmationExpiresAt ||
        order.confirmationExpiresAt > input.expiresAtOrBefore)
    )
      throw new ConflictException('ORDER_NOT_EXPIRED');
    const changed = await tx.order.updateMany({
      where: {
        id: order.id,
        status: { in: input.expectedStatuses },
        ...(input.expiresAtOrBefore && {
          confirmationExpiresAt: { lte: input.expiresAtOrBefore },
        }),
      },
      data: {
        status: 'CANCELLED',
        paymentStatus: 'UNPAID',
        cancelledAt: input.now,
        cancellationReason: input.reason,
        cancellationNote: input.note ?? null,
      },
    });
    if (changed.count !== 1)
      throw new ConflictException('ORDER_STATUS_CONFLICT');
    const reservations = await tx.stockReservation.findMany({
      where: { orderId: order.id, status: 'ACTIVE' },
    });
    for (const reservation of reservations) {
      const rows = await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        UPDATE "ProductVariant"
        SET "reservedQuantity" = "reservedQuantity" - ${reservation.quantity},
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${reservation.variantId}::uuid
          AND "reservedQuantity" >= ${reservation.quantity}
        RETURNING "id"
      `);
      if (rows.length !== 1)
        throw new ConflictException('ORDER_RESERVATION_CONFLICT');
    }
    await tx.stockReservation.updateMany({
      where: { orderId: order.id, status: 'ACTIVE' },
      data: { status: 'RELEASED', releasedAt: input.now },
    });
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: input.eventType,
        fromStatus: order.status,
        toStatus: 'CANCELLED',
        actorType: input.actorType,
        adminId: input.adminId,
        customerId: input.customerId,
        note: input.note ?? null,
        metadata:
          input.reason === 'CONFIRMATION_TIMEOUT'
            ? { reason: input.reason }
            : undefined,
      },
    });
    return {
      orderNumber: order.orderNumber,
      fromStatus: order.status,
      releasedReservationCount: reservations.length,
    };
  }
}
