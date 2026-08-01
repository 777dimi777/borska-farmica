import { Logger, ServiceUnavailableException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../database/prisma.service';
import { HealthService } from './health.service';
import { HEALTH_SERVICE_NAME } from './health.types';

describe('HealthService', () => {
  let healthService: HealthService;
  let queryRaw: jest.Mock;

  beforeEach(async () => {
    queryRaw = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        { provide: PrismaService, useValue: { $queryRaw: queryRaw } },
      ],
    }).compile();
    healthService = module.get(HealthService);
  });

  it('returns safe liveness information', () => {
    const response = healthService.getLiveness();
    expect(response.status).toBe('ok');
    expect(response.service).toBe(HEALTH_SERVICE_NAME);
    expect(Number.isNaN(Date.parse(response.timestamp))).toBe(false);
    expect(response.uptime).toBeGreaterThanOrEqual(0);
    expect(JSON.stringify(response)).not.toMatch(
      /database_url|password|connection|string|postgresql:\/\//i,
    );
  });

  it('reports database up when the readiness query succeeds', async () => {
    queryRaw.mockResolvedValue([{ result: 1 }]);
    await expect(healthService.getReadiness()).resolves.toMatchObject({
      status: 'ok',
      service: HEALTH_SERVICE_NAME,
      checks: { database: 'up' },
    });
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });

  it('throws a safe 503 response when the readiness query fails', async () => {
    const databaseError =
      'password=secret postgresql://admin:secret@internal/database';
    queryRaw.mockRejectedValue(new Error(databaseError));
    jest.spyOn(Logger.prototype, 'error').mockImplementation();

    try {
      await healthService.getReadiness();
      fail('Expected readiness check to throw');
    } catch (error: unknown) {
      expect(error).toBeInstanceOf(ServiceUnavailableException);
      const exception = error as ServiceUnavailableException;
      expect(exception.getStatus()).toBe(503);
      expect(exception.getResponse()).toMatchObject({
        status: 'error',
        service: HEALTH_SERVICE_NAME,
        checks: { database: 'down' },
      });
      expect(JSON.stringify(exception.getResponse())).not.toContain(
        databaseError,
      );
    }
    expect(queryRaw).toHaveBeenCalledTimes(1);
  });
});
