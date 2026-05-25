import { ForbiddenException, Injectable, Optional } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardCacheService } from '../../common/dashboard-cache.service';
import { SocialService } from '../social/social.service';

@Injectable()
export class CommunityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardCache: DashboardCacheService,
    @Optional() private readonly socialService?: SocialService,
  ) {}

  listRequests(userId?: string) {
    return this.prisma.prayerRequest.findMany({
      where: userId
        ? {
            OR: [{ status: 'APPROVED' }, { userId }],
          }
        : { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: { supports: true },
    });
  }

  async createRequest(
    userId: string,
    content: string,
    anonymous?: boolean,
    publishMode: 'APP_ONLY' | 'FACEBOOK_PREP' = 'APP_ONLY',
  ) {
    const facebookText = `Bună! Am o cerere de rugăciune: ${content}. Mulțumesc celor care se roagă pentru mine.`;
    const created = await this.prisma.prayerRequest.create({
      data: {
        userId,
        content,
        anonymous: Boolean(anonymous),
        shareTarget: publishMode,
        facebookShareText: facebookText,
        status: 'PENDING',
      },
    });

    await (this.prisma as unknown as {
      notification?: {
        create: (args: {
          data: { userId: string; title: string; body: string };
        }) => Promise<unknown>;
      };
    }).notification?.create({
      data: {
        userId,
        title: 'Cerere trimisă spre aprobare',
        body: 'Cererea ta de rugăciune a fost salvată și va fi vizibilă public după aprobare.',
      },
    });

    this.dashboardCache.invalidateUser(userId);

    await this.socialService?.logActivity({
      platform: 'app',
      type: 'created_prayer_request',
      source: 'app',
      userId,
      metadata: {
        publishMode,
        anonymous: Boolean(anonymous),
      },
    });

    return created;
  }

  async support(userId: string, prayerRequestId: string) {
    const request = await (this.prisma.prayerRequest as unknown as {
      findUnique?: (args: { where: { id: string } }) => Promise<{ status: string } | null>;
    }).findUnique?.({ where: { id: prayerRequestId } });
    if (request === null || (request && request.status !== 'APPROVED')) {
      throw new ForbiddenException('Poți susține doar cererile aprobate.');
    }

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

  listPendingRequests() {
    return this.prisma.prayerRequest.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      include: { supports: true, user: { select: { id: true, email: true, name: true } } },
    });
  }

  moderateRequest(prayerRequestId: string, status: 'APPROVED' | 'REJECTED', moderationNote?: string) {
    return this.prisma.prayerRequest.update({
      where: { id: prayerRequestId },
      data: {
        status,
        moderationNote,
      },
    });
  }
}
