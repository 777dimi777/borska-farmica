/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-argument */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../dist/src/app.module';
import { PrismaService } from './../dist/src/database/prisma.service';
import { PasswordService } from './../dist/src/admin-auth/password.service';

const password = 'E2E-Strong-Password-123!';
const emails = [
  'e2e-category-admin@example.test',
  'e2e-category-super@example.test',
];

describe('Admin categories (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let adminToken: string;
  let superToken: string;
  let firstId: string;
  let secondId: string;

  const cleanup = async () => {
    await prisma.product.deleteMany({
      where: { slug: { startsWith: 'e2e-category-' } },
    });
    await prisma.adminAuditLog.deleteMany({
      where: { admin: { email: { in: emails } } },
    });
    await prisma.category.deleteMany({
      where: { slug: { startsWith: 'e2e-category-' } },
    });
    const admins = await prisma.adminUser.findMany({
      where: { email: { in: emails } },
      select: { id: true },
    });
    const ids = admins.map((x) => x.id);
    if (ids.length) {
      await prisma.adminSession.deleteMany({ where: { adminId: { in: ids } } });
      await prisma.adminUser.deleteMany({ where: { id: { in: ids } } });
    }
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = module.createNestApplication();
    app.use(cookieParser());
    app.use(helmet());
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: false },
      }),
    );
    await app.init();
    prisma = app.get(PrismaService);
    await cleanup();
    const passwordHash = await app.get(PasswordService).hash(password);
    await prisma.adminUser.createMany({
      data: [
        {
          email: emails[0],
          passwordHash,
          firstName: 'E2E',
          lastName: 'Admin',
          role: 'ADMIN',
        },
        {
          email: emails[1],
          passwordHash,
          firstName: 'E2E',
          lastName: 'Super',
          role: 'SUPER_ADMIN',
        },
      ],
    });
    const login = async (email: string) =>
      (
        await request(app.getHttpServer())
          .post('/api/v1/admin/auth/login')
          .send({ email, password })
          .expect(200)
      ).body.accessToken as string;
    adminToken = await login(emails[0]);
    superToken = await login(emails[1]);
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });

  it('requires an admin access token and validates requests', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/categories')
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/admin/categories')
      .set(auth(adminToken))
      .send({ name: 'x', extra: true })
      .expect(400);
    await request(app.getHttpServer())
      .patch('/api/v1/admin/categories/00000000-0000-4000-8000-000000000000')
      .set(auth(adminToken))
      .send({})
      .expect(400);
  });

  it('creates, lists, reads, updates and reorders categories', async () => {
    const first = await request(app.getHttpServer())
      .post('/api/v1/admin/categories')
      .set(auth(adminToken))
      .set('User-Agent', 'category-e2e')
      .send({
        name: 'E2E Category \u010caj',
        description: 'test',
        sortOrder: 20,
      })
      .expect(201);
    firstId = first.body.id as string;
    expect(first.body.slug).toBe('e2e-category-caj');
    const second = await request(app.getHttpServer())
      .post('/api/v1/admin/categories')
      .set(auth(adminToken))
      .send({ name: 'E2E Category Two', isActive: false, sortOrder: 21 })
      .expect(201);
    secondId = second.body.id as string;
    await request(app.getHttpServer())
      .post('/api/v1/admin/categories')
      .set(auth(adminToken))
      .send({ name: 'E2E Category \u010caj' })
      .expect(409);
    const list = await request(app.getHttpServer())
      .get(
        '/api/v1/admin/categories?search=e2e-category&status=all&sort=name_asc&page=1&limit=10',
      )
      .set(auth(adminToken))
      .expect(200);
    expect(list.body.pagination.total).toBeGreaterThanOrEqual(2);
    expect(list.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: firstId,
          productCount: 0,
          activeProductCount: 0,
        }),
      ]),
    );
    await request(app.getHttpServer())
      .get(`/api/v1/admin/categories/${firstId}`)
      .set(auth(adminToken))
      .expect(200)
      .expect((res) =>
        expect(res.body).toMatchObject({
          id: firstId,
          draftProductCount: 0,
          archivedProductCount: 0,
        }),
      );
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/categories/${firstId}`)
      .set(auth(adminToken))
      .send({ description: null, isActive: false })
      .expect(200)
      .expect((res) => expect(res.body.isActive).toBe(false));
    const publicList = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);
    expect(JSON.stringify(publicList.body)).not.toContain(firstId);
    const reordered = await request(app.getHttpServer())
      .patch('/api/v1/admin/categories/reorder')
      .set(auth(adminToken))
      .send({
        items: [
          { id: firstId, sortOrder: 2 },
          { id: secondId, sortOrder: 1 },
        ],
      })
      .expect(200);
    expect(
      reordered.body.findIndex((x: { id: string }) => x.id === secondId),
    ).toBeLessThan(
      reordered.body.findIndex((x: { id: string }) => x.id === firstId),
    );
  });

  it('restricts deletion and records sanitized audit events', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/admin/categories/${secondId}`)
      .set(auth(adminToken))
      .expect(403);
    await prisma.product.create({
      data: {
        categoryId: firstId,
        name: 'E2E Category Product',
        slug: 'e2e-category-product',
      },
    });
    await request(app.getHttpServer())
      .delete(`/api/v1/admin/categories/${firstId}`)
      .set(auth(superToken))
      .expect(409);
    await request(app.getHttpServer())
      .delete(`/api/v1/admin/categories/${secondId}`)
      .set(auth(superToken))
      .expect(204);
    const logs = await prisma.adminAuditLog.findMany({
      where: { resourceType: 'category', admin: { email: { in: emails } } },
      orderBy: { createdAt: 'asc' },
    });
    expect(logs.map((x) => x.action)).toEqual(
      expect.arrayContaining([
        'category.created',
        'category.deactivated',
        'category.reordered',
        'category.deleted',
      ]),
    );
    expect(JSON.stringify(logs)).not.toContain(password);
    expect(logs.some((x) => x.userAgent === 'category-e2e')).toBe(true);
  });
});
