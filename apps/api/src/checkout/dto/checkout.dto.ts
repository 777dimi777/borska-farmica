import { Transform } from 'class-transformer';
import { IsOptional, IsUUID, Matches, MaxLength } from 'class-validator';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const PLAIN_NOTE_PATTERN = /^[^<>]*$/;

export class CheckoutRequestDto {
  @IsUUID('4')
  pickupLocationId!: string;

  @Matches(DATE_PATTERN)
  requestedPickupDate!: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() || undefined : value,
  )
  @MaxLength(500)
  @Matches(PLAIN_NOTE_PATTERN)
  customerNote?: string;
}
