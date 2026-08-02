import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, Matches, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { OrderStatus } from '../../generated/prisma/enums';

export enum CustomerOrderSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}

export class CustomerOrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(CustomerOrderSort)
  sort: CustomerOrderSort = CustomerOrderSort.NEWEST;
}

export class CustomerOrderNumberDto {
  @Matches(/^BF-\d{8}-[23456789A-HJ-NP-Z]{8}$/)
  orderNumber!: string;
}

export class CustomerCancelOrderDto {
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @MaxLength(500)
  @Matches(/^[^<>]*$/)
  reason?: string;
}
