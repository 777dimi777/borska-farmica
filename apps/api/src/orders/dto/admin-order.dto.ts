import { Transform } from 'class-transformer';
import {
  Equals,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsISO8601,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { toTrimmedOptionalString } from '../../common/query-transformers';
import { OrderStatus, PaymentStatus } from '../../generated/prisma/enums';

export enum AdminOrderSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  PICKUP_DATE = 'pickup_date',
  STATUS = 'status',
}

export class AdminOrderQueryDto extends PaginationQueryDto {
  @Transform(toTrimmedOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @IsOptional()
  @IsUUID('4')
  pickupLocationId?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  requestedPickupDateFrom?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  @IsDateString({ strict: true })
  requestedPickupDateTo?: string;

  @IsOptional()
  @IsDateString()
  createdAtFrom?: string;

  @IsOptional()
  @IsDateString()
  createdAtTo?: string;

  @IsOptional()
  @IsEnum(AdminOrderSort)
  sort: AdminOrderSort = AdminOrderSort.NEWEST;
}

export class AdminOrderTransitionDto {
  @IsEnum(OrderStatus)
  targetStatus!: OrderStatus;

  @IsOptional()
  @IsISO8601({ strict: true })
  confirmedPickupAt?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @MaxLength(500)
  @Matches(/^[^<>]*$/)
  note?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @MaxLength(500)
  @Matches(/^[^<>]+$/)
  cancellationReason?: string;

  @IsOptional()
  @IsBoolean()
  @Equals(true)
  cashReceived?: boolean;
}
