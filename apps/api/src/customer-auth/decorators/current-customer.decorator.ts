import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedCustomerRequest } from '../authenticated-customer';
export const CurrentCustomer = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) =>
    ctx.switchToHttp().getRequest<AuthenticatedCustomerRequest>().customer,
);
