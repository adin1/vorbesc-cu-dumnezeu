import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AiService } from './ai.service';
import { AiChatDto, ExplainVerseDto, GeneratePrayerDto } from './dto';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  chat(@Body() dto: AiChatDto) {
    return this.aiService.chat(dto.message);
  }

  @Post('generate-prayer')
  generatePrayer(@Body() dto: GeneratePrayerDto) {
    return this.aiService.generatePrayer(dto.topic);
  }

  @Post('explain-verse')
  explainVerse(@Body() dto: ExplainVerseDto) {
    return this.aiService.explainVerse(dto.verse);
  }
}
