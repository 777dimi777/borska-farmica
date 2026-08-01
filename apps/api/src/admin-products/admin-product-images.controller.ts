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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import type { AuthenticatedAdmin } from '../admin-auth/authenticated-request';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { AdminRole } from '../generated/prisma/enums';
import { AdminProductImagesService } from './admin-product-images.service';
import {
  ProductImageMutationDto,
  ProductImageReorderDto,
} from './dto/content-mutation.dto';
@ApiTags('Admin Product Images')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/products/:productId/images')
export class AdminProductImagesController {
  constructor(private readonly service: AdminProductImagesService) {}
  private context(a: AuthenticatedAdmin, r: Request) {
    return { adminId: a.id, ipAddress: r.ip, userAgent: r.get('user-agent') };
  }
  @Get()
  @ApiOperation({ summary: 'List product image metadata' })
  list(@Param('productId', new ParseUUIDPipe({ version: '4' })) p: string) {
    return this.service.list(p);
  }
  @Post()
  @ApiOperation({ summary: 'Create product image metadata' })
  create(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Body() d: ProductImageMutationDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.create(p, d, this.context(a, r));
  }
  @Patch('reorder')
  @ApiOperation({ summary: 'Reorder images and optionally select primary' })
  reorder(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Body() d: ProductImageReorderDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.reorder(p, d, this.context(a, r));
  }
  @Patch(':imageId')
  @ApiOperation({ summary: 'Update product image metadata' })
  update(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Param('imageId', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() d: ProductImageMutationDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.update(p, id, d, this.context(a, r));
  }
  @Delete(':imageId')
  @ApiOperation({
    summary: 'Delete image metadata without deleting the remote file',
  })
  @HttpCode(204)
  remove(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Param('imageId', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.remove(p, id, this.context(a, r));
  }
}
