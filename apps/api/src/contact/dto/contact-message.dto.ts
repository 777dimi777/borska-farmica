import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class ContactMessageDto {
  @Transform(trim) @IsString() @MinLength(2) @MaxLength(100) name!: string;
  @Transform(trim) @IsEmail() @MaxLength(254) email!: string;
  @Transform(trim)
  @IsIn(['Pitanje o proizvodu', 'Postojeća porudžbina', 'Preuzimanje', 'Drugo'])
  topic!: string;
  @Transform(trim)
  @IsOptional()
  @IsString()
  @MaxLength(80)
  orderNumber?: string;
  @Transform(trim) @IsString() @MinLength(10) @MaxLength(3000) message!: string;
  @IsOptional() @IsString() @MaxLength(0) website?: string;
}
