import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { createPaginationMetadata } from '../common/pagination/pagination';
import { isRetryableTransactionError } from '../common/prisma-write-conflict';
import {
  CustomerCancelOrderDto,
  CustomerOrderQueryDto,
  CustomerOrderSort,
} from './dto/customer-order.dto';

const detailInclude = {
  pickupLocation: {
    select: {
      id: true,
      code: true,
      name: true,
      address: true,
      instructions: true,
    },
  },
  items: { orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }] },
  events: { orderBy: [{ createdAt: 'asc' as const }, { id: 'asc' as const }] },
} satisfies Prisma.OrderInclude;
type Detail = Prisma.OrderGetPayload<{ include: typeof detailInclude }>;

@Injectable()
export class CustomerOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(customerId: string, query: CustomerOrderQueryDto) {
    const where: Prisma.OrderWhereInput = {
      customerId,
      ...(query.status && { status: query.status }),
    };
    const orderBy: Prisma.OrderOrderByWithRelationInput[] =
      query.sort === CustomerOrderSort.OLDEST
        ? ([{ createdAt: 'asc' as const }, { id: 'asc' as const }] as const)
        : ([{ createdAt: 'desc' as const }, { id: 'desc' as const }] as const);
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        include: {
          pickupLocation: { select: { code: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);
    return {
      data: rows.map((order) => ({
        orderNumber: order.orderNumber,
        status: order.status,
        paymentStatus: order.paymentStatus,
        total: order.total.toFixed(2),
        currency: order.currency,
        pickup: order.pickupLocation,
        requestedPickupDate: order.requestedPickupDate
          .toISOString()
          .slice(0, 10),
        confirmedPickupAt: order.confirmedPickupAt,
        itemCount: order._count.items,
        createdAt: order.createdAt,
      })),
      pagination: createPaginationMetadata(query.page, query.limit, total),
    };
  }

  async detail(customerId: string, orderNumber: string) {
    const order = await this.prisma.order.findFirst({
      where: { customerId, orderNumber },
      include: detailInclude,
    });
    if (!order) throw new NotFoundException('Order not found.');
    return this.mapDetail(order);
  }

  async cancel(
    customerId: string,
    orderNumber: string,
    dto: CustomerCancelOrderDto,
  ) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await this.prisma.$transaction(
          async (tx) => {
            const current = await tx.order.findFirst({
              where: { customerId, orderNumber },
              select: { id: true, status: true },
            });
            if (!current) throw new NotFoundException('Order not found.');
            if (current.status === 'CANCELLED') return;
            if (current.status !== 'PENDING_CONFIRMATION')
              throw new ConflictException('ORDER_CANCELLATION_NOT_ALLOWED');
            const now = new Date(),
              changed = await tx.order.updateMany({
                where: {
                  id: current.id,
                  customerId,
                  status: 'PENDING_CONFIRMATION',
                },
                data: {
                  status: 'CANCELLED',
                  cancelledAt: now,
                  cancellationReason: dto.reason ?? null,
                },
              });
            if (changed.count !== 1)
              throw new ConflictException('ORDER_STATUS_CONFLICT');
            const reservations = await tx.stockReservation.findMany({
              where: { orderId: current.id, status: 'ACTIVE' },
            });
            for (const reservation of reservations) {
              const released = await tx.$queryRaw<
                Array<{ id: string }>
              >(Prisma.sql`
                UPDATE "ProductVariant"
                SET "reservedQuantity" = "reservedQuantity" - ${reservation.quantity},
                    "updatedAt" = CURRENT_TIMESTAMP
                WHERE "id" = ${reservation.variantId}::uuid
                  AND "reservedQuantity" >= ${reservation.quantity}
                RETURNING "id"
              `);
              if (released.length !== 1)
                throw new ConflictException('ORDER_RESERVATION_CONFLICT');
            }
            await tx.stockReservation.updateMany({
              where: { orderId: current.id, status: 'ACTIVE' },
              data: { status: 'RELEASED', releasedAt: now },
            });
            await tx.orderEvent.create({
              data: {
                orderId: current.id,
                type: 'order.cancelled_by_customer',
                fromStatus: 'PENDING_CONFIRMATION',
                toStatus: 'CANCELLED',
                actorType: 'CUSTOMER',
                customerId,
                note: dto.reason ?? null,
              },
            });
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
        return this.detail(customerId, orderNumber);
      } catch (error) {
        if (attempt < 2 && isRetryableTransactionError(error)) continue;
        throw error;
      }
    }
    throw new ConflictException('ORDER_STATUS_CONFLICT');
  }

  private mapDetail(order: Detail) {
    return {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      pickup: {
        ...order.pickupLocation,
        requestedPickupDate: order.requestedPickupDate
          .toISOString()
          .slice(0, 10),
        confirmedPickupAt: order.confirmedPickupAt,
        exactTimeRequiresConfirmation: true,
      },
      customer: {
        firstName: order.customerFirstName,
        lastName: order.customerLastName,
        email: order.customerEmail,
        phone: order.customerPhone,
      },
      customerNote: order.customerNote,
      cancellationReason: order.cancellationReason,
      items: order.items.map((item) => ({
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
      summary: {
        subtotal: order.subtotal.toFixed(2),
        fee: '0.00',
        total: order.total.toFixed(2),
        currency: order.currency,
      },
      timeline: order.events.map((event) => ({
        type: event.type,
        fromStatus: event.fromStatus,
        toStatus: event.toStatus,
        note: event.actorType === 'CUSTOMER' ? event.note : null,
        createdAt: event.createdAt,
      })),
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
