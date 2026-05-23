import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreateJournalDto {
  @IsString()
  mood!: string;

  @IsString()
  @MinLength(2)
  burden!: string;

  @IsString()
  gratitude!: string;

  @IsString()
  prayerToday!: string;
}

export class UpdateJournalDto {
  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsString()
  burden?: string;

  @IsOptional()
  @IsString()
  gratitude?: string;

  @IsOptional()
  @IsString()
  prayerToday?: string;
}
