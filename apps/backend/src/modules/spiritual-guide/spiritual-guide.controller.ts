import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SpiritualGuideMessageDto } from './dto';
import { SpiritualGuideService } from './spiritual-guide.service';

@Controller('spiritual-guide')
@UseGuards(JwtAuthGuard)
export class SpiritualGuideController {
  constructor(private readonly spiritualGuideService: SpiritualGuideService) {}

  @Get('moods')
  moods() {
    return this.spiritualGuideService.listMoods();
  }

  @Get('daily')
  daily() {
    return this.spiritualGuideService.getDailyContent();
  }

  @Post('message')
  message(@Body() dto: SpiritualGuideMessageDto) {
    return this.spiritualGuideService.message(dto);
  }
}
