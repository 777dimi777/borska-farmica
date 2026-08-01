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
import { CurrentAdmin } from '../admin-auth/decorators/current-admin.decorator';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import type { AuthenticatedAdmin } from '../admin-auth/authenticated-request';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { AdminRole } from '../generated/prisma/enums';
import { AdminAvailabilityMutationsService } from './admin-availability-mutations.service';
import {
  AvailabilityWindowMutationDto,
  ContentReorderDto,
} from './dto/content-mutation.dto';
@ApiTags('Admin Product Availability')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.ADMIN, AdminRole.SUPER_ADMIN)
@Controller('admin/products/:productId/availability-windows')
export class AdminAvailabilityMutationsController {
  constructor(private readonly service: AdminAvailabilityMutationsService) {}
  private context(a: AuthenticatedAdmin, r: Request) {
    return { adminId: a.id, ipAddress: r.ip, userAgent: r.get('user-agent') };
  }
  @Post() create(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Body() d: AvailabilityWindowMutationDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.create(p, d, this.context(a, r));
  }
  @Patch('reorder') reorder(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Body() d: ContentReorderDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.reorder(p, d, this.context(a, r));
  }
  @Patch(':windowId') update(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Param('windowId', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() d: AvailabilityWindowMutationDto,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.update(p, id, d, this.context(a, r));
  }
  @Delete(':windowId') @HttpCode(204) remove(
    @Param('productId', new ParseUUIDPipe({ version: '4' })) p: string,
    @Param('windowId', new ParseUUIDPipe({ version: '4' })) id: string,
    @CurrentAdmin() a: AuthenticatedAdmin,
    @Req() r: Request,
  ) {
    return this.service.remove(p, id, this.context(a, r));
  }
}
