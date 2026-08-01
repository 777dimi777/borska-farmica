import { PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';
import { AvailabilityMode, ProductStatus } from '../../generated/prisma/enums';
import { toOptionalBoolean } from '../../common/query-transformers';
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const nullable = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;
export class CreateProductDto {
  @IsUUID('4') categoryId!: string;
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(160) name!: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(180) slug?: string;
  @Transform(nullable)
  @IsOptional()
  @IsString()
  @MaxLength(320)
  shortDescription?: string | null;
  @Transform(nullable)
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  description?: string | null;
  @Transform(toOptionalBoolean) @IsOptional() @IsBoolean() featured?: boolean;
  @Transform(toOptionalBoolean)
  @IsOptional()
  @IsBoolean()
  mainProduct?: boolean;
  @IsOptional() @IsEnum(AvailabilityMode) availabilityMode?: AvailabilityMode;
  @Transform(toOptionalBoolean)
  @IsOptional()
  @IsBoolean()
  manuallyAvailable?: boolean;
  @Transform(nullable) @IsOptional() @IsString() @MaxLength(70) seoTitle?:
    string | null;
  @Transform(nullable)
  @IsOptional()
  @IsString()
  @MaxLength(170)
  seoDescription?: string | null;
}
export class UpdateProductDto extends PartialType(CreateProductDto) {
  @IsOptional() @IsEnum(ProductStatus) status?: ProductStatus;
}
