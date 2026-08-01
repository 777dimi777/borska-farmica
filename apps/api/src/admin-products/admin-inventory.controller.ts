import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator';
import type { AuthenticatedAdmin } from '../admin-auth/authenticated-request';
import { AdminRole } from '../generated/prisma/enums';
import { AdminInventoryService } from './admin-inventory.service';
import {
  InventoryAdjustmentDto,
  InventoryMovementQueryDto,
} from './dto/inventory.dto';
@ApiTags('Admin Inventory')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/products/:productId/variants/:variantId')
export class AdminInventoryController {
  constructor(private readonly service: AdminInventoryService) {}
  private context(admin: AuthenticatedAdmin, request: Request) {
    return {
      adminId: admin.id,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    };
  }
  @Get('inventory-movements') history(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Param('variantId', new ParseUUIDPipe({ version: '4' })) variantId: string,
    @Query() query: InventoryMovementQueryDto,
  ) {
    return this.service.history(productId, variantId, query);
  }
  @Post('inventory-adjustments') adjust(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Param('variantId', new ParseUUIDPipe({ version: '4' })) variantId: string,
    @Body() dto: InventoryAdjustmentDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.service.adjust(
      productId,
      variantId,
      dto,
      this.context(admin, request),
    );
  }
}
