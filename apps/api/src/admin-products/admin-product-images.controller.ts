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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import type { AuthenticatedAdmin } from '../admin-auth/authenticated-request';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { AdminRole } from '../generated/prisma/enums';
import { AdminProductImagesService } from './admin-product-images.service';
import { ProductImageMutationDto } from './dto/content-mutation.dto';
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
  @Get() list(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
  ) {
    return this.service.list(p);
  }
  @Post() create(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Body() d: ProductImageMutationDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.create(p, d, this.context(a, r));
  }
  @Patch(':imageId') update(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Param('imageId', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() d: ProductImageMutationDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.update(p, id, d, this.context(a, r));
  }
  @Delete(':imageId') @HttpCode(204) remove(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Param('imageId', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.remove(p, id, this.context(a, r));
  }
}
