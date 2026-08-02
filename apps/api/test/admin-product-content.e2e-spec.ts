/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/require-await */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import request from 'supertest';
import sharp from 'sharp';
import { App } from 'supertest/types';
import { AppModule } from './../dist/src/app.module';
import { PrismaService } from './../dist/src/database/prisma.service';
import { PasswordService } from './../dist/src/admin-auth/password.service';
import { configureOpenApi } from './../dist/src/openapi';
import { IMAGE_STORAGE_PROVIDER } from './../dist/src/image-storage/image-storage.types';

const prefix = 'e2e-content-',
  email = prefix + 'admin@example.test',
  password = 'E2E-Strong-Password-123!';
describe('Admin product availability and images (e2e)', () => {
  let app: INestApplication<App>,
    prisma: PrismaService,
    token: string,
    productId: string,
    otherId: string,
    categoryId: string;
  const auth = () => ({ Authorization: 'Bearer ' + token });
  const fakeStorage = {
    upload: jest.fn(
      async (
        input: {
          width: number;
          height: number;
          format: string;
          byteSize: number;
        },
        uploadedProductId: string,
      ) => ({
        provider: 'CLOUDINARY' as const,
        storageKey: `fake/${uploadedProductId}/asset.webp`,
        url: `https://res.cloudinary.com/test/image/upload/fake/${uploadedProductId}/asset.webp`,
        width: input.width,
        height: input.height,
        format: input.format,
        byteSize: input.byteSize,
      }),
    ),
    delete: jest.fn(async () => 'deleted' as const),
  };
  const cleanup = async () => {
    const admins = await prisma.adminUser.findMany({
        where: { email },
        select: { id: true },
      }),
      adminIds = admins.map((x) => x.id);
    await prisma.adminAuditLog.deleteMany({
      where: { adminId: { in: adminIds } },
    });
    const products = await prisma.product.findMany({
        where: { slug: { startsWith: prefix } },
        select: { id: true },
      }),
      ids = products.map((x) => x.id);
    await prisma.availabilityWindow.deleteMany({
      where: { productId: { in: ids } },
    });
    await prisma.productImage.deleteMany({ where: { productId: { in: ids } } });
    const variants = await prisma.productVariant.findMany({
      where: { productId: { in: ids } },
      select: { id: true },
    });
    await prisma.inventoryMovement.deleteMany({
      where: { variantId: { in: variants.map((x) => x.id) } },
    });
    await prisma.productVariant.deleteMany({
      where: { productId: { in: ids } },
    });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    await prisma.category.deleteMany({
      where: { slug: { startsWith: prefix } },
    });
    await prisma.adminSession.deleteMany({
      where: { adminId: { in: adminIds } },
    });
    await prisma.adminUser.deleteMany({ where: { id: { in: adminIds } } });
  };
  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(IMAGE_STORAGE_PROVIDER)
      .useValue(fakeStorage)
      .compile();
    app = mod.createNestApplication();
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
    app.get(ConfigService).set('IMAGE_UPLOAD_ENABLED', true);
    prisma = app.get(PrismaService);
    await cleanup();
    const passwordHash = await app.get(PasswordService).hash(password);
    await prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        firstName: 'Content',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    });
    token = (
      await request(app.getHttpServer())
        .post('/api/v1/admin/auth/login')
        .send({ email, password })
        .expect(200)
    ).body.accessToken as string;
    const c = await prisma.category.create({
      data: { name: 'E2E Content', slug: prefix + 'category' },
    });
    categoryId = c.id;
    const p = await prisma.product.create({
      data: {
        categoryId,
        name: 'Seasonal Product',
        slug: prefix + 'product',
        status: 'ACTIVE',
        availabilityMode: 'SEASONAL',
      },
    });
    productId = p.id;
    otherId = (
      await prisma.product.create({
        data: { categoryId, name: 'Other Product', slug: prefix + 'other' },
      })
    ).id;
    await prisma.productVariant.create({
      data: {
        productId,
        name: 'Default',
        sku: prefix + 'sku',
        price: '10',
        packageAmount: '1',
        measurementUnit: 'PIECE',
        stockQuantity: '5',
        isDefault: true,
      },
    });
  });
  afterAll(async () => {
    await cleanup();
    expect(
      await prisma.product.count({ where: { slug: { startsWith: prefix } } }),
    ).toBe(0);
    expect(await prisma.adminUser.count({ where: { email } })).toBe(0);
    await app.close();
  });

  it('protects endpoints and validates availability contracts', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/products/' + productId + '/availability-windows')
      .expect(401);
    await request(app.getHttpServer())
      .get('/api/v1/admin/products/not-a-uuid/availability-windows')
      .set(auth())
      .expect(400);
    await request(app.getHttpServer())
      .get(
        '/api/v1/admin/products/' + productId + '/availability-preview?at=nope',
      )
      .set(auth())
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/admin/products/' + productId + '/availability-windows')
      .set(auth())
      .send({
        type: 'FIXED_DATE_RANGE',
        startsAt: '2026-04-01',
        endsAt: '2026-04-30',
        startMonth: 4,
      })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/admin/products/' + productId + '/availability-windows')
      .set(auth())
      .send({
        type: 'RECURRING_ANNUAL',
        startMonth: 4,
        startDay: 31,
        endMonth: 5,
        endDay: 1,
      })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/admin/products/' + productId + '/availability-windows')
      .set(auth())
      .send({
        type: 'RECURRING_ANNUAL',
        startMonth: 2,
        startDay: 29,
        endMonth: 2,
        endDay: 29,
        label: ' leap ',
      })
      .expect(201);
  });

  it('creates, previews, updates, deterministically reorders and deletes windows', async () => {
    const fixed = (
      await request(app.getHttpServer())
        .post('/api/v1/admin/products/' + productId + '/availability-windows')
        .set(auth())
        .send({
          type: 'FIXED_DATE_RANGE',
          startsAt: '2026-06-01',
          endsAt: '2026-08-31',
          label: 'Summer',
          sortOrder: 10,
        })
        .expect(201)
    ).body;
    const recurring = (
      await request(app.getHttpServer())
        .post('/api/v1/admin/products/' + productId + '/availability-windows')
        .set(auth())
        .send({
          type: 'RECURRING_ANNUAL',
          startMonth: 12,
          startDay: 20,
          endMonth: 1,
          endDay: 10,
          label: 'Winter',
          sortOrder: 20,
        })
        .expect(201)
    ).body;
    await request(app.getHttpServer())
      .patch(
        '/api/v1/admin/products/' +
          productId +
          '/availability-windows/' +
          fixed.id,
      )
      .set(auth())
      .send({ isActive: false })
      .expect(200);
    await request(app.getHttpServer())
      .patch(
        '/api/v1/admin/products/' + productId + '/availability-windows/reorder',
      )
      .set(auth())
      .send({
        items: [
          { id: fixed.id, sortOrder: 1 },
          { id: recurring.id, sortOrder: 2 },
        ],
      })
      .expect(200);
    const preview = await request(app.getHttpServer())
      .get(
        '/api/v1/admin/products/' +
          productId +
          '/availability-preview?at=2026-12-25T12:00:00.000Z',
      )
      .set(auth())
      .expect(200);
    expect(preview.body).toMatchObject({
      matchedWindowId: recurring.id,
      businessReason: 'MATCHED_RECURRING_WINDOW',
      currentlyAvailable: true,
    });
    const list = await request(app.getHttpServer())
      .get('/api/v1/admin/products/' + productId + '/availability-windows')
      .set(auth())
      .expect(200);
    expect(list.body.length).toBe(3);
    await request(app.getHttpServer())
      .patch(
        '/api/v1/admin/products/' +
          otherId +
          '/availability-windows/' +
          fixed.id,
      )
      .set(auth())
      .send({ label: 'x' })
      .expect(404);
    await request(app.getHttpServer())
      .delete(
        '/api/v1/admin/products/' +
          productId +
          '/availability-windows/' +
          fixed.id,
      )
      .set(auth())
      .expect(204);
    await request(app.getHttpServer())
      .delete(
        '/api/v1/admin/products/' +
          productId +
          '/availability-windows/' +
          recurring.id,
      )
      .set(auth())
      .expect(204);
    expect(
      await prisma.adminAuditLog.count({
        where: {
          admin: { email },
          action: { startsWith: 'availability_window.' },
        },
      }),
    ).toBeGreaterThanOrEqual(6);
  });

  it('manages image metadata, primary fallback, reorder and public projection', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/admin/products/' + productId + '/images')
      .set(auth())
      .send({ url: 'data:image/png;base64,x', altText: 'Bad image' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/admin/products/' + productId + '/images')
      .set(auth())
      .send({ url: 'https://example.com/a.jpg', altText: '   ' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/admin/products/' + productId + '/images')
      .set(auth())
      .send({
        url: 'https://example.com/a.jpg',
        altText: 'First image',
        storageKey: 'forbidden',
      })
      .expect(400);
    const first = (
      await request(app.getHttpServer())
        .post('/api/v1/admin/products/' + productId + '/images')
        .set(auth())
        .send({ url: 'https://example.com/a.jpg', altText: 'First image' })
        .expect(201)
    ).body;
    expect(first).toMatchObject({ isPrimary: true });
    expect(first.storageKey).toBeUndefined();
    const second = (
      await request(app.getHttpServer())
        .post('/api/v1/admin/products/' + productId + '/images')
        .set(auth())
        .send({ url: 'https://example.com/b.jpg', altText: 'Second image' })
        .expect(201)
    ).body;
    expect(second.isPrimary).toBe(false);
    await request(app.getHttpServer())
      .patch('/api/v1/admin/products/' + productId + '/images/' + second.id)
      .set(auth())
      .send({ isPrimary: true, altText: 'Second primary' })
      .expect(200);
    await request(app.getHttpServer())
      .patch('/api/v1/admin/products/' + productId + '/images/' + second.id)
      .set(auth())
      .send({ isPrimary: false })
      .expect(409);
    const reordered = await request(app.getHttpServer())
      .patch('/api/v1/admin/products/' + productId + '/images/reorder')
      .set(auth())
      .send({
        items: [
          { id: first.id, sortOrder: 4 },
          { id: second.id, sortOrder: 2 },
        ],
        primaryImageId: first.id,
      })
      .expect(200);
    expect(reordered.body[0].id).toBe(first.id);
    await request(app.getHttpServer())
      .patch('/api/v1/admin/products/' + otherId + '/images/' + first.id)
      .set(auth())
      .send({ altText: 'Mismatch' })
      .expect(404);
    const publicDetail = await request(app.getHttpServer())
      .get('/api/v1/products/' + prefix + 'product')
      .expect(200);
    expect(publicDetail.body.images[0]).toMatchObject({
      id: first.id,
      primary: true,
    });
    await request(app.getHttpServer())
      .delete('/api/v1/admin/products/' + productId + '/images/' + first.id)
      .set(auth())
      .expect(204);
    expect(
      (
        await request(app.getHttpServer())
          .get('/api/v1/admin/products/' + productId + '/images')
          .set(auth())
          .expect(200)
      ).body[0].isPrimary,
    ).toBe(true);
    await request(app.getHttpServer())
      .delete('/api/v1/admin/products/' + productId + '/images/' + second.id)
      .set(auth())
      .expect(204);
    expect(
      (
        await request(app.getHttpServer())
          .get('/api/v1/admin/products/' + productId + '/images')
          .set(auth())
          .expect(200)
      ).body,
    ).toEqual([]);
    expect(
      await prisma.adminAuditLog.count({
        where: { admin: { email }, action: { startsWith: 'product_image.' } },
      }),
    ).toBeGreaterThanOrEqual(6);
  });
  it('uploads a real multipart image through the fake provider', async () => {
    const png = await sharp({
      create: {
        width: 32,
        height: 16,
        channels: 4,
        background: { r: 10, g: 80, b: 20, alpha: 0.7 },
      },
    })
      .png()
      .toBuffer();

    await request(app.getHttpServer())
      .post('/api/v1/admin/products/' + productId + '/images/upload')
      .field('altText', 'Unauthorized image')
      .attach('file', png, { filename: 'image.png', contentType: 'image/png' })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/admin/products/' + productId + '/images/upload')
      .set(auth())
      .field('altText', 'Missing file')
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/admin/products/' + productId + '/images/upload')
      .set(auth())
      .field('altText', 'MIME mismatch')
      .attach('file', png, { filename: 'image.jpg', contentType: 'image/jpeg' })
      .expect(415);

    const uploaded = await request(app.getHttpServer())
      .post('/api/v1/admin/products/' + productId + '/images/upload')
      .set(auth())
      .field('altText', 'Managed product image')
      .field('isPrimary', 'true')
      .attach('file', png, { filename: 'image.png', contentType: 'image/png' })
      .expect(201);

    expect(uploaded.body).toMatchObject({
      storageProvider: 'CLOUDINARY',
      width: 32,
      height: 16,
      format: 'webp',
      isPrimary: true,
    });
    expect(uploaded.body.storageKey).toBeUndefined();
    expect(fakeStorage.upload).toHaveBeenCalledTimes(1);
    const publicDetail = await request(app.getHttpServer())
      .get('/api/v1/products/' + prefix + 'product')
      .expect(200);
    expect(publicDetail.body.images[0]).toMatchObject({
      width: 32,
      height: 16,
      primary: true,
    });
    expect(publicDetail.body.images[0].storageKey).toBeUndefined();
    const audit = await prisma.adminAuditLog.findFirstOrThrow({
      where: { action: 'product_image.uploaded', resourceId: uploaded.body.id },
      select: { changes: true },
    });
    expect(JSON.stringify(audit.changes)).not.toContain('storageKey');
    await request(app.getHttpServer())
      .delete(
        '/api/v1/admin/products/' + productId + '/images/' + uploaded.body.id,
      )
      .set(auth())
      .expect(204);
    expect(fakeStorage.delete).toHaveBeenCalledWith(
      `fake/${productId}/asset.webp`,
    );
  });
});
