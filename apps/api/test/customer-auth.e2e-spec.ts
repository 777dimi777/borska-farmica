/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import request from 'supertest';
import { App } from 'supertest/types';
import { randomUUID } from 'crypto';
import { AppModule } from './../dist/src/app.module';
import { PrismaService } from './../dist/src/database/prisma.service';
import { TokenService } from './../dist/src/admin-auth/token.service';
import { configureOpenApi } from './../dist/src/openapi';
const email = 'e2e-customer@example.test',
  password = 'customer-password-123',
  nextPassword = 'customer-password-456';
const cookieLines = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value : value ? [value] : [];
const cookieValue = (headers: string | string[] | undefined, name: string) => {
  const values = cookieLines(headers);
  const row = values.find((x) => x.startsWith(name + '='));
  return row?.split(';')[0];
};
jest.setTimeout(15_000);

describe('Customer authentication (e2e)', () => {
  let app: INestApplication<App>,
    prisma: PrismaService,
    customerId: string,
    access: string,
    refresh1: string,
    refresh2: string;
  const cleanup = async () => {
    const customers = await prisma.customerUser.findMany({
        where: { email },
        select: { id: true },
      }),
      ids = customers.map((x) => x.id);
    await prisma.customerSession.deleteMany({
      where: { customerId: { in: ids } },
    });
    await prisma.customerUser.deleteMany({ where: { id: { in: ids } } });
  };
  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = mod.createNestApplication();
    app.use(cookieParser());
    app.use(helmet());
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin: 'http://localhost:3000', credentials: true });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
      }),
    );
    configureOpenApi(app, true);
    await app.init();
    prisma = app.get(PrismaService);
    await cleanup();
  });
  afterAll(async () => {
    await cleanup();
    expect(await prisma.customerUser.count({ where: { email } })).toBe(0);
    await app.close();
  });
  it('registers normalized customer transactionally and sets isolated HttpOnly cookie', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .set('Cookie', 'bf_cart=keep-cart')
      .send({
        firstName: 'Milo\u0161',
        lastName: 'Dimitrijevi\u0107',
        email: ' E2E-CUSTOMER@EXAMPLE.TEST ',
        phone: '0641234567',
        password,
      })
      .expect(201);
    access = res.body.accessToken;
    expect(res.body.customer).toMatchObject({
      email,
      phone: '+381641234567',
      emailVerified: false,
    });
    expect(res.body).not.toHaveProperty('passwordHash');
    const cookies = cookieLines(res.headers['set-cookie']);
    expect(cookies.join(';')).toContain('bf_customer_refresh=');
    expect(cookies.join(';')).toContain('HttpOnly');
    expect(cookies.join(';')).toContain('Path=/api/v1/auth');
    refresh1 = cookieValue(cookies, 'bf_customer_refresh')!;
    const row = await prisma.customerUser.findUniqueOrThrow({
      where: { email },
    });
    customerId = row.id;
    expect(await prisma.customerSession.count({ where: { customerId } })).toBe(
      1,
    );
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        firstName: 'M',
        lastName: 'D',
        email,
        phone: '0641234567',
        password,
      })
      .expect(409);
    await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        firstName: 'M',
        lastName: 'D',
        email: 'other@example.test',
        phone: '0641234567',
        password,
        extra: true,
      })
      .expect(400);
  });
  it('uses generic login failures and keeps admin/customer tokens separate', async () => {
    const wrong = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: 'wrong-password-long' })
      .expect(401);
    const unknown = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'unknown@example.test', password: 'wrong-password-long' })
      .expect(401);
    expect(wrong.body.message).toBe(unknown.body.message);
    const adminAccess = await app
      .get(TokenService)
      .signAccess(customerId, 'ADMIN');
    await request(app.getHttpServer())
      .get('/api/v1/account/me')
      .set('Authorization', 'Bearer ' + adminAccess)
      .expect(401);
    const adminRefresh = await app
      .get(TokenService)
      .signRefresh(customerId, randomUUID());
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', 'bf_customer_refresh=' + adminRefresh)
      .expect(401);
  });
  it('rotates refresh, rejects reuse and exposes only sanitized me/profile fields', async () => {
    const refreshed = await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', refresh1)
      .expect(200);
    access = refreshed.body.accessToken;
    refresh2 = cookieValue(
      refreshed.headers['set-cookie'],
      'bf_customer_refresh',
    )!;
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', refresh1)
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/account/me')
      .set('Authorization', 'Bearer ' + refresh2.split('=')[1])
      .expect(401);
    const me = await request(app.getHttpServer())
      .get('/api/v1/account/me')
      .set('Authorization', 'Bearer ' + access)
      .expect(200);
    expect(me.body).toMatchObject({
      id: customerId,
      email,
      phone: '+381641234567',
    });
    expect(me.body).not.toHaveProperty('passwordHash');
    const updated = await request(app.getHttpServer())
      .patch('/api/v1/account/me')
      .set('Authorization', 'Bearer ' + access)
      .send({ firstName: 'Milica-Jana', phone: '0651234567' })
      .expect(200);
    expect(updated.body).toMatchObject({
      firstName: 'Milica-Jana',
      phone: '+381651234567',
    });
    await request(app.getHttpServer())
      .patch('/api/v1/account/me')
      .set('Authorization', 'Bearer ' + access)
      .send({})
      .expect(400);
    await request(app.getHttpServer())
      .patch('/api/v1/account/me')
      .set('Authorization', 'Bearer ' + access)
      .send({ email: 'inject@example.test' })
      .expect(400);
  });
  it('changes password, invalidates every old customer token/session and preserves cart cookie', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password })
      .expect(200);
    const otherRefresh = cookieValue(
      login.headers['set-cookie'],
      'bf_customer_refresh',
    )!;
    await request(app.getHttpServer())
      .post('/api/v1/account/change-password')
      .set('Authorization', 'Bearer ' + access)
      .send({
        currentPassword: 'wrong-password-long',
        newPassword: nextPassword,
      })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/account/change-password')
      .set('Authorization', 'Bearer ' + access)
      .send({ currentPassword: password, newPassword: password })
      .expect(400);
    const changed = await request(app.getHttpServer())
      .post('/api/v1/account/change-password')
      .set('Authorization', 'Bearer ' + access)
      .send({ currentPassword: password, newPassword: nextPassword })
      .expect(201);
    const newAccess = changed.body.accessToken,
      newRefresh = cookieValue(
        changed.headers['set-cookie'],
        'bf_customer_refresh',
      )!;
    await request(app.getHttpServer())
      .get('/api/v1/account/me')
      .set('Authorization', 'Bearer ' + access)
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', refresh2)
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .set('Cookie', otherRefresh)
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/account/me')
      .set('Authorization', 'Bearer ' + newAccess)
      .expect(200);
    const logout = await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Cookie', [newRefresh, 'bf_cart=keep-cart'])
      .expect(204);
    expect(cookieLines(logout.headers['set-cookie']).join(';')).not.toContain(
      'bf_cart=;',
    );
    await request(app.getHttpServer())
      .post('/api/v1/auth/logout')
      .set('Cookie', newRefresh)
      .expect(204);
  });
  it('rejects disabled customers and rate-limits repeated login attempts', async () => {
    await prisma.customerUser.update({
      where: { id: customerId },
      data: { status: 'DISABLED' },
    });
    await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: nextPassword })
      .expect(401);
    await prisma.customerUser.update({
      where: { id: customerId },
      data: { status: 'ACTIVE' },
    });
    const statuses: number[] = [];
    for (let i = 0; i < 7; i++)
      statuses.push(
        (
          await request(app.getHttpServer())
            .post('/api/v1/auth/login')
            .send({
              email: 'rate-' + i + '@example.test',
              password: 'wrong-password-long',
            })
        ).status,
      );
    expect(statuses).toContain(429);
  });
});
