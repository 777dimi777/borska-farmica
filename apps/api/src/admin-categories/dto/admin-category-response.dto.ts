import { ApiProperty } from '@nestjs/swagger';
import { PaginationMetadataDto } from '../../common/pagination/pagination-response.dto';
export class AdminCategoryDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() name!: string;
  @ApiProperty() slug!: string;
  @ApiProperty({ nullable: true, type: String }) description!: string | null;
  @ApiProperty({ nullable: true, type: String }) imageUrl!: string | null;
  @ApiProperty() isActive!: boolean;
  @ApiProperty() sortOrder!: number;
  @ApiProperty() productCount!: number;
  @ApiProperty() activeProductCount!: number;
  @ApiProperty({ format: 'date-time' }) createdAt!: Date;
  @ApiProperty({ format: 'date-time' }) updatedAt!: Date;
}
export class AdminCategoryDetailDto extends AdminCategoryDto {
  @ApiProperty() draftProductCount!: number;
  @ApiProperty() archivedProductCount!: number;
}
export class AdminCategoryListDto {
  @ApiProperty({ type: AdminCategoryDto, isArray: true })
  data!: AdminCategoryDto[];
  @ApiProperty({ type: PaginationMetadataDto })
  pagination!: PaginationMetadataDto;
}
