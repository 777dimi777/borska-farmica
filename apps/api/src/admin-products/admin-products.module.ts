import { Module } from '@nestjs/common';
import { AdminProductsController } from './admin-products.controller';
import { AdminProductsService } from './admin-products.service';
import { AdminProductMutationsService } from './admin-product-mutations.service';
import { AdminAuditModule } from '../admin-audit/admin-audit.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminVariantsController } from './admin-variants.controller';
import { AdminVariantsService } from './admin-variants.service';
import { AdminInventoryController } from './admin-inventory.controller';
import { AdminInventoryService } from './admin-inventory.service';
@Module({
  imports: [AdminAuthModule, AdminAuditModule],
  controllers: [
    AdminProductsController,
    AdminVariantsController,
    AdminInventoryController,
  ],
  providers: [
    AdminProductsService,
    AdminProductMutationsService,
    AdminVariantsService,
    AdminInventoryService,
  ],
})
export class AdminProductsModule {}
