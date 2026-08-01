import { ApiProperty } from '@nestjs/swagger';

export class CategoryResponseDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ example: 'MleÄni proizvodi' }) name!: string;
  @ApiProperty({ example: 'mlecni-proizvodi' }) slug!: string;
  @ApiProperty({ type: String, nullable: true }) description!: string | null;
  @ApiProperty({ type: String, format: 'uri', nullable: true }) imageUrl!:
    string | null;
  @ApiProperty({ example: 0 }) productCount!: number;
}
