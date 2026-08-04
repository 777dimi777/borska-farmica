import type { Pagination } from '../catalog/types';
export type Customer = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: string;
  updatedAt: string;
  lastLoginAt: string | null;
  orderCount: number;
  completedOrderCount: number;
  cancelledOrderCount: number;
  totalSpent: string;
  lastOrderAt: string | null;
  activeSessionCount: number;
};
export type CustomerDetail = Customer & {
  orderStatusDistribution: Record<string, number>;
  recentOrders: CustomerOrder[];
};
export type CustomerPage = { data: Customer[]; pagination: Pagination };
export type CustomerOrder = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  total: string;
  currency: string;
  pickup?: { id: string; code: string; name: string };
  itemCount?: number;
  createdAt: string;
  completedAt: string | null;
};
export type CustomerOrdersPage = {
  data: CustomerOrder[];
  pagination: Pagination;
};
export type Audit = {
  id: string;
  action: string;
  resourceType: string;
  resourceId: string | null;
  changes: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  admin: { id: string; email: string; role: string };
};
export type AuditPage = { data: Audit[]; pagination: Pagination };
