import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'crypto';
import type { Request } from 'express';

@Injectable()
export class MetricsGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}
  canActivate(context: ExecutionContext): boolean {
    if (!this.config.get<boolean>('METRICS_ENABLED', false))
      throw new NotFoundException();
    const expected = this.config.getOrThrow<string>('METRICS_AUTH_TOKEN'),
      header = context.switchToHttp().getRequest<Request>()
        .headers.authorization;
    const supplied =
      typeof header === 'string' && header.startsWith('Bearer ')
        ? header.slice(7)
        : '';
    const digest = (value: string) =>
      createHash('sha256').update(value).digest();
    if (!timingSafeEqual(digest(supplied), digest(expected)))
      throw new UnauthorizedException('METRICS_AUTH_REQUIRED');
    return true;
  }
}
