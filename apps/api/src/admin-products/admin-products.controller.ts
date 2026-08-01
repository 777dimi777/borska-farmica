import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import { AdminRole } from '../generated/prisma/enums';
import { AdminProductsService } from './admin-products.service';
import { AdminProductQueryDto } from './dto/admin-product-query.dto';
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
  constructor(private readonly service: AdminProductsService) {}
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
}
