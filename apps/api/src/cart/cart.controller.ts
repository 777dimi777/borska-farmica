import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import {
  ApiCookieAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { CartCookieService } from './cart-cookie.service';
import { CartIdentityService } from './cart-identity.service';
import { CartOriginGuard } from './cart-origin.guard';
import { CartService } from './cart.service';
import { AddCartItemDto, UpdateCartItemDto } from './dto/cart-item.dto';
@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(
    private readonly carts: CartService,
    private readonly identity: CartIdentityService,
    private readonly cookies: CartCookieService,
  ) {}
  private async active(req: Request, res: Response) {
    const raw = this.cookies.read(req);
    let cart = await this.identity.resolve(raw);
    if (raw && !cart) this.cookies.clear(res);
    if (!cart) {
      const created = await this.identity.create();
      cart = created.cart;
      this.cookies.set(res, created.raw);
    }
    return cart;
  }
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
  @Post('items')
  @UseGuards(CartOriginGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiOperation({
    summary: 'Add a variant using a server-validated decimal quantity',
  })
  async add(
    @Body() dto: AddCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cart = await this.active(req, res);
    return this.carts.add(cart.id, dto);
  }
  @Patch('items/:itemId')
  @UseGuards(CartOriginGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async update(
    @Param('itemId', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() dto: UpdateCartItemDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cart = await this.active(req, res);
    return this.carts.update(cart.id, id, dto);
  }
  @Delete('items/:itemId')
  @HttpCode(204)
  @UseGuards(CartOriginGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiNoContentResponse()
  async remove(
    @Param('itemId', new ParseUUIDPipe({ version: '4' })) id: string,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const cart = await this.active(req, res);
    await this.carts.remove(cart.id, id);
  }
  @Delete('items')
  @HttpCode(204)
  @UseGuards(CartOriginGuard)
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  @ApiNoContentResponse()
  async clear(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cart = await this.active(req, res);
    await this.carts.clear(cart.id);
  }
}
