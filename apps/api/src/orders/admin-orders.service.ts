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
import { isRetryableTransactionError } from '../common/prisma-write-conflict';
import { belgradeCalendarDate } from '../checkout/checkout-date';
import {
  AdminOrderQueryDto,
  AdminOrderSort,
  AdminOrderTransitionDto,
} from './dto/admin-order.dto';
import { OrderStatus } from '../generated/prisma/enums';

const adminDetailInclude = {
  pickupLocation: true,
  customer: {
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      status: true,
    },
  },
  items: { orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }] },
  reservations: {
    orderBy: [{ reservedAt: 'asc' as const }, { id: 'asc' as const }],
    include: {
      variant: {
        select: {
          id: true,
          sku: true,
          stockQuantity: true,
          reservedQuantity: true,
        },
      },
    },
  },
  events: { orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }] },
} satisfies Prisma.OrderInclude;
type AdminDetail = Prisma.OrderGetPayload<{
  include: typeof adminDetailInclude;
}>;

const transitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING_CONFIRMATION: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['READY_FOR_PICKUP', 'CANCELLED'],
  READY_FOR_PICKUP: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
};

@Injectable()
export class AdminOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}

  async list(query: AdminOrderQueryDto) {
    const requestedPickupDate = {
        ...(query.requestedPickupDateFrom && {
          gte: new Date(`${query.requestedPickupDateFrom}T00:00:00.000Z`),
        }),
        ...(query.requestedPickupDateTo && {
          lte: new Date(`${query.requestedPickupDateTo}T00:00:00.000Z`),
        }),
      },
      createdAt = {
        ...(query.createdAtFrom && { gte: new Date(query.createdAtFrom) }),
        ...(query.createdAtTo && { lte: new Date(query.createdAtTo) }),
      },
      where: Prisma.OrderWhereInput = {
        ...(query.status && { status: query.status }),
        ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
        ...(query.pickupLocationId && {
          pickupLocationId: query.pickupLocationId,
        }),
        ...(Object.keys(requestedPickupDate).length && { requestedPickupDate }),
        ...(Object.keys(createdAt).length && { createdAt }),
        ...(query.search && {
          OR: [
            { orderNumber: { contains: query.search, mode: 'insensitive' } },
            {
              customerFirstName: {
                contains: query.search,
                mode: 'insensitive',
              },
            },
            {
              customerLastName: { contains: query.search, mode: 'insensitive' },
            },
            { customerEmail: { contains: query.search, mode: 'insensitive' } },
            { customerPhone: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: Prisma.OrderOrderByWithRelationInput[] =
        query.sort === AdminOrderSort.OLDEST
          ? [{ createdAt: 'asc' }, { id: 'asc' }]
          : query.sort === AdminOrderSort.PICKUP_DATE
            ? [{ requestedPickupDate: 'asc' }, { createdAt: 'asc' }]
            : query.sort === AdminOrderSort.STATUS
              ? [{ status: 'asc' }, { createdAt: 'desc' }]
              : [{ createdAt: 'desc' }, { id: 'desc' }];
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          pickupLocation: { select: { id: true, code: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);
    return {
      data: rows.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customer: {
          firstName: order.customerFirstName,
          lastName: order.customerLastName,
          email: order.customerEmail,
          phone: order.customerPhone,
        },
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        pickup: order.pickupLocation,
        requestedPickupDate: order.requestedPickupDate
          .toISOString()
          .slice(0, 10),
        confirmedPickupAt: order.confirmedPickupAt,
        total: order.total.toFixed(2),
        currency: order.currency,
        itemCount: order._count.items,
        attentionRequired: order.status === 'PENDING_CONFIRMATION',
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
      })),
      pagination: createPaginationMetadata(query.page, query.limit, total),
    };
  }

  async detail(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: adminDetailInclude,
    });
    if (!order) throw new NotFoundException('Order not found.');
    return this.mapDetail(order);
  }

  async transition(
    id: string,
    dto: AdminOrderTransitionDto,
    context: AuditContext,
  ) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.prisma.$transaction(
          async (tx) => this.transitionIn(tx, id, dto, context),
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
        return this.detail(id);
      } catch (error) {
        if (attempt < 2 && isRetryableTransactionError(error)) continue;
        throw error;
      }
    }
    throw new ConflictException('ORDER_STATUS_CONFLICT');
  }

  private async transitionIn(
    tx: Prisma.TransactionClient,
    id: string,
    dto: AdminOrderTransitionDto,
    context: AuditContext,
  ) {
    const order = await tx.order.findUnique({
      where: { id },
      include: { pickupLocation: true },
    });
    if (!order) throw new NotFoundException('Order not found.');
    if (!transitions[order.status].includes(dto.targetStatus))
      throw new ConflictException('ORDER_TRANSITION_NOT_ALLOWED');
    this.validateTransitionInput(order.requestedPickupDate, dto);
    if (dto.targetStatus === 'CANCELLED')
      return this.cancelIn(tx, order, dto, context);
    if (dto.targetStatus === 'COMPLETED')
      return this.completeIn(tx, order, context);
    const now = new Date(),
      data: Prisma.OrderUpdateManyMutationInput = {
        status: dto.targetStatus,
        ...(dto.targetStatus === 'CONFIRMED' && {
          confirmedAt: now,
          confirmedPickupAt: new Date(dto.confirmedPickupAt!),
        }),
        ...(dto.targetStatus === 'PREPARING' && { preparingAt: now }),
        ...(dto.targetStatus === 'READY_FOR_PICKUP' && { readyAt: now }),
      },
      changed = await tx.order.updateMany({
        where: { id, status: order.status },
        data,
      });
    if (changed.count !== 1)
      throw new ConflictException('ORDER_STATUS_CONFLICT');
    const type =
        dto.targetStatus === 'CONFIRMED'
          ? 'order.confirmed'
          : dto.targetStatus === 'PREPARING'
            ? 'order.preparing'
            : 'order.ready_for_pickup',
      action =
        dto.targetStatus === 'CONFIRMED'
          ? AUDIT_ACTIONS.ORDER_CONFIRMED
          : dto.targetStatus === 'PREPARING'
            ? AUDIT_ACTIONS.ORDER_PREPARING
            : AUDIT_ACTIONS.ORDER_READY_FOR_PICKUP;
    await tx.orderEvent.create({
      data: {
        orderId: id,
        type,
        fromStatus: order.status,
        toStatus: dto.targetStatus,
        actorType: 'ADMIN',
        adminId: context.adminId,
        note: dto.note ?? null,
      },
    });
    await this.audit.write(tx, context, {
      action,
      resourceType: AUDIT_RESOURCE_TYPES.ORDER,
      resourceId: id,
      changes: {
        orderNumber: order.orderNumber,
        fromStatus: order.status,
        toStatus: dto.targetStatus,
        confirmedPickupAt: dto.confirmedPickupAt ?? null,
        note: dto.note ?? null,
      },
    });
  }

  private validateTransitionInput(
    requestedPickupDate: Date,
    dto: AdminOrderTransitionDto,
  ) {
    if (dto.targetStatus === 'CONFIRMED') {
      if (!dto.confirmedPickupAt)
        throw new BadRequestException('ORDER_CONFIRMED_PICKUP_REQUIRED');
      const confirmedDate = belgradeCalendarDate(
        new Date(dto.confirmedPickupAt),
      )
        .toISOString()
        .slice(0, 10);
      if (confirmedDate !== requestedPickupDate.toISOString().slice(0, 10))
        throw new ConflictException('ORDER_CONFIRMED_PICKUP_DATE_MISMATCH');
    }
    if (dto.targetStatus === 'CANCELLED' && !dto.cancellationReason)
      throw new BadRequestException('ORDER_CANCELLATION_REASON_REQUIRED');
    if (dto.targetStatus === 'COMPLETED' && dto.cashReceived !== true)
      throw new BadRequestException('ORDER_CASH_RECEIPT_REQUIRED');
  }

  private async cancelIn(
    tx: Prisma.TransactionClient,
    order: { id: string; orderNumber: string; status: OrderStatus },
    dto: AdminOrderTransitionDto,
    context: AuditContext,
  ) {
    const now = new Date(),
      changed = await tx.order.updateMany({
        where: { id: order.id, status: order.status },
        data: {
          status: 'CANCELLED',
          paymentStatus: 'UNPAID',
          cancelledAt: now,
          cancellationReason: dto.cancellationReason!,
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
      data: { status: 'RELEASED', releasedAt: now },
    });
    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: 'order.cancelled_by_admin',
        fromStatus: order.status,
        toStatus: 'CANCELLED',
        actorType: 'ADMIN',
        adminId: context.adminId,
        note: dto.cancellationReason!,
      },
    });
    await this.audit.write(tx, context, {
      action: AUDIT_ACTIONS.ORDER_CANCELLED,
      resourceType: AUDIT_RESOURCE_TYPES.ORDER,
      resourceId: order.id,
      changes: {
        orderNumber: order.orderNumber,
        fromStatus: order.status,
        releasedReservationCount: reservations.length,
        reason: dto.cancellationReason!,
      },
    });
  }

  private async completeIn(
    tx: Prisma.TransactionClient,
    order: { id: string; orderNumber: string; status: OrderStatus },
    context: AuditContext,
  ) {
    const now = new Date(),
      changed = await tx.order.updateMany({
        where: { id: order.id, status: 'READY_FOR_PICKUP' },
        data: {
          status: 'COMPLETED',
          paymentStatus: 'PAID',
          completedAt: now,
        },
      });
    if (changed.count !== 1)
      throw new ConflictException('ORDER_STATUS_CONFLICT');
    const reservations = await tx.stockReservation.findMany({
      where: { orderId: order.id, status: 'ACTIVE' },
    });
    if (reservations.length === 0)
      throw new ConflictException('ORDER_ACTIVE_RESERVATIONS_REQUIRED');
    for (const reservation of reservations) {
      const rows = await tx.$queryRaw<
        Array<{ id: string; stockQuantity: Prisma.Decimal }>
      >(Prisma.sql`
        UPDATE "ProductVariant"
        SET "stockQuantity" = "stockQuantity" - ${reservation.quantity},
            "reservedQuantity" = "reservedQuantity" - ${reservation.quantity},
            "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = ${reservation.variantId}::uuid
          AND "stockQuantity" >= ${reservation.quantity}
          AND "reservedQuantity" >= ${reservation.quantity}
        RETURNING "id", "stockQuantity"
      `);
      if (rows.length !== 1)
        throw new ConflictException('ORDER_RESERVATION_CONFLICT');
      await tx.inventoryMovement.create({
        data: {
          variantId: reservation.variantId,
          type: 'SALE',
          quantityDelta: reservation.quantity.negated(),
          resultingStock: rows[0].stockQuantity,
          reason: 'Cash sale completed at pickup.',
          reference: order.orderNumber,
        },
      });
    }
    await tx.stockReservation.updateMany({
      where: { orderId: order.id, status: 'ACTIVE' },
      data: { status: 'CONSUMED', consumedAt: now },
    });
    await tx.orderEvent.createMany({
      data: [
        {
          orderId: order.id,
          type: 'reservation.consumed',
          actorType: 'SYSTEM',
          metadata: { count: reservations.length },
        },
        {
          orderId: order.id,
          type: 'payment.marked_paid',
          actorType: 'ADMIN',
          adminId: context.adminId,
        },
        {
          orderId: order.id,
          type: 'order.completed',
          fromStatus: order.status,
          toStatus: 'COMPLETED',
          actorType: 'ADMIN',
          adminId: context.adminId,
        },
      ],
    });
    await this.audit.write(tx, context, {
      action: AUDIT_ACTIONS.PAYMENT_CASH_RECEIVED,
      resourceType: AUDIT_RESOURCE_TYPES.ORDER,
      resourceId: order.id,
      changes: { orderNumber: order.orderNumber, paymentStatus: 'PAID' },
    });
    await this.audit.write(tx, context, {
      action: AUDIT_ACTIONS.ORDER_COMPLETED,
      resourceType: AUDIT_RESOURCE_TYPES.ORDER,
      resourceId: order.id,
      changes: {
        orderNumber: order.orderNumber,
        fromStatus: order.status,
        toStatus: 'COMPLETED',
        consumedReservationCount: reservations.length,
      },
    });
  }

  private mapDetail(order: AdminDetail) {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerProfile: order.customer,
      customerSnapshot: {
        firstName: order.customerFirstName,
        lastName: order.customerLastName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      pickup: {
        ...order.pickupLocation,
        requestedPickupDate: order.requestedPickupDate
          .toISOString()
          .slice(0, 10),
        confirmedPickupAt: order.confirmedPickupAt,
      },
      customerNote: order.customerNote,
      cancellationReason: order.cancellationReason,
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        productSlug: item.productSlug,
        variantName: item.variantName,
        sku: item.sku,
        packageAmount: item.packageAmount.toFixed(3),
        measurementUnit: item.measurementUnit,
        quantity: item.quantity.toFixed(3),
        unitPrice: item.unitPrice.toFixed(2),
        lineTotal: item.lineTotal.toFixed(2),
        imageUrl: item.imageUrl,
      })),
      reservations: order.reservations.map((reservation) => ({
        status: reservation.status,
        variantId: reservation.variantId,
        quantity: reservation.quantity.toFixed(3),
        reservedAt: reservation.reservedAt,
        releasedAt: reservation.releasedAt,
        consumedAt: reservation.consumedAt,
        stock: {
          sku: reservation.variant.sku,
          physical: reservation.variant.stockQuantity.toFixed(3),
          reserved: reservation.variant.reservedQuantity.toFixed(3),
          available: reservation.variant.stockQuantity
            .minus(reservation.variant.reservedQuantity)
            .toFixed(3),
        },
      })),
      timeline: order.events.map((event) => ({
        type: event.type,
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
        actorType: event.actorType,
        note: event.note,
        metadata: event.metadata,
        createdAt: event.createdAt,
      })),
      summary: {
        subtotal: order.subtotal.toFixed(2),
        fee: '0.00',
        total: order.total.toFixed(2),
        currency: order.currency,
      },
      confirmedAt: order.confirmedAt,
      preparingAt: order.preparingAt,
      readyAt: order.readyAt,
      completedAt: order.completedAt,
      cancelledAt: order.cancelledAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }
}
