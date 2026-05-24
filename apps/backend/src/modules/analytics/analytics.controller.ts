import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { CreateAcquisitionDto } from './dto';
import { AnalyticsService } from './analytics.service';

@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Public()
  @Post('acquisition')
  createAcquisition(@Body() dto: CreateAcquisitionDto) {
    return this.analyticsService.createAcquisition(dto);
  }
}