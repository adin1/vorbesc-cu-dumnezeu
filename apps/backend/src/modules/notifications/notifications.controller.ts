import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const parsedLimit = Number(limit ?? 10);
    const parsedOffset = Number(offset ?? 0);
    const parsedUnreadOnly = unreadOnly === 'true';

    return this.notificationsService.listForUser(
      user.id,
      Number.isNaN(parsedLimit) ? 10 : parsedLimit,
      Number.isNaN(parsedOffset) ? 0 : parsedOffset,
      parsedUnreadOnly,
    );
  }

  @Patch(':id/read')
  markAsRead(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Patch('read-all')
  markAll(@CurrentUser() user: { id: string }) {
    return this.notificationsService.markAllAsRead(user.id);
  }
}
