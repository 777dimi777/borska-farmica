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
import { AdminAvailabilityController } from './admin-availability.controller';
import { AdminAvailabilityService } from './admin-availability.service';
import { AdminAvailabilityMutationsController } from './admin-availability-mutations.controller';
import { AdminAvailabilityMutationsService } from './admin-availability-mutations.service';
import { AdminProductImagesController } from './admin-product-images.controller';
import { AdminProductImagesService } from './admin-product-images.service';
@Module({
  imports: [AdminAuthModule, AdminAuditModule],
  controllers: [
    AdminProductsController,
    AdminVariantsController,
    AdminInventoryController,
    AdminAvailabilityController,
    AdminAvailabilityMutationsController,
    AdminProductImagesController,
  ],
  providers: [
    AdminProductsService,
    AdminProductMutationsService,
    AdminVariantsService,
    AdminInventoryService,
    AdminAvailabilityService,
    AdminAvailabilityMutationsService,
    AdminProductImagesService,
  ],
})
export class AdminProductsModule {}
