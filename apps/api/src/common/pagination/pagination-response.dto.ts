import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetadataDto {
  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 12 }) limit!: number;
  @ApiProperty({ example: 25 }) total!: number;
  @ApiProperty({ example: 3 }) totalPages!: number;
  @ApiProperty({ example: false }) hasPreviousPage!: boolean;
  @ApiProperty({ example: true }) hasNextPage!: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMetadataDto;
}
