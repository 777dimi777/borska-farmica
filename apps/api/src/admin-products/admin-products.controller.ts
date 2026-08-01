import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import { AdminRole } from '../generated/prisma/enums';
import { AdminProductsService } from './admin-products.service';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
import { CreateProductDto, UpdateProductDto } from './dto/product-mutation.dto';
import { AdminProductMutationsService } from './admin-product-mutations.service';
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator';
import type { AuthenticatedAdmin } from '../admin-auth/authenticated-request';
import type { Request } from 'express';
import {
  AdminProductDetailDto,
  AdminProductListDto,
} from './dto/admin-product-response.dto';
@ApiTags('Admin Products')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/products')
export class AdminProductsController {
  constructor(
    private readonly service: AdminProductsService,
    private readonly mutations: AdminProductMutationsService,
  ) {}
  private context(admin: AuthenticatedAdmin, request: Request) {
    return {
      adminId: admin.id,
      ipAddress: request.ip,
      userAgent: request.get('user-agent'),
    };
  }
  @Get() @ApiOkResponse({ type: AdminProductListDto }) findAll(
    @Query() q: AdminProductQueryDto,
  ) {
    return this.service.findAll(q);
  }
  @Get(':id') @ApiOkResponse({ type: AdminProductDetailDto }) findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.service.findOne(id);
  }

  @Post()
  create(
    @Body() dto: CreateProductDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.mutations.create(dto, this.context(admin, request));
  }
  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateProductDto,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.mutations.update(id, dto, this.context(admin, request));
  }
  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  @HttpCode(204)
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentAdmin() admin: AuthenticatedAdmin,
    @Req() request: Request,
  ) {
    return this.mutations.remove(id, this.context(admin, request));
  }
}
