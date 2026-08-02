import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Roles } from '../admin-auth/decorators/roles.decorator';
import { AccessJwtGuard } from '../admin-auth/guards/access-jwt.guard';
import { RolesGuard } from '../admin-auth/guards/roles.guard';
import { AdminRole } from '../generated/prisma/enums';
import { AdminAuditViewerService } from './admin-audit-viewer.service';
import { AdminAuditQueryDto } from './dto/admin-audit-query.dto';
@ApiTags('Admin Audit Logs')
@ApiBearerAuth('admin-access')
@UseGuards(AccessJwtGuard, RolesGuard)
@Roles(AdminRole.SUPER_ADMIN)
@Controller('admin/audit-logs')
export class AdminAuditViewerController {
  constructor(private readonly viewer: AdminAuditViewerService) {}
  @Get()
  @ApiOperation({ summary: 'List redacted append-only audit logs' })
  list(@Query() q: AdminAuditQueryDto) {
    return this.viewer.list(q);
  }
  @Get(':id') @ApiOperation({ summary: 'Read one redacted audit log' }) detail(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    return this.viewer.detail(id);
  }
}
