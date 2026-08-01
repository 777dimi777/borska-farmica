/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../dist/src/app.module';
import { PrismaService } from './../dist/src/database/prisma.service';
import { PasswordService } from './../dist/src/admin-auth/password.service';
import { configureOpenApi } from './../dist/src/openapi';

const prefix = 'e2e-admin-product-';
const emails = [`${prefix}admin@example.test`, `${prefix}super@example.test`];
const password = 'E2E-Strong-Password-123!';
describe('Admin product management (e2e)', () => {
  let app: INestApplication<App>,
    prisma: PrismaService,
    adminToken: string,
    superToken: string;
  let activeCategoryId: string,
    inactiveCategoryId: string,
    productId: string,
    variantId: string;
  const auth = (token: string) => ({ Authorization: `Bearer ${token}` });
  const cleanup = async () => {
    const admins = await prisma.adminUser.findMany({
      where: { email: { in: emails } },
      select: { id: true },
    });
    const adminIds = admins.map((x) => x.id);
    await prisma.adminAuditLog.deleteMany({
      where: { adminId: { in: adminIds } },
    });
    const products = await prisma.product.findMany({
      where: { slug: { startsWith: prefix } },
      select: { id: true },
    });
    const productIds = products.map((x) => x.id);
    const variants = await prisma.productVariant.findMany({
      where: { productId: { in: productIds } },
      select: { id: true },
    });
    const variantIds = variants.map((x) => x.id);
    await prisma.inventoryMovement.deleteMany({
      where: { variantId: { in: variantIds } },
    });
    await prisma.availabilityWindow.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.productImage.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.productVariant.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    await prisma.category.deleteMany({
      where: { slug: { startsWith: prefix } },
    });
    await prisma.adminSession.deleteMany({
      where: { adminId: { in: adminIds } },
    });
    await prisma.adminUser.deleteMany({ where: { id: { in: adminIds } } });
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
    configureOpenApi(app, true);
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
    const active = await prisma.category.create({
      data: {
        name: 'E2E Admin Product Active',
        slug: `${prefix}active-category`,
        sortOrder: 990,
      },
    });
    const inactive = await prisma.category.create({
      data: {
        name: 'E2E Admin Product Inactive',
        slug: `${prefix}inactive-category`,
        isActive: false,
        sortOrder: 991,
      },
    });
    activeCategoryId = active.id;
    inactiveCategoryId = inactive.id;
  });
  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  it('enforces authentication, roles and disabled status', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/products')
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/admin/products/not-a-uuid')
      .set(auth(adminToken))
      .expect(400);
    const admin = await prisma.adminUser.findUniqueOrThrow({
      where: { email: emails[0] },
    });
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { status: 'DISABLED' },
    });
    await request(app.getHttpServer())
      .get('/api/v1/admin/products')
      .set(auth(adminToken))
      .expect(401);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { status: 'ACTIVE' },
    });
  });

  it('creates a DRAFT product, validates lifecycle and normalizes slug', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/admin/products')
      .set(auth(adminToken))
      .send({
        categoryId: activeCategoryId,
        name: 'E2E Admin Product \u010caj',
        featured: true,
        availabilityMode: 'ALWAYS',
      })
      .expect(201);
    productId = created.body.id as string;
    expect(created.body).toMatchObject({
      slug: `${prefix}caj`,
      status: 'DRAFT',
      variantCount: 0,
    });
    await request(app.getHttpServer())
      .post('/api/v1/admin/products')
      .set(auth(adminToken))
      .send({
        categoryId: activeCategoryId,
        name: 'Duplicate',
        slug: `${prefix}caj`,
      })
      .expect(409);
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .send({})
      .expect(400);
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .send({ status: 'ACTIVE' })
      .expect(409);
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .send({ categoryId: inactiveCategoryId })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .send({ status: 'ACTIVE' })
      .expect(409);
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .send({ categoryId: activeCategoryId, shortDescription: ' plain text ' })
      .expect(200);
  });

  it('manages variants with precise strings, SKU and default rules', async () => {
    const payload = {
      name: '1 l',
      sku: ' e2e_admin_product_1l ',
      price: '250.00',
      compareAtPrice: '300.00',
      packageAmount: '1.000',
      unit: 'LITER',
      lowStockThreshold: '5.000',
      minimumPurchaseQuantity: '1.000',
      purchaseIncrement: '1.000',
      allowBackorder: false,
      isActive: true,
    };
    const first = await request(app.getHttpServer())
      .post(`/api/v1/admin/products/${productId}/variants`)
      .set(auth(adminToken))
      .send(payload)
      .expect(201);
    variantId = first.body.variants[0].id as string;
    expect(first.body.variants[0]).toMatchObject({
      sku: 'E2E_ADMIN_PRODUCT_1L',
      price: '250.00',
      packageAmount: '1.000',
      isDefault: true,
      stockQuantity: '0.000',
    });
    await request(app.getHttpServer())
      .post(`/api/v1/admin/products/${productId}/variants`)
      .set(auth(adminToken))
      .send({ ...payload, sku: 'OTHER', stockQuantity: '5.000' })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/api/v1/admin/products/${productId}/variants`)
      .set(auth(adminToken))
      .send({ ...payload, sku: 'E2E_ADMIN_PRODUCT_1L' })
      .expect(409);
    await request(app.getHttpServer())
      .post(`/api/v1/admin/products/${productId}/variants`)
      .set(auth(adminToken))
      .send({ ...payload, sku: 'BAD-PRICE', price: 2.5 })
      .expect(400);
    await request(app.getHttpServer())
      .post(`/api/v1/admin/products/${productId}/variants`)
      .set(auth(adminToken))
      .send({ ...payload, sku: 'COMPARE', compareAtPrice: '250.00' })
      .expect(400);
    const second = await request(app.getHttpServer())
      .post(`/api/v1/admin/products/${productId}/variants`)
      .set(auth(adminToken))
      .send({
        ...payload,
        sku: 'E2E_ADMIN_PRODUCT_500ML',
        name: '500 ml',
        price: '150.00',
        compareAtPrice: null,
        packageAmount: '0.500',
        isDefault: true,
        isActive: false,
      })
      .expect(201);
    expect(
      second.body.variants.find(
        (x: { sku: string }) => x.sku === 'E2E_ADMIN_PRODUCT_500ML',
      ).isDefault,
    ).toBe(true);
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}/variants/${variantId}`)
      .set(auth(adminToken))
      .send({ isDefault: true })
      .expect(200);
  });

  it('publishes, queries every admin view and preserves public stock privacy', async () => {
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .send({ status: 'ACTIVE' })
      .expect(200);
    for (const query of [
      'status=ACTIVE',
      'featured=true',
      'mainProduct=false',
      'availabilityMode=ALWAYS',
      'stockStatus=out_of_stock',
      'stockStatus=in_stock',
      'stockStatus=low_stock',
      'stockStatus=backorder',
      'sort=oldest',
      'sort=name_asc',
      'sort=name_desc',
      'sort=updated_desc',
      'sort=status',
      `categoryId=${activeCategoryId}`,
      'search=E2E_ADMIN_PRODUCT_1L',
    ]) {
      const list = await request(app.getHttpServer())
        .get(`/api/v1/admin/products?${query}&page=1&limit=5`)
        .set(auth(adminToken))
        .expect(200);
      expect(list.body.pagination).toMatchObject({ page: 1, limit: 5 });
    }
    const detail = await request(app.getHttpServer())
      .get(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .expect(200);
    expect(detail.body).toMatchObject({
      id: productId,
      status: 'ACTIVE',
      startingPrice: '250.00',
      stockQuantity: '0.000',
    });
    await request(app.getHttpServer())
      .get('/api/v1/admin/products/00000000-0000-4000-8000-000000000099')
      .set(auth(adminToken))
      .expect(404);
    const publicDetail = await request(app.getHttpServer())
      .get(`/api/v1/products/${prefix}caj`)
      .expect(200);
    expect(JSON.stringify(publicDetail.body)).not.toContain('stockQuantity');
  });

  it('applies inventory adjustments and exposes paginated immutable history', async () => {
    const restock = await request(app.getHttpServer())
      .post(
        `/api/v1/admin/products/${productId}/variants/${variantId}/inventory-adjustments`,
      )
      .set(auth(adminToken))
      .send({ type: 'RESTOCK', quantity: '10.000', reference: 'E2E' })
      .expect(201);
    expect(restock.body).toMatchObject({
      stockQuantity: '10.000',
      availableQuantity: '10.000',
      movement: { quantityDelta: '10.000', balanceAfter: '10.000' },
    });
    await request(app.getHttpServer())
      .post(
        `/api/v1/admin/products/${productId}/variants/${variantId}/inventory-adjustments`,
      )
      .set(auth(adminToken))
      .send({ type: 'DAMAGE', quantity: '2.000', reason: 'E2E damage' })
      .expect(201)
      .expect((res) => expect(res.body.stockQuantity).toBe('8.000'));
    await request(app.getHttpServer())
      .post(
        `/api/v1/admin/products/${productId}/variants/${variantId}/inventory-adjustments`,
      )
      .set(auth(adminToken))
      .send({ type: 'ADJUSTMENT', quantity: '-1.500', reason: 'E2E count' })
      .expect(201)
      .expect((res) => expect(res.body.stockQuantity).toBe('6.500'));
    for (const body of [
      { type: 'SALE', quantity: '1.000' },
      { type: 'RESTOCK', quantity: '0' },
      { type: 'DAMAGE', quantity: '1.000' },
      { type: 'ADJUSTMENT', quantity: '-100.000', reason: 'bad' },
    ])
      await request(app.getHttpServer())
        .post(
          `/api/v1/admin/products/${productId}/variants/${variantId}/inventory-adjustments`,
        )
        .set(auth(adminToken))
        .send(body)
        .expect(body.type === 'ADJUSTMENT' ? 409 : 400);
    const history = await request(app.getHttpServer())
      .get(
        `/api/v1/admin/products/${productId}/variants/${variantId}/inventory-movements?type=RESTOCK&page=1&limit=1`,
      )
      .set(auth(adminToken))
      .expect(200);
    expect(history.body).toMatchObject({
      data: [
        { type: 'RESTOCK', quantityDelta: '10.000', balanceAfter: '10.000' },
      ],
      pagination: { total: 1 },
    });
    expect(JSON.stringify(history.body)).not.toContain('adminId');
  });

  it('enforces delete/archive rules and records only successful audits', async () => {
    await request(app.getHttpServer())
      .delete(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .expect(403);
    await request(app.getHttpServer())
      .delete(`/api/v1/admin/products/${productId}/variants/${variantId}`)
      .set(auth(superToken))
      .expect(409);
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .send({ status: 'ARCHIVED' })
      .expect(200);
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .send({ status: 'ACTIVE' })
      .expect(409);
    await request(app.getHttpServer())
      .patch(`/api/v1/admin/products/${productId}`)
      .set(auth(adminToken))
      .send({ status: 'DRAFT' })
      .expect(200);
    await request(app.getHttpServer())
      .delete(`/api/v1/admin/products/${productId}`)
      .set(auth(superToken))
      .expect(409);
    const empty = await request(app.getHttpServer())
      .post('/api/v1/admin/products')
      .set(auth(adminToken))
      .send({ categoryId: activeCategoryId, name: 'E2E Admin Product Empty' })
      .expect(201);
    await request(app.getHttpServer())
      .delete(`/api/v1/admin/products/${empty.body.id}`)
      .set(auth(superToken))
      .expect(204);
    const logs = await prisma.adminAuditLog.findMany({
      where: { admin: { email: { in: emails } } },
    });
    expect(logs.map((x) => x.action)).toEqual(
      expect.arrayContaining([
        'product.created',
        'product.published',
        'product_variant.created',
        'inventory.restocked',
        'inventory.damaged',
        'inventory.adjusted',
        'product.archived',
        'product.moved_to_draft',
        'product.deleted',
      ]),
    );
    const json = JSON.stringify(logs);
    for (const secret of [
      password,
      'accessToken',
      'refreshToken',
      'cookie',
      'passwordHash',
    ])
      expect(json).not.toContain(secret);
  });
});
