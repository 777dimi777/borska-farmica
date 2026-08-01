import { ApiProperty } from '@nestjs/swagger';
import {
  AvailabilityMode,
  AvailabilityWindowType,
  MeasurementUnit,
  ProductStatus,
} from '../../generated/prisma/enums';
import { PaginationMetadataDto } from '../../common/pagination/pagination-response.dto';
import { AdminStockStatus } from './admin-product-query.dto';

export class AdminProductCategoryDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty() isActive!: boolean;
}
export class AdminProductImageDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() url!: string;
  @ApiProperty() altText!: string;
  @ApiProperty() primary!: boolean;
  @ApiProperty() sortOrder!: number;
}
export class AdminProductVariantDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() sku!: string;
  @ApiProperty({ example: '250.00' }) price!: string;
  @ApiProperty({ type: String, nullable: true }) compareAtPrice!: string | null;
  @ApiProperty({ example: '1.000' }) packageAmount!: string;
  @ApiProperty({ enum: MeasurementUnit }) unit!: MeasurementUnit;
  @ApiProperty({ example: '10.000' }) stockQuantity!: string;
  @ApiProperty({ example: '2.000' }) reservedQuantity!: string;
  @ApiProperty({ example: '8.000' }) availableQuantity!: string;
  @ApiProperty({ example: '5.000' }) lowStockThreshold!: string;
  @ApiProperty({ example: '1.000' }) minimumPurchaseQuantity!: string;
  @ApiProperty({ example: '1.000' }) purchaseIncrement!: string;
  @ApiProperty() allowBackorder!: boolean;
  @ApiProperty() isDefault!: boolean;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() sortOrder!: number;
  @ApiProperty({ enum: AdminStockStatus }) stockStatus!: AdminStockStatus;
  @ApiProperty({ format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ format: 'date-time' }) updatedAt!: Date;
}
export class AdminAvailabilityWindowDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: AvailabilityWindowType }) type!: AvailabilityWindowType;
  @ApiProperty({ nullable: true, type: String }) startsAt!: Date | null;
  @ApiProperty({ nullable: true, type: String }) endsAt!: Date | null;
  @ApiProperty({ nullable: true, type: Number }) startMonth!: number | null;
  @ApiProperty({ nullable: true, type: Number }) startDay!: number | null;
  @ApiProperty({ nullable: true, type: Number }) endMonth!: number | null;
  @ApiProperty({ nullable: true, type: Number }) endDay!: number | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty({ nullable: true, type: String }) publicLabel!: string | null;
  @ApiProperty() sortOrder!: number;
}
export class AdminProductDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ enum: ProductStatus }) status!: ProductStatus;
  @ApiProperty() featured!: boolean;
  @ApiProperty() mainProduct!: boolean;
  @ApiProperty({ enum: AvailabilityMode }) availabilityMode!: AvailabilityMode;
  @ApiProperty() manuallyAvailable!: boolean;
  @ApiProperty({ type: AdminProductCategoryDto })
  category!: AdminProductCategoryDto;
  @ApiProperty() variantCount!: number;
  @ApiProperty() activeVariantCount!: number;
  @ApiProperty({ nullable: true, type: String }) startingPrice!: string | null;
  @ApiProperty({ nullable: true, type: String }) highestPrice!: string | null;
  @ApiProperty() stockQuantity!: string;
  @ApiProperty() reservedQuantity!: string;
  @ApiProperty() availableQuantity!: string;
  @ApiProperty({ enum: AdminStockStatus }) stockStatus!: AdminStockStatus;
  @ApiProperty({ nullable: true, type: AdminProductImageDto })
  primaryImage!: AdminProductImageDto | null;
  @ApiProperty({ format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ format: 'date-time' }) updatedAt!: Date;
}
export class AdminProductDetailDto extends AdminProductDto {
  @ApiProperty({ nullable: true, type: String }) shortDescription!:
    string | null;
  @ApiProperty({ nullable: true, type: String }) description!: string | null;
  @ApiProperty({ nullable: true, type: String }) seoTitle!: string | null;
  @ApiProperty({ nullable: true, type: String }) seoDescription!: string | null;
  @ApiProperty({ type: AdminProductVariantDto, isArray: true })
  variants!: AdminProductVariantDto[];
  @ApiProperty({ type: AdminProductImageDto, isArray: true })
  images!: AdminProductImageDto[];
  @ApiProperty({ type: AdminAvailabilityWindowDto, isArray: true })
  availabilityWindows!: AdminAvailabilityWindowDto[];
}
export class AdminProductListDto {
  @ApiProperty({ type: AdminProductDto, isArray: true })
  data!: AdminProductDto[];
  @ApiProperty({ type: PaginationMetadataDto })
  pagination!: PaginationMetadataDto;
}
