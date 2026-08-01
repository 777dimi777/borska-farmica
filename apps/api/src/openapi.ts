import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function configureOpenApi(
  app: INestApplication,
  enabled: boolean,
): void {
  if (!enabled) return;

  const config = new DocumentBuilder()
    .setTitle('Borska Farmica API')
    .setDescription('Public API for Borska Farmica health and catalog data.')
    .setVersion('1.0')
    .addServer('/api/v1', 'Version 1 API')
    .addTag('Health')
    .addTag('Categories')
    .addTag('Products')
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    ignoreGlobalPrefix: true,
  });

  SwaggerModule.setup('api/docs', app, document, {
    jsonDocumentUrl: 'api/docs-json',
  });
}
