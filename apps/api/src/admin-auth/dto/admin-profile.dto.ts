import { ApiProperty } from '@nestjs/swagger';
import { AdminRole, AdminStatus } from '../../generated/prisma/enums';
export class AdminProfileDto {
  @ApiProperty({ format: 'uuid' }) id!: string;
  @ApiProperty() email!: string;
  @ApiProperty() firstName!: string;
  @ApiProperty() lastName!: string;
  @ApiProperty({ enum: AdminRole }) role!: AdminRole;
  @ApiProperty({ enum: AdminStatus }) status!: AdminStatus;
  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  lastLoginAt!: Date | null;
}
