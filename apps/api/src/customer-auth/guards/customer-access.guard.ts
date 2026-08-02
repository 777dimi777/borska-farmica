import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedCustomerRequest } from '../authenticated-customer';
import { CustomerTokenService } from '../customer-token.service';
@Injectable()
export class CustomerAccessGuard implements CanActivate {
  constructor(
    private readonly tokens: CustomerTokenService,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context
        .switchToHttp()
        .getRequest<AuthenticatedCustomerRequest>(),
      [scheme, token] = req.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid access token.');
    const p = await this.tokens.verifyAccess(token);
    const customer = await this.prisma.customerUser.findFirst({
      where: { id: p.sub, status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        status: true,
        emailVerifiedAt: true,
        lastLoginAt: true,
        passwordChangedAt: true,
        createdAt: true,
      },
    });
    if (
      !customer ||
      (customer.passwordChangedAt?.getTime() ?? null) !== p.passwordChangedAt
    )
      throw new UnauthorizedException('Invalid access token.');
    req.customer = {
      id: customer.id,
      email: customer.email,
      firstName: customer.firstName,
      lastName: customer.lastName,
      phone: customer.phone,
      status: customer.status,
      emailVerifiedAt: customer.emailVerifiedAt,
      lastLoginAt: customer.lastLoginAt,
      createdAt: customer.createdAt,
    };
    return true;
  }
}
