import { ApiProperty } from '@nestjs/swagger';
import { AvailabilityMode } from '../../generated/prisma/enums';
import { PaginationMetadataDto } from '../../common/pagination/pagination-response.dto';

export class ProductCategoryDto {
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
}
export class ProductImageDto {
  @ApiProperty({ format: 'uri' }) url!: string;
  @ApiProperty() altText!: string;
  @ApiProperty({ type: Number, nullable: true }) width!: number | null;
  @ApiProperty({ type: Number, nullable: true }) height!: number | null;
}
export class ProductAvailabilityDto {
  @ApiProperty({ enum: AvailabilityMode }) mode!: AvailabilityMode;
  @ApiProperty() currentlyAvailable!: boolean;
  @ApiProperty() inStock!: boolean;
  @ApiProperty() purchasable!: boolean;
  @ApiProperty({ type: String, nullable: true }) label!: string | null;
}
export class ProductListItemDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ type: String, nullable: true }) shortDescription!:
    string | null;
  @ApiProperty() featured!: boolean;
  @ApiProperty() mainProduct!: boolean;
  @ApiProperty({ type: ProductCategoryDto }) category!: ProductCategoryDto;
  @ApiProperty({ type: ProductImageDto, nullable: true })
  primaryImage!: ProductImageDto | null;
  @ApiProperty({ example: '850.00' }) startingPrice!: string;
  @ApiProperty({ type: ProductAvailabilityDto })
  availability!: ProductAvailabilityDto;
}
export class ProductListResponseDto {
  @ApiProperty({ type: ProductListItemDto, isArray: true })
  data!: ProductListItemDto[];
  @ApiProperty({ type: PaginationMetadataDto })
  pagination!: PaginationMetadataDto;
}
