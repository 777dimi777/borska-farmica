import { Module } from '@nestjs/common';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminAuditViewerController } from './admin-audit-viewer.controller';
import { AdminAuditViewerService } from './admin-audit-viewer.service';
@Module({
  imports: [AdminAuthModule],
  controllers: [AdminAuditViewerController],
  providers: [AdminAuditViewerService],
  exports: [AdminAuditViewerService],
})
export class AdminAuditViewerModule {}
