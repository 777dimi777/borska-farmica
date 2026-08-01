import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import { AdminRole } from '../generated/prisma/enums';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminCategoryQueryDto } from './dto/admin-category-query.dto';
import {
  AdminCategoryDetailDto,
  AdminCategoryListDto,
} from './dto/admin-category-response.dto';
@ApiTags('Admin Categories')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/categories')
export class AdminCategoriesController {
  constructor(private readonly service: AdminCategoriesService) {}
  @Get() @ApiOkResponse({ type: AdminCategoryListDto }) findAll(
    @Query() q: AdminCategoryQueryDto,
  ) {
    return this.service.findAll(q);
  }
  @Get(':id')
  @ApiOkResponse({ type: AdminCategoryDetailDto })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    return this.service.findOne(id);
  }
}
