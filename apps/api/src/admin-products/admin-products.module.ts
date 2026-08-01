import { Module } from '@nestjs/common';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminProductMutationsService } from './admin-product-mutations.service';
import { AdminAuditModule } from '../admin-audit/admin-audit.module';
@Module({
  imports: [AdminAuditModule],
  controllers: [AdminProductsController],
  providers: [AdminProductsService, AdminProductMutationsService],
})
export class AdminProductsModule {}
