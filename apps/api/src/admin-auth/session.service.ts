import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { AdminRole } from '../generated/prisma/enums';
import { TokenService } from './token.service';
export interface SessionMetadata {
  userAgent?: string;
  ipAddress?: string;
}
@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
  ) {}
  async create(
    adminId: string,
    role: AdminRole,
    metadata: SessionMetadata,
  ): Promise<string> {
    const id = randomUUID();
    const token = await this.tokens.signRefresh(adminId, id);
    await this.prisma.adminSession.create({
      data: {
        id,
        adminId,
        refreshTokenHash: this.tokens.hashToken(token),
        expiresAt: new Date(Date.now() + this.tokens.refreshTtl() * 1000),
        userAgent: metadata.userAgent?.slice(0, 512),
        ipAddress: metadata.ipAddress?.slice(0, 64),
      },
    });
    return token;
  }
  async rotate(
    rawToken: string,
    metadata: SessionMetadata,
  ): Promise<{
    refreshToken: string;
    admin: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: AdminRole;
    };
  }> {
    const payload = await this.tokens.verifyRefresh(rawToken);
    const hash = this.tokens.hashToken(rawToken);
    const nextId = randomUUID();
    const nextToken = await this.tokens.signRefresh(payload.sub, nextId);
    const now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const old = await tx.adminSession.findFirst({
        where: {
          id: payload.sessionId,
          adminId: payload.sub,
          refreshTokenHash: hash,
          revokedAt: null,
          expiresAt: { gt: now },
          admin: { status: 'ACTIVE' },
        },
        include: { admin: true },
      });
      if (!old) throw new UnauthorizedException('Invalid credentials.');
      const revoked = await tx.adminSession.updateMany({
        where: { id: old.id, revokedAt: null },
        data: { revokedAt: now, lastUsedAt: now },
      });
      if (revoked.count !== 1)
        throw new UnauthorizedException('Invalid credentials.');
      await tx.adminSession.create({
        data: {
          id: nextId,
          adminId: old.adminId,
          refreshTokenHash: this.tokens.hashToken(nextToken),
          expiresAt: new Date(now.getTime() + this.tokens.refreshTtl() * 1000),
          userAgent: metadata.userAgent?.slice(0, 512),
          ipAddress: metadata.ipAddress?.slice(0, 64),
        },
      });
      return { refreshToken: nextToken, admin: old.admin };
    });
  }
  async revoke(rawToken?: string): Promise<void> {
    if (!rawToken) return;
    try {
      const payload = await this.tokens.verifyRefresh(rawToken);
      await this.prisma.adminSession.updateMany({
        where: { id: payload.sessionId, adminId: payload.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      return;
    }
  }
}
