import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { toOptionalBoolean } from '../../common/query-transformers';
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
const nullable = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() || null : value;
export class CreateCategoryDto {
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(80) name!: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(120) slug?: string;
  @Transform(nullable) @IsOptional() @IsString() @MaxLength(2000) description?:
    string | null;
  @Transform(nullable)
  @IsOptional()
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(2048)
  imageUrl?: string | null;
  @Transform(toOptionalBoolean) @IsOptional() @IsBoolean() isActive?: boolean;
  @Type(() => Number)
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1000000)
  sortOrder?: number;
}
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
export class ReorderCategoryItemDto {
  @IsUUID('4') id!: string;
  @Type(() => Number) @IsInt() @Min(0) @Max(1000000) sortOrder!: number;
}
export class ReorderCategoriesDto {
  @ApiProperty({ type: ReorderCategoryItemDto, isArray: true })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique((x: ReorderCategoryItemDto) => x.id)
  @ArrayUnique((x: ReorderCategoryItemDto) => x.sortOrder)
  @ValidateNested({ each: true })
  @Type(() => ReorderCategoryItemDto)
  items!: ReorderCategoryItemDto[];
}
