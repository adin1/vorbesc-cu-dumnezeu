import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateAcquisitionDto {
  @IsIn(['tiktok', 'facebook', 'direct'])
  @IsString()
  source!: string;

  @IsOptional()
  @IsString()
  medium?: string;

  @IsOptional()
  @IsString()
  campaign?: string;

  @IsOptional()
  @IsString()
  landingPage?: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsString()
  firstVisitAt?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}