import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UpdatePlanProgressDto } from './dto';
import { PlansService } from './plans.service';

@Controller('plans')
@UseGuards(JwtAuthGuard)
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  list() {
    return this.plansService.list();
  }

  @Get(':id')
  byId(@Param('id') id: string) {
    return this.plansService.byId(id);
  }

  @Post(':id/start')
  start(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.plansService.start(user.id, id);
  }

  @Patch('progress/:id')
  updateProgress(@Param('id') id: string, @Body() dto: UpdatePlanProgressDto) {
    return this.plansService.updateProgress(id, dto.dayNumber, dto.completed);
  }
}
