import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { configureOpenApi } from './openapi';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');
  const frontendUrl = configService.getOrThrow<string>('FRONTEND_URL');
  const express = app.getHttpAdapter().getInstance() as {
    disable(name: string): void;
    set(name: string, value: boolean): void;
  };

  express.disable('x-powered-by');
  express.set('trust proxy', configService.getOrThrow<boolean>('TRUST_PROXY'));
  app.use(cookieParser());
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", 'data:'],
        },
      },
    }),
  );
  const bodyLimit = configService.getOrThrow<string>('JSON_BODY_LIMIT');
  app.use(json({ limit: bodyLimit }));
  app.use(urlencoded({ extended: true, limit: bodyLimit }));
  app.setGlobalPrefix('api/v1');
  app.enableCors({ origin: frontendUrl, credentials: true });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );
  configureOpenApi(app, configService.getOrThrow<boolean>('SWAGGER_ENABLED'));
  app.enableShutdownHooks();
  await app.listen(port);
  new Logger('Bootstrap').log(`API running on http://localhost:${port}/api/v1`);
}
void bootstrap();
