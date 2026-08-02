import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import { MaintenanceService } from './maintenance.service';

@Injectable()
export class MaintenanceScheduler implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(MaintenanceScheduler.name);
  private readonly name = 'maintenance';
  constructor(
    private readonly config: ConfigService,
    private readonly maintenance: MaintenanceService,
    private readonly registry: SchedulerRegistry,
  ) {}
  onModuleInit(): void {
    if (!this.config.get<boolean>('MAINTENANCE_JOBS_ENABLED', false)) return;
    const job = CronJob.from({
      cronTime: this.config.get<string>('ORDER_EXPIRATION_CRON', '*/5 * * * *'),
      onTick: () => void this.run(),
      start: false,
      waitForCompletion: true,
    });
    this.registry.addCronJob(this.name, job);
    job.start();
  }
  onModuleDestroy(): void {
    if (this.registry.doesExist('cron', this.name))
      this.registry.deleteCronJob(this.name);
  }
  async run(): Promise<void> {
    try {
      await this.maintenance.run('all');
    } catch (error) {
      this.logger.error(
        `Maintenance run failed: ${error instanceof Error ? error.message : 'unknown'}`,
      );
    }
  }
}
