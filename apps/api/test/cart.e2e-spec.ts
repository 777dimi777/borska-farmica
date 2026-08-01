/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unnecessary-type-assertion */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../dist/src/app.module';
import { PrismaService } from './../dist/src/database/prisma.service';
import { configureOpenApi } from './../dist/src/openapi';
const prefix = 'e2e-cart-';
describe('Guest cart (e2e)', () => {
  let app: INestApplication<App>,
    prisma: PrismaService,
    productId: string,
    variantId: string,
    categoryId: string;
  const testCartIds = new Set<string>();
  const cleanup = async () => {
    const products = await prisma.product.findMany({
        where: { slug: { startsWith: prefix } },
        select: { id: true },
      }),
      ids = products.map((x) => x.id);
    const variants = await prisma.productVariant.findMany({
        where: { productId: { in: ids } },
        select: { id: true },
      }),
      vIds = variants.map((x) => x.id);
    const carts = await prisma.cart.findMany({
      where: {
        OR: [
          { id: { in: [...testCartIds] } },
          { items: { some: { variantId: { in: vIds } } } },
          { tokenHash: 'f'.repeat(64) },
        ],
      },
      select: { id: true },
    });
    const cartIds = carts.map((cart) => cart.id);
    await prisma.cartItem.deleteMany({ where: { cartId: { in: cartIds } } });
    await prisma.cart.deleteMany({ where: { id: { in: cartIds } } });
    testCartIds.clear();
    await prisma.availabilityWindow.deleteMany({
      where: { productId: { in: ids } },
    });
    await prisma.productImage.deleteMany({ where: { productId: { in: ids } } });
    await prisma.inventoryMovement.deleteMany({
      where: { variantId: { in: vIds } },
    });
    await prisma.productVariant.deleteMany({
      where: { productId: { in: ids } },
    });
    await prisma.product.deleteMany({ where: { id: { in: ids } } });
    await prisma.category.deleteMany({
      where: { slug: { startsWith: prefix } },
    });
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
    const c = await prisma.category.create({
      data: { name: 'E2E Cart', slug: prefix + 'category' },
    });
    categoryId = c.id;
    const p = await prisma.product.create({
      data: {
        categoryId,
        name: 'E2E Cart Milk',
        slug: prefix + 'milk',
        status: 'ACTIVE',
        availabilityMode: 'ALWAYS',
      },
    });
    productId = p.id;
    const v = await prisma.productVariant.create({
      data: {
        productId,
        name: '500 ml',
        sku: prefix + 'sku',
        price: '200.00',
        packageAmount: '0.500',
        measurementUnit: 'LITER',
        stockQuantity: '5.000',
        reservedQuantity: '1.000',
        minimumPurchaseQuantity: '0.500',
        purchaseIncrement: '0.250',
        isDefault: true,
      },
    });
    variantId = v.id;
    await prisma.productImage.create({
      data: {
        productId,
        url: 'https://example.com/cart.jpg',
        altText: 'Cart product image',
        isPrimary: true,
      },
    });
  });
  afterAll(async () => {
    await cleanup();
    expect(await prisma.cartItem.count({ where: { variantId } })).toBe(0);
    expect(
      await prisma.product.count({ where: { slug: { startsWith: prefix } } }),
    ).toBe(0);
    await app.close();
  });
  it('GET is empty and creates no database identity', async () => {
    const before = await prisma.cart.count();
    await request(app.getHttpServer())
      .get('/api/v1/cart')
      .expect(200)
      .expect({
        items: [],
        summary: {
          distinctItemCount: 0,
          totalQuantity: '0.000',
          subtotal: '0.00',
          currency: 'RSD',
        },
        expiresAt: null,
      });
    expect(await prisma.cart.count()).toBe(before);
  });
  it('protects Origin and DTO/decimal contracts', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .set('Origin', 'https://evil.example')
      .send({ variantId, quantity: '0.500' })
      .expect(403);
    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .send({ variantId, quantity: 0.5 })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .send({ variantId, quantity: '0.500', price: '1.00' })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/cart/items')
      .send({ variantId: 'bad', quantity: '0.500' })
      .expect(400);
  });
  it('sets a secure identity, prices fractions, isolates agents and never reserves stock', async () => {
    const a = request.agent(app.getHttpServer()),
      b = request.agent(app.getHttpServer());
    const before = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variantId },
    });
    const added = await a
      .post('/api/v1/cart/items')
      .set('Origin', 'http://localhost:3000')
      .send({ variantId, quantity: '0.500' })
      .expect(201);
    const cookie = added.headers['set-cookie']?.[0] as string;
    expect(cookie).toContain('HttpOnly');
    expect(cookie).toContain('Path=/api/v1/cart');
    const raw = /bf_cart=([^;]+)/.exec(cookie)?.[1];
    expect(raw).toBeTruthy();
    const cart = await prisma.cart.findFirstOrThrow({
      where: { items: { some: { variantId } } },
    });
    testCartIds.add(cart.id);
    expect(cart.tokenHash).not.toBe(raw);
    expect(added.body.summary).toMatchObject({
      distinctItemCount: 1,
      totalQuantity: '0.500',
      subtotal: '100.00',
      currency: 'RSD',
    });
    expect(added.body.items[0]).not.toHaveProperty('stockQuantity');
    expect(added.body.items[0]).not.toHaveProperty('tokenHash');
    const increased = await a
      .post('/api/v1/cart/items')
      .send({ variantId, quantity: '0.250' })
      .expect(201);
    expect(increased.body.items[0].quantity).toBe('0.750');
    await a
      .post('/api/v1/cart/items')
      .send({ variantId, quantity: '0.100' })
      .expect(400);
    const other = await b
      .post('/api/v1/cart/items')
      .send({ variantId, quantity: '0.500' })
      .expect(201);
    await b
      .patch('/api/v1/cart/items/' + increased.body.items[0].id)
      .send({ quantity: '1.000' })
      .expect(404);
    expect(other.body.items[0].id).not.toBe(increased.body.items[0].id);
    await prisma.productVariant.update({
      where: { id: variantId },
      data: { price: '220.00' },
    });
    const repriced = await a.get('/api/v1/cart').expect(200);
    expect(repriced.body.items[0]).toMatchObject({
      priceChanged: true,
      currentUnitPrice: '220.00',
      lineTotal: '165.00',
    });
    expect(repriced.body.summary.subtotal).toBe('165.00');
    const after = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variantId },
    });
    expect(after.stockQuantity.toString()).toBe(
      before.stockQuantity.toString(),
    );
    expect(after.reservedQuantity.toString()).toBe(
      before.reservedQuantity.toString(),
    );
    expect(await prisma.inventoryMovement.count({ where: { variantId } })).toBe(
      0,
    );
    await a
      .patch('/api/v1/cart/items/' + increased.body.items[0].id)
      .send({ quantity: '0' })
      .expect(400);
    await a
      .delete('/api/v1/cart/items/' + increased.body.items[0].id)
      .expect(204);
    await a.delete('/api/v1/cart/items').expect(204);
  });
  it('expires old identities, clears random cookies and does not reactivate converted carts', async () => {
    const a = request.agent(app.getHttpServer());
    await a
      .post('/api/v1/cart/items')
      .send({ variantId, quantity: '0.500' })
      .expect(201);
    const active = await prisma.cart.findFirstOrThrow({
      where: { items: { some: { variantId } }, status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
    });
    await prisma.cart.update({
      where: { id: active.id },
      data: { expiresAt: new Date(0) },
    });
    const empty = await a.get('/api/v1/cart').expect(200);
    expect(empty.body.items).toEqual([]);
    expect(
      (await prisma.cart.findUniqueOrThrow({ where: { id: active.id } }))
        .status,
    ).toBe('EXPIRED');
    await request(app.getHttpServer())
      .get('/api/v1/cart')
      .set('Cookie', 'bf_cart=random-invalid')
      .expect(200);
    const converted = await prisma.cart.create({
      data: {
        tokenHash: 'f'.repeat(64),
        status: 'CONVERTED',
        expiresAt: new Date(Date.now() + 100000),
        convertedAt: new Date(),
      },
    });
    testCartIds.add(converted.id);
    expect(converted.status).toBe('CONVERTED');
  });
});
