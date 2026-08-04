import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Sentry from '@sentry/node';
import { redactSensitive } from './redaction';

export function sanitizeSentryEvent<T>(event: T): T {
  const sanitized = redactSensitive(event) as T & {
    request?: Record<string, unknown>;
  };
  if (sanitized.request) {
    delete sanitized.request.data;
    delete sanitized.request.query_string;
    delete sanitized.request.cookies;
  }
  return sanitized;
}

@Injectable()
export class SentryService implements OnModuleInit, OnApplicationShutdown {
  private enabled = false;
  constructor(private readonly config: ConfigService) {}
  onModuleInit(): void {
    this.enabled = this.config.get<boolean>('SENTRY_ENABLED', false);
    if (!this.enabled) return;
    Sentry.init({
      dsn: this.config.getOrThrow<string>('SENTRY_DSN'),
      environment: this.config.get<string>('SENTRY_ENVIRONMENT'),
      release: this.config.get<string>('SENTRY_RELEASE'),
      tracesSampleRate: this.config.get<number>('SENTRY_TRACES_SAMPLE_RATE', 0),
      sendDefaultPii: false,
      beforeSend: (event) => sanitizeSentryEvent(event),
    });
  }
  capture(error: unknown, requestId?: string): void {
    if (!this.enabled) return;
    Sentry.withScope((scope) => {
      if (requestId) scope.setTag('requestId', requestId);
      Sentry.captureException(error);
    });
  }
  async onApplicationShutdown(): Promise<void> {
    await this.flush(
      this.config.get<number>('SHUTDOWN_GRACE_PERIOD_MS', 10000),
    );
  }
  async flush(timeout: number): Promise<boolean> {
    return this.enabled ? Sentry.flush(timeout) : true;
  }
}
