import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { isRetryableTransactionError } from '../common/prisma-write-conflict';
import { OrderCancellationService } from './order-cancellation.service';
import { TimeProvider } from './time-provider';

export interface MaintenanceResult {
  scanned: number;
  processed: number;
  skipped: number;
  failed: number;
  durationMs: number;
}

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly clock: TimeProvider,
    private readonly cancellation: OrderCancellationService,
  ) {}
  private result(
    start: number,
    scanned: number,
    processed: number,
    skipped: number,
    failed: number,
  ): MaintenanceResult {
    return {
      scanned,
      processed,
      skipped,
      failed,
      durationMs: Date.now() - start,
    };
  }
  async expireOrders(dryRun = false): Promise<MaintenanceResult> {
    const start = Date.now(),
      now = this.clock.now(),
      size = this.config.get<number>('MAINTENANCE_BATCH_SIZE', 100),
      max = this.config.get<number>('MAINTENANCE_MAX_BATCHES', 10);
    let scanned = 0,
      processed = 0,
      skipped = 0,
      failed = 0;
    for (let batch = 0; batch < max; batch++) {
      const ids = await this.prisma.order.findMany({
        where: {
          status: 'PENDING_CONFIRMATION',
          confirmationExpiresAt: { lte: now },
        },
        orderBy: [{ confirmationExpiresAt: 'asc' }, { id: 'asc' }],
        take: size,
        select: { id: true },
      });
      scanned += ids.length;
      if (dryRun) return this.result(start, scanned, 0, scanned, 0);
      if (!ids.length) break;
      for (const { id } of ids) {
        let done = false;
        for (let attempt = 0; attempt < 3 && !done; attempt++) {
          try {
            await this.prisma.$transaction(
              (tx) =>
                this.cancellation.cancelIn(tx, {
                  orderId: id,
                  expectedStatuses: ['PENDING_CONFIRMATION'],
                  now,
                  expiresAtOrBefore: now,
                  reason: 'CONFIRMATION_TIMEOUT',
                  actorType: 'SYSTEM',
                  eventType: 'order.cancelled_by_timeout',
                }),
              { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
            );
            processed++;
            done = true;
          } catch (error) {
            if (attempt < 2 && isRetryableTransactionError(error)) continue;
            if (
              error instanceof Error &&
              ['ORDER_STATUS_CONFLICT', 'ORDER_NOT_EXPIRED'].includes(
                error.message,
              )
            )
              skipped++;
            else failed++;
            done = true;
          }
        }
      }
      if (ids.length < size) break;
    }
    const output = this.result(start, scanned, processed, skipped, failed);
    this.logger.log(JSON.stringify({ job: 'orders', ...output }));
    return output;
  }
  async cleanCarts(dryRun = false): Promise<MaintenanceResult> {
    const start = Date.now(),
      now = this.clock.now(),
      size = this.config.get<number>('MAINTENANCE_BATCH_SIZE', 100);
    const expired = await this.prisma.cart.findMany({
      where: { status: 'ACTIVE', expiresAt: { lte: now } },
      take: size,
      select: { id: true },
    });
    const cutoff = new Date(
      now.getTime() -
        this.config.get<number>('CART_RETENTION_DAYS', 30) * 86400000,
    );
    const stale = await this.prisma.cart.findMany({
      where: {
        status: { in: ['EXPIRED', 'ABANDONED'] },
        updatedAt: { lte: cutoff },
        order: null,
      },
      take: size,
      select: { id: true },
    });
    if (!dryRun) {
      await this.prisma.cart.updateMany({
        where: {
          id: { in: expired.map((x) => x.id) },
          status: 'ACTIVE',
          expiresAt: { lte: now },
        },
        data: { status: 'EXPIRED' },
      });
      await this.prisma.cart.deleteMany({
        where: {
          id: { in: stale.map((x) => x.id) },
          status: { in: ['EXPIRED', 'ABANDONED'] },
          order: null,
        },
      });
    }
    const out = this.result(
      start,
      expired.length + stale.length,
      dryRun ? 0 : expired.length + stale.length,
      dryRun ? expired.length + stale.length : 0,
      0,
    );
    this.logger.log(JSON.stringify({ job: 'carts', ...out }));
    return out;
  }
  async cleanSessions(dryRun = false): Promise<MaintenanceResult> {
    const start = Date.now(),
      now = this.clock.now(),
      cutoff = new Date(
        now.getTime() -
          this.config.get<number>('SESSION_RETENTION_DAYS', 90) * 86400000,
      ),
      size = this.config.get<number>('MAINTENANCE_BATCH_SIZE', 100),
      where = {
        OR: [{ expiresAt: { lte: cutoff } }, { revokedAt: { lte: cutoff } }],
      };
    const [customers, admins] = await Promise.all([
      this.prisma.customerSession.findMany({
        where,
        take: size,
        select: { id: true },
      }),
      this.prisma.adminSession.findMany({
        where,
        take: size,
        select: { id: true },
      }),
    ]);
    if (!dryRun)
      await this.prisma.$transaction([
        this.prisma.customerSession.deleteMany({
          where: { id: { in: customers.map((x) => x.id) } },
        }),
        this.prisma.adminSession.deleteMany({
          where: { id: { in: admins.map((x) => x.id) } },
        }),
      ]);
    const scanned = customers.length + admins.length,
      out = this.result(
        start,
        scanned,
        dryRun ? 0 : scanned,
        dryRun ? scanned : 0,
        0,
      );
    this.logger.log(JSON.stringify({ job: 'sessions', ...out }));
    return out;
  }
  async run(target: 'orders' | 'carts' | 'sessions' | 'all', dryRun = false) {
    const result: Record<string, MaintenanceResult> = {};
    if (target === 'orders' || target === 'all')
      result.orders = await this.expireOrders(dryRun);
    if (target === 'carts' || target === 'all')
      result.carts = await this.cleanCarts(dryRun);
    if (target === 'sessions' || target === 'all')
      result.sessions = await this.cleanSessions(dryRun);
    return result;
  }
}
