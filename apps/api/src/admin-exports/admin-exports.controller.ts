import { Controller, Get, Query, Req, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import type { AuthenticatedAdmin } from '../admin-auth/authenticated-request';
import { AdminRole } from '../generated/prisma/enums';
import { AdminCustomerQueryDto } from '../admin-customers/dto/admin-customer.dto';
import { AdminOrderQueryDto } from '../orders/dto/admin-order.dto';
import { AdminAuditQueryDto } from '../admin-audit-viewer/dto/admin-audit-query.dto';
import { AdminExportsService } from './admin-exports.service';
import { InventoryExportQueryDto } from './dto/export-query.dto';
@ApiTags('Admin Exports')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Controller('admin/exports')
export class AdminExportsController {
  constructor(private readonly exports: AdminExportsService) {}
  private context(a: AuthenticatedAdmin, r: Request) {
    return { adminId: a.id, ipAddress: r.ip, userAgent: r.get('user-agent') };
  }
  private send(res: Response, name: string, data: Buffer) {
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="' + name + '"');
    return res.send(data);
  }
  @Get('customers.csv') @Roles(AdminRole.SUPER_ADMIN) async customers(
    @Query() q: AdminCustomerQueryDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
    @Res() res: Response,
  ) {
    return this.send(
      res,
      'borska-farmica-customers.csv',
      await this.exports.customers(q, this.context(a, r)),
    );
  }
  @Get('orders.csv') @Roles(AdminRole.SUPER_ADMIN) async orders(
    @Query() q: AdminOrderQueryDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
    @Res() res: Response,
  ) {
    return this.send(
      res,
      'borska-farmica-orders.csv',
      await this.exports.orders(q, this.context(a, r)),
    );
  }
  @Get('inventory.csv')
  @Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
  async inventory(
    @Query() q: InventoryExportQueryDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
    @Res() res: Response,
  ) {
    return this.send(
      res,
      'borska-farmica-inventory.csv',
      await this.exports.inventory(q, this.context(a, r)),
    );
  }
  @Get('audit-logs.csv') @Roles(AdminRole.SUPER_ADMIN) async audit(
    @Query() q: AdminAuditQueryDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
    @Res() res: Response,
  ) {
    return this.send(
      res,
      'borska-farmica-audit-logs.csv',
      await this.exports.auditLogs(q, this.context(a, r)),
    );
  }
}
