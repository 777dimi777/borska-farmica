import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator';
import type { AuthenticatedAdmin } from '../admin-auth/authenticated-request';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { AdminRole } from '../generated/prisma/enums';
import { AdminCustomersService } from './admin-customers.service';
import {
  AdminCustomerOrderQueryDto,
  AdminCustomerQueryDto,
} from './dto/admin-customer.dto';
@ApiTags('Admin Customers')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/customers')
export class AdminCustomersController {
  constructor(private readonly customers: AdminCustomersService) {}
  @Get() @ApiOperation({ summary: 'List and aggregate customers' }) list(
    @Query() q: AdminCustomerQueryDto,
  ) {
    return this.customers.list(q);
  }
  @Get(':id/orders')
  @ApiOperation({ summary: 'List one customer orders' })
  orders(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Query() q: AdminCustomerOrderQueryDto,
  ) {
    return this.customers.orders(id, q);
  }
  @Get(':id')
  @ApiOperation({ summary: 'Read sanitized customer detail' })
  detail(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.customers.detail(id);
  }
  private context(admin: AuthenticatedAdmin, request: Request) {
    return {
      adminId: admin.id,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    };
  }
  @Post(':id/disable')
  @Roles(AdminRole.SUPER_ADMIN)
  disable(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.customers.setEnabled(id, false, this.context(admin, request));
  }
  @Post(':id/enable')
  @Roles(AdminRole.SUPER_ADMIN)
  enable(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.customers.setEnabled(id, true, this.context(admin, request));
  }
  @Post(':id/revoke-sessions')
  @Roles(AdminRole.SUPER_ADMIN)
  revoke(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.customers.revokeSessions(id, this.context(admin, request));
  }
}
