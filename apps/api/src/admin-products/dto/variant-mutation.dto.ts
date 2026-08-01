import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { MeasurementUnit } from '../../generated/prisma/enums';
import { PRICE_PATTERN, QUANTITY_PATTERN } from '../decimal';
import { toOptionalBoolean } from '../../common/query-transformers';
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const sku = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim().toUpperCase() : value;
export class CreateVariantDto {
  @Transform(trim) @IsString() @MinLength(1) @MaxLength(120) name!: string;
  @Transform(sku)
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  @Matches(/^[A-Z0-9_-]+$/)
  sku!: string;
  @ApiProperty({ type: String, example: '250.00' })
  @IsString()
  @Matches(PRICE_PATTERN)
  price!: string;
  @ApiProperty({ type: String, nullable: true })
  @IsOptional()
  @IsString()
  @Matches(PRICE_PATTERN)
  compareAtPrice?: string | null;
  @ApiProperty({ type: String, example: '1.000' })
  @IsString()
  @Matches(QUANTITY_PATTERN)
  packageAmount!: string;
  @ApiProperty({ enum: MeasurementUnit })
  @IsEnum(MeasurementUnit)
  unit!: MeasurementUnit;
  @ApiProperty({ type: String })
  @IsString()
  @Matches(QUANTITY_PATTERN)
  lowStockThreshold!: string;
  @ApiProperty({ type: String })
  @IsString()
  @Matches(QUANTITY_PATTERN)
  minimumPurchaseQuantity!: string;
  @ApiProperty({ type: String })
  @IsString()
  @Matches(QUANTITY_PATTERN)
  purchaseIncrement!: string;
  @Transform(toOptionalBoolean)
  @IsOptional()
  @IsBoolean()
  allowBackorder?: boolean;
  @Transform(toOptionalBoolean) @IsOptional() @IsBoolean() isDefault?: boolean;
  @Transform(toOptionalBoolean) @IsOptional() @IsBoolean() isActive?: boolean;
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000)
  sortOrder?: number;
}
export class UpdateVariantDto extends PartialType(CreateVariantDto) {}
