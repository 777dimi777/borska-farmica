import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PasswordService } from '../admin-auth/password.service';
import { PrismaService } from '../database/prisma.service';
import {
  CustomerAuthResponse,
  CustomerSessionMetadata,
  customerSummary,
} from './customer-auth.types';
import { CustomerSessionService } from './customer-session.service';
import { CustomerTokenService } from './customer-token.service';
import {
  ChangeCustomerPasswordDto,
  UpdateCustomerProfileDto,
} from './dto/customer-account.dto';
@Injectable()
export class CustomerAccountService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: CustomerSessionService,
    private readonly tokens: CustomerTokenService,
  ) {}
  private profile(c: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emailVerifiedAt: Date | null;
    lastLoginAt: Date | null;
    createdAt: Date;
  }) {
    return {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.email,
      phone: c.phone,
      emailVerified: c.emailVerifiedAt !== null,
      lastLoginAt: c.lastLoginAt,
      createdAt: c.createdAt,
    };
  }
  async get(id: string) {
    const c = await this.prisma.customerUser.findUniqueOrThrow({
      where: { id },
    });
    return this.profile(c);
  }
  async update(id: string, dto: UpdateCustomerProfileDto) {
    if (!Object.values(dto).some((v) => v !== undefined))
      throw new BadRequestException('At least one field is required.');
    const before = await this.prisma.customerUser.findUniqueOrThrow({
      where: { id },
    });
    const data = {
      firstName: dto.firstName,
      lastName: dto.lastName,
      phone: dto.phone,
    };
    const changed = Object.fromEntries(
      Object.entries(data).filter(
        ([key, value]) =>
          value !== undefined && value !== before[key as keyof typeof before],
      ),
    );
    if (!Object.keys(changed).length) return this.profile(before);
    const updated = await this.prisma.customerUser.update({
      where: { id },
      data: changed,
    });
    return this.profile(updated);
  }
  async changePassword(
    id: string,
    dto: ChangeCustomerPasswordDto,
    m: CustomerSessionMetadata,
  ): Promise<{ response: CustomerAuthResponse; refreshToken: string }> {
    const customer = await this.prisma.customerUser.findUniqueOrThrow({
      where: { id },
    });
    if (
      !(await this.passwords.verify(customer.passwordHash, dto.currentPassword))
    )
      throw new UnauthorizedException('Invalid credentials.');
    if (await this.passwords.verify(customer.passwordHash, dto.newPassword))
      throw new BadRequestException('New password must be different.');
    const passwordHash = await this.passwords.hash(dto.newPassword),
      now = new Date();
    const result = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.customerUser.update({
        where: { id },
        data: { passwordHash, passwordChangedAt: now },
      });
      await tx.customerSession.updateMany({
        where: { customerId: id, revokedAt: null },
        data: { revokedAt: now },
      });
      const refreshToken = await this.sessions.createIn(tx, id, m);
      return { updated, refreshToken };
    });
    return {
      refreshToken: result.refreshToken,
      response: {
        accessToken: await this.tokens.signAccess(
          id,
          result.updated.passwordChangedAt,
        ),
        tokenType: 'Bearer',
        expiresIn: this.tokens.accessTtl(),
        customer: customerSummary(result.updated),
      },
    };
  }
}
