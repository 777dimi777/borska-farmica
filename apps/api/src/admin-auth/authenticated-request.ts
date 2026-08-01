import type { Request } from 'express';
import { AdminRole, AdminStatus } from '../generated/prisma/enums';
export interface AuthenticatedAdmin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
  status: AdminStatus;
  lastLoginAt: Date | null;
}
export type AuthenticatedAdminRequest = Request & { admin: AuthenticatedAdmin };
