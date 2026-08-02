import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MaintenanceService } from './maintenance.service';
import { MaintenanceScheduler } from './maintenance.scheduler';
import { OrderCancellationService } from './order-cancellation.service';
import { TimeProvider } from './time-provider';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [
    TimeProvider,
    OrderCancellationService,
    MaintenanceService,
    MaintenanceScheduler,
  ],
  exports: [TimeProvider, OrderCancellationService, MaintenanceService],
})
export class MaintenanceModule {}
