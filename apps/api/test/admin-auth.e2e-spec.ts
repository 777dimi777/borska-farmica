import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../dist/src/app.module';
import { PrismaService } from './../dist/src/database/prisma.service';
import { PasswordService } from './../dist/src/admin-auth/password.service';
import { configureOpenApi } from './../dist/src/openapi';

const EMAIL = 'e2e-admin-auth@example.test';
const PASSWORD = 'E2E-Strong-Password-123!';
const cookieValue = (header: string[]) =>
  header.find((value) => value.startsWith('bf_admin_refresh='))?.split(';')[0];

describe('Admin authentication (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminId: string;
  const cleanup = async () => {
    const admins = await prisma.adminUser.findMany({
      where: { email: EMAIL },
      select: { id: true },
    });
    const ids = admins.map(({ id }) => id);
    if (ids.length) {
      await prisma.adminSession.deleteMany({ where: { adminId: { in: ids } } });
      await prisma.adminUser.deleteMany({ where: { id: { in: ids } } });
    }
  };
  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
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
    const hash = await app.get(PasswordService).hash(PASSWORD);
    const admin = await prisma.adminUser.create({
      data: {
        email: EMAIL,
        passwordHash: hash,
        firstName: 'E2E',
        lastName: 'Admin',
        role: 'SUPER_ADMIN',
      },
    });
    adminId = admin.id;
  });
  afterAll(async () => {
    await cleanup();
    await app.close();
  });
  it('rejects invalid DTO, wrong password and unknown email with generic errors', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .send({ email: 'bad', password: 'short', extra: true })
      .expect(400);
    const wrong = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .send({ email: EMAIL, password: 'Wrong-Password-123!' })
      .expect(401);
    const missing = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .send({ email: 'missing@example.test', password: 'Wrong-Password-123!' })
      .expect(401);
    const wrongBody = wrong.body as { message: string };
    const missingBody = missing.body as { message: string };
    expect(wrongBody.message).toBe(missingBody.message);
  });
  it('logs in, sets HttpOnly cookie, authorizes me and rotates refresh', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/login')
      .send({ email: `  ${EMAIL.toUpperCase()} `, password: PASSWORD })
      .expect(200);
    const oldCookie = cookieValue(
      login.headers['set-cookie'] as unknown as string[],
    );
    expect(oldCookie).toBeDefined();
    expect(
      (login.headers['set-cookie'] as unknown as string[]).join(';'),
    ).toContain('HttpOnly');
    expect(login.body).toMatchObject({
      tokenType: 'Bearer',
      expiresIn: 900,
      admin: { email: EMAIL, role: 'SUPER_ADMIN' },
    });
    expect(login.body).not.toHaveProperty('refreshToken');
    expect(JSON.stringify(login.body)).not.toContain('passwordHash');
    const access = (login.body as { accessToken: string }).accessToken;
    const me = await request(app.getHttpServer())
      .get('/api/v1/admin/auth/me')
      .set('Authorization', `Bearer ${access}`)
      .expect(200);
    expect(me.body).toMatchObject({ email: EMAIL, status: 'ACTIVE' });
    await request(app.getHttpServer()).get('/api/v1/admin/auth/me').expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/admin/auth/me')
      .set('Authorization', 'Bearer invalid')
      .expect(401);
    const refresh = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/refresh')
      .set('Cookie', oldCookie as string)
      .expect(200);
    const nextCookie = cookieValue(
      refresh.headers['set-cookie'] as unknown as string[],
    );
    expect(nextCookie).toBeDefined();
    expect(nextCookie).not.toBe(oldCookie);
    await request(app.getHttpServer())
      .post('/api/v1/admin/auth/refresh')
      .set('Cookie', oldCookie as string)
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/admin/auth/refresh')
      .expect(401);
    await prisma.adminUser.update({
      where: { id: adminId },
      data: { status: 'DISABLED' },
    });
    await request(app.getHttpServer())
      .get('/api/v1/admin/auth/me')
      .set('Authorization', `Bearer ${access}`)
      .expect(401);
    await prisma.adminUser.update({
      where: { id: adminId },
      data: { status: 'ACTIVE' },
    });
    const logout = await request(app.getHttpServer())
      .post('/api/v1/admin/auth/logout')
      .set('Cookie', nextCookie as string)
      .expect(204);
    expect(
      (logout.headers['set-cookie'] as unknown as string[]).join(';'),
    ).toContain('Expires=Thu, 01 Jan 1970 00:00:00 GMT');
    await request(app.getHttpServer())
      .post('/api/v1/admin/auth/logout')
      .set('Cookie', nextCookie as string)
      .expect(204);
    await request(app.getHttpServer())
      .post('/api/v1/admin/auth/refresh')
      .set('Cookie', nextCookie as string)
      .expect(401);
  });
  it('returns security headers and documents auth routes', async () => {
    const health = await request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200);
    expect(health.headers).toHaveProperty('x-content-type-options', 'nosniff');
    expect(health.headers).not.toHaveProperty('x-powered-by');
    const spec = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);
    const paths = (spec.body as { paths: Record<string, unknown> }).paths;
    expect(paths).toHaveProperty('/admin/auth/login');
    expect(paths).toHaveProperty('/admin/auth/refresh');
    expect(paths).toHaveProperty('/admin/auth/logout');
    expect(paths).toHaveProperty('/admin/auth/me');
  });
});
