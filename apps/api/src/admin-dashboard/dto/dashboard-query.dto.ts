import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, Matches } from 'class-validator';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export class DashboardPeriodQueryDto {
  @ApiPropertyOptional({ example: '2026-07-04' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(DATE_PATTERN)
  from?: string;

  @ApiPropertyOptional({ example: '2026-08-02' })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @Matches(DATE_PATTERN)
  to?: string;
}
