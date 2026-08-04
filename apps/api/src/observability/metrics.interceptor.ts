import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metrics: MetricsService) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== 'http') return next.handle();
    const http = context.switchToHttp(),
      req = http.getRequest<Request>(),
      res = http.getResponse<Response>(),
      start = process.hrtime.bigint();
    return next.handle().pipe(
      finalize(() => {
        const seconds = Number(process.hrtime.bigint() - start) / 1e9;
        const routePath = (req.route as { path?: unknown } | undefined)?.path;
        const route =
          typeof routePath === 'string'
            ? `${req.baseUrl}${routePath}`
            : 'unmatched';
        this.metrics.recordHttp(req.method, route, res.statusCode, seconds);
      }),
    );
  }
}
