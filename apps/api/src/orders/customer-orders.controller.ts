import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AuthenticatedCustomer } from '../customer-auth/authenticated-customer';
import { CurrentCustomer } from '../customer-auth/decorators/current-customer.decorator';
import { CustomerAccessGuard } from '../customer-auth/guards/customer-access.guard';
import { CustomerOrdersService } from './customer-orders.service';
import {
  CustomerCancelOrderDto,
  CustomerOrderNumberDto,
  CustomerOrderQueryDto,
} from './dto/customer-order.dto';

@ApiTags('Customer Orders')
@ApiBearerAuth('customer-access')
@UseGuards(CustomerAccessGuard)
@Controller('account/orders')
export class CustomerOrdersController {
  constructor(private readonly orders: CustomerOrdersService) {}

  @Get()
  @ApiOperation({ summary: 'List only the authenticated customer orders' })
  list(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Query() query: CustomerOrderQueryDto,
  ) {
    return this.orders.list(customer.id, query);
  }

  @Get(':orderNumber')
  @ApiOperation({ summary: 'Read a customer-safe order snapshot and timeline' })
  detail(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Param() params: CustomerOrderNumberDto,
  ) {
    return this.orders.detail(customer.id, params.orderNumber);
  }

  @Post(':orderNumber/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a pending order and release reservations' })
  cancel(
    @CurrentCustomer() customer: AuthenticatedCustomer,
    @Param() params: CustomerOrderNumberDto,
    @Body() dto: CustomerCancelOrderDto,
  ) {
    return this.orders.cancel(customer.id, params.orderNumber, dto);
  }
}
