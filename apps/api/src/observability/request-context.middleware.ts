import { Injectable, NestMiddleware } from '@nestjs/common';
import type { NextFunction, Request, Response } from 'express';
import { RequestContextService } from './request-context.service';
import { resolveRequestId, validRequestId } from './request-id';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  constructor(private readonly context: RequestContextService) {}
  use(req: Request & { id?: string }, res: Response, next: NextFunction): void {
    const id = validRequestId(req.id)
      ? req.id
      : resolveRequestId(req.headers['x-request-id']);
    req.id = id;
    res.setHeader('X-Request-ID', id);
    this.context.run({ requestId: id }, next);
  }
}
