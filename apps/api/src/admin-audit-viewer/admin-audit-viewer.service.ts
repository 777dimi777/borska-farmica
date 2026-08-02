/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { createPaginationMetadata } from '../common/pagination/pagination';
import { resolveDashboardPeriod } from '../admin-dashboard/dashboard-period';
import { AdminAuditQueryDto, AuditSort } from './dto/admin-audit-query.dto';
import { redactAuditValue } from './audit-redaction';
@Injectable()
export class AdminAuditViewerService {
  constructor(private readonly prisma: PrismaService) {}
  where(q: AdminAuditQueryDto): Prisma.AdminAuditLogWhereInput {
    const period =
      q.createdFrom || q.createdTo
        ? resolveDashboardPeriod(q.createdFrom, q.createdTo)
        : null;
    return {
      ...(q.adminId && { adminId: q.adminId }),
      ...(q.action && { action: { contains: q.action, mode: 'insensitive' } }),
      ...(q.resourceType && {
        resourceType: { contains: q.resourceType, mode: 'insensitive' },
      }),
      ...(q.resourceId && { resourceId: q.resourceId }),
      ...(period && {
        createdAt: { gte: period.start, lt: period.endExclusive },
      }),
      ...(q.search && {
        OR: [
          { action: { contains: q.search, mode: 'insensitive' } },
          { resourceType: { contains: q.search, mode: 'insensitive' } },
          { admin: { email: { contains: q.search, mode: 'insensitive' } } },
        ],
      }),
    };
  }
  map(row: any) {
    return {
      id: row.id,
      action: row.action,
      resourceType: row.resourceType,
      resourceId: row.resourceId,
      changes: redactAuditValue(row.changes),
      ipAddress: row.ipAddress,
      userAgent: row.userAgent,
      createdAt: row.createdAt,
      admin: row.admin,
    };
  }
  async list(q: AdminAuditQueryDto) {
    const where = this.where(q);
    const [total, rows] = await this.prisma.$transaction([
      this.prisma.adminAuditLog.count({ where }),
      this.prisma.adminAuditLog.findMany({
        where,
        skip: (q.page - 1) * q.limit,
        take: q.limit,
        orderBy: [
          { createdAt: q.sort === AuditSort.OLDEST ? 'asc' : 'desc' },
          { id: 'desc' },
        ],
        include: { admin: { select: { id: true, email: true, role: true } } },
      }),
    ]);
    return {
      data: rows.map((r) => this.map(r)),
      pagination: createPaginationMetadata(q.page, q.limit, total),
    };
  }
  async detail(id: string) {
    const row = await this.prisma.adminAuditLog.findUnique({
      where: { id },
      include: { admin: { select: { id: true, email: true, role: true } } },
    });
    if (!row) throw new NotFoundException('Audit log not found.');
    return this.map(row);
  }
}
