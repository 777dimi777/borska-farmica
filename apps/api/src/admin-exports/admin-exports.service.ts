import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES,
  AuditContext,
} from '../admin-audit/admin-audit.types';
import { AdminCustomerQueryDto } from '../admin-customers/dto/admin-customer.dto';
import { AdminOrderQueryDto } from '../orders/dto/admin-order.dto';
import { AuditAction } from '../admin-audit/admin-audit.types';
import {
  AuditSort,
  AdminAuditQueryDto,
} from '../admin-audit-viewer/dto/admin-audit-query.dto';
import { AdminAuditViewerService } from '../admin-audit-viewer/admin-audit-viewer.service';
import { redactAuditValue } from '../admin-audit-viewer/audit-redaction';
import { variantStockStatus } from '../admin-products/admin-product-stock';
import { InventoryExportQueryDto } from './dto/export-query.dto';
import { CSV_EXPORT_LIMIT, csvDocument } from './secure-csv';
@Injectable()
export class AdminExportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
    private readonly auditViewer: AdminAuditViewerService,
  ) {}
  private ensure(rows: unknown[]) {
    if (rows.length > CSV_EXPORT_LIMIT)
      throw new UnprocessableEntityException(
        'CSV_EXPORT_LIMIT_EXCEEDED: narrow the filters.',
      );
  }
  private async recorded(
    context: AuditContext,
    action: AuditAction,
    kind: string,
    count: number,
    filters: object,
  ) {
    await this.prisma.$transaction((tx) =>
      this.audit.write(tx, context, {
        action,
        resourceType: AUDIT_RESOURCE_TYPES.EXPORT,
        changes: { exportType: kind, rowCount: count, format: 'csv', filters },
      }),
    );
  }
  async customers(q: AdminCustomerQueryDto, c: AuditContext) {
    const where: Prisma.CustomerUserWhereInput = {
      ...(q.status && { status: q.status }),
      ...(q.search && {
        OR: [
          { firstName: { contains: q.search, mode: 'insensitive' } },
          { lastName: { contains: q.search, mode: 'insensitive' } },
          { email: { contains: q.search, mode: 'insensitive' } },
          {
            phone: {
              contains: q.search.replace(/\s/g, ''),
              mode: 'insensitive',
            },
          },
        ],
      }),
    };
    const rows = await this.prisma.customerUser.findMany({
      where,
      take: CSV_EXPORT_LIMIT + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        orders: {
          select: {
            status: true,
            paymentStatus: true,
            total: true,
            createdAt: true,
          },
        },
      },
    });
    this.ensure(rows);
    const data = rows.map((x) => {
      const paid = x.orders.filter(
        (o) => o.status === 'COMPLETED' && o.paymentStatus === 'PAID',
      );
      const spent = paid.reduce(
        (s, o) => s.plus(o.total),
        new Prisma.Decimal(0),
      );
      return [
        x.id,
        x.firstName,
        x.lastName,
        x.email,
        x.phone,
        x.status,
        x.createdAt,
        x.orders.length,
        paid.length,
        spent.toFixed(2),
        x.orders.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
        )[0]?.createdAt ?? null,
      ];
    });
    const out = csvDocument(
      [
        'id',
        'first_name',
        'last_name',
        'email',
        'phone',
        'status',
        'registered_at',
        'order_count',
        'completed_order_count',
        'total_spent_rsd',
        'last_order_at',
      ],
      data,
    );
    await this.recorded(
      c,
      AUDIT_ACTIONS.CUSTOMER_EXPORTED,
      'customers',
      rows.length,
      q,
    );
    return out;
  }
  async orders(q: AdminOrderQueryDto, c: AuditContext) {
    const where: Prisma.OrderWhereInput = {
      ...(q.status && { status: q.status }),
      ...(q.paymentStatus && { paymentStatus: q.paymentStatus }),
      ...(q.pickupLocationId && { pickupLocationId: q.pickupLocationId }),
      ...(q.search && {
        OR: [
          { orderNumber: { contains: q.search, mode: 'insensitive' } },
          { customerEmail: { contains: q.search, mode: 'insensitive' } },
          { customerPhone: { contains: q.search, mode: 'insensitive' } },
        ],
      }),
    };
    const rows = await this.prisma.order.findMany({
      where,
      take: CSV_EXPORT_LIMIT + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        pickupLocation: { select: { name: true } },
        _count: { select: { items: true } },
      },
    });
    this.ensure(rows);
    const out = csvDocument(
      [
        'order_number',
        'status',
        'payment_status',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_note',
        'pickup',
        'total_rsd',
        'created_at',
        'confirmed_at',
        'completed_at',
        'item_count',
      ],
      rows.map((o) => [
        o.orderNumber,
        o.status,
        o.paymentStatus,
        o.customerFirstName + ' ' + o.customerLastName,
        o.customerEmail,
        o.customerPhone,
        o.customerNote,
        o.pickupLocation.name,
        o.total.toFixed(2),
        o.createdAt,
        o.confirmedAt,
        o.completedAt,
        o._count.items,
      ]),
    );
    await this.recorded(
      c,
      AUDIT_ACTIONS.ORDERS_EXPORTED,
      'orders',
      rows.length,
      q,
    );
    return out;
  }
  async inventory(q: InventoryExportQueryDto, c: AuditContext) {
    const rows = await this.prisma.productVariant.findMany({
      where: {
        ...(q.productStatus && { product: { status: q.productStatus } }),
        ...(q.category && { product: { category: { slug: q.category } } }),
        ...(q.search && {
          OR: [
            { sku: { contains: q.search, mode: 'insensitive' } },
            { name: { contains: q.search, mode: 'insensitive' } },
            { product: { name: { contains: q.search, mode: 'insensitive' } } },
          ],
        }),
      },
      take: CSV_EXPORT_LIMIT + 1,
      orderBy: [{ product: { name: 'asc' } }, { sku: 'asc' }],
      include: {
        product: {
          include: { category: { select: { name: true, slug: true } } },
        },
      },
    });
    const filtered = q.stockStatus
      ? rows.filter((v) => variantStockStatus(v) === q.stockStatus)
      : rows;
    this.ensure(filtered);
    const out = csvDocument(
      [
        'product_id',
        'product_name',
        'product_status',
        'category',
        'variant_id',
        'sku',
        'variant_name',
        'stock_quantity',
        'reserved_quantity',
        'available_quantity',
        'low_stock_threshold',
        'stock_status',
        'allow_backorder',
        'price_rsd',
      ],
      filtered.map((v) => [
        v.productId,
        v.product.name,
        v.product.status,
        v.product.category.name,
        v.id,
        v.sku,
        v.name,
        v.stockQuantity.toFixed(3),
        v.reservedQuantity.toFixed(3),
        v.stockQuantity.minus(v.reservedQuantity).toFixed(3),
        v.lowStockThreshold.toFixed(3),
        variantStockStatus(v),
        v.allowBackorder,
        v.price.toFixed(2),
      ]),
    );
    await this.recorded(
      c,
      AUDIT_ACTIONS.INVENTORY_EXPORTED,
      'inventory',
      filtered.length,
      q,
    );
    return out;
  }
  async auditLogs(q: AdminAuditQueryDto, c: AuditContext) {
    const where = this.auditViewer.where(q);
    const rows = await this.prisma.adminAuditLog.findMany({
      where,
      take: CSV_EXPORT_LIMIT + 1,
      orderBy: { createdAt: q.sort === AuditSort.OLDEST ? 'asc' : 'desc' },
      include: { admin: { select: { email: true } } },
    });
    this.ensure(rows);
    const out = csvDocument(
      [
        'audit_id',
        'admin_id',
        'admin_email',
        'action',
        'resource_type',
        'resource_id',
        'created_at',
        'metadata_json',
      ],
      rows.map((x) => [
        x.id,
        x.adminId,
        x.admin.email,
        x.action,
        x.resourceType,
        x.resourceId,
        x.createdAt,
        JSON.stringify(redactAuditValue(x.changes)),
      ]),
    );
    await this.recorded(
      c,
      AUDIT_ACTIONS.AUDIT_LOGS_EXPORTED,
      'audit_logs',
      rows.length,
      q,
    );
    return out;
  }
}
