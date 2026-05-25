import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateSocialActivityDto {
  @IsIn(['tiktok', 'facebook', 'app'])
  @IsString()
  platform!: 'tiktok' | 'facebook' | 'app';

  @IsString()
  type!:
    | 'clicked_tiktok_link'
    | 'clicked_facebook_link'
    | 'opened_app_from_tiktok'
    | 'opened_app_from_facebook'
    | 'started_plan'
    | 'created_prayer_request'
    | 'donation_started'
    | 'donation_completed'
    | 'premium_started';

  @IsOptional()
  @IsString()
  campaign?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  metadata?: Record<string, unknown>;
}

export class SocialExportQueryDto {
  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  from?: string;

  @IsOptional()
  @IsString()
  to?: string;
}
