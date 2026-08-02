import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CartCookieService } from '../cart/cart-cookie.service';
import { CartIdentityService } from '../cart/cart-identity.service';
import type { AuthenticatedCustomer } from '../customer-auth/authenticated-customer';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';
import { CustomerAccessGuard } from '../customer-auth/guards/customer-access.guard';
import { CheckoutValidationService } from './checkout-validation.service';
import { CheckoutRequestDto } from './dto/checkout.dto';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkout: CheckoutValidationService,
    private readonly identity: CartIdentityService,
    private readonly cookies: CartCookieService,
  ) {}

  @Get('pickup-locations')
  @ApiOperation({ summary: 'List active pickup locations' })
  pickupLocations() {
    return this.checkout.pickupLocations();
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @UseGuards(CustomerAccessGuard)
  @ApiBearerAuth('customer-access')
  @ApiCookieAuth('bf_cart')
  @ApiOperation({
    summary: 'Validate cart and preview cash-on-pickup checkout',
  })
  async preview(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Body() dto: CheckoutRequestDto,
    @Req() req: Request,
  ) {
    const cart = await this.identity.resolve(this.cookies.read(req));
    if (!cart) throw new BadRequestException('CHECKOUT_CART_REQUIRED');
    return this.checkout.preview(customer.id, cart.id, dto);
  }
}
