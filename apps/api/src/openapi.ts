import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureOpenApi(
  app: INestApplication,
  enabled: boolean,
): void {
  if (!enabled) return;

  const config = new DocumentBuilder()
    .setTitle('Borska Farmica API')
    .setDescription(
      'Public catalog, guest cart, customer accounts, cash-on-pickup checkout, orders and protected admin workflows.',
    )
    .setVersion('1.0')
    .addServer('/api/v1', 'Version 1 API')
    .addTag('Health')
    .addTag('Categories')
    .addTag('Products')
    .addTag('Customer Auth')
    .addTag('Customer Account')
    .addTag('Checkout')
    .addTag('Customer Orders')
    .addTag('Admin Orders')
    .addTag('Admin Dashboard')
    .addTag('Admin Customers')
    .addTag('Admin Audit Logs')
    .addTag('Admin Exports')
    .addTag('Admin Auth')
    .addTag('Admin Categories')
    .addTag('Admin Products')
    .addTag('Admin Product Variants')
    .addTag('Admin Inventory')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'admin-access',
    )
    .addCookieAuth('bf_admin_refresh')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'customer-access',
    )
    .addCookieAuth('bf_customer_refresh')
    .addCookieAuth('bf_cart')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });
}
