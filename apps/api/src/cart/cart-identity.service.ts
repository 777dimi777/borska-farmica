import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../database/prisma.service';
@Injectable()
export class CartIdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}
  hash(raw: string) {
    return createHash('sha256').update(raw, 'utf8').digest('hex');
  }
  ttlMs() {
    return this.config.getOrThrow<number>('CART_TTL_DAYS') * 86400000;
  }
  async resolve(raw?: string) {
    if (!raw || !/^[A-Za-z0-9_-]{43}$/.test(raw)) return null;
    const cart = await this.prisma.cart.findUnique({
      where: { tokenHash: this.hash(raw) },
    });
    if (!cart || cart.status !== 'ACTIVE') return null;
    if (cart.expiresAt <= new Date()) {
      await this.prisma.cart.updateMany({
        where: { id: cart.id, status: 'ACTIVE' },
        data: { status: 'EXPIRED' },
      });
      return null;
    }
    return cart;
  }
  async create() {
    for (let i = 0; i < 3; i++) {
      const raw = randomBytes(32).toString('base64url');
      try {
        const cart = await this.prisma.cart.create({
          data: {
            tokenHash: this.hash(raw),
            expiresAt: new Date(Date.now() + this.ttlMs()),
          },
        });
        return { raw, cart };
      } catch (e) {
        if (i === 2) throw e;
      }
    }
    throw new Error('Unable to create cart identity.');
  }
}
