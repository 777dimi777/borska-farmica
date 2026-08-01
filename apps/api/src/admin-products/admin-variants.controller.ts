import {
  Body,
  Controller,
  Delete,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
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
import { AdminVariantsService } from './admin-variants.service';
import { CreateVariantDto, UpdateVariantDto } from './dto/variant-mutation.dto';
@ApiTags('Admin Product Variants')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/products/:productId/variants')
export class AdminVariantsController {
  constructor(private readonly service: AdminVariantsService) {}
  private context(admin: AuthenticatedAdmin, request: Request) {
    return {
      adminId: admin.id,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    };
  }
  @Post() create(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Body() dto: CreateVariantDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.service.create(productId, dto, this.context(admin, request));
  }
  @Patch(':variantId') update(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Param('variantId', new ParseUUIDPipe({ version: '4' })) variantId: string,
    @Body() dto: UpdateVariantDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.service.update(
      productId,
      variantId,
      dto,
      this.context(admin, request),
    );
  }
  @Delete(':variantId') @Roles(AdminRole.SUPER_ADMIN) @HttpCode(204) remove(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Param('variantId', new ParseUUIDPipe({ version: '4' })) variantId: string,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.service.remove(
      productId,
      variantId,
      this.context(admin, request),
    );
  }
}
