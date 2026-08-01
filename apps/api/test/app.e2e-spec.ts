import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../dist/src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
  });

  it('/api/v1 (GET) returns 404', () => {
    return request(app.getHttpServer()).get('/api/v1').expect(404);
  });

  it('/api/v1/health (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);
    const body = response.body as Record<string, unknown>;

    expect(body).toMatchObject({
      status: 'ok',
      service: 'borska-farmica-api',
    });
    expect(typeof body.timestamp).toBe('string');
    expect(Number.isNaN(Date.parse(body.timestamp as string))).toBe(false);
    expect(typeof body.uptime).toBe('number');
    expect(body.uptime as number).toBeGreaterThanOrEqual(0);
  });

  it('/api/v1/health/ready (GET)', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health/ready')
      .expect(200);
    const body = response.body as Record<string, unknown>;

    expect(body).toMatchObject({
      status: 'ok',
      service: 'borska-farmica-api',
      checks: { database: 'up' },
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
