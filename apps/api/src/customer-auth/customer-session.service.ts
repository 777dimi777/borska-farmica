import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CustomerSessionMetadata } from './customer-auth.types';
import { CustomerTokenService } from './customer-token.service';
@Injectable()
export class CustomerSessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: CustomerTokenService,
  ) {}
  async createIn(
    tx: Prisma.TransactionClient,
    customerId: string,
    m: CustomerSessionMetadata,
  ) {
    const id = randomUUID(),
      raw = await this.tokens.signRefresh(customerId, id);
    await tx.customerSession.create({
      data: {
        id,
        customerId,
        refreshTokenHash: this.tokens.hash(raw),
        expiresAt: new Date(Date.now() + this.tokens.refreshTtl() * 1000),
        userAgent: m.userAgent?.slice(0, 512),
        ipAddress: m.ipAddress?.slice(0, 64),
      },
    });
    return raw;
  }
  create(customerId: string, m: CustomerSessionMetadata) {
    return this.prisma.$transaction((tx) => this.createIn(tx, customerId, m));
  }
  async rotate(raw: string, m: CustomerSessionMetadata) {
    const p = await this.tokens.verifyRefresh(raw),
      now = new Date();
    return this.prisma.$transaction(async (tx) => {
      const old = await tx.customerSession.findFirst({
        where: {
          id: p.sessionId,
          customerId: p.sub,
          refreshTokenHash: this.tokens.hash(raw),
          revokedAt: null,
          expiresAt: { gt: now },
          customer: { status: 'ACTIVE' },
        },
        include: { customer: true },
      });
      if (!old) throw new UnauthorizedException('Invalid credentials.');
      const changed = await tx.customerSession.updateMany({
        where: { id: old.id, revokedAt: null },
        data: { revokedAt: now, lastUsedAt: now },
      });
      if (changed.count !== 1)
        throw new UnauthorizedException('Invalid credentials.');
      const refreshToken = await this.createIn(tx, old.customerId, m);
      return { customer: old.customer, refreshToken };
    });
  }
  async revoke(raw?: string) {
    if (!raw) return;
    try {
      const p = await this.tokens.verifyRefresh(raw);
      await this.prisma.customerSession.updateMany({
        where: { id: p.sessionId, customerId: p.sub, revokedAt: null },
        data: { revokedAt: new Date() },
      });
    } catch {
      return;
    }
  }
}
