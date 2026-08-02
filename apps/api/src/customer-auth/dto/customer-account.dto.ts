import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  normalizeCustomerName,
  normalizeSerbianPhone,
} from '../customer-normalization';
const name = /^[\p{L}][\p{L}\p{M} .'-]*$/u;
export class UpdateCustomerProfileDto {
  @IsOptional()
  @Transform(({ value }) => normalizeCustomerName(String(value)))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(name)
  firstName?: string;
  @IsOptional()
  @Transform(({ value }) => normalizeCustomerName(String(value)))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(name)
  lastName?: string;
  @IsOptional()
  @Transform(({ value }) => normalizeSerbianPhone(String(value)))
  @IsString()
  @MaxLength(32)
  phone?: string;
}
export class ChangeCustomerPasswordDto {
  @IsString() @MinLength(1) @MaxLength(128) currentPassword!: string;
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  @Matches(/\S/)
  newPassword!: string;
}
