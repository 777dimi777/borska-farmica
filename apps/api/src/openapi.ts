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
      'Public catalog plus protected Borska Farmica admin APIs for authentication, categories, products, variants and inventory.',
    )
    .setVersion('1.0')
    .addServer('/api/v1', 'Version 1 API')
    .addTag('Health')
    .addTag('Categories')
    .addTag('Products')
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
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });
}
