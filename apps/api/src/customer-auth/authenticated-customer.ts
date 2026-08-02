import type { Request } from 'express';
import { CustomerStatus } from '../generated/prisma/enums';
export interface AuthenticatedCustomer {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  status: CustomerStatus;
  emailVerifiedAt: Date | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}
export interface AuthenticatedCustomerRequest extends Request {
  customer?: AuthenticatedCustomer;
}
