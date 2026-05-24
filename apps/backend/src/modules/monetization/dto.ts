import { IsIn, IsInt, IsOptional, IsPositive, IsString, MaxLength, Min } from 'class-validator';

export class CreateSubscriptionCheckoutDto {
  @IsString()
  planSlug!: string;
}

export class CreateDonationCheckoutDto {
  @IsInt()
  @Min(500)
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  message?: string;

  @IsOptional()
  @IsString()
  @IsIn(['RON', 'EUR'])
  currency?: string;
}

export class VerifyCheckoutSessionDto {
  @IsString()
  sessionId!: string;
}