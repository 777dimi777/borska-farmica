import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { AvailabilityMode } from '../../generated/prisma/enums';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import {
  toOptionalBoolean,
  toTrimmedOptionalString,
} from '../../common/query-transformers';
import { ProductSort } from '../product-sort.enum';

export class ProductQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @Transform(toTrimmedOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
  @ApiPropertyOptional({ example: 'mlecni-proizvodi' })
  @Transform(toTrimmedOptionalString)
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  category?: string;
  @ApiPropertyOptional({ type: Boolean })
  @Transform(toOptionalBoolean)
  @IsOptional()
  @IsBoolean()
  featured?: boolean;
  @ApiPropertyOptional({ type: Boolean })
  @Transform(toOptionalBoolean)
  @IsOptional()
  @IsBoolean()
  mainProduct?: boolean;
  @ApiPropertyOptional({ enum: AvailabilityMode })
  @IsOptional()
  @IsEnum(AvailabilityMode)
  availabilityMode?: AvailabilityMode;
  @ApiPropertyOptional({
    type: Boolean,
    description:
      'When true, keeps products with stock or backorder. False does not filter.',
  })
  @Transform(toOptionalBoolean)
  @IsOptional()
  @IsBoolean()
  inStock?: boolean;
  @ApiPropertyOptional({ enum: ProductSort, default: ProductSort.NEWEST })
  @IsOptional()
  @IsEnum(ProductSort)
  sort: ProductSort = ProductSort.NEWEST;
}
