import { IsOptional, IsString, MinLength } from 'class-validator';

export class SpiritualGuideMessageDto {
  @IsOptional()
  @IsString()
  moodId?: string;

  @IsOptional()
  @IsString()
  mood?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  userText?: string;
}
