import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiBearerAuth,
  ApiCookieAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CartCookieService } from '../cart/cart-cookie.service';
import { CartIdentityService } from '../cart/cart-identity.service';
import { CartOriginGuard } from '../cart/cart-origin.guard';
import type { AuthenticatedCustomer } from '../customer-auth/authenticated-customer';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';
import { CustomerAccessGuard } from '../customer-auth/guards/customer-access.guard';
import { CheckoutValidationService } from './checkout-validation.service';
import { CheckoutRequestDto } from './dto/checkout.dto';
import { OrderCreationService } from './order-creation.service';

@ApiTags('Checkout')
@Controller('checkout')
export class CheckoutController {
  constructor(
    private readonly checkout: CheckoutValidationService,
    private readonly orders: OrderCreationService,
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

  @Post('orders')
  @UseGuards(CustomerAccessGuard, CartOriginGuard)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiBearerAuth('customer-access')
  @ApiCookieAuth('bf_cart')
  @ApiOperation({ summary: 'Atomically create an order and reserve stock' })
  async createOrder(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Body() dto: CheckoutRequestDto,
    @Headers('idempotency-key') idempotencyKey: string | undefined,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rawCartToken = this.cookies.read(req);
    if (!rawCartToken) throw new BadRequestException('CHECKOUT_CART_REQUIRED');
    const result = await this.orders.create(
      customer.id,
      rawCartToken,
      dto,
      idempotencyKey,
    );
    this.cookies.clear(res);
    return result;
  }
}
