import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AdminAuthModule } from '../admin-auth/admin-auth.module';
import { CustomerAuthController } from './customer-auth.controller';
import { CustomerAuthService } from './customer-auth.service';
import { CustomerCookieService } from './customer-cookie.service';
import { CustomerSessionService } from './customer-session.service';
import { CustomerTokenService } from './customer-token.service';
import { AccountController } from './account.controller';
import { CustomerAccountService } from './customer-account.service';
import { CustomerAccessGuard } from './guards/customer-access.guard';
@Module({
  imports: [JwtModule.register({}), AdminAuthModule],
  controllers: [CustomerAuthController, AccountController],
  providers: [
    CustomerAuthService,
    CustomerAccountService,
    CustomerCookieService,
    CustomerSessionService,
    CustomerTokenService,
    CustomerAccessGuard,
  ],
  exports: [
    CustomerAccessGuard,
    CustomerAuthService,
    CustomerAccountService,
    CustomerCookieService,
    CustomerSessionService,
    CustomerTokenService,
  ],
})
export class CustomerAuthModule {}
