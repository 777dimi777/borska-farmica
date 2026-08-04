import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../dist/src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let config: ConfigService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    config = app.get(ConfigService);
  });

  it('/api/v1 (GET) returns 404', () => {
    return request(app.getHttpServer()).get('/api/v1').expect(404);
  });

  it('generates, validates and returns request correlation IDs', async () => {
    const generated = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);
    expect(generated.headers['x-request-id']).toMatch(/^[0-9a-f-]{36}$/);
    const accepted = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('X-Request-ID', 'safe.client-id_123')
      .expect(200);
    expect(accepted.headers['x-request-id']).toBe('safe.client-id_123');
    const replaced = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('X-Request-ID', 'x'.repeat(101))
      .expect(200);
    expect(replaced.headers['x-request-id']).not.toBe('x'.repeat(101));
  });

  it('returns a safe correlated 404 response', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/not-present')
      .expect(404);
    expect(response.body).toMatchObject({
      statusCode: 404,
      requestId: response.headers['x-request-id'],
      path: '/api/v1/not-present',
    });
    expect(JSON.stringify(response.body)).not.toMatch(
      /stack|postgresql|prisma|connectionString/i,
    );
  });

  it('protects metrics independently of admin auth', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/internal/metrics')
      .expect(404);
    config.set('METRICS_ENABLED', true);
    config.set(
      'METRICS_AUTH_TOKEN',
      'metrics-test-token-that-is-longer-than-32',
    );
    await request(app.getHttpServer())
      .get('/api/v1/internal/metrics')
      .expect(401);
    const response = await request(app.getHttpServer())
      .get('/api/v1/internal/metrics')
      .set('Authorization', 'Bearer metrics-test-token-that-is-longer-than-32')
      .expect(200);
    expect(response.headers['content-type']).toContain('text/plain');
    expect(response.text).toContain('borska_farmica_http_requests_total');
    expect(response.text).not.toContain('safe.client-id_123');
    config.set('METRICS_ENABLED', false);
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
