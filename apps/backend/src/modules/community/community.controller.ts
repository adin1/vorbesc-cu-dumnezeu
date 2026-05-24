import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { CreatePrayerRequestDto, ModeratePrayerRequestDto, ReportPrayerRequestDto } from './dto';
import { CommunityService } from './community.service';

@Controller('prayer-requests')
@UseGuards(JwtAuthGuard)
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get()
  list(@CurrentUser() user: { id: string }) {
    return this.communityService.listRequests(user.id);
  }

  @Post()
  create(@CurrentUser() user: { id: string }, @Body() dto: CreatePrayerRequestDto) {
    return this.communityService.createRequest(user.id, dto.content, dto.anonymous, dto.publishMode);
  }

  @Post(':id/support')
  support(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.communityService.support(user.id, id);
  }

  @Post(':id/report')
  report(@Param('id') id: string, @Body() dto: ReportPrayerRequestDto) {
    return this.communityService.report(id, dto.reason);
  }

  @Get('moderation/pending')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  listPending() {
    return this.communityService.listPendingRequests();
  }

  @Patch('moderation/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  moderate(@Param('id') id: string, @Body() dto: ModeratePrayerRequestDto) {
    return this.communityService.moderateRequest(id, dto.status, dto.moderationNote);
  }
}
