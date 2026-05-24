import { IsBoolean, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePrayerRequestDto {
  @IsString()
  @MinLength(3)
  content!: string;

  @IsOptional()
  @IsBoolean()
  anonymous?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['APP_ONLY', 'FACEBOOK_PREP'])
  publishMode?: 'APP_ONLY' | 'FACEBOOK_PREP';
}

export class ReportPrayerRequestDto {
  @IsString()
  @MinLength(3)
  reason!: string;
}

export class ModeratePrayerRequestDto {
  @IsString()
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';

  @IsOptional()
  @IsString()
  moderationNote?: string;
}
