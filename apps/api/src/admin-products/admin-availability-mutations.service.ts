import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminAuditService } from '../admin-audit/admin-audit.service';
import {
  AUDIT_ACTIONS,
  AUDIT_RESOURCE_TYPES,
  AuditContext,
} from '../admin-audit/admin-audit.types';
import { PrismaService } from '../database/prisma.service';
import { AvailabilityWindowType } from '../generated/prisma/enums';
import {
  AvailabilityWindowMutationDto,
  ContentReorderDto,
} from './dto/content-mutation.dto';
@Injectable()
export class AdminAvailabilityMutationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AdminAuditService,
  ) {}
  private data(dto: AvailabilityWindowMutationDto, old?: any) {
    const x = { ...old, ...dto };
    const fixed = x.type === AvailabilityWindowType.FIXED_DATE_RANGE;
    if (fixed) {
      if (
        !x.startsAt ||
        !x.endsAt ||
        x.startMonth != null ||
        x.startDay != null ||
        x.endMonth != null ||
        x.endDay != null
      )
        throw new BadRequestException(
          'Fixed windows require only startsAt and endsAt.',
        );
      if (
        !this.date(x.startsAt) ||
        !this.date(x.endsAt) ||
        x.startsAt > x.endsAt
      )
        throw new BadRequestException('Invalid inclusive fixed date range.');
    } else if (x.type === AvailabilityWindowType.RECURRING_ANNUAL) {
      if (
        !x.startMonth ||
        !x.startDay ||
        !x.endMonth ||
        !x.endDay ||
        x.startsAt != null ||
        x.endsAt != null
      )
        throw new BadRequestException(
          'Recurring windows require only month/day fields.',
        );
      if (
        !this.day(x.startMonth, x.startDay) ||
        !this.day(x.endMonth, x.endDay)
      )
        throw new BadRequestException('Invalid recurring calendar day.');
    } else throw new BadRequestException('Window type is required.');
    return {
      type: x.type,
      startsAt: fixed ? new Date(x.startsAt + 'T00:00:00.000Z') : null,
      endsAt: fixed ? new Date(x.endsAt + 'T00:00:00.000Z') : null,
      startMonth: fixed ? null : x.startMonth,
      startDay: fixed ? null : x.startDay,
      endMonth: fixed ? null : x.endMonth,
      endDay: fixed ? null : x.endDay,
      isActive: x.isActive ?? true,
      publicLabel: x.label?.trim() || null,
      sortOrder: x.sortOrder ?? 0,
    };
  }
  private date(s: string) {
    const d = new Date(s + 'T00:00:00.000Z');
    return !Number.isNaN(d.valueOf()) && d.toISOString().slice(0, 10) === s;
  }
  private day(m: number, d: number) {
    const x = new Date(Date.UTC(2028, m - 1, d));
    return x.getUTCMonth() === m - 1 && x.getUTCDate() === d;
  }
  private async product(id: string) {
    if (
      !(await this.prisma.product.findUnique({
        where: { id },
        select: { id: true },
      }))
    )
      throw new NotFoundException('Product not found.');
  }
  async create(
    productId: string,
    dto: AvailabilityWindowMutationDto,
    c: AuditContext,
  ) {
    await this.product(productId);
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.availabilityWindow.create({
        data: { productId, ...this.data(dto) },
      });
      await this.audit.write(tx, c, {
        action: AUDIT_ACTIONS.AVAILABILITY_WINDOW_CREATED,
        resourceType: AUDIT_RESOURCE_TYPES.AVAILABILITY_WINDOW,
        resourceId: row.id,
        changes: { productId },
      });
      return row;
    });
  }
  async update(
    productId: string,
    id: string,
    dto: AvailabilityWindowMutationDto,
    c: AuditContext,
  ) {
    if (!Object.values(dto).some((v) => v !== undefined))
      throw new BadRequestException('At least one field is required.');
    return this.prisma.$transaction(async (tx) => {
      const old = await tx.availabilityWindow.findFirst({
        where: { id, productId },
      });
      if (!old) throw new NotFoundException('Availability window not found.');
      const base = {
        ...old,
        startsAt: old.startsAt?.toISOString().slice(0, 10),
        endsAt: old.endsAt?.toISOString().slice(0, 10),
        label: old.publicLabel,
      };
      const before = this.data({}, base),
        data = this.data(dto, base);
      if (JSON.stringify(data) === JSON.stringify(before)) return old;
      const row = await tx.availabilityWindow.update({ where: { id }, data });
      const action =
        dto.isActive === true && !old.isActive
          ? AUDIT_ACTIONS.AVAILABILITY_WINDOW_ACTIVATED
          : dto.isActive === false && old.isActive
            ? AUDIT_ACTIONS.AVAILABILITY_WINDOW_DEACTIVATED
            : AUDIT_ACTIONS.AVAILABILITY_WINDOW_UPDATED;
      await this.audit.write(tx, c, {
        action,
        resourceType: AUDIT_RESOURCE_TYPES.AVAILABILITY_WINDOW,
        resourceId: id,
        changes: {
          before: { isActive: old.isActive, sortOrder: old.sortOrder },
          after: { isActive: row.isActive, sortOrder: row.sortOrder },
        },
      });
      return row;
    });
  }
  async remove(productId: string, id: string, c: AuditContext) {
    await this.prisma.$transaction(async (tx) => {
      const old = await tx.availabilityWindow.findFirst({
        where: { id, productId },
      });
      if (!old) throw new NotFoundException('Availability window not found.');
      await tx.availabilityWindow.delete({ where: { id } });
      await this.audit.write(tx, c, {
        action: AUDIT_ACTIONS.AVAILABILITY_WINDOW_DELETED,
        resourceType: AUDIT_RESOURCE_TYPES.AVAILABILITY_WINDOW,
        resourceId: id,
        changes: { productId, type: old.type, label: old.publicLabel },
      });
    });
  }
  async reorder(productId: string, dto: ContentReorderDto, c: AuditContext) {
    await this.product(productId);
    const ids = dto.items.map((x) => x.id),
      orders = dto.items.map((x) => x.sortOrder);
    if (
      new Set(ids).size !== ids.length ||
      new Set(orders).size !== orders.length
    )
      throw new BadRequestException('Duplicate ids or sortOrder values.');
    await this.prisma.$transaction(async (tx) => {
      const n = await tx.availabilityWindow.count({
        where: { productId, id: { in: ids } },
      });
      if (n !== ids.length)
        throw new NotFoundException('Availability window not found.');
      for (const x of dto.items)
        await tx.availabilityWindow.update({
          where: { id: x.id },
          data: { sortOrder: x.sortOrder },
        });
      await this.audit.write(tx, c, {
        action: AUDIT_ACTIONS.AVAILABILITY_WINDOW_REORDERED,
        resourceType: AUDIT_RESOURCE_TYPES.AVAILABILITY_WINDOW,
        resourceId: productId,
        changes: {
          items: dto.items.map(({ id, sortOrder }) => ({ id, sortOrder })),
        },
      });
    });
  }
}
