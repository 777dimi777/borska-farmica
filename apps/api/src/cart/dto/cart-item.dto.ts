import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, Matches } from 'class-validator';
import { QUANTITY_PATTERN } from '../../admin-products/decimal';
export class AddCartItemDto {
  @ApiProperty({ format: 'uuid' }) @IsUUID('4') variantId!: string;
  @ApiProperty({ example: '1.000', type: String })
  @Matches(QUANTITY_PATTERN)
  quantity!: string;
}
export class UpdateCartItemDto {
  @ApiProperty({ example: '2.000', type: String })
  @Matches(QUANTITY_PATTERN)
  quantity!: string;
}
