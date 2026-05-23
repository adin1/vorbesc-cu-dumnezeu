import { IsOptional, IsString, MinLength } from 'class-validator';

export class CreatePrayerRequestDto {
  @IsString()
  @MinLength(3)
  content!: string;

  @IsOptional()
  anonymous?: boolean;
}

export class ReportPrayerRequestDto {
  @IsString()
  @MinLength(3)
  reason!: string;
}
