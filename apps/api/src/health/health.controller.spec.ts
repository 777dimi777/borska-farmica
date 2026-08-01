import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { HEALTH_SERVICE_NAME } from './health.types';

describe('HealthController', () => {
  let controller: HealthController;
  const healthService = {
    getLiveness: jest.fn(),
    getReadiness: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: healthService }],
    }).compile();
    controller = module.get(HealthController);
  });

  it('delegates liveness to the service', () => {
    const response = {
      status: 'ok' as const,
      service: HEALTH_SERVICE_NAME,
      timestamp: new Date().toISOString(),
      uptime: 1,
    };
    healthService.getLiveness.mockReturnValue(response);
    expect(controller.getLiveness()).toBe(response);
    expect(healthService.getLiveness).toHaveBeenCalledTimes(1);
  });

  it('delegates readiness to the service', async () => {
    const response = {
      status: 'ok' as const,
      service: HEALTH_SERVICE_NAME,
      timestamp: new Date().toISOString(),
      checks: { database: 'up' as const },
    };
    healthService.getReadiness.mockResolvedValue(response);
    await expect(controller.getReadiness()).resolves.toBe(response);
    expect(healthService.getReadiness).toHaveBeenCalledTimes(1);
  });
});
