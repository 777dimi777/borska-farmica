export type CustomerSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  emailVerified: boolean;
};
export type CustomerProfile = CustomerSummary & {
  createdAt: string;
  lastLoginAt: string | null;
};
export type AuthResponse = {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  customer: CustomerSummary;
};
export type LoginInput = { email: string; password: string };
export type RegisterInput = LoginInput & {
  firstName: string;
  lastName: string;
  phone: string;
};
export type ProfileInput = {
  firstName?: string;
  lastName?: string;
  phone?: string;
};
