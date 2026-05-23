import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardCacheService } from '../../common/dashboard-cache.service';

@Injectable()
export class CommunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardCache: DashboardCacheService,
  ) {}

  listRequests() {
    return this.prisma.prayerRequest.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { createdAt: 'desc' },
      include: { supports: true },
    });
  }

  async createRequest(userId: string, content: string, anonymous?: boolean) {
    const created = await this.prisma.prayerRequest.create({
      data: { userId, content, anonymous: Boolean(anonymous) },
    });
    this.dashboardCache.invalidateUser(userId);
    return created;
  }

  support(userId: string, prayerRequestId: string) {
    return this.prisma.prayerSupport.upsert({
      where: { userId_prayerRequestId: { userId, prayerRequestId } },
      create: { userId, prayerRequestId },
      update: {},
    });
  }

  report(prayerRequestId: string, reason: string) {
    return this.prisma.prayerRequest.update({
      where: { id: prayerRequestId },
      data: { moderationNote: reason, status: 'REPORTED' },
    });
  }
}
