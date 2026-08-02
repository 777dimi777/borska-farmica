import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminAuditModule } from '../admin-audit/admin-audit.module';
import { AdminAuditViewerModule } from '../admin-audit-viewer/admin-audit-viewer.module';
import { AdminExportsController } from './admin-exports.controller';
import { AdminExportsService } from './admin-exports.service';
@Module({
  imports: [AdminAuthModule, AdminAuditModule, AdminAuditViewerModule],
  controllers: [AdminExportsController],
  providers: [AdminExportsService],
})
export class AdminExportsModule {}
