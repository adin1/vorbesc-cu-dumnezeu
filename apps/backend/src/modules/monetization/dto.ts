import { IsIn, IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateSubscriptionCheckoutDto {
  @IsString()
  planSlug!: string;
}

export class CreateDonationCheckoutDto {
  @IsInt()
  @IsIn([500, 1000, 2500, 5000])
  amount!: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  message?: string;

  @IsOptional()
  @IsString()
  @IsIn(['RON'])
  currency?: string;
}

export class VerifyCheckoutSessionDto {
  @IsString()
  sessionId!: string;
}