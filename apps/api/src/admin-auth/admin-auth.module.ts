import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthController } from './admin-auth.controller';
import { AdminAuthService } from './admin-auth.service';
import { PasswordService } from './password.service';
import { SessionService } from './session.service';
import { AccessJwtGuard } from './guards/access-jwt.guard';
import { RolesGuard } from './guards/roles.guard';
import { TokenService } from './token.service';
@Module({
  imports: [JwtModule.register({})],
  controllers: [AdminAuthController],
  providers: [
    AdminAuthService,
    PasswordService,
    SessionService,
    TokenService,
    AccessJwtGuard,
    RolesGuard,
  ],
  exports: [
    AdminAuthService,
    PasswordService,
    TokenService,
    AccessJwtGuard,
    RolesGuard,
  ],
})
export class AdminAuthModule {}
