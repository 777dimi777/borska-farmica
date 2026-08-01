import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AdminRole } from '../generated/prisma/enums';
import { normalizeEmail } from './auth.types';
import { PasswordService } from './password.service';
export interface BootstrapAdminInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: AdminRole;
}
@Injectable()
export class AdminBootstrapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
  ) {}
  async create(input: BootstrapAdminInput): Promise<'created' | 'exists'> {
    const email = normalizeEmail(input.email);
    const existing = await this.prisma.adminUser.findUnique({
      where: { email },
      select: { id: true },
    });
    if (existing) return 'exists';
    const passwordHash = await this.passwords.hash(input.password);
    await this.prisma.adminUser.create({
      data: {
        email,
        passwordHash,
        firstName: input.firstName.trim(),
        lastName: input.lastName.trim(),
        role: input.role,
      },
    });
    return 'created';
  }
}
