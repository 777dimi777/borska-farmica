import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { toTrimmedOptionalString } from '../../common/query-transformers';
export enum AuditSort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
}
export class AdminAuditQueryDto extends PaginationQueryDto {
  @IsOptional() @IsUUID('4') adminId?: string;
  @IsOptional()
  @Transform(toTrimmedOptionalString)
  @IsString()
  @MaxLength(100)
  action?: string;
  @IsOptional()
  @Transform(toTrimmedOptionalString)
  @IsString()
  @MaxLength(80)
  resourceType?: string;
  @IsOptional() @IsUUID('4') resourceId?: string;
  @IsOptional() @IsDateString() createdFrom?: string;
  @IsOptional() @IsDateString() createdTo?: string;
  @IsOptional()
  @Transform(toTrimmedOptionalString)
  @IsString()
  @MaxLength(120)
  search?: string;
  @IsOptional() @IsEnum(AuditSort) sort: AuditSort = AuditSort.NEWEST;
}
