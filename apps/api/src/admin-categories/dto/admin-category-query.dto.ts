import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { toTrimmedOptionalString } from '../../common/query-transformers';
export enum AdminCategoryStatus {
  ALL = 'all',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
export enum AdminCategorySort {
  SORT_ORDER = 'sort_order',
  NAME_ASC = 'name_asc',
  NAME_DESC = 'name_desc',
  NEWEST = 'newest',
  OLDEST = 'oldest',
}
export class AdminCategoryQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ maxLength: 100 })
  @Transform(toTrimmedOptionalString)
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
  @ApiPropertyOptional({
    enum: AdminCategoryStatus,
    default: AdminCategoryStatus.ALL,
  })
  @IsEnum(AdminCategoryStatus)
  status: AdminCategoryStatus = AdminCategoryStatus.ALL;
  @ApiPropertyOptional({
    enum: AdminCategorySort,
    default: AdminCategorySort.SORT_ORDER,
  })
  @IsEnum(AdminCategorySort)
  sort: AdminCategorySort = AdminCategorySort.SORT_ORDER;
}
