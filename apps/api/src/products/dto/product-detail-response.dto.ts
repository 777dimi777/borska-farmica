import { ApiProperty } from '@nestjs/swagger';
import { MeasurementUnit } from '../../generated/prisma/enums';
import {
  ProductAvailabilityDto,
  ProductCategoryDto,
  ProductImageDto,
} from './product-response.dto';

export class ProductVariantDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() sku!: string;
  @ApiProperty({ example: '250.00' }) price!: string;
  @ApiProperty({ type: String, nullable: true }) compareAtPrice!: string | null;
  @ApiProperty({ example: '1.000' }) packageAmount!: string;
  @ApiProperty({ example: '0.500' }) minimumPurchaseQuantity!: string;
  @ApiProperty({ example: '0.250' }) purchaseIncrement!: string;
  @ApiProperty({ enum: MeasurementUnit }) unit!: MeasurementUnit;
  @ApiProperty() default!: boolean;
  @ApiProperty() inStock!: boolean;
  @ApiProperty() purchasable!: boolean;
}
export class ProductDetailImageDto extends ProductImageDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() primary!: boolean;
}
export class ProductSeoDto {
  @ApiProperty({ type: String, nullable: true }) title!: string | null;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
}
export class ProductDetailResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ type: String, nullable: true }) shortDescription!:
    string | null;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty() featured!: boolean;
  @ApiProperty() mainProduct!: boolean;
  @ApiProperty({ type: ProductCategoryDto }) category!: ProductCategoryDto;
  @ApiProperty({ type: ProductVariantDto, isArray: true })
  variants!: ProductVariantDto[];
  @ApiProperty({ type: ProductDetailImageDto, isArray: true })
  images!: ProductDetailImageDto[];
  @ApiProperty({ type: ProductAvailabilityDto })
  availability!: ProductAvailabilityDto;
  @ApiProperty({ type: ProductSeoDto }) seo!: ProductSeoDto;
}
