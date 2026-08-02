import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../database/prisma.service';
import { PasswordService } from '../admin-auth/password.service';
import { CustomerLoginDto, CustomerRegisterDto } from './dto/customer-auth.dto';
import {
  CustomerAuthResponse,
  CustomerSessionMetadata,
  customerSummary,
} from './customer-auth.types';
import { CustomerSessionService } from './customer-session.service';
import { CustomerTokenService } from './customer-token.service';
@Injectable()
export class CustomerAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: CustomerSessionService,
    private readonly tokens: CustomerTokenService,
  ) {}
  private unauthorized(): never {
    throw new UnauthorizedException('Invalid credentials.');
  }
  private async response(customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    emailVerifiedAt: Date | null;
  }): Promise<CustomerAuthResponse> {
    return {
      accessToken: await this.tokens.signAccess(customer.id),
      tokenType: 'Bearer',
      expiresIn: this.tokens.accessTtl(),
      customer: customerSummary(customer),
    };
  }
  async register(dto: CustomerRegisterDto, m: CustomerSessionMetadata) {
    const passwordHash = await this.passwords.hash(dto.password);
    try {
      return await this.prisma.$transaction(async (tx) => {
        const customer = await tx.customerUser.create({
          data: {
            firstName: dto.firstName,
            lastName: dto.lastName,
            email: dto.email,
            phone: dto.phone,
            passwordHash,
          },
        });
        const refreshToken = await this.sessions.createIn(tx, customer.id, m);
        return { response: await this.response(customer), refreshToken };
      });
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === 'P2002'
      )
        throw new ConflictException('Email is already registered.');
      throw e;
    }
  }
  async login(dto: CustomerLoginDto, m: CustomerSessionMetadata) {
    const customer = await this.prisma.customerUser.findUnique({
      where: { email: dto.email },
    });
    if (!customer) {
      await this.passwords.verifyDummy(dto.password);
      return this.unauthorized();
    }
    if (
      !(await this.passwords.verify(customer.passwordHash, dto.password)) ||
      customer.status !== 'ACTIVE'
    )
      return this.unauthorized();
    const refreshToken = await this.sessions.create(customer.id, m);
    const updated = await this.prisma.customerUser.update({
      where: { id: customer.id },
      data: { lastLoginAt: new Date() },
    });
    return { response: await this.response(updated), refreshToken };
  }
}
