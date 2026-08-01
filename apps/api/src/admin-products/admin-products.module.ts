import { Module } from '@nestjs/common';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminProductMutationsService } from './admin-product-mutations.service';
import { AdminAuditModule } from '../admin-audit/admin-audit.module';
import { AdminVariantsController } from './admin-variants.controller';
import { AdminVariantsService } from './admin-variants.service';
@Module({
  imports: [AdminAuditModule],
  controllers: [AdminProductsController, AdminVariantsController],
  providers: [
    AdminProductsService,
    AdminProductMutationsService,
    AdminVariantsService,
  ],
})
export class AdminProductsModule {}
