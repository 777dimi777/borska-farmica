import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  HEALTH_SERVICE_NAME,
  LivenessResponse,
  NotReadyResponse,
  ReadinessResponse,
} from './health.types';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(private readonly prisma: PrismaService) {}

  getLiveness(): LivenessResponse {
    return {
      status: 'ok',
      service: HEALTH_SERVICE_NAME,
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async getReadiness(): Promise<ReadinessResponse> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        service: HEALTH_SERVICE_NAME,
        timestamp: new Date().toISOString(),
        checks: { database: 'up' },
      };
    } catch (error: unknown) {
      const errorName = error instanceof Error ? error.name : 'UnknownError';
      const errorCode =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : 'no-code';
      this.logger.error(
        `Database readiness check failed (${errorName}, ${errorCode})`,
      );
      const response: NotReadyResponse = {
        status: 'error',
        service: HEALTH_SERVICE_NAME,
        timestamp: new Date().toISOString(),
        checks: { database: 'down' },
      };
      throw new ServiceUnavailableException(response);
    }
  }
}
