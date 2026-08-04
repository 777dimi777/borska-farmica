import {
  Global,
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import type { Request, Response } from 'express';
import { resolveRequestId } from './request-id';
import { RequestContextService } from './request-context.service';
import { RequestContextMiddleware } from './request-context.middleware';
import { SafeHttpExceptionFilter } from './http-exception.filter';
import { SentryService } from './sentry.service';
import { MetricsService } from './metrics.service';
import { MetricsInterceptor } from './metrics.interceptor';
import { MetricsGuard } from './metrics.guard';
import { MetricsController } from './metrics.controller';

@Global()
@Module({
  imports: [
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get<string>('LOG_LEVEL', 'info'),
          ...(config.get<boolean>('LOG_PRETTY', false) &&
            config.get<string>('NODE_ENV') !== 'production' && {
              transport: {
                target: 'pino-pretty',
                options: { singleLine: true },
              },
            }),
          genReqId: (req: Request & { id?: string }, res: Response) => {
            const id = resolveRequestId(req.headers['x-request-id']);
            res.setHeader('X-Request-ID', id);
            return id;
          },
          serializers: {
            req: (req: { id?: string; method?: string; url?: string }) => ({
              id: req.id,
              method: req.method,
              path: req.url?.split('?')[0],
            }),
            res: (res: { statusCode?: number }) => ({
              statusCode: res.statusCode,
            }),
          },
          redact: {
            paths: [
              'req.headers',
              'res.headers',
              'password',
              'passwordHash',
              'token',
              'accessToken',
              'refreshToken',
              'secret',
              'apiKey',
              'apiSecret',
              'databaseUrl',
              'connectionString',
            ],
            censor: '[REDACTED]',
          },
        },
      }),
    }),
  ],
  controllers: [MetricsController],
  providers: [
    RequestContextService,
    RequestContextMiddleware,
    SentryService,
    MetricsService,
    MetricsGuard,
    { provide: APP_FILTER, useClass: SafeHttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: MetricsInterceptor },
  ],
  exports: [RequestContextService, SentryService, MetricsService, LoggerModule],
})
export class ObservabilityModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
      .apply(RequestContextMiddleware)
      .forRoutes({ path: '*splat', method: RequestMethod.ALL });
  }
}
