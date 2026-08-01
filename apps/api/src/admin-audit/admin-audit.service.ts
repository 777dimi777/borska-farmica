import { Injectable } from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { AuditAction, AuditContext } from './admin-audit.types';
export interface AuditWrite {
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  changes?: Prisma.InputJsonValue;
}
@Injectable()
export class AdminAuditService {
  write(
    tx: Prisma.TransactionClient,
    context: AuditContext,
    entry: AuditWrite,
  ) {
    return tx.adminAuditLog.create({
      data: {
        adminId: context.adminId,
        action: entry.action,
        resourceType: entry.resourceType,
        resourceId: entry.resourceId,
        changes: entry.changes,
        ipAddress: context.ipAddress?.slice(0, 64),
        userAgent: context.userAgent?.slice(0, 512),
      },
    });
  }
}
