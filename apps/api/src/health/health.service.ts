import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { MetricsService } from '../observability/metrics.service';
import {
  HEALTH_SERVICE_NAME,
  LivenessResponse,
  NotReadyResponse,
  ReadinessResponse,
} from './health.types';
@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly metrics: MetricsService,
  ) {}
  private runtime() {
    return {
      service: HEALTH_SERVICE_NAME,
      environment: this.config.get<string>('NODE_ENV', 'development'),
      version: this.config.get<string>('APP_VERSION', 'development'),
      commit: this.config.get<string>('GIT_COMMIT_SHA') || 'unknown',
      timestamp: new Date().toISOString(),
    };
  }
  getLiveness(): LivenessResponse {
    return { status: 'ok', ...this.runtime(), uptime: process.uptime() };
  }
  async getReadiness(): Promise<ReadinessResponse> {
    try {
      const timeout = this.config.get<number>('READINESS_TIMEOUT_MS', 3000);
      let timer: NodeJS.Timeout | undefined;
      try {
        await Promise.race([
          this.prisma.$queryRaw`SELECT 1`,
          new Promise((_, reject) => {
            timer = setTimeout(
              () => reject(new Error('READINESS_TIMEOUT')),
              timeout,
            );
          }),
        ]);
      } finally {
        if (timer) clearTimeout(timer);
      }
      this.metrics.readiness.set(1);
      return { status: 'ok', ...this.runtime(), checks: { database: 'up' } };
    } catch (error) {
      this.metrics.readiness.set(0);
      this.logger.error({
        event: 'database.readiness.failed',
        errorName: error instanceof Error ? error.name : 'UnknownError',
      });
      const response: NotReadyResponse = {
        status: 'error',
        ...this.runtime(),
        checks: { database: 'down' },
      };
      throw new ServiceUnavailableException(response);
    }
  }
}
