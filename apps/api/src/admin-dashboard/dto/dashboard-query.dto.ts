import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, Matches } from 'class-validator';
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
