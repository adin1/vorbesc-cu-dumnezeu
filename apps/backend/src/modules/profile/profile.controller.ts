import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreateFavoriteVerseDto,
  UpdateProfileDto,
  UpdateSpiritualPreferenceDto,
} from './dto';
import { ProfileService } from './profile.service';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('dashboard/cache-stats')
  getDashboardCacheStats() {
    return this.profileService.getDashboardCacheStats();
  }

  @Post('dashboard/cache-stats/reset')
  resetDashboardCacheStats(@CurrentUser() user: { id: string; email: string }) {
    return this.profileService.resetDashboardCacheStats(user.id, user.email);
  }

  @Post('dashboard/cache/clear')
  clearDashboardCache(@CurrentUser() user: { id: string; email: string }) {
    return this.profileService.clearDashboardCacheForUser(user.id, user.email);
  }

  @Get('dashboard/cache/permissions')
  getDashboardCachePermissions(@CurrentUser() user: { id: string; email: string }) {
    return this.profileService.getDashboardCachePermissions(user.email);
  }

  @Post('dashboard/cache/clear-all')
  clearDashboardCacheForAll(@CurrentUser() user: { id: string; email: string }) {
    return this.profileService.clearDashboardCacheForAllUsers(user.id, user.email);
  }

  @Get('dashboard')
  getDashboard(@CurrentUser() user: { id: string }, @Query('days') days?: string) {
    const parsedDays = Number(days ?? 7);
    return this.profileService.getDashboard(user.id, Number.isNaN(parsedDays) ? 7 : parsedDays);
  }

  @Get('stats')
  getStats(@CurrentUser() user: { id: string }) {
    return this.profileService.getStats(user.id);
  }

  @Get('stats/trend')
  getTrend(@CurrentUser() user: { id: string }, @Query('days') days?: string) {
    const parsedDays = Number(days ?? 7);
    return this.profileService.getJournalTrend(user.id, Number.isNaN(parsedDays) ? 7 : parsedDays);
  }

  @Get()
  getProfile(@CurrentUser() user: { id: string }) {
    return this.profileService.getProfile(user.id);
  }

  @Patch()
  updateProfile(@CurrentUser() user: { id: string }, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateProfile(user.id, dto);
  }

  @Patch('preferences')
  updatePreferences(@CurrentUser() user: { id: string }, @Body() dto: UpdateSpiritualPreferenceDto) {
    return this.profileService.upsertSpiritualPreference(user.id, dto);
  }

  @Get('favorite-verses')
  listFavoriteVerses(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = Number(limit ?? 10);
    const parsedOffset = Number(offset ?? 0);
    return this.profileService.listFavoriteVerses(
      user.id,
      Number.isNaN(parsedLimit) ? 10 : parsedLimit,
      Number.isNaN(parsedOffset) ? 0 : parsedOffset,
    );
  }

  @Post('favorite-verses')
  addFavoriteVerse(@CurrentUser() user: { id: string }, @Body() dto: CreateFavoriteVerseDto) {
    return this.profileService.addFavoriteVerse(user.id, dto);
  }

  @Delete('favorite-verses/:id')
  deleteFavoriteVerse(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.profileService.removeFavoriteVerse(user.id, id);
  }

  @Get('saved-prayers')
  listSavedPrayers(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    const parsedLimit = Number(limit ?? 10);
    const parsedOffset = Number(offset ?? 0);
    return this.profileService.listSavedPrayers(
      user.id,
      Number.isNaN(parsedLimit) ? 10 : parsedLimit,
      Number.isNaN(parsedOffset) ? 0 : parsedOffset,
    );
  }

  @Delete('saved-prayers/:id')
  deleteSavedPrayer(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.profileService.removeSavedPrayer(user.id, id);
  }
}
