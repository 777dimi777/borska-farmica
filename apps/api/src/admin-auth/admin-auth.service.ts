import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AdminStatus } from '../generated/prisma/enums';
import { AuthResponse, normalizeEmail, toAdminSummary } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { PasswordService } from './password.service';
import { SessionMetadata, SessionService } from './session.service';
import { TokenService } from './token.service';
@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly tokens: TokenService,
  ) {}
  private unauthorized(): never {
    throw new UnauthorizedException('Invalid credentials.');
  }
  async login(
    dto: LoginDto,
    metadata: SessionMetadata,
  ): Promise<{ response: AuthResponse; refreshToken: string }> {
    const admin = await this.prisma.adminUser.findUnique({
      where: { email: normalizeEmail(dto.email) },
    });
    if (!admin) {
      await this.passwords.verifyDummy(dto.password);
      return this.unauthorized();
    }
    if (
      !(await this.passwords.verify(admin.passwordHash, dto.password)) ||
      admin.status !== AdminStatus.ACTIVE
    )
      return this.unauthorized();
    const refreshToken = await this.sessions.create(
      admin.id,
      admin.role,
      metadata,
    );
    await this.prisma.adminUser.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });
    return { response: await this.response(admin), refreshToken };
  }
  async refresh(
    rawToken: string,
    metadata: SessionMetadata,
  ): Promise<{ response: AuthResponse; refreshToken: string }> {
    const rotated = await this.sessions.rotate(rawToken, metadata);
    return {
      response: await this.response(rotated.admin),
      refreshToken: rotated.refreshToken,
    };
  }
  logout(rawToken?: string): Promise<void> {
    return this.sessions.revoke(rawToken);
  }
  private async response(admin: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: import('../generated/prisma/enums').AdminRole;
  }): Promise<AuthResponse> {
    return {
      accessToken: await this.tokens.signAccess(admin.id, admin.role),
      tokenType: 'Bearer',
      expiresIn: this.tokens.accessTtl(),
      admin: toAdminSummary(admin),
    };
  }
}
