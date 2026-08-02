/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { createPaginationMetadata } from '../common/pagination/pagination';
import {
  AdminCustomerOrderQueryDto,
  AdminCustomerQueryDto,
  CustomerOrderSort,
  CustomerSort,
} from './dto/admin-customer.dto';

@Injectable()
export class AdminCustomersService {
  constructor(private readonly prisma: PrismaService) {}
  private where(query: AdminCustomerQueryDto): Prisma.CustomerUserWhereInput {
    const terms = query.search?.split(/\s+/).filter(Boolean) ?? [];
    const createdAt = {
      ...(query.createdFrom && { gte: new Date(query.createdFrom) }),
      ...(query.createdTo && { lte: new Date(query.createdTo) }),
    };
    const orderCreated = {
      ...(query.lastOrderFrom && { gte: new Date(query.lastOrderFrom) }),
      ...(query.lastOrderTo && { lte: new Date(query.lastOrderTo) }),
    };
    return {
      ...(query.status && { status: query.status }),
      ...(Object.keys(createdAt).length && { createdAt }),
      ...(Object.keys(orderCreated).length && {
        orders: { some: { createdAt: orderCreated } },
      }),
      ...(terms.length && {
        AND: terms.map((term) => ({
          OR: [
            { firstName: { contains: term, mode: 'insensitive' } },
            { lastName: { contains: term, mode: 'insensitive' } },
            { email: { contains: term, mode: 'insensitive' } },
            {
              phone: { contains: term.replace(/\s/g, ''), mode: 'insensitive' },
            },
          ],
        })),
      }),
    };
  }
  private map(customer: any) {
    const completed = customer.orders.filter(
      (o: any) => o.status === 'COMPLETED' && o.paymentStatus === 'PAID',
    );
    const total = completed.reduce(
      (sum: Prisma.Decimal, o: any) => sum.plus(o.total),
      new Prisma.Decimal(0),
    );
    return {
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      fullName: customer.firstName + ' ' + customer.lastName,
      email: customer.email,
      phone: customer.phone,
      status: customer.status,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      lastLoginAt: customer.lastLoginAt,
      orderCount: customer.orders.length,
      completedOrderCount: completed.length,
      cancelledOrderCount: customer.orders.filter(
        (o: any) => o.status === 'CANCELLED',
      ).length,
      totalSpent: total.toFixed(2),
      lastOrderAt: customer.orders[0]?.createdAt ?? null,
      activeSessionCount: customer.sessions.length,
    };
  }
  async list(query: AdminCustomerQueryDto) {
    const where = this.where(query);
    const orderBy: Prisma.CustomerUserOrderByWithRelationInput[] =
      query.sort === CustomerSort.OLDEST
        ? [{ createdAt: 'asc' }, { id: 'asc' }]
        : query.sort === CustomerSort.NAME_ASC
          ? [{ firstName: 'asc' }, { lastName: 'asc' }, { id: 'asc' }]
          : query.sort === CustomerSort.NAME_DESC
            ? [{ firstName: 'desc' }, { lastName: 'desc' }, { id: 'desc' }]
            : [{ createdAt: 'desc' }, { id: 'desc' }];
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.customerUser.count({ where }),
      this.prisma.customerUser.findMany({
        where,
        orderBy,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lastLoginAt: true,
          orders: {
            orderBy: { createdAt: 'desc' },
            select: {
              status: true,
              paymentStatus: true,
              total: true,
              createdAt: true,
            },
          },
          sessions: {
            where: { revokedAt: null, expiresAt: { gt: new Date() } },
            select: { id: true },
          },
        },
      }),
    ]);
    let data = rows.map((row) => this.map(row));
    if (query.sort === CustomerSort.LAST_ORDER_DESC)
      data = data.sort(
        (a, b) =>
          (b.lastOrderAt?.getTime() ?? 0) - (a.lastOrderAt?.getTime() ?? 0),
      );
    if (query.sort === CustomerSort.TOTAL_SPENT_DESC)
      data = data.sort((a, b) =>
        new Prisma.Decimal(b.totalSpent).cmp(a.totalSpent),
      );
    return {
      data,
      pagination: createPaginationMetadata(query.page, query.limit, total),
    };
  }
  async detail(id: string) {
    const row = await this.prisma.customerUser.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        lastLoginAt: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            orderNumber: true,
            status: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
          },
          take: 100,
        },
        sessions: {
          where: { revokedAt: null, expiresAt: { gt: new Date() } },
          select: { id: true },
        },
      },
    });
    if (!row) throw new NotFoundException('Customer not found.');
    const base = this.map(row);
    const distribution = Object.fromEntries(
      [
        'PENDING_CONFIRMATION',
        'CONFIRMED',
        'PREPARING',
        'READY_FOR_PICKUP',
        'COMPLETED',
        'CANCELLED',
      ].map((s) => [s, row.orders.filter((o) => o.status === s).length]),
    );
    return {
      ...base,
      orderStatusDistribution: distribution,
      recentOrders: row.orders
        .slice(0, 5)
        .map((o) => ({ ...o, total: o.total.toFixed(2) })),
    };
  }
  async orders(id: string, query: AdminCustomerOrderQueryDto) {
    if (!(await this.prisma.customerUser.count({ where: { id } })))
      throw new NotFoundException('Customer not found.');
    const createdAt = {
      ...(query.createdFrom && { gte: new Date(query.createdFrom) }),
      ...(query.createdTo && { lte: new Date(query.createdTo) }),
    };
    const where: Prisma.OrderWhereInput = {
      customerId: id,
      ...(query.status && { status: query.status }),
      ...(query.paymentStatus && { paymentStatus: query.paymentStatus }),
      ...(Object.keys(createdAt).length && { createdAt }),
    };
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy: [
          {
            createdAt: query.sort === CustomerOrderSort.OLDEST ? 'asc' : 'desc',
          },
          { id: 'desc' },
        ],
        include: {
          pickupLocation: { select: { id: true, code: true, name: true } },
          _count: { select: { items: true } },
        },
      }),
    ]);
    return {
      data: rows.map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        status: o.status,
        paymentStatus: o.paymentStatus,
        total: o.total.toFixed(2),
        currency: o.currency,
        pickup: o.pickupLocation,
        itemCount: o._count.items,
        createdAt: o.createdAt,
        completedAt: o.completedAt,
      })),
      pagination: createPaginationMetadata(query.page, query.limit, total),
    };
  }
}
