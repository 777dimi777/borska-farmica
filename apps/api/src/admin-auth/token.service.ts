import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { createHash } from 'crypto';
import { AdminRole } from '../generated/prisma/enums';
import { AccessPayload, RefreshPayload } from './auth.types';
@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}
  accessTtl(): number {
    return this.config.getOrThrow<number>('JWT_ACCESS_TTL');
  }
  refreshTtl(): number {
    return this.config.getOrThrow<number>('JWT_REFRESH_TTL');
  }
  signAccess(adminId: string, role: AdminRole): Promise<string> {
    return this.jwt.signAsync(
      { sub: adminId, role, type: 'access' } satisfies AccessPayload,
      {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.accessTtl(),
      },
    );
  }
  signRefresh(adminId: string, sessionId: string): Promise<string> {
    return this.jwt.signAsync(
      { sub: adminId, sessionId, type: 'refresh' } satisfies RefreshPayload,
      {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.refreshTtl(),
      },
    );
  }
  async verifyRefresh(token: string): Promise<RefreshPayload> {
    try {
      const payload = await this.jwt.verifyAsync<RefreshPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
      if (payload.type !== 'refresh' || !payload.sub || !payload.sessionId)
        throw new Error();
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid credentials.');
    }
  }
  async verifyAccess(token: string): Promise<AccessPayload> {
    try {
      const payload = await this.jwt.verifyAsync<AccessPayload>(token, {
        secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      });
      if (payload.type !== 'access' || !payload.sub || !payload.role)
        throw new Error();
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid access token.');
    }
  }
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
