import { Module } from '@nestjs/common';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { AdminAuditModule } from '../admin-audit/admin-audit.module';
import { CustomerOrdersController } from './customer-orders.controller';
import { CustomerOrdersService } from './customer-orders.service';
import { AdminOrdersController } from './admin-orders.controller';
import { AdminOrdersService } from './admin-orders.service';

@Module({
  imports: [CustomerAuthModule, AdminAuthModule, AdminAuditModule],
  controllers: [CustomerOrdersController, AdminOrdersController],
  providers: [CustomerOrdersService, AdminOrdersService],
  exports: [CustomerOrdersService, AdminOrdersService],
})
export class OrdersModule {}
