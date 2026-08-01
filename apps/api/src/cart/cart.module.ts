import { Module } from '@nestjs/common';
import { CartCookieService } from './cart-cookie.service';
import { CartIdentityService } from './cart-identity.service';
import { CartOriginGuard } from './cart-origin.guard';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
@Module({
  controllers: [CartController],
  providers: [
    CartIdentityService,
    CartCookieService,
    CartOriginGuard,
    CartService,
  ],
  exports: [CartIdentityService, CartCookieService, CartOriginGuard],
})
export class CartModule {}
