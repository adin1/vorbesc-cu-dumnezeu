import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { CreateSocialActivityDto } from './social.dto';

@Injectable()
export class SocialService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  isTrackingEnabled() {
    return this.configService.get<string>('SOCIAL_TRACKING_ENABLED', 'true') !== 'false';
  }

  async logActivity(dto: CreateSocialActivityDto) {
    if (!this.isTrackingEnabled()) {
      return { skipped: true };
    }

    return this.prisma.socialActivityLog.create({
      data: {
        platform: dto.platform,
        type: dto.type,
        campaign: dto.campaign,
        source: dto.source,
        userId: dto.userId,
        metadata: dto.metadata ? JSON.stringify(dto.metadata) : undefined,
      },
    });
  }

  async getHubConfig() {
    const appUrl = this.configService.get<string>('NEXT_PUBLIC_APP_URL', 'https://vorbeste-cu-dumnezeu.vercel.app');
    return {
      trackingEnabled: this.isTrackingEnabled(),
      appUrl,
      tiktokUrl:
        this.configService.get<string>('NEXT_PUBLIC_TIKTOK_URL', 'https://www.tiktok.com/@vorbestecudumnezeu') ||
        'https://www.tiktok.com/@vorbestecudumnezeu',
      facebookUrl: this.configService.get<string>('NEXT_PUBLIC_FACEBOOK_GROUP_URL', ''),
      ctas: {
        tiktok: 'Urmărește-ne pe TikTok',
        facebook: 'Intră în comunitatea Facebook',
        support: 'Susține comunitatea',
      },
      utmRules: {
        tiktok: ['bio', 'video', 'comment', 'landing'],
        facebook: ['group', 'post', 'landing'],
      },
    };
  }

  private formatDailySeries(
    rows: Array<{ createdAt: Date; source: string | null | undefined }>,
    source?: string,
    days = 14,
  ) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const buckets = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      buckets.set(d.toISOString().slice(0, 10), 0);
    }

    for (const row of rows) {
      if (source && row.source !== source) {
        continue;
      }
      const key = row.createdAt.toISOString().slice(0, 10);
      if (buckets.has(key)) {
        buckets.set(key, (buckets.get(key) || 0) + 1);
      }
    }

    return Array.from(buckets.entries()).map(([date, count]) => ({ date, count }));
  }

  private mapTopCampaigns(
    rows: Array<{ source: string; campaign: string | null }>,
    source: 'tiktok' | 'facebook',
  ) {
    const campaignMap = new Map<string, number>();
    for (const row of rows) {
      if (row.source !== source) {
        continue;
      }
      const key = row.campaign || 'unknown';
      campaignMap.set(key, (campaignMap.get(key) || 0) + 1);
    }

    return Array.from(campaignMap.entries())
      .map(([campaign, visitors]) => ({ campaign, visitors }))
      .sort((a, b) => b.visitors - a.visitors)
      .slice(0, 5);
  }

  async getGrowthDashboard() {
    const [
      users,
      acquisitions,
      activities,
      donations,
      subscriptions,
      plans,
      prayerRequests,
    ] = await Promise.all([
      this.prisma.user.findMany({ select: { id: true, createdAt: true, updatedAt: true } }),
      this.prisma.userAcquisition.findMany({
        select: {
          source: true,
          medium: true,
          campaign: true,
          createdAt: true,
          userId: true,
        },
      }),
      this.prisma.socialActivityLog.findMany({
        select: {
          platform: true,
          type: true,
          source: true,
          createdAt: true,
          userId: true,
        },
      }),
      this.prisma.donation.findMany({ select: { amount: true, userId: true } }),
      this.prisma.userSubscription.findMany({
        where: { status: { in: ['ACTIVE', 'PAST_DUE', 'INCOMPLETE'] } },
        select: { userId: true },
      }),
      this.prisma.userPlanProgress.findMany({ select: { userId: true } }),
      this.prisma.prayerRequest.findMany({ select: { userId: true } }),
    ]);

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const dau = users.filter((u) => now - u.updatedAt.getTime() <= dayMs).length;
    const wau = users.filter((u) => now - u.updatedAt.getTime() <= 7 * dayMs).length;

    const cohortUsers = users.filter((u) => now - u.createdAt.getTime() <= 30 * dayMs);
    const retained = cohortUsers.filter((u) => u.updatedAt.getTime() - u.createdAt.getTime() >= dayMs).length;
    const retention = cohortUsers.length ? retained / cohortUsers.length : 0;

    const tiktokUserIds = new Set(
      acquisitions.filter((a) => a.source === 'tiktok' && a.userId).map((a) => a.userId as string),
    );
    const facebookUserIds = new Set(
      acquisitions.filter((a) => a.source === 'facebook' && a.userId).map((a) => a.userId as string),
    );

    const premiumUserIds = new Set(subscriptions.map((s) => s.userId));
    const planUserIds = new Set(plans.map((p) => p.userId));
    const prayerUserIds = new Set(prayerRequests.map((p) => p.userId));

    const tiktokDonations = donations
      .filter((d) => d.userId && tiktokUserIds.has(d.userId))
      .reduce((sum, d) => sum + d.amount, 0);

    const facebookDonations = donations
      .filter((d) => d.userId && facebookUserIds.has(d.userId))
      .reduce((sum, d) => sum + d.amount, 0);

    const topCampaigns = {
      tiktok: this.mapTopCampaigns(acquisitions, 'tiktok'),
      facebook: this.mapTopCampaigns(acquisitions, 'facebook'),
    };

    const trafficDaily = this.formatDailySeries(
      acquisitions.map((a) => ({ createdAt: a.createdAt, source: a.source })),
      undefined,
      14,
    );
    const tiktokDaily = this.formatDailySeries(
      acquisitions.map((a) => ({ createdAt: a.createdAt, source: a.source })),
      'tiktok',
      14,
    );
    const facebookDaily = this.formatDailySeries(
      acquisitions.map((a) => ({ createdAt: a.createdAt, source: a.source })),
      'facebook',
      14,
    );

    const startedPlanFromTikTok = Array.from(tiktokUserIds).filter((id) => planUserIds.has(id)).length;
    const startedPlanFromFacebook = Array.from(facebookUserIds).filter((id) => planUserIds.has(id)).length;
    const premiumFromTikTok = Array.from(tiktokUserIds).filter((id) => premiumUserIds.has(id)).length;
    const premiumFromFacebook = Array.from(facebookUserIds).filter((id) => premiumUserIds.has(id)).length;

    const tiktokVisitors = acquisitions.filter((a) => a.source === 'tiktok').length;
    const facebookVisitors = acquisitions.filter((a) => a.source === 'facebook').length;

    return {
      tiktok: {
        visitors: tiktokVisitors,
        registrations: tiktokUserIds.size,
        premiumConversions: premiumFromTikTok,
        donations: tiktokDonations,
        topCampaigns: topCampaigns.tiktok,
      },
      facebook: {
        visitors: facebookVisitors,
        registrations: facebookUserIds.size,
        prayerRequests: Array.from(facebookUserIds).filter((id) => prayerUserIds.has(id)).length,
        startedPlans: startedPlanFromFacebook,
        premiumConversions: premiumFromFacebook,
        donations: facebookDonations,
        topCampaigns: topCampaigns.facebook,
      },
      app: {
        totalActiveUsers: users.length,
        dau,
        wau,
        retention,
        conversionRates: {
          tiktokToRegistration: tiktokVisitors ? tiktokUserIds.size / tiktokVisitors : 0,
          tiktokToPremium: tiktokUserIds.size ? premiumFromTikTok / tiktokUserIds.size : 0,
          facebookToRegistration: facebookVisitors ? facebookUserIds.size / facebookVisitors : 0,
          facebookToPremium: facebookUserIds.size ? premiumFromFacebook / facebookUserIds.size : 0,
        },
      },
      charts: {
        dailyTraffic: trafficDaily,
        sourceComparison: {
          tiktok: tiktokDaily,
          facebook: facebookDaily,
        },
        conversionFunnel: {
          tiktok: {
            visitors: tiktokVisitors,
            registrations: tiktokUserIds.size,
            startedPlans: startedPlanFromTikTok,
            premium: premiumFromTikTok,
          },
          facebook: {
            visitors: facebookVisitors,
            registrations: facebookUserIds.size,
            startedPlans: startedPlanFromFacebook,
            premium: premiumFromFacebook,
          },
        },
      },
      activity: {
        totalEvents: activities.length,
        latest: activities.slice(-20).reverse(),
      },
      generatedAt: new Date().toISOString(),
    };
  }

  async exportGrowthCsv(source?: string, from?: string, to?: string) {
    const fromDate = from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const toDate = to ? new Date(to) : new Date();

    const acquisitions = await this.prisma.userAcquisition.findMany({
      where: {
        createdAt: { gte: fromDate, lte: toDate },
        ...(source ? { source } : {}),
      },
      select: {
        source: true,
        medium: true,
        campaign: true,
        landingPage: true,
        userId: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 5000,
    });

    const lines = [
      'date,source,medium,campaign,landingPage,userId,eventType',
      ...acquisitions.map((a) =>
        [
          a.createdAt.toISOString(),
          a.source,
          a.medium || '',
          a.campaign || '',
          a.landingPage || '',
          a.userId || '',
          'acquisition',
        ]
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(','),
      ),
    ];

    return lines.join('\n');
  }
}
