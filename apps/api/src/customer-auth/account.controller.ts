import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import type { AuthenticatedCustomer } from './authenticated-customer';
import { CustomerAccountService } from './customer-account.service';
import { CustomerCookieService } from './customer-cookie.service';
import { CurrentCustomer } from './decorators/current-customer.decorator';
import {
  ChangeCustomerPasswordDto,
  UpdateCustomerProfileDto,
} from './dto/customer-account.dto';
import { CustomerAccessGuard } from './guards/customer-access.guard';
@ApiTags('Customer Account')
@ApiBearerAuth('customer-access')
@UseGuards(CustomerAccessGuard)
@Controller('account')
export class AccountController {
  constructor(
    private readonly accounts: CustomerAccountService,
    private readonly cookies: CustomerCookieService,
  ) {}
  private metadata(req: Request) {
    return { userAgent: req.get('user-agent'), ipAddress: req.ip };
  }
  @Get('me')
  @ApiOperation({ summary: 'Read the authenticated customer profile' })
  @ApiOkResponse()
  me(@CurrentCustomer() c: AuthenticatedCustomer) {
    return this.accounts.get(c.id);
  }
  @Patch('me')
  @ApiOperation({ summary: 'Update customer name or Serbian contact phone' })
  update(
    @CurrentCustomer() c: AuthenticatedCustomer,
    @Body() dto: UpdateCustomerProfileDto,
  ) {
    return this.accounts.update(c.id, dto);
  }
  @Post('change-password')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({
    summary:
      'Change password, revoke customer sessions and issue a fresh session',
  })
  async changePassword(
    @CurrentCustomer() c: AuthenticatedCustomer,
    @Body() dto: ChangeCustomerPasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.accounts.changePassword(
      c.id,
      dto,
      this.metadata(req),
    );
    this.cookies.set(res, result.refreshToken);
    return result.response;
  }
}
