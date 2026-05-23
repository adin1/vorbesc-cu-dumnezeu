import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsString()
  denomination?: string;

  @IsOptional()
  @IsBoolean()
  notifyDaily?: boolean;

  @IsOptional()
  @IsBoolean()
  notifyCommunity?: boolean;
}

export class UpdateSpiritualPreferenceDto {
  @IsOptional()
  @IsString()
  preferredTone?: string;

  @IsOptional()
  @IsString()
  spiritualGoal?: string;

  @IsOptional()
  @IsString()
  confession?: string;
}

export class CreateFavoriteVerseDto {
  @IsString()
  @MinLength(2)
  reference!: string;

  @IsString()
  @MinLength(2)
  text!: string;
}
