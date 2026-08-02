import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductStatus } from '../../generated/prisma/enums';
import { AdminStockStatus } from '../../admin-products/dto/admin-product-query.dto';
import { toTrimmedOptionalString } from '../../common/query-transformers';
export class InventoryExportQueryDto {
  @IsOptional()
  @Transform(toTrimmedOptionalString)
  @IsString()
  @MaxLength(120)
  search?: string;
  @IsOptional()
  @Transform(toTrimmedOptionalString)
  @IsString()
  @MaxLength(180)
  category?: string;
  @IsOptional() @IsEnum(ProductStatus) productStatus?: ProductStatus;
  @IsOptional() @IsEnum(AdminStockStatus) stockStatus?: AdminStockStatus;
}
