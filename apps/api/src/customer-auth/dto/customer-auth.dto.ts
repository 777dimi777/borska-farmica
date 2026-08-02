import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  normalizeCustomerEmail,
  normalizeCustomerName,
  normalizeSerbianPhone,
} from '../customer-normalization';
const name = /^[\p{L}][\p{L}\p{M} .'-]*$/u;
export class CustomerRegisterDto {
  @Transform(({ value }) => normalizeCustomerName(String(value)))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(name)
  firstName!: string;
  @Transform(({ value }) => normalizeCustomerName(String(value)))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @Matches(name)
  lastName!: string;
  @Transform(({ value }) => normalizeCustomerEmail(String(value)))
  @IsEmail()
  @MaxLength(254)
  email!: string;
  @Transform(({ value }) => normalizeSerbianPhone(String(value)))
  @IsString()
  @MaxLength(32)
  phone!: string;
  @IsString() @MinLength(12) @MaxLength(128) @Matches(/\S/) password!: string;
}
export class CustomerLoginDto {
  @Transform(({ value }) => normalizeCustomerEmail(String(value)))
  @IsEmail()
  @MaxLength(254)
  email!: string;
  @IsString() @MinLength(1) @MaxLength(128) password!: string;
}
