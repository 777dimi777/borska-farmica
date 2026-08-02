import { Module } from '@nestjs/common';
import { CartModule } from '../cart/cart.module';
import { CustomerAuthModule } from '../customer-auth/customer-auth.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutValidationService } from './checkout-validation.service';

@Module({
  imports: [CartModule, CustomerAuthModule],
  controllers: [CheckoutController],
  providers: [CheckoutValidationService],
  exports: [CheckoutValidationService],
})
export class CheckoutModule {}
