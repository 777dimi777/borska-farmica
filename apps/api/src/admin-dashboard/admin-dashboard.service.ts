import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client';
import { OrderStatus } from '../generated/prisma/enums';
import { AdminStockStatus } from '../admin-products/dto/admin-product-query.dto';
import { variantStockStatus } from '../admin-products/admin-product-stock';
import { evaluateAvailability } from '../products/availability';
import { PrismaService } from '../database/prisma.service';
import {
  belgradeBusinessDate,
  compareMetric,
  DASHBOARD_TIME_ZONE,
  resolveDashboardPeriod,
} from './dashboard-period';
import {
  DashboardPeriodQueryDto,
  RevenueGranularity,
  RevenueSeriesQueryDto,
  TopProductsQueryDto,
  TopProductsSort,
  InventoryAlertsQueryDto,
  InventoryAlertFilter,
  SeasonalDashboardQueryDto,
  RecentOrdersQueryDto,
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
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}
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

  async topProducts(query: TopProductsQueryDto) {
    const period = this.period(query);
    const orderBy =
      query.sort === TopProductsSort.QUANTITY
        ? Prisma.sql`quantity DESC, revenue DESC`
        : query.sort === TopProductsSort.ORDERS
          ? Prisma.sql`orders DESC, revenue DESC`
          : Prisma.sql`revenue DESC, quantity DESC`;
    const rows = await this.prisma.$queryRaw<
      Array<{
        productId: string;
        productName: string;
        productSlug: string;
        revenue: Prisma.Decimal;
        quantity: Prisma.Decimal;
        orders: bigint;
        imageUrl: string | null;
      }>
    >(Prisma.sql`
      SELECT item."productId",
        (array_agg(item."productName" ORDER BY orders."completedAt" DESC))[1] AS "productName",
        (array_agg(item."productSlug" ORDER BY orders."completedAt" DESC))[1] AS "productSlug",
        SUM(item."lineTotal") AS revenue, SUM(item.quantity) AS quantity,
        COUNT(DISTINCT orders.id) AS orders,
        (SELECT image.url FROM "ProductImage" image
          WHERE image."productId" = item."productId"
          ORDER BY image."isPrimary" DESC, image."sortOrder", image."createdAt", image.id
          LIMIT 1) AS "imageUrl"
      FROM "OrderItem" item JOIN "Order" orders ON orders.id = item."orderId"
      WHERE orders.status = 'COMPLETED' AND orders."paymentStatus" = 'PAID'
        AND orders."completedAt" >= ${period.start}
        AND orders."completedAt" < ${period.endExclusive}
      GROUP BY item."productId"
      ORDER BY ${orderBy}
      LIMIT ${query.limit}
    `);
    return {
      period,
      sort: query.sort,
      data: rows.map((row) => ({
        ...row,
        revenue: new Prisma.Decimal(row.revenue).toFixed(2),
        quantity: new Prisma.Decimal(row.quantity).toFixed(3),
        orders: Number(row.orders),
      })),
    };
  }

  async categorySales(query: DashboardPeriodQueryDto) {
    const period = this.period(query);
    const rows = await this.prisma.$queryRaw<
      Array<{
        categoryId: string;
        categoryName: string;
        categorySlug: string;
        revenue: Prisma.Decimal;
        quantity: Prisma.Decimal;
        orders: bigint;
      }>
    >(Prisma.sql`
      SELECT item."categoryId",
        (array_agg(item."categoryName" ORDER BY orders."completedAt" DESC))[1] AS "categoryName",
        (array_agg(item."categorySlug" ORDER BY orders."completedAt" DESC))[1] AS "categorySlug",
        SUM(item."lineTotal") AS revenue, SUM(item.quantity) AS quantity,
        COUNT(DISTINCT orders.id) AS orders
      FROM "OrderItem" item JOIN "Order" orders ON orders.id = item."orderId"
      WHERE orders.status = 'COMPLETED' AND orders."paymentStatus" = 'PAID'
        AND orders."completedAt" >= ${period.start}
        AND orders."completedAt" < ${period.endExclusive}
      GROUP BY item."categoryId" ORDER BY revenue DESC, quantity DESC
    `);
    return {
      period,
      snapshotSource: 'order_item',
      data: rows.map((row) => ({
        ...row,
        revenue: new Prisma.Decimal(row.revenue).toFixed(2),
        quantity: new Prisma.Decimal(row.quantity).toFixed(3),
        orders: Number(row.orders),
      })),
    };
  }

  async pickupSales(query: DashboardPeriodQueryDto) {
    const period = this.period(query);
    const rows = await this.prisma.$queryRaw<
      Array<{
        pickupLocationId: string;
        code: string;
        name: string;
        address: string | null;
        revenue: Prisma.Decimal;
        orders: bigint;
      }>
    >(Prisma.sql`
      SELECT location.id AS "pickupLocationId", location.code, location.name, location.address,
        COALESCE(SUM(orders.total), 0) AS revenue, COUNT(orders.id) AS orders
      FROM "PickupLocation" location
      LEFT JOIN "Order" orders ON orders."pickupLocationId" = location.id
        AND orders.status = 'COMPLETED' AND orders."paymentStatus" = 'PAID'
        AND orders."completedAt" >= ${period.start}
        AND orders."completedAt" < ${period.endExclusive}
      GROUP BY location.id ORDER BY revenue DESC, location."sortOrder"
    `);
    return {
      period,
      displaySource: 'current_pickup_location',
      data: rows.map((row) => ({
        ...row,
        revenue: new Prisma.Decimal(row.revenue).toFixed(2),
        orders: Number(row.orders),
      })),
    };
  }

  private async activeVariants() {
    return this.prisma.productVariant.findMany({
      where: { isActive: true, product: { status: 'ACTIVE' } },
      orderBy: [
        { product: { name: 'asc' } },
        { sortOrder: 'asc' },
        { id: 'asc' },
      ],
      select: {
        id: true,
        name: true,
        sku: true,
        measurementUnit: true,
        stockQuantity: true,
        reservedQuantity: true,
        lowStockThreshold: true,
        allowBackorder: true,
        isActive: true,
        product: { select: { id: true, name: true, slug: true } },
      },
    });
  }

  private stockAlert(
    variant: Awaited<
      ReturnType<AdminDashboardService['activeVariants']>
    >[number],
  ) {
    const stockStatus = variantStockStatus(variant);
    const available = variant.stockQuantity.minus(variant.reservedQuantity);
    const reservedPressure =
      variant.reservedQuantity.isPositive() &&
      (variant.stockQuantity.isZero() ||
        variant.reservedQuantity.times(4).gte(variant.stockQuantity.times(3)));
    return { stockStatus, available, reservedPressure };
  }

  async inventoryAlerts(query: InventoryAlertsQueryDto) {
    const variants = await this.activeVariants();
    const data = variants.flatMap((variant) => {
      const alert = this.stockAlert(variant);
      const matches =
        query.status === InventoryAlertFilter.ALL
          ? alert.stockStatus !== AdminStockStatus.IN_STOCK ||
            alert.reservedPressure
          : query.status === InventoryAlertFilter.LOW
            ? alert.stockStatus === AdminStockStatus.LOW_STOCK
            : query.status === InventoryAlertFilter.OUT
              ? alert.stockStatus === AdminStockStatus.OUT_OF_STOCK
              : query.status === InventoryAlertFilter.BACKORDER
                ? alert.stockStatus === AdminStockStatus.BACKORDER
                : alert.reservedPressure;
      if (!matches) return [];
      return [
        {
          id: variant.id,
          product: variant.product,
          name: variant.name,
          sku: variant.sku,
          measurementUnit: variant.measurementUnit,
          stockQuantity: variant.stockQuantity.toFixed(3),
          reservedQuantity: variant.reservedQuantity.toFixed(3),
          availableQuantity: alert.available.toFixed(3),
          lowStockThreshold: variant.lowStockThreshold.toFixed(3),
          status: alert.stockStatus.toLowerCase(),
          reservedPressure: alert.reservedPressure,
        },
      ];
    });
    return { filter: query.status, total: data.length, data };
  }

  async inventorySummary() {
    const variants = await this.activeVariants();
    const counts = {
      inStock: 0,
      lowStock: 0,
      outOfStock: 0,
      backorder: 0,
      reservedPressure: 0,
    };
    const units = new Map<
      string,
      {
        stock: Prisma.Decimal;
        reserved: Prisma.Decimal;
        available: Prisma.Decimal;
      }
    >();
    for (const variant of variants) {
      const alert = this.stockAlert(variant);
      if (alert.stockStatus === AdminStockStatus.IN_STOCK) counts.inStock++;
      else if (alert.stockStatus === AdminStockStatus.LOW_STOCK)
        counts.lowStock++;
      else if (alert.stockStatus === AdminStockStatus.OUT_OF_STOCK)
        counts.outOfStock++;
      else counts.backorder++;
      if (alert.reservedPressure) counts.reservedPressure++;
      const unit = units.get(variant.measurementUnit) ?? {
        stock: new Prisma.Decimal(0),
        reserved: new Prisma.Decimal(0),
        available: new Prisma.Decimal(0),
      };
      unit.stock = unit.stock.plus(variant.stockQuantity);
      unit.reserved = unit.reserved.plus(variant.reservedQuantity);
      unit.available = unit.available.plus(alert.available);
      units.set(variant.measurementUnit, unit);
    }
    return {
      activeVariants: variants.length,
      counts,
      byMeasurementUnit: Array.from(units, ([measurementUnit, value]) => ({
        measurementUnit,
        stockQuantity: value.stock.toFixed(3),
        reservedQuantity: value.reserved.toFixed(3),
        availableQuantity: value.available.toFixed(3),
      })),
    };
  }

  async seasonal(query: SeasonalDashboardQueryDto) {
    const products = await this.prisma.product.findMany({
      where: { status: 'ACTIVE', availabilityMode: 'SEASONAL' },
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        name: true,
        slug: true,
        availabilityMode: true,
        isManuallyAvailable: true,
        variants: {
          where: { isActive: true },
          select: {
            stockQuantity: true,
            reservedQuantity: true,
            allowBackorder: true,
          },
        },
        availabilityWindows: {
          where: { isActive: true },
          orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
        },
      },
    });
    const today = belgradeBusinessDate();
    const toReference = (date: string) => new Date(date + 'T12:00:00.000Z');
    const add = (value: string, days: number) => {
      const date = new Date(value + 'T00:00:00.000Z');
      date.setUTCDate(date.getUTCDate() + days);
      return date.toISOString().slice(0, 10);
    };
    const data = products.map((product) => {
      const current = evaluateAvailability(
        {
          mode: product.availabilityMode,
          manuallyAvailable: product.isManuallyAvailable,
          variants: product.variants,
          windows: product.availabilityWindows,
        },
        toReference(today),
      );
      let nextAvailableDate: string | null = current.currentlyAvailable
        ? today
        : null;
      for (
        let day = 1;
        nextAvailableDate === null && day <= query.horizon;
        day++
      ) {
        const date = add(today, day);
        const evaluation = evaluateAvailability(
          {
            mode: product.availabilityMode,
            manuallyAvailable: product.isManuallyAvailable,
            variants: product.variants,
            windows: product.availabilityWindows,
          },
          toReference(date),
        );
        if (evaluation.currentlyAvailable) nextAvailableDate = date;
      }
      return {
        id: product.id,
        name: product.name,
        slug: product.slug,
        currentlyAvailable: current.currentlyAvailable,
        businessReason: current.businessReason,
        matchedWindowId: current.matchedWindowId,
        nextAvailableDate,
      };
    });
    return {
      businessDate: today,
      timeZone: DASHBOARD_TIME_ZONE,
      horizon: query.horizon,
      data,
    };
  }

  async recentOrders(query: RecentOrdersQueryDto) {
    const orders = await this.prisma.order.findMany({
      take: query.limit,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        total: true,
        currency: true,
        createdAt: true,
        requestedPickupDate: true,
        customerFirstName: true,
        customerLastName: true,
        pickupLocation: { select: { id: true, code: true, name: true } },
      },
    });
    const threshold = new Date(
      Date.now() - this.pendingAttentionHours * 3_600_000,
    );
    return {
      data: orders.map((order) => ({
        ...order,
        total: order.total.toFixed(2),
        customerName: order.customerFirstName + ' ' + order.customerLastName,
        customerFirstName: undefined,
        customerLastName: undefined,
        requiresAttention:
          order.status === OrderStatus.PENDING_CONFIRMATION &&
          order.createdAt < threshold,
      })),
    };
  }

  private get pendingAttentionHours() {
    return this.config.get<number>('DASHBOARD_PENDING_ATTENTION_HOURS', 24);
  }

  async attention() {
    const now = new Date();
    const period = resolveDashboardPeriod(undefined, undefined, now);
    const staleBefore = new Date(
      now.getTime() - this.pendingAttentionHours * 3_600_000,
    );
    const todayDatabaseDate = new Date(period.to + 'T00:00:00.000Z');
    const nonterminal = [
      OrderStatus.PENDING_CONFIRMATION,
      OrderStatus.CONFIRMED,
      OrderStatus.PREPARING,
      OrderStatus.READY_FOR_PICKUP,
    ];
    const [
      pending,
      stalePending,
      confirmedToday,
      ready,
      overduePickup,
      seasonalWithoutWindows,
      activeWithoutImage,
      activeWithoutVariant,
      variants,
    ] = await Promise.all([
      this.prisma.order.count({
        where: { status: OrderStatus.PENDING_CONFIRMATION },
      }),
      this.prisma.order.count({
        where: {
          status: OrderStatus.PENDING_CONFIRMATION,
          createdAt: { lt: staleBefore },
        },
      }),
      this.prisma.order.count({
        where: { confirmedAt: { gte: period.start, lt: period.endExclusive } },
      }),
      this.prisma.order.count({
        where: { status: OrderStatus.READY_FOR_PICKUP },
      }),
      this.prisma.order.count({
        where: {
          status: { in: nonterminal },
          requestedPickupDate: { lt: todayDatabaseDate },
        },
      }),
      this.prisma.product.count({
        where: {
          status: 'ACTIVE',
          availabilityMode: 'SEASONAL',
          availabilityWindows: { none: { isActive: true } },
        },
      }),
      this.prisma.product.count({
        where: { status: 'ACTIVE', images: { none: {} } },
      }),
      this.prisma.product.count({
        where: { status: 'ACTIVE', variants: { none: { isActive: true } } },
      }),
      this.activeVariants(),
    ]);
    const stockAlerts = variants.filter((variant) => {
      const alert = this.stockAlert(variant);
      return (
        alert.stockStatus !== AdminStockStatus.IN_STOCK ||
        alert.reservedPressure
      );
    }).length;
    return {
      generatedAt: now.toISOString(),
      timeZone: DASHBOARD_TIME_ZONE,
      pendingAttentionHours: this.pendingAttentionHours,
      counts: {
        pending,
        stalePending,
        confirmedToday,
        ready,
        overduePickup,
        stockAlerts,
        seasonalWithoutWindows,
        activeWithoutImage,
        activeWithoutVariant,
      },
    };
  }
}
