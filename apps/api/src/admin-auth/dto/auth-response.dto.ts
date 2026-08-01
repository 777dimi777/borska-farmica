import { ApiProperty } from '@nestjs/swagger';
import { AdminRole } from '../../generated/prisma/enums';
export class AdminSummaryDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiProperty({ enum: AdminRole }) role!: AdminRole;
}
export class AuthResponseDto {
  @ApiProperty() accessToken!: string;
  @ApiProperty({ example: 'Bearer' }) tokenType!: 'Bearer';
  @ApiProperty({ example: 900 }) expiresIn!: number;
  @ApiProperty({ type: AdminSummaryDto }) admin!: AdminSummaryDto;
}
