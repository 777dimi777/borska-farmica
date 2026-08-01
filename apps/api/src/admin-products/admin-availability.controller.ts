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
import { AdminAvailabilityService } from './admin-availability.service';
import {
  AdminAvailabilityWindowDto,
  AvailabilityPreviewDto,
  AvailabilityPreviewQueryDto,
} from './dto/availability.dto';
@ApiTags('Admin Product Availability')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/products/:productId')
export class AdminAvailabilityController {
  constructor(private readonly service: AdminAvailabilityService) {}
  @Get('availability-windows')
  @ApiOkResponse({ type: AdminAvailabilityWindowDto, isArray: true })
  list(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
  ) {
    return this.service.list(productId);
  }
  @Get('availability-preview')
  @ApiOkResponse({ type: AvailabilityPreviewDto })
  preview(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) productId: string,
    @Query() query: AvailabilityPreviewQueryDto,
  ) {
    return this.service.preview(productId, query.at);
  }
}
