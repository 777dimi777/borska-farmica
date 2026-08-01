import { AdminRole, AdminStatus } from '../generated/prisma/enums';
export interface AdminSummary {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
}
export interface AuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  admin: AdminSummary;
}
export interface AccessPayload {
  sub: string;
  role: AdminRole;
  type: 'access';
}
export interface RefreshPayload {
  sub: string;
  sessionId: string;
  type: 'refresh';
}
export interface AdminRecord extends AdminSummary {
  passwordHash: string;
  status: AdminStatus;
}
export const normalizeEmail = (email: string): string =>
  email.trim().toLowerCase();
export const toAdminSummary = (admin: AdminSummary): AdminSummary => ({
  id: admin.id,
  email: admin.email,
  firstName: admin.firstName,
  lastName: admin.lastName,
  role: admin.role,
});
