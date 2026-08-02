import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
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
import { Roles } from '../admin-auth/decorators/roles.decorator';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import type { AuthenticatedAdmin } from '../admin-auth/authenticated-request';
import { AdminRole } from '../generated/prisma/enums';
import { AdminOrdersService } from './admin-orders.service';
import {
  AdminOrderQueryDto,
  AdminOrderTransitionDto,
} from './dto/admin-order.dto';

@ApiTags('Admin Orders')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private readonly orders: AdminOrdersService) {}

  private context(admin: AuthenticatedAdmin, request: Request) {
    return {
      adminId: admin.id,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    };
  }

  @Get()
  @ApiOperation({ summary: 'Filter and search customer orders' })
  list(@Query() query: AdminOrderQueryDto) {
    return this.orders.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Read order, reservations, stock and timeline' })
  detail(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.orders.detail(id);
  }

  @Post(':id/transitions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply a validated order status transition' })
  transition(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: AdminOrderTransitionDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.orders.transition(id, dto, this.context(admin, request));
  }
}
