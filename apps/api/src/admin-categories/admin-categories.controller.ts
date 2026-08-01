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
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator';
import type { AuthenticatedAdmin } from '../admin-auth/authenticated-request';
import { AdminRole } from '../generated/prisma/enums';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminCategoryQueryDto } from './dto/admin-category-query.dto';
import {
  AdminCategoryDetailDto,
  AdminCategoryListDto,
} from './dto/admin-category-response.dto';
import {
  CreateCategoryDto,
  ReorderCategoriesDto,
  UpdateCategoryDto,
} from './dto/category-mutation.dto';
@ApiTags('Admin Categories')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly service: AdminCategoriesService) {}
  private context(a: AuthenticatedAdmin, r: Request) {
    return { adminId: a.id, ipAddress: r.ip, userAgent: r.get('user-agent') };
  }
  @Get() @ApiOkResponse({ type: AdminCategoryListDto }) findAll(
    @Query() q: AdminCategoryQueryDto,
  ) {
    return this.service.findAll(q);
  }
  @Patch('reorder') reorder(
    @Body() d: ReorderCategoriesDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.reorder(d, this.context(a, r));
  }
  @Get(':id') @ApiOkResponse({ type: AdminCategoryDetailDto }) findOne(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.service.findOne(id);
  }
  @Post() @ApiCreatedResponse() create(
    @Body() d: CreateCategoryDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.create(d, this.context(a, r));
  }
  @Patch(':id') update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() d: UpdateCategoryDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.update(id, d, this.context(a, r));
  }
  @Delete(':id')
  @Roles(AdminRole.SUPER_ADMIN)
  @HttpCode(204)
  @ApiNoContentResponse()
  remove(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.remove(id, this.context(a, r));
  }
}
