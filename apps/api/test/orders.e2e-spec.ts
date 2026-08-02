/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call */
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import request from 'supertest';
import type { App } from 'supertest/types';
import { AppModule } from './../dist/src/app.module';
import { PrismaService } from './../dist/src/database/prisma.service';
import { CartIdentityService } from './../dist/src/cart/cart-identity.service';
import { TokenService } from './../dist/src/admin-auth/token.service';
import { configureOpenApi } from './../dist/src/openapi';

jest.setTimeout(30_000);
const customerEmail = 'orders-customer@example.test';
const otherEmail = 'orders-other@example.test';
const adminEmail = 'orders-admin@example.test';
const password = 'customer-password-123';
const origin = 'http://localhost:3000';
const idempotency = (suffix: string) => `orders-e2e-request-${suffix}`;
const cookieLines = (value: string | string[] | undefined) =>
  Array.isArray(value) ? value : value ? [value] : [];

function businessDate(offsetDays = 0) {
  const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Belgrade',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(new Date()),
    get = (type: Intl.DateTimeFormatPartTypes) =>
      Number(parts.find((part) => part.type === type)?.value),
    date = new Date(
      Date.UTC(get('year'), get('month') - 1, get('day') + offsetDays),
    );
  return date;
}
function dateString(date: Date) {
  return date.toISOString().slice(0, 10);
}
function nextSaturday() {
  const today = businessDate(),
    isoDay = today.getUTCDay() || 7,
    offset = (6 - isoDay + 7) % 7;
  return new Date(today.getTime() + offset * 86_400_000);
}

describe('Checkout and order lifecycle (e2e)', () => {
  let app: INestApplication<App>,
    prisma: PrismaService,
    identity: CartIdentityService,
    customerAccess: string,
    otherAccess: string,
    adminId: string,
    adminAccess: string,
    categoryId: string,
    productId: string,
    variantId: string,
    secondProductId: string,
    secondVariantId: string,
    farmId: string,
    marketId: string;

  const cleanup = async () => {
    const customers = await prisma.customerUser.findMany({
        where: { email: { in: [customerEmail, otherEmail] } },
        select: { id: true },
      }),
      customerIds = customers.map((row) => row.id),
      admins = await prisma.adminUser.findMany({
        where: { email: adminEmail },
        select: { id: true },
      }),
      adminIds = admins.map((row) => row.id),
      products = await prisma.product.findMany({
        where: { slug: { startsWith: 'orders-e2e-' } },
        select: { id: true },
      }),
      productIds = products.map((row) => row.id),
      variants = await prisma.productVariant.findMany({
        where: { productId: { in: productIds } },
        select: { id: true },
      }),
      variantIds = variants.map((row) => row.id),
      orders = await prisma.order.findMany({
        where: { customerId: { in: customerIds } },
        select: { id: true, cartId: true },
      }),
      orderIds = orders.map((row) => row.id),
      cartIds = orders.map((row) => row.cartId),
      extraCarts = await prisma.cart.findMany({
        where: { tokenHash: { startsWith: 'orders-e2e-impossible-prefix' } },
        select: { id: true },
      });
    await prisma.adminAuditLog.deleteMany({
      where: {
        OR: [{ adminId: { in: adminIds } }, { resourceId: { in: orderIds } }],
      },
    });
    await prisma.orderEvent.deleteMany({
      where: { orderId: { in: orderIds } },
    });
    await prisma.stockReservation.deleteMany({
      where: { orderId: { in: orderIds } },
    });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    const allCarts = [...cartIds, ...extraCarts.map((row) => row.id)];
    await prisma.cartItem.deleteMany({
      where: {
        OR: [{ cartId: { in: allCarts } }, { variantId: { in: variantIds } }],
      },
    });
    await prisma.cart.deleteMany({ where: { id: { in: allCarts } } });
    await prisma.inventoryMovement.deleteMany({
      where: { variantId: { in: variantIds } },
    });
    await prisma.productImage.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.availabilityWindow.deleteMany({
      where: { productId: { in: productIds } },
    });
    await prisma.productVariant.deleteMany({
      where: { id: { in: variantIds } },
    });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    await prisma.category.deleteMany({
      where: { slug: 'orders-e2e-category' },
    });
    await prisma.customerSession.deleteMany({
      where: { customerId: { in: customerIds } },
    });
    await prisma.customerUser.deleteMany({
      where: { id: { in: customerIds } },
    });
    await prisma.adminSession.deleteMany({
      where: { adminId: { in: adminIds } },
    });
    await prisma.adminUser.deleteMany({ where: { id: { in: adminIds } } });
  };

  const register = async (email: string, firstName: string) => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({
        firstName,
        lastName: 'Kupac',
        email,
        phone: email === customerEmail ? '0641234567' : '0651234567',
        password,
      })
      .expect(201);
    return {
      id: response.body.customer.id as string,
      access: response.body.accessToken as string,
    };
  };

  const createCart = async (
    items: Array<{ variantId: string; quantity: string; price?: string }>,
  ) => {
    const created = await identity.create();
    await prisma.cartItem.createMany({
      data: items.map((item) => ({
        cartId: created.cart.id,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPriceAtAddition: item.price ?? '250.00',
      })),
    });
    return {
      id: created.cart.id,
      raw: created.raw,
      cookie: `bf_cart=${created.raw}`,
    };
  };

  const createOrder = (
    access: string,
    cookie: string,
    pickupLocationId: string,
    requestedPickupDate: string,
    key: string,
    note?: string,
  ) =>
    request(app.getHttpServer())
      .post('/api/v1/checkout/orders')
      .set('Authorization', `Bearer ${access}`)
      .set('Cookie', cookie)
      .set('Origin', origin)
      .set('Idempotency-Key', key)
      .send({
        pickupLocationId,
        requestedPickupDate,
        ...(note && { customerNote: note }),
      });

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.use(helmet());
    app.setGlobalPrefix('api/v1');
    app.enableCors({ origin, credentials: true });
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
    identity = app.get(CartIdentityService);
    await cleanup();
    const customer = await register(customerEmail, 'Miloš'),
      other = await register(otherEmail, 'Milica');
    customerAccess = customer.access;
    otherAccess = other.access;
    const admin = await prisma.adminUser.create({
      data: {
        email: adminEmail,
        passwordHash: 'unused-e2e-hash',
        firstName: 'Order',
        lastName: 'Admin',
        role: 'ADMIN',
      },
    });
    adminId = admin.id;
    adminAccess = await app.get(TokenService).signAccess(admin.id, 'ADMIN');
    const category = await prisma.category.create({
      data: { name: 'Orders E2E', slug: 'orders-e2e-category', isActive: true },
    });
    categoryId = category.id;
    const product = await prisma.product.create({
      data: {
        categoryId,
        name: 'Orders E2E Milk',
        slug: 'orders-e2e-milk',
        status: 'ACTIVE',
        availabilityMode: 'ALWAYS',
      },
    });
    productId = product.id;
    const variant = await prisma.productVariant.create({
      data: {
        productId,
        name: '1 l',
        sku: 'ORDERS-E2E-MILK',
        price: '250.00',
        packageAmount: '1.000',
        measurementUnit: 'LITER',
        stockQuantity: '8.000',
        minimumPurchaseQuantity: '1.000',
        purchaseIncrement: '1.000',
        isDefault: true,
      },
    });
    variantId = variant.id;
    const secondProduct = await prisma.product.create({
      data: {
        categoryId,
        name: 'Orders E2E Cheese',
        slug: 'orders-e2e-cheese',
        status: 'ACTIVE',
        availabilityMode: 'ALWAYS',
      },
    });
    secondProductId = secondProduct.id;
    const secondVariant = await prisma.productVariant.create({
      data: {
        productId: secondProductId,
        name: '500 g',
        sku: 'ORDERS-E2E-CHEESE',
        price: '500.00',
        packageAmount: '0.500',
        measurementUnit: 'KILOGRAM',
        stockQuantity: '1.000',
        minimumPurchaseQuantity: '1.000',
        purchaseIncrement: '1.000',
        isDefault: true,
      },
    });
    secondVariantId = secondVariant.id;
    const pickups = await prisma.pickupLocation.findMany();
    farmId = pickups.find((row) => row.code === 'FARM_HOME')!.id;
    marketId = pickups.find((row) => row.code === 'BOR_CITY_MARKET')!.id;
  });

  afterAll(async () => {
    await cleanup();
    expect(
      await prisma.customerUser.count({
        where: { email: { in: [customerEmail, otherEmail] } },
      }),
    ).toBe(0);
    expect(await prisma.adminUser.count({ where: { email: adminEmail } })).toBe(
      0,
    );
    expect(
      await prisma.category.count({ where: { slug: 'orders-e2e-category' } }),
    ).toBe(0);
    expect(await prisma.pickupLocation.count()).toBe(2);
    await app.close();
  });

  it('lists pickup options and validates Belgrade dates and preview without mutation', async () => {
    const locations = await request(app.getHttpServer())
      .get('/api/v1/checkout/pickup-locations')
      .expect(200);
    expect(locations.body).toHaveLength(2);
    expect(locations.body.map((row: { code: string }) => row.code)).toEqual([
      'FARM_HOME',
      'BOR_CITY_MARKET',
    ]);
    const cart = await createCart([
      { variantId, quantity: '2.000', price: '200.00' },
    ]);
    const saturday = nextSaturday(),
      sunday = new Date(saturday.getTime() + 86_400_000);
    await request(app.getHttpServer())
      .post('/api/v1/checkout/preview')
      .set('Cookie', cart.cookie)
      .send({
        pickupLocationId: farmId,
        requestedPickupDate: dateString(businessDate()),
      })
      .expect(401);
    await request(app.getHttpServer())
      .post('/api/v1/checkout/preview')
      .set('Authorization', `Bearer ${customerAccess}`)
      .send({
        pickupLocationId: farmId,
        requestedPickupDate: dateString(businessDate()),
      })
      .expect(400);
    await request(app.getHttpServer())
      .post('/api/v1/checkout/preview')
      .set('Authorization', `Bearer ${customerAccess}`)
      .set('Cookie', cart.cookie)
      .send({
        pickupLocationId: marketId,
        requestedPickupDate: dateString(sunday),
      })
      .expect(409);
    const beforeReserved = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variantId },
    });
    const preview = await request(app.getHttpServer())
      .post('/api/v1/checkout/preview')
      .set('Authorization', `Bearer ${customerAccess}`)
      .set('Cookie', cart.cookie)
      .send({
        pickupLocationId: marketId,
        requestedPickupDate: dateString(saturday),
      })
      .expect(200);
    expect(preview.body).toMatchObject({
      valid: true,
      summary: {
        subtotal: '500.00',
        fee: '0.00',
        total: '500.00',
        currency: 'RSD',
      },
      pickup: { code: 'BOR_CITY_MARKET', exactTimeRequiresConfirmation: true },
    });
    expect(await prisma.order.count({ where: { cartId: cart.id } })).toBe(0);
    const afterReserved = await prisma.productVariant.findUniqueOrThrow({
      where: { id: variantId },
    });
    expect(afterReserved.reservedQuantity.toFixed(3)).toBe(
      beforeReserved.reservedQuantity.toFixed(3),
    );
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.delete({ where: { id: cart.id } });
  });

  it('creates once, snapshots current price, converts cart and replays idempotently', async () => {
    const cart = await createCart([
        { variantId, quantity: '2.000', price: '200.00' },
      ]),
      date = dateString(businessDate()),
      key = idempotency('create-one'),
      first = await createOrder(
        customerAccess,
        cart.cookie,
        farmId,
        date,
        key,
        'Pozvati pre dolaska',
      ).expect(201);
    expect(first.body).toMatchObject({
      status: 'PENDING_CONFIRMATION',
      paymentMethod: 'CASH_ON_PICKUP',
      paymentStatus: 'UNPAID',
      customer: { email: customerEmail },
      summary: {
        subtotal: '500.00',
        fee: '0.00',
        total: '500.00',
        currency: 'RSD',
      },
      idempotentReplay: false,
    });
    expect(first.body.items[0]).toMatchObject({
      unitPrice: '250.00',
      quantity: '2.000',
    });
    const snapshot = await prisma.orderItem.findFirstOrThrow({
      where: { order: { orderNumber: first.body.orderNumber } },
    });
    expect(snapshot).toMatchObject({
      categoryId,
      categoryName: 'Orders E2E',
      categorySlug: 'orders-e2e-category',
    });
    const cleared = cookieLines(first.headers['set-cookie']).join(';');
    expect(cleared).toContain('bf_cart=;');
    expect(cleared).not.toContain('Idempotency-Key');
    const dbCart = await prisma.cart.findUniqueOrThrow({
        where: { id: cart.id },
      }),
      stock = await prisma.productVariant.findUniqueOrThrow({
        where: { id: variantId },
      });
    expect(dbCart.status).toBe('CONVERTED');
    expect(stock.stockQuantity.toFixed(3)).toBe('8.000');
    expect(stock.reservedQuantity.toFixed(3)).toBe('2.000');
    expect(
      await prisma.inventoryMovement.count({
        where: { variantId, type: 'SALE' },
      }),
    ).toBe(0);
    const replay = await createOrder(
      customerAccess,
      cart.cookie,
      farmId,
      date,
      key,
      'Pozvati pre dolaska',
    ).expect(201);
    expect(replay.body.orderNumber).toBe(first.body.orderNumber);
    expect(replay.body.idempotentReplay).toBe(true);
    await createOrder(
      customerAccess,
      cart.cookie,
      farmId,
      date,
      key,
      'Druga napomena',
    ).expect(409);
  });

  it('isolates customer history and idempotently releases pending reservations', async () => {
    const listing = await request(app.getHttpServer())
      .get('/api/v1/account/orders')
      .set('Authorization', `Bearer ${customerAccess}`)
      .expect(200);
    const orderNumber = listing.body.data[0].orderNumber as string;
    expect(listing.body.data[0]).toMatchObject({
      total: '500.00',
      itemCount: 1,
    });
    await request(app.getHttpServer())
      .get(`/api/v1/account/orders/${orderNumber}`)
      .set('Authorization', `Bearer ${otherAccess}`)
      .expect(404);
    await request(app.getHttpServer())
      .post(`/api/v1/account/orders/${orderNumber}/cancel`)
      .set('Authorization', `Bearer ${customerAccess}`)
      .send({ reason: 'Promena plana' })
      .expect(200);
    await request(app.getHttpServer())
      .post(`/api/v1/account/orders/${orderNumber}/cancel`)
      .set('Authorization', `Bearer ${customerAccess}`)
      .send({ reason: 'Ignored replay' })
      .expect(200);
    const order = await prisma.order.findUniqueOrThrow({
        where: { orderNumber },
      }),
      stock = await prisma.productVariant.findUniqueOrThrow({
        where: { id: variantId },
      }),
      reservations = await prisma.stockReservation.findMany({
        where: { orderId: order.id },
      });
    expect(order.status).toBe('CANCELLED');
    expect(stock.stockQuantity.toFixed(3)).toBe('8.000');
    expect(stock.reservedQuantity.toFixed(3)).toBe('0.000');
    expect(reservations.every((row) => row.status === 'RELEASED')).toBe(true);
    expect(await prisma.inventoryMovement.count({ where: { variantId } })).toBe(
      0,
    );
  });

  it('runs admin workflow and consumes stock exactly once after cash receipt', async () => {
    const cart = await createCart([{ variantId, quantity: '1.000' }]),
      requestedDate = dateString(businessDate()),
      created = await createOrder(
        customerAccess,
        cart.cookie,
        farmId,
        requestedDate,
        idempotency('complete'),
      ).expect(201),
      order = await prisma.order.findUniqueOrThrow({
        where: { orderNumber: created.body.orderNumber },
      });
    await request(app.getHttpServer())
      .get('/api/v1/admin/orders?search=' + encodeURIComponent(customerEmail))
      .set('Authorization', `Bearer ${adminAccess}`)
      .expect(200)
      .expect((response) =>
        expect(
          response.body.data.some((row: { id: string }) => row.id === order.id),
        ).toBe(true),
      );
    await request(app.getHttpServer())
      .get(`/api/v1/admin/orders/${order.id}`)
      .set('Authorization', `Bearer ${customerAccess}`)
      .expect(401);
    await request(app.getHttpServer())
      .get(`/api/v1/account/orders/${created.body.orderNumber}`)
      .set('Authorization', `Bearer ${adminAccess}`)
      .expect(401);
    const transition = (targetStatus: string, body: object = {}) =>
      request(app.getHttpServer())
        .post(`/api/v1/admin/orders/${order.id}/transitions`)
        .set('Authorization', `Bearer ${adminAccess}`)
        .send({ targetStatus, ...body });
    await transition('CONFIRMED', {
      confirmedPickupAt: `${requestedDate}T10:00:00+02:00`,
      note: 'Potvrđeno telefonom',
    }).expect(200);
    await request(app.getHttpServer())
      .post(`/api/v1/account/orders/${created.body.orderNumber}/cancel`)
      .set('Authorization', `Bearer ${customerAccess}`)
      .send({})
      .expect(409);
    await transition('PREPARING').expect(200);
    await transition('READY_FOR_PICKUP').expect(200);
    await transition('COMPLETED', { cashReceived: false }).expect(400);
    await transition('COMPLETED', { cashReceived: true }).expect(200);
    await transition('COMPLETED', { cashReceived: true }).expect(409);
    const finalOrder = await prisma.order.findUniqueOrThrow({
        where: { id: order.id },
      }),
      stock = await prisma.productVariant.findUniqueOrThrow({
        where: { id: variantId },
      }),
      sale = await prisma.inventoryMovement.findMany({
        where: { variantId, type: 'SALE', reference: created.body.orderNumber },
      }),
      reservation = await prisma.stockReservation.findFirstOrThrow({
        where: { orderId: order.id },
      });
    expect(finalOrder).toMatchObject({
      status: 'COMPLETED',
      paymentStatus: 'PAID',
    });
    expect(stock.stockQuantity.toFixed(3)).toBe('7.000');
    expect(stock.reservedQuantity.toFixed(3)).toBe('0.000');
    expect(sale).toHaveLength(1);
    expect(sale[0].quantityDelta.toFixed(3)).toBe('-1.000');
    expect(reservation.status).toBe('CONSUMED');
    expect(
      await prisma.adminAuditLog.count({
        where: { adminId, resourceId: order.id },
      }),
    ).toBeGreaterThanOrEqual(5);
  });

  it('admin cancellation releases reservation without a physical movement', async () => {
    const cart = await createCart([{ variantId, quantity: '1.000' }]),
      requestedDate = dateString(businessDate()),
      created = await createOrder(
        customerAccess,
        cart.cookie,
        farmId,
        requestedDate,
        idempotency('admin-cancel'),
      ).expect(201),
      order = await prisma.order.findUniqueOrThrow({
        where: { orderNumber: created.body.orderNumber },
      });
    await request(app.getHttpServer())
      .post(`/api/v1/admin/orders/${order.id}/transitions`)
      .set('Authorization', `Bearer ${adminAccess}`)
      .send({
        targetStatus: 'CANCELLED',
        cancellationReason: 'Proizvod nije dostupan',
      })
      .expect(200);
    const stock = await prisma.productVariant.findUniqueOrThrow({
        where: { id: variantId },
      }),
      reservation = await prisma.stockReservation.findFirstOrThrow({
        where: { orderId: order.id },
      });
    expect(stock.stockQuantity.toFixed(3)).toBe('7.000');
    expect(stock.reservedQuantity.toFixed(3)).toBe('0.000');
    expect(reservation.status).toBe('RELEASED');
    expect(
      await prisma.inventoryMovement.count({
        where: { reference: created.body.orderNumber },
      }),
    ).toBe(0);
  });

  it('allows only one concurrent checkout to reserve the final physical unit', async () => {
    const firstCart = await createCart([
        { variantId: secondVariantId, quantity: '1.000', price: '500.00' },
      ]),
      secondCart = await createCart([
        { variantId: secondVariantId, quantity: '1.000', price: '500.00' },
      ]),
      date = dateString(businessDate()),
      responses = await Promise.all([
        createOrder(
          customerAccess,
          firstCart.cookie,
          farmId,
          date,
          idempotency('race-a'),
        ),
        createOrder(
          otherAccess,
          secondCart.cookie,
          farmId,
          date,
          idempotency('race-b'),
        ),
      ]),
      statuses = responses.map((response) => response.status).sort();
    expect(statuses).toEqual([201, 409]);
    const variant = await prisma.productVariant.findUniqueOrThrow({
      where: { id: secondVariantId },
    });
    expect(variant.stockQuantity.toFixed(3)).toBe('1.000');
    expect(variant.reservedQuantity.toFixed(3)).toBe('1.000');
    expect(
      await prisma.order.count({
        where: { cartId: { in: [firstCart.id, secondCart.id] } },
      }),
    ).toBe(1);
  });

  it('rolls back every reservation when any cart item is insufficient and rejects extra fields', async () => {
    const cart = await createCart([
        { variantId, quantity: '1.000' },
        { variantId: secondVariantId, quantity: '1.000', price: '500.00' },
      ]),
      before = await prisma.productVariant.findUniqueOrThrow({
        where: { id: variantId },
      });
    await createOrder(
      customerAccess,
      cart.cookie,
      farmId,
      dateString(businessDate()),
      idempotency('rollback'),
    )
      .send({ extra: true })
      .expect(400);
    await createOrder(
      customerAccess,
      cart.cookie,
      farmId,
      dateString(businessDate()),
      idempotency('rollback-valid'),
    ).expect(409);
    const after = await prisma.productVariant.findUniqueOrThrow({
        where: { id: variantId },
      }),
      dbCart = await prisma.cart.findUniqueOrThrow({ where: { id: cart.id } });
    expect(after.reservedQuantity.toFixed(3)).toBe(
      before.reservedQuantity.toFixed(3),
    );
    expect(dbCart.status).toBe('ACTIVE');
    expect(await prisma.order.count({ where: { cartId: cart.id } })).toBe(0);
  });
});
