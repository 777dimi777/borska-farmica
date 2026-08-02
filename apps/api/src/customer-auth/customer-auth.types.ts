export interface CustomerAccessPayload {
  sub: string;
  type: 'customer_access';
  iat?: number;
  exp?: number;
}
export interface CustomerRefreshPayload {
  sub: string;
  sessionId: string;
  type: 'customer_refresh';
  iat?: number;
  exp?: number;
}
export interface CustomerSummary {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
}
export interface CustomerAuthResponse {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  customer: CustomerSummary;
}
export interface CustomerSessionMetadata {
  userAgent?: string;
  ipAddress?: string;
}
export const customerSummary = (c: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailVerifiedAt: Date | null;
}): CustomerSummary => ({
  id: c.id,
  firstName: c.firstName,
  lastName: c.lastName,
  email: c.email,
  phone: c.phone,
  emailVerified: c.emailVerifiedAt !== null,
});
