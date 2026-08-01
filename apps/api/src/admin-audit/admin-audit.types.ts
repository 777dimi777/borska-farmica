export const AUDIT_ACTIONS = {
  CATEGORY_CREATED: 'category.created',
  CATEGORY_UPDATED: 'category.updated',
  CATEGORY_ACTIVATED: 'category.activated',
  CATEGORY_DEACTIVATED: 'category.deactivated',
  CATEGORY_REORDERED: 'category.reordered',
  CATEGORY_DELETED: 'category.deleted',
} as const;
export const AUDIT_RESOURCE_TYPES = { CATEGORY: 'category' } as const;
export type AuditAction = (typeof AUDIT_ACTIONS)[keyof typeof AUDIT_ACTIONS];
export interface AuditContext {
  adminId: string;
  ipAddress?: string;
  userAgent?: string;
}
