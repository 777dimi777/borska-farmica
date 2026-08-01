import { ApiProperty } from '@nestjs/swagger';
import { Transform, TransformFnParams } from 'class-transformer';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';
import { normalizeEmail } from '../auth.types';
function normalizeEmailInput(params: TransformFnParams): unknown {
  const value: unknown = params.value;
  return typeof value === 'string' ? normalizeEmail(value) : value;
}
export class LoginDto {
  @ApiProperty()
  @Transform(normalizeEmailInput)
  @IsEmail()
  @MaxLength(254)
  email!: string;
  @ApiProperty({ minLength: 12, maxLength: 128, format: 'password' })
  @IsString()
  @MinLength(12)
  @MaxLength(128)
  password!: string;
}
