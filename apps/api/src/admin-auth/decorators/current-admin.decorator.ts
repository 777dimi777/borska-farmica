import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import {
  AuthenticatedAdmin,
  AuthenticatedAdminRequest,
} from '../authenticated-request';
export const CurrentAdmin = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedAdmin =>
    context.switchToHttp().getRequest<AuthenticatedAdminRequest>().admin,
);
