import { Controller, Get, Req, Res } from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CartCookieService } from './cart-cookie.service';
import { CartIdentityService } from './cart-identity.service';
import { CartService } from './cart.service';
@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly carts: CartService,
    private readonly identity: CartIdentityService,
    private readonly cookies: CartCookieService,
  ) {}
  @Get()
  @ApiCookieAuth()
  @ApiOperation({ summary: 'Read the current guest cart without creating one' })
  @ApiOkResponse()
  async read(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const raw = this.cookies.read(req),
      cart = await this.identity.resolve(raw);
    if (raw && !cart) this.cookies.clear(res);
    return cart ? this.carts.read(cart.id) : this.carts.empty();
  }
}
