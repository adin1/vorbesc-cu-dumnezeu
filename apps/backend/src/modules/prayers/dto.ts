import { IsOptional, IsString, MinLength } from 'class-validator';

export class GeneratePrayerRequestDto {
  @IsString()
  @MinLength(2)
  topic!: string;
}

export class SaveGeneratedPrayerDto {
  @IsString()
  @MinLength(2)
  topic!: string;

  @IsString()
  @MinLength(10)
  prayer!: string;

  @IsString()
  @IsOptional()
  suggestion?: string;
}
