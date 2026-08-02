import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { toTrimmedOptionalString } from '../../common/query-transformers';
import {
  CustomerStatus,
  OrderStatus,
  PaymentStatus,
} from '../../generated/prisma/enums';
export enum CustomerSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  LAST_ORDER_DESC = 'last_order_desc',
  TOTAL_SPENT_DESC = 'total_spent_desc',
}
export class AdminCustomerQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Transform(toTrimmedOptionalString)
  @IsString()
  @MaxLength(120)
  search?: string;
  @IsOptional() @IsEnum(CustomerStatus) status?: CustomerStatus;
  @IsOptional() @IsDateString() createdFrom?: string;
  @IsOptional() @IsDateString() createdTo?: string;
  @IsOptional() @IsDateString() lastOrderFrom?: string;
  @IsOptional() @IsDateString() lastOrderTo?: string;
  @IsOptional() @IsEnum(CustomerSort) sort: CustomerSort = CustomerSort.NEWEST;
}
export enum CustomerOrderSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}
export class AdminCustomerOrderQueryDto extends PaginationQueryDto {
  @IsOptional() @IsEnum(OrderStatus) status?: OrderStatus;
  @IsOptional() @IsEnum(PaymentStatus) paymentStatus?: PaymentStatus;
  @IsOptional() @IsDateString() createdFrom?: string;
  @IsOptional() @IsDateString() createdTo?: string;
  @IsOptional() @IsEnum(CustomerOrderSort) sort: CustomerOrderSort =
    CustomerOrderSort.NEWEST;
}
