import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import {
  toOptionalBoolean,
  toTrimmedOptionalString,
} from '../../common/query-transformers';
import { AvailabilityMode } from '../../generated/prisma/enums';

export enum AdminProductStatus {
  ALL = 'all',
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  ARCHIVED = 'ARCHIVED',
}
export enum AdminStockStatus {
  ALL = 'all',
  IN_STOCK = 'in_stock',
  LOW_STOCK = 'low_stock',
  OUT_OF_STOCK = 'out_of_stock',
  BACKORDER = 'backorder',
}
export enum AdminProductSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  UPDATED_DESC = 'updated_desc',
  STATUS = 'status',
}

export class AdminProductQueryDto extends PaginationQueryDto {
  @Transform(toTrimmedOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Unknown UUID returns an empty page.',
  })
  @IsOptional()
  @IsUUID('4')
  categoryId?: string;
  @ApiPropertyOptional({
    enum: AdminProductStatus,
    default: AdminProductStatus.ALL,
  })
  @IsOptional()
  @IsEnum(AdminProductStatus)
  status: AdminProductStatus = AdminProductStatus.ALL;
  @Transform(toOptionalBoolean) @IsOptional() @IsBoolean() featured?: boolean;
  @Transform(toOptionalBoolean)
  @IsOptional()
  @IsBoolean()
  mainProduct?: boolean;
  @IsOptional() @IsEnum(AvailabilityMode) availabilityMode?: AvailabilityMode;
  @ApiPropertyOptional({
    enum: AdminStockStatus,
    default: AdminStockStatus.ALL,
  })
  @IsOptional()
  @IsEnum(AdminStockStatus)
  stockStatus: AdminStockStatus = AdminStockStatus.ALL;
  @ApiPropertyOptional({
    enum: AdminProductSort,
    default: AdminProductSort.NEWEST,
  })
  @IsOptional()
  @IsEnum(AdminProductSort)
  sort: AdminProductSort = AdminProductSort.NEWEST;
}
