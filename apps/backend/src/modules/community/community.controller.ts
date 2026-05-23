import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePrayerRequestDto, ReportPrayerRequestDto } from './dto';
import { CommunityService } from './community.service';

@Controller('prayer-requests')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  list() {
    return this.communityService.listRequests();
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreatePrayerRequestDto) {
    return this.communityService.createRequest(user.id, dto.content, dto.anonymous);
  }

  @Post(':id/support')
  support(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.communityService.support(user.id, id);
  }

  @Post(':id/report')
  report(@Param('id') id: string, @Body() dto: ReportPrayerRequestDto) {
    return this.communityService.report(id, dto.reason);
  }
}
