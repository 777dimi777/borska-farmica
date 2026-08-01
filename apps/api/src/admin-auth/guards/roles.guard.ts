import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedAdminRequest } from '../authenticated-request';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { AdminRole } from '../../generated/prisma/enums';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<AdminRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required?.length) return true;
    const admin = context
      .switchToHttp()
      .getRequest<AuthenticatedAdminRequest>().admin;
    if (!admin || !required.includes(admin.role))
      throw new ForbiddenException();
    return true;
  }
}
