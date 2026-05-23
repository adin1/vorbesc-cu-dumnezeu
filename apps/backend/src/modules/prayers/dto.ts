import { IsString, MinLength } from 'class-validator';

export class GeneratePrayerRequestDto {
  @IsString()
  @MinLength(2)
  topic!: string;
}
