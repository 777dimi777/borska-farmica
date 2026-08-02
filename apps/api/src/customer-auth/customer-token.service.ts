import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import {
  CustomerAccessPayload,
  CustomerRefreshPayload,
} from './customer-auth.types';
@Injectable()
export class CustomerTokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  accessTtl() {
    return this.config.getOrThrow<number>('CUSTOMER_JWT_ACCESS_TTL');
  }
  refreshTtl() {
    return this.config.getOrThrow<number>('CUSTOMER_JWT_REFRESH_TTL');
  }
  signAccess(id: string, passwordChangedAt: Date | null) {
    return this.jwt.signAsync(
      {
        sub: id,
        type: 'customer_access',
        passwordChangedAt: passwordChangedAt?.getTime() ?? null,
      } satisfies CustomerAccessPayload,
      {
        secret: this.config.getOrThrow<string>('CUSTOMER_JWT_ACCESS_SECRET'),
        expiresIn: this.accessTtl(),
      },
    );
  }
  signRefresh(id: string, sessionId: string) {
    return this.jwt.signAsync(
      {
        sub: id,
        sessionId,
        type: 'customer_refresh',
      } satisfies CustomerRefreshPayload,
      {
        secret: this.config.getOrThrow<string>('CUSTOMER_JWT_REFRESH_SECRET'),
        expiresIn: this.refreshTtl(),
      },
    );
  }
  async verifyAccess(token: string) {
    try {
      const p = await this.jwt.verifyAsync<CustomerAccessPayload>(token, {
        secret: this.config.getOrThrow<string>('CUSTOMER_JWT_ACCESS_SECRET'),
      });
      if (p.type !== 'customer_access' || !p.sub) throw new Error();
      return p;
    } catch {
      throw new UnauthorizedException('Invalid access token.');
    }
  }
  async verifyRefresh(token: string) {
    try {
      const p = await this.jwt.verifyAsync<CustomerRefreshPayload>(token, {
        secret: this.config.getOrThrow<string>('CUSTOMER_JWT_REFRESH_SECRET'),
      });
      if (p.type !== 'customer_refresh' || !p.sub || !p.sessionId)
        throw new Error();
      return p;
    } catch {
      throw new UnauthorizedException('Invalid credentials.');
    }
  }
  hash(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }
}
