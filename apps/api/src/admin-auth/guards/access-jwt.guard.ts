import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { AuthenticatedAdminRequest } from '../authenticated-request';
import { TokenService } from '../token.service';
@Injectable()
export class AccessJwtGuard implements CanActivate {
  constructor(
    private readonly tokens: TokenService,
    private readonly prisma: PrismaService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest<AuthenticatedAdminRequest>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token)
      throw new UnauthorizedException('Invalid access token.');
    const payload = await this.tokens.verifyAccess(token);
    const admin = await this.prisma.adminUser.findFirst({
      where: { id: payload.sub, status: 'ACTIVE' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        lastLoginAt: true,
      },
    });
    if (!admin || admin.role !== payload.role)
      throw new UnauthorizedException('Invalid access token.');
    request.admin = admin;
    return true;
  }
}
