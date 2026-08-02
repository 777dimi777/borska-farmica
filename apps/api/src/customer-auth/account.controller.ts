import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { AuthenticatedCustomer } from './authenticated-customer';
import { CurrentCustomer } from './decorators/current-customer.decorator';
import { CustomerAccessGuard } from './guards/customer-access.guard';
@ApiTags('Customer Account')
@ApiBearerAuth('customer-access')
@UseGuards(CustomerAccessGuard)
@Controller('account')
export class AccountController {
  @Get('me')
  @ApiOperation({ summary: 'Read the authenticated customer profile' })
  @ApiOkResponse()
  me(@CurrentCustomer() c: AuthenticatedCustomer) {
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
}
