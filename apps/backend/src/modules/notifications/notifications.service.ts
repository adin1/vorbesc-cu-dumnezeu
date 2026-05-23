import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardCacheService } from '../../common/dashboard-cache.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardCache: DashboardCacheService,
  ) {}

  async listForUser(userId: string, limit = 10, offset = 0, unreadOnly = false) {
    const where = {
      userId,
      ...(unreadOnly ? { read: false } : {}),
    };

    const [items, total] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.notification.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  async markAsRead(userId: string, notificationId: string) {
    const notification = await this.prisma.notification.findUnique({ where: { id: notificationId } });
    if (!notification || notification.userId !== userId) {
      throw new NotFoundException('Notification not found');
    }

    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });

    this.dashboardCache.invalidateUser(userId);
    return updated;
  }

  async markAllAsRead(userId: string) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
    this.dashboardCache.invalidateUser(userId);
    return result;
  }
}
