import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GeneratePrayerRequestDto } from './dto';
import { PrayersService } from './prayers.service';

@Controller('prayers')
@UseGuards(JwtAuthGuard)
export class PrayersController {
  constructor(private readonly prayersService: PrayersService) {}

  @Get()
  list() {
    return this.prayersService.list();
  }

  @Get('categories')
  categories() {
    return this.prayersService.categories();
  }

  @Post('generate')
  generate(@Body() dto: GeneratePrayerRequestDto) {
    return this.prayersService.generate(dto.topic);
  }

  @Post(':id/save')
  savePrayer(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.prayersService.savePrayerForUser(user.id, id);
  }
}
