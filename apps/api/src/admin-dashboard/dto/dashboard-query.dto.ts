import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Matches, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { toTrimmedOptionalString } from '../../common/query-transformers';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
export class DashboardPeriodQueryDto {
  @ApiPropertyOptional({ example: '2026-07-04' })
  @IsOptional()
  @Transform(toTrimmedOptionalString)
  @Matches(DATE_PATTERN)
  from?: string;
  @ApiPropertyOptional({ example: '2026-08-02' })
  @IsOptional()
  @Transform(toTrimmedOptionalString)
  @Matches(DATE_PATTERN)
  to?: string;
}
export enum RevenueGranularity {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}
export class RevenueSeriesQueryDto extends DashboardPeriodQueryDto {
  @ApiPropertyOptional({
    enum: RevenueGranularity,
    default: RevenueGranularity.DAY,
  })
  @IsOptional()
  @IsEnum(RevenueGranularity)
  granularity: RevenueGranularity = RevenueGranularity.DAY;
}

export enum TopProductsSort {
  REVENUE = 'revenue',
  QUANTITY = 'quantity',
  ORDERS = 'orders',
}

export class TopProductsQueryDto extends DashboardPeriodQueryDto {
  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;

  @ApiPropertyOptional({
    enum: TopProductsSort,
    default: TopProductsSort.REVENUE,
  })
  @IsOptional()
  @IsEnum(TopProductsSort)
  sort: TopProductsSort = TopProductsSort.REVENUE;
}

export enum InventoryAlertFilter {
  LOW = 'low',
  OUT = 'out',
  BACKORDER = 'backorder',
  RESERVED_PRESSURE = 'reserved_pressure',
  ALL = 'all',
}
export class InventoryAlertsQueryDto {
  @ApiPropertyOptional({
    enum: InventoryAlertFilter,
    default: InventoryAlertFilter.ALL,
  })
  @IsOptional()
  @IsEnum(InventoryAlertFilter)
  status: InventoryAlertFilter = InventoryAlertFilter.ALL;
}
export class SeasonalDashboardQueryDto {
  @ApiPropertyOptional({ default: 60, minimum: 1, maximum: 366 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(366)
  horizon = 60;
}
export class RecentOrdersQueryDto {
  @ApiPropertyOptional({ default: 10, minimum: 1, maximum: 50 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit = 10;
}
