import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
@Injectable()
export class CartOriginGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>(),
      origin = req.get('origin');
    if (!origin) return true;
    if (origin !== this.config.getOrThrow<string>('FRONTEND_URL'))
      throw new ForbiddenException('Origin is not allowed.');
    return true;
  }
}
