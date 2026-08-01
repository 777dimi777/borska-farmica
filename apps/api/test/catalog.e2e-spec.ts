import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../dist/src/app.module';
import { PrismaService } from './../dist/src/database/prisma.service';
import { configureOpenApi } from './../dist/src/openapi';

const CATEGORY_SLUG = 'e2e-catalog-category';
const ACTIVE_SLUG = 'e2e-catalog-active-product';
const HIDDEN_SLUG = 'e2e-catalog-hidden-product';
const ACTIVE_SKU = 'E2E-CATALOG-ACTIVE';
const INACTIVE_SKU = 'E2E-CATALOG-INACTIVE';

interface JsonObject {
  [key: string]: unknown;
}

describe('Public catalog (e2e)', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  const cleanup = async () => {
    const products = await prisma.product.findMany({
      where: { slug: { in: [ACTIVE_SLUG, HIDDEN_SLUG] } },
      select: { id: true },
    });
    const ids = products.map(({ id }) => id);
    if (ids.length) {
      const variants = await prisma.productVariant.findMany({
        where: { productId: { in: ids } },
        select: { id: true },
      });
      await prisma.inventoryMovement.deleteMany({
        where: { variantId: { in: variants.map(({ id }) => id) } },
      });
      await prisma.availabilityWindow.deleteMany({
        where: { productId: { in: ids } },
      });
      await prisma.productImage.deleteMany({
        where: { productId: { in: ids } },
      });
      await prisma.productVariant.deleteMany({
        where: { productId: { in: ids } },
      });
      await prisma.product.deleteMany({ where: { id: { in: ids } } });
    }
    await prisma.category.deleteMany({ where: { slug: CATEGORY_SLUG } });
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = moduleFixture.createNestApplication();
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
    const category = await prisma.category.create({
      data: {
        name: 'E2E Catalog Category',
        slug: CATEGORY_SLUG,
        sortOrder: 999,
      },
    });
    const active = await prisma.product.create({
      data: {
        categoryId: category.id,
        name: 'E2E Searchable Product',
        slug: ACTIVE_SLUG,
        shortDescription: 'E2E catalog fixture',
        description: 'Not business content.',
        status: 'ACTIVE',
        isFeatured: true,
        availabilityMode: 'ALWAYS',
      },
    });
    const hidden = await prisma.product.create({
      data: {
        categoryId: category.id,
        name: 'E2E Hidden Product',
        slug: HIDDEN_SLUG,
        status: 'DRAFT',
      },
    });
    await prisma.productVariant.createMany({
      data: [
        {
          productId: active.id,
          name: 'Second',
          sku: `${ACTIVE_SKU}-2`,
          price: '20.00',
          packageAmount: '2.000',
          measurementUnit: 'PIECE',
          stockQuantity: '0',
          reservedQuantity: '0',
          isActive: false,
          sortOrder: 2,
        },
        {
          productId: active.id,
          name: 'First',
          sku: ACTIVE_SKU,
          price: '10.00',
          packageAmount: '1.000',
          measurementUnit: 'PIECE',
          stockQuantity: '3',
          reservedQuantity: '1',
          isActive: true,
          isDefault: true,
          sortOrder: 1,
        },
        {
          productId: hidden.id,
          name: 'Hidden',
          sku: INACTIVE_SKU,
          price: '99.00',
          packageAmount: '1.000',
          measurementUnit: 'PIECE',
          isActive: true,
        },
      ],
    });
    await prisma.productImage.createMany({
      data: [
        {
          productId: active.id,
          url: 'https://example.test/second.jpg',
          altText: 'Second test image',
          sortOrder: 2,
        },
        {
          productId: active.id,
          url: 'https://example.test/primary.jpg',
          altText: 'Primary test image',
          isPrimary: true,
          sortOrder: 1,
        },
      ],
    });
  });

  afterAll(async () => {
    await cleanup();
    await app.close();
  });

  it('exposes all six seeded categories and category details', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/categories')
      .expect(200);
    const categories = response.body as JsonObject[];
    const slugs = categories.map((item) => item.slug);
    for (const slug of [
      'mlecni-proizvodi',
      'voce',
      'povrce',
      'rakija',
      'jaja',
      'stajsko-djubrivo',
    ])
      expect(slugs).toContain(slug);
    const detail = await request(app.getHttpServer())
      .get(`/api/v1/categories/${CATEGORY_SLUG}`)
      .expect(200);
    expect(detail.body).toMatchObject({ slug: CATEGORY_SLUG, productCount: 1 });
    await request(app.getHttpServer())
      .get('/api/v1/categories/e2e-does-not-exist')
      .expect(404);
  });

  it('returns a paginated, filtered, searched and sorted public listing', async () => {
    const response = await request(app.getHttpServer())
      .get(
        `/api/v1/products?category=${CATEGORY_SLUG}&search=searchable&featured=true&sort=name_desc&page=1&limit=1`,
      )
      .expect(200);
    expect(response.body).toMatchObject({
      data: [
        {
          slug: ACTIVE_SLUG,
          startingPrice: '10.00',
          primaryImage: { altText: 'Primary test image' },
        },
      ],
      pagination: {
        page: 1,
        limit: 1,
        total: 1,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    });
    const json = JSON.stringify(response.body);
    expect(json).not.toContain('stockQuantity');
    expect(json).not.toContain('reservedQuantity');
    expect(json).not.toContain(HIDDEN_SLUG);
  });

  it.each([
    '/api/v1/products?page=0',
    '/api/v1/products?limit=49',
    '/api/v1/products?featured=yes',
  ])('rejects invalid query %s', async (path) => {
    await request(app.getHttpServer()).get(path).expect(400);
  });

  it('returns ordered public details with precise strings and availability', async () => {
    const response = await request(app.getHttpServer())
      .get(`/api/v1/products/${ACTIVE_SLUG}`)
      .expect(200);
    expect(response.body).toMatchObject({
      slug: ACTIVE_SLUG,
      availability: {
        currentlyAvailable: true,
        inStock: true,
        purchasable: true,
      },
    });
    const body = response.body as {
      variants: JsonObject[];
      images: Array<{ altText: string }>;
    };
    expect(body.variants[0]).toMatchObject({
      sku: ACTIVE_SKU,
      price: '10.00',
      packageAmount: '1.000',
    });
    expect(body.images.map((image) => image.altText)).toEqual([
      'Primary test image',
      'Second test image',
    ]);
    expect((response.body as JsonObject).variants).toHaveLength(1);
    expect(JSON.stringify(response.body)).not.toContain('stockQuantity');
    await request(app.getHttpServer())
      .get(`/api/v1/products/${HIDDEN_SLUG}`)
      .expect(404);
  });

  it('publishes catalog routes in generated OpenAPI JSON', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/docs-json')
      .expect(200);
    const paths = (response.body as { paths: Record<string, unknown> }).paths;
    expect(paths).toHaveProperty('/categories');
    expect(paths).toHaveProperty('/categories/{slug}');
    expect(paths).toHaveProperty('/products');
    expect(paths).toHaveProperty('/products/{slug}');
  });
});
