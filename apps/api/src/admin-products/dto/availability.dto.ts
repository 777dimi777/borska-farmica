import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsISO8601, IsOptional } from 'class-validator';
import {
  AvailabilityMode,
  AvailabilityWindowType,
} from '../../generated/prisma/enums';
import {
  AvailabilityBusinessReason,
  AvailabilityStockReason,
} from '../../products/availability';
import { toTrimmedOptionalString } from '../../common/query-transformers';
export class AvailabilityPreviewQueryDto {
  @ApiPropertyOptional({ format: 'date-time' })
  @Transform(toTrimmedOptionalString)
  @IsOptional()
  @IsISO8601({ strict: true })
  at?: string;
}
export class AdminAvailabilityWindowDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ format: 'uuid' }) productId!: string;
  @ApiProperty({ enum: AvailabilityWindowType }) type!: AvailabilityWindowType;
  @ApiProperty({ nullable: true, type: String }) startsAt!: Date | null;
  @ApiProperty({ nullable: true, type: String }) endsAt!: Date | null;
  @ApiProperty({ nullable: true, type: Number }) startMonth!: number | null;
  @ApiProperty({ nullable: true, type: Number }) startDay!: number | null;
  @ApiProperty({ nullable: true, type: Number }) endMonth!: number | null;
  @ApiProperty({ nullable: true, type: Number }) endDay!: number | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ nullable: true, type: String }) label!: string | null;
  @ApiProperty() sortOrder!: number;
  @ApiProperty({ format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ format: 'date-time' }) updatedAt!: Date;
}
export class AvailabilityPreviewDto {
  @ApiProperty({ format: 'uuid' }) productId!: string;
  @ApiProperty({ enum: AvailabilityMode }) mode!: AvailabilityMode;
  @ApiProperty({ format: 'date-time' }) evaluatedAt!: string;
  @ApiProperty() businessDate!: string;
  @ApiProperty() currentlyAvailable!: boolean;
  @ApiProperty() inStock!: boolean;
  @ApiProperty() purchasable!: boolean;
  @ApiProperty({ nullable: true, type: String }) label!: string | null;
  @ApiProperty({ nullable: true, type: String, format: 'uuid' })
  matchedWindowId!: string | null;
  @ApiProperty({ enum: AvailabilityBusinessReason })
  businessReason!: AvailabilityBusinessReason;
  @ApiProperty({ enum: AvailabilityStockReason })
  stockReason!: AvailabilityStockReason;
}
