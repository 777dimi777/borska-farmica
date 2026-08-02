import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AvailabilityWindowType } from '../../generated/prisma/enums';
export class AvailabilityWindowMutationDto {
  @IsOptional() @IsEnum(AvailabilityWindowType) type?: AvailabilityWindowType;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) startsAt?: string;
  @IsOptional() @Matches(/^\d{4}-\d{2}-\d{2}$/) endsAt?: string;
  @IsOptional() @IsInt() @Min(1) @Max(12) startMonth?: number;
  @IsOptional() @IsInt() @Min(1) @Max(31) startDay?: number;
  @IsOptional() @IsInt() @Min(1) @Max(12) endMonth?: number;
  @IsOptional() @IsInt() @Min(1) @Max(31) endDay?: number;
  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() @MaxLength(240) label?: string | null;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
export class ContentOrderItemDto {
  @IsUUID('4') id!: string;
  @IsInt() @Min(0) sortOrder!: number;
}
export class ContentReorderDto {
  @IsArray()
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => ContentOrderItemDto)
  items!: ContentOrderItemDto[];
}
export class ProductImageMutationDto {
  @IsOptional() @Matches(/^https:\/\/[^\s]+$/i) @MaxLength(2048) url?: string;
  @IsOptional() @IsString() @MinLength(3) @MaxLength(160) altText?: string;
  @IsOptional() @IsBoolean() isPrimary?: boolean;
  @IsOptional() @IsInt() @Min(0) sortOrder?: number;
}
export class ProductImageReorderDto extends ContentReorderDto {
  @IsOptional() @IsUUID('4') primaryImageId?: string;
}

export class ProductImageUploadDto {
  @IsString() @MinLength(3) @MaxLength(160) altText!: string;
  @IsOptional()
  @Transform(
    ({ value }: { value: unknown }) => value === true || value === 'true',
  )
  @IsBoolean()
  isPrimary?: boolean;
}
