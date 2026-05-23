import { IsString, MinLength } from 'class-validator';

export class AiChatDto {
  @IsString()
  @MinLength(2)
  message!: string;
}

export class GeneratePrayerDto {
  @IsString()
  @MinLength(2)
  topic!: string;
}

export class ExplainVerseDto {
  @IsString()
  @MinLength(2)
  verse!: string;
}
