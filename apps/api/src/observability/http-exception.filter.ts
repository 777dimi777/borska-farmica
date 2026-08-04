import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { RequestContextService } from './request-context.service';
import { SentryService } from './sentry.service';

interface ErrorBody {
  statusCode: number;
  error: string;
  message: string | string[];
  code?: string;
  requestId: string;
  timestamp: string;
  path: string;
}
@Catch()
export class SafeHttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(SafeHttpExceptionFilter.name);
  constructor(
    private readonly context: RequestContextService,
    private readonly sentry: SentryService,
  ) {}
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp(),
      response = http.getResponse<Response>(),
      request = http.getRequest<Request & { id?: string }>();
    const known = exception instanceof HttpException,
      status = known ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const raw = known ? exception.getResponse() : null;
    const object =
      raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
    const rawMessage = typeof raw === 'string' ? raw : object.message;
    const message =
      status >= 500
        ? 'Internal server error.'
        : Array.isArray(rawMessage)
          ? rawMessage.map(String)
          : typeof rawMessage === 'string'
            ? rawMessage
            : known
              ? exception.message
              : 'Request failed.';
    const candidate =
      typeof object.code === 'string'
        ? object.code
        : typeof message === 'string' && /^[A-Z][A-Z0-9_]+$/.test(message)
          ? message
          : undefined;
    const requestId = request.id ?? this.context.requestId() ?? 'unavailable';
    const body: ErrorBody = {
      statusCode: status,
      error: HttpStatus[status] ?? 'Error',
      message,
      ...(candidate && { code: candidate }),
      requestId,
      timestamp: new Date().toISOString(),
      path: request.originalUrl.split('?')[0],
    };
    if (!known || status >= 500) {
      this.logger.error({
        requestId,
        status,
        errorName: exception instanceof Error ? exception.name : 'UnknownError',
        stack: exception instanceof Error ? exception.stack : undefined,
      });
      this.sentry.capture(exception, requestId);
    }
    response.status(status).json(body);
  }
}
