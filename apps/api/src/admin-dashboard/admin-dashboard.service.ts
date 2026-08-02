import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { OrderStatus } from '../generated/prisma/enums';
import { PrismaService } from '../database/prisma.service';
import { compareMetric, resolveDashboardPeriod } from './dashboard-period';
import {
  DashboardPeriodQueryDto,
  RevenueGranularity,
  RevenueSeriesQueryDto,
} from './dto/dashboard-query.dto';

interface ItemAggregateRow {
  quantity: Prisma.Decimal | null;
  customers: bigint;
}
interface SeriesRow {
  bucket: Date;
  revenue: Prisma.Decimal;
  orders: bigint;
}

@Injectable()
export class AdminDashboardService {
  constructor(private readonly prisma: PrismaService) {}
  period(query: DashboardPeriodQueryDto) {
    return resolveDashboardPeriod(query.from, query.to);
  }

  private async metrics(start: Date, endExclusive: Date) {
    const completedWhere = {
      status: OrderStatus.COMPLETED,
      paymentStatus: 'PAID' as const,
      completedAt: { gte: start, lt: endExclusive },
    };
    const [completed, createdOrders, cancelledOrders, itemAggregate] =
      await Promise.all([
        this.prisma.order.aggregate({
          where: completedWhere,
          _sum: { total: true },
          _count: { id: true },
        }),
        this.prisma.order.count({
          where: { createdAt: { gte: start, lt: endExclusive } },
        }),
        this.prisma.order.count({
          where: { cancelledAt: { gte: start, lt: endExclusive } },
        }),
        this.prisma.$queryRaw<ItemAggregateRow[]>(Prisma.sql`
        SELECT COALESCE(SUM(item."quantity"), 0) AS "quantity",
          COUNT(DISTINCT orders."customerId") AS "customers"
        FROM "Order" AS orders
        LEFT JOIN "OrderItem" AS item ON item."orderId" = orders."id"
        WHERE orders."status" = 'COMPLETED' AND orders."paymentStatus" = 'PAID'
          AND orders."completedAt" >= ${start} AND orders."completedAt" < ${endExclusive}
      `),
      ]);
    const revenue = completed._sum.total ?? new Prisma.Decimal(0);
    const completedOrders = completed._count.id;
    return {
      revenue,
      completedOrders,
      createdOrders,
      averageOrderValue:
        completedOrders === 0
          ? new Prisma.Decimal(0)
          : revenue.dividedBy(completedOrders),
      itemsSold: itemAggregate[0]?.quantity ?? new Prisma.Decimal(0),
      uniqueCustomers: Number(itemAggregate[0]?.customers ?? 0n),
      cancelledOrders,
    };
  }

  async overview(query: DashboardPeriodQueryDto) {
    const period = this.period(query);
    const [current, previous, pendingConfirmation] = await Promise.all([
      this.metrics(period.start, period.endExclusive),
      this.metrics(period.previous.start, period.previous.endExclusive),
      this.prisma.order.count({
        where: { status: OrderStatus.PENDING_CONFIRMATION },
      }),
    ]);
    return {
      period,
      metrics: {
        revenue: compareMetric(current.revenue, previous.revenue, 2),
        completedOrders: compareMetric(
          current.completedOrders,
          previous.completedOrders,
          0,
        ),
        createdOrders: compareMetric(
          current.createdOrders,
          previous.createdOrders,
          0,
        ),
        averageOrderValue: compareMetric(
          current.averageOrderValue,
          previous.averageOrderValue,
          2,
        ),
        itemsSold: compareMetric(current.itemsSold, previous.itemsSold, 3),
        uniqueCustomers: compareMetric(
          current.uniqueCustomers,
          previous.uniqueCustomers,
          0,
        ),
        cancelledOrders: compareMetric(
          current.cancelledOrders,
          previous.cancelledOrders,
          0,
        ),
      },
      operational: { pendingConfirmation },
    };
  }

  async revenueSeries(query: RevenueSeriesQueryDto) {
    const period = this.period(query);
    if (query.granularity === RevenueGranularity.DAY && period.days > 93)
      throw new BadRequestException('DASHBOARD_DAY_GRANULARITY_MAX_93');
    const unit =
      query.granularity === RevenueGranularity.DAY
        ? Prisma.sql`'day'`
        : query.granularity === RevenueGranularity.WEEK
          ? Prisma.sql`'week'`
          : Prisma.sql`'month'`;
    const step =
      query.granularity === RevenueGranularity.DAY
        ? Prisma.sql`INTERVAL '1 day'`
        : query.granularity === RevenueGranularity.WEEK
          ? Prisma.sql`INTERVAL '1 week'`
          : Prisma.sql`INTERVAL '1 month'`;
    const rows = await this.prisma.$queryRaw<SeriesRow[]>(Prisma.sql`
      WITH buckets AS (
        SELECT generate_series(
          date_trunc(${unit}, timezone('Europe/Belgrade', ${period.start})),
          date_trunc(${unit}, timezone('Europe/Belgrade', ${new Date(period.endExclusive.getTime() - 1)})),
          ${step}
        ) AS bucket
      ), sales AS (
        SELECT date_trunc(${unit}, timezone('Europe/Belgrade', "completedAt")) AS bucket,
          SUM("total") AS revenue, COUNT(*) AS orders
        FROM "Order"
        WHERE "status" = 'COMPLETED' AND "paymentStatus" = 'PAID'
          AND "completedAt" >= ${period.start} AND "completedAt" < ${period.endExclusive}
        GROUP BY 1
      )
      SELECT buckets.bucket, COALESCE(sales.revenue, 0) AS revenue, COALESCE(sales.orders, 0) AS orders
      FROM buckets LEFT JOIN sales USING (bucket) ORDER BY buckets.bucket
    `);
    return {
      period,
      granularity: query.granularity,
      data: rows.map((row) => ({
        bucket: row.bucket.toISOString().slice(0, 10),
        revenue: new Prisma.Decimal(row.revenue).toFixed(2),
        orders: Number(row.orders),
      })),
    };
  }

  async ordersByStatus(query: DashboardPeriodQueryDto) {
    const period = this.period(query);
    const rows = await this.prisma.order.groupBy({
      by: ['status'],
      where: { createdAt: { gte: period.start, lt: period.endExclusive } },
      _count: { id: true },
    });
    const counts = new Map(rows.map((row) => [row.status, row._count.id]));
    const total = rows.reduce((sum, row) => sum + row._count.id, 0);
    return {
      period,
      total,
      data: Object.values(OrderStatus).map((status) => {
        const count = counts.get(status) ?? 0;
        return {
          status,
          count,
          percentage:
            total === 0
              ? '0.00'
              : new Prisma.Decimal(count).div(total).times(100).toFixed(2),
        };
      }),
    };
  }

  async orderFlow(query: DashboardPeriodQueryDto) {
    const period = this.period(query);
    const fields = [
      ['created', 'createdAt'],
      ['confirmed', 'confirmedAt'],
      ['preparing', 'preparingAt'],
      ['readyForPickup', 'readyAt'],
      ['completed', 'completedAt'],
      ['cancelled', 'cancelledAt'],
    ] as const;
    const values = await Promise.all(
      fields.map(([, field]) =>
        this.prisma.order.count({
          where: { [field]: { gte: period.start, lt: period.endExclusive } },
        }),
      ),
    );
    return {
      period,
      semantics: 'event_timestamp_counts',
      data: Object.fromEntries(
        fields.map(([name], index) => [name, values[index]]),
      ),
    };
  }
}
