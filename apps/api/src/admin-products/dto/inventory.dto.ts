import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/pagination/pagination-query.dto';
import { InventoryMovementType } from '../../generated/prisma/enums';
import { SIGNED_QUANTITY_PATTERN } from '../decimal';
const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;
export enum ManualInventoryType {
  RESTOCK = 'RESTOCK',
  ADJUSTMENT = 'ADJUSTMENT',
  DAMAGE = 'DAMAGE',
}
export class InventoryAdjustmentDto {
  @ApiProperty({ enum: ManualInventoryType })
  @IsEnum(ManualInventoryType)
  type!: ManualInventoryType;
  @ApiProperty({
    type: String,
    example: '10.000',
    description:
      'Positive absolute quantity for RESTOCK/DAMAGE; signed delta for ADJUSTMENT.',
  })
  @IsString()
  @Matches(SIGNED_QUANTITY_PATTERN)
  quantity!: string;
  @Transform(trim)
  @ValidateIf(
    (x: InventoryAdjustmentDto) =>
      x.type === ManualInventoryType.DAMAGE ||
      x.type === ManualInventoryType.ADJUSTMENT,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  reason?: string;
  @Transform(trim) @IsOptional() @IsString() @MaxLength(160) reference?: string;
}
export class InventoryMovementQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: InventoryMovementType })
  @IsOptional()
  @IsEnum(InventoryMovementType)
  type?: InventoryMovementType;
}
export class InventoryMovementDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty({ enum: InventoryMovementType }) type!: InventoryMovementType;
  @ApiProperty() quantityDelta!: string;
  @ApiProperty({ nullable: true, type: String }) balanceAfter!: string | null;
  @ApiProperty({ nullable: true, type: String }) reason!: string | null;
  @ApiProperty({ nullable: true, type: String }) reference!: string | null;
  @ApiProperty({ format: 'date-time' }) createdAt!: Date;
}
