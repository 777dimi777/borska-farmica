/* eslint-disable @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../dist/src/app.module';
import { TokenService } from './../dist/src/admin-auth/token.service';
import { PrismaService } from './../dist/src/database/prisma.service';

jest.setTimeout(30_000);
const adminEmail = 'dashboard-admin@example.test';
const customerEmail = 'dashboard-customer@example.test';
const slug = 'dashboard-e2e-product';
const categorySlug = 'dashboard-e2e-category';

function today() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Belgrade',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value;
  return read('year') + '-' + read('month') + '-' + read('day');
}

describe('Admin dashboard analytics (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let accessToken: string;

  const cleanup = async () => {
    const customer = await prisma.customerUser.findUnique({
      where: { email: customerEmail },
    });
    if (customer) {
      const orders = await prisma.order.findMany({
        where: { customerId: customer.id },
        select: { id: true, cartId: true },
      });
      const orderIds = orders.map((row) => row.id);
      await prisma.stockReservation.deleteMany({
        where: { orderId: { in: orderIds } },
      });
      await prisma.orderEvent.deleteMany({
        where: { orderId: { in: orderIds } },
      });
      await prisma.orderItem.deleteMany({
        where: { orderId: { in: orderIds } },
      });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
      await prisma.cart.deleteMany({
        where: { id: { in: orders.map((row) => row.cartId) } },
      });
      await prisma.customerSession.deleteMany({
        where: { customerId: customer.id },
      });
      await prisma.customerUser.delete({ where: { id: customer.id } });
    }
    await prisma.cart.deleteMany({ where: { tokenHash: 'd'.repeat(64) } });
    const product = await prisma.product.findUnique({ where: { slug } });
    if (product) {
      await prisma.inventoryMovement.deleteMany({
        where: { variant: { productId: product.id } },
      });
      await prisma.productImage.deleteMany({
        where: { productId: product.id },
      });
      await prisma.availabilityWindow.deleteMany({
        where: { productId: product.id },
      });
      await prisma.productVariant.deleteMany({
        where: { productId: product.id },
      });
      await prisma.product.delete({ where: { id: product.id } });
    }
    await prisma.category.deleteMany({ where: { slug: categorySlug } });
    const admin = await prisma.adminUser.findUnique({
      where: { email: adminEmail },
    });
    if (admin) {
      await prisma.adminSession.deleteMany({ where: { adminId: admin.id } });
      await prisma.adminUser.delete({ where: { id: admin.id } });
    }
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
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

    const admin = await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash: 'unused',
        firstName: 'Dashboard',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    });
    accessToken = await app.get(TokenService).signAccess(admin.id, 'ADMIN');
    const customer = await prisma.customerUser.create({
      data: {
        email: customerEmail,
        passwordHash: 'unused',
        firstName: 'Ana',
        lastName: 'Kupac',
        phone: '+381641234567',
      },
    });
    const category = await prisma.category.create({
      data: { name: 'Dashboard E2E', slug: categorySlug },
    });
    const product = await prisma.product.create({
      data: {
        categoryId: category.id,
        name: 'Dashboard sir',
        slug,
        status: 'ACTIVE',
        availabilityMode: 'ALWAYS',
      },
    });
    const variant = await prisma.productVariant.create({
      data: {
        productId: product.id,
        name: 'Komad',
        sku: 'DASHBOARD-E2E-SKU',
        price: '300.00',
        packageAmount: '1.000',
        measurementUnit: 'PIECE',
        stockQuantity: '10.000',
      },
    });
    const cart = await prisma.cart.create({
      data: {
        tokenHash: 'd'.repeat(64),
        status: 'CONVERTED',
        expiresAt: new Date(Date.now() + 86_400_000),
        convertedAt: new Date(),
      },
    });
    const pickup = await prisma.pickupLocation.findUniqueOrThrow({
      where: { code: 'FARM_HOME' },
    });
    await prisma.order.create({
      data: {
        orderNumber: 'BF-DASHBOARD-E2E',
        customerId: customer.id,
        cartId: cart.id,
        pickupLocationId: pickup.id,
        status: 'COMPLETED',
        paymentStatus: 'PAID',
        subtotal: '600.00',
        total: '600.00',
        requestedPickupDate: new Date(today() + 'T00:00:00.000Z'),
        customerFirstName: 'Ana',
        customerLastName: 'Kupac',
        customerEmail,
        customerPhone: '+381641234567',
        checkoutIdempotencyKeyHash: 'a'.repeat(64),
        checkoutRequestFingerprint: 'b'.repeat(64),
        completedAt: new Date(),
        confirmedAt: new Date(),
        readyAt: new Date(),
        items: {
          create: {
            productId: product.id,
            variantId: variant.id,
            productName: 'Istorijski sir',
            productSlug: 'istorijski-sir',
            categoryId: category.id,
            categoryName: 'Istorijska kategorija',
            categorySlug: 'istorijska-kategorija',
            variantName: 'Komad',
            sku: 'DASHBOARD-E2E-SKU',
            packageAmount: '1.000',
            measurementUnit: 'PIECE',
            quantity: '2.000',
            unitPrice: '300.00',
            lineTotal: '600.00',
          },
        },
      },
    });
  });

  afterAll(async () => {
    await cleanup();
    expect(await prisma.pickupLocation.count()).toBe(2);
    expect(await prisma.category.count()).toBe(6);
    await app.close();
  });

  it('protects dashboard and returns exact paid/completed metrics with zero-safe comparison', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/admin/dashboard/overview')
      .expect(401);
    const response = await request(app.getHttpServer())
      .get(
        '/api/v1/admin/dashboard/overview?from=' + today() + '&to=' + today(),
      )
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200);
    expect(response.body.metrics).toMatchObject({
      revenue: {
        current: '600.00',
        previous: '0.00',
        percentageChange: null,
        trend: 'up',
      },
      completedOrders: { current: '1', previous: '0' },
      itemsSold: { current: '2.000' },
      uniqueCustomers: { current: '1' },
    });
  });

  it('returns gap-free series, every status and historical category snapshots', async () => {
    const auth = { Authorization: 'Bearer ' + accessToken };
    const series = await request(app.getHttpServer())
      .get(
        '/api/v1/admin/dashboard/revenue-series?from=' +
          today() +
          '&to=' +
          today() +
          '&granularity=day',
      )
      .set(auth)
      .expect(200);
    expect(series.body.data).toEqual([
      { bucket: today(), revenue: '600.00', orders: 1 },
    ]);
    const statuses = await request(app.getHttpServer())
      .get(
        '/api/v1/admin/dashboard/orders-by-status?from=' +
          today() +
          '&to=' +
          today(),
      )
      .set(auth)
      .expect(200);
    expect(statuses.body.data).toHaveLength(6);
    expect(
      statuses.body.data.find(
        (row: { status: string }) => row.status === 'COMPLETED',
      ).count,
    ).toBe(1);
    const categories = await request(app.getHttpServer())
      .get(
        '/api/v1/admin/dashboard/category-sales?from=' +
          today() +
          '&to=' +
          today(),
      )
      .set(auth)
      .expect(200);
    expect(categories.body.data[0]).toMatchObject({
      categoryName: 'Istorijska kategorija',
      categorySlug: 'istorijska-kategorija',
      revenue: '600.00',
      quantity: '2.000',
      orders: 1,
    });
  });

  it('does not expose customer contact details in recent orders', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/admin/dashboard/recent-orders?limit=1')
      .set('Authorization', 'Bearer ' + accessToken)
      .expect(200);
    expect(response.body.data[0].customerName).toBe('Ana Kupac');
    expect(response.body.data[0].customerEmail).toBeUndefined();
    expect(response.body.data[0].customerPhone).toBeUndefined();
  });
});
