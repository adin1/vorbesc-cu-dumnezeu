import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MonetizationService } from '../monetization/monetization.service';

type SourceMetrics = {
  visitors: number;
  registeredUsers: number;
  userIds: string[];
};

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monetizationService: MonetizationService,
  ) {}

  private computeSourceMetrics(
    source: 'facebook' | 'tiktok',
    rows: Array<{ source: string; userId: string | null }>,
  ): SourceMetrics {
    const sourceRows = rows.filter((row) => row.source === source);
    const userIds = Array.from(new Set(sourceRows.map((row) => row.userId).filter(Boolean))) as string[];
    return {
      visitors: sourceRows.length,
      registeredUsers: userIds.length,
      userIds,
    };
  }

  async metrics() {
    const [users, prayers, journalEntries, prayerRequests, activePlanRows, monetization, acquisitionRows] =
      await Promise.all([
        this.prisma.user.count(),
        this.prisma.prayer.count({ where: { userId: null } }),
        this.prisma.journalEntry.count(),
        this.prisma.prayerRequest.count(),
        this.prisma.userPlanProgress.findMany({
          where: { completed: false },
          distinct: ['planId'],
          select: { planId: true },
        }),
        this.monetizationService.getAdminMonetizationMetrics(),
        this.prisma.userAcquisition.findMany({
          where: { source: { in: ['facebook', 'tiktok'] } },
          select: { source: true, userId: true },
        }),
      ]);

    const facebookMetrics = this.computeSourceMetrics('facebook', acquisitionRows);
    const tiktokMetrics = this.computeSourceMetrics('tiktok', acquisitionRows);

    const [facebookPlanStartsRows, facebookPrayerPostRows] = facebookMetrics.userIds.length
      ? await Promise.all([
          this.prisma.userPlanProgress.findMany({
            where: { userId: { in: facebookMetrics.userIds } },
            select: { userId: true },
          }),
          this.prisma.prayerRequest.findMany({
            where: { userId: { in: facebookMetrics.userIds } },
            select: { userId: true },
          }),
        ])
      : [[], []];

    const [tiktokPlanStartsRows, tiktokPremiumRows, tiktokDonationAgg] = tiktokMetrics.userIds.length
      ? await Promise.all([
          this.prisma.userPlanProgress.findMany({
            where: { userId: { in: tiktokMetrics.userIds } },
            select: { userId: true },
          }),
          this.prisma.userSubscription.findMany({
            where: { userId: { in: tiktokMetrics.userIds }, status: 'ACTIVE' },
            select: { userId: true },
          }),
          this.prisma.donation.aggregate({
            where: { userId: { in: tiktokMetrics.userIds } },
            _sum: { amount: true },
          }),
        ])
      : [[], [], { _sum: { amount: 0 } }];

    const tiktokPremiumUsers = new Set(tiktokPremiumRows.map((row) => row.userId)).size;
    const tiktokPlanStarts = new Set(tiktokPlanStartsRows.map((row) => row.userId)).size;
    const tiktokToPremiumConversion =
      tiktokMetrics.registeredUsers > 0 ? tiktokPremiumUsers / tiktokMetrics.registeredUsers : 0;
    const tiktokDonationTotal = tiktokDonationAgg._sum.amount ?? 0;

    return {
      users,
      prayers,
      journalEntries,
      prayerRequests,
      activePlans: activePlanRows.length,
      totalDonations: monetization.totalDonations,
      totalSubscriptions: monetization.totalSubscriptions,
      estimatedMonthlyRevenue: monetization.estimatedMonthlyRevenue,
      premiumUsers: monetization.premiumUsers,
      activeMonetizationPlans: monetization.activePlanBreakdown,
      facebookVisitors: facebookMetrics.visitors,
      facebookRegisteredUsers: facebookMetrics.registeredUsers,
      facebookUsersStartedPlan: new Set(facebookPlanStartsRows.map((row) => row.userId)).size,
      facebookUsersPostedPrayerRequest: new Set(facebookPrayerPostRows.map((row) => row.userId)).size,
      tiktokVisitors: tiktokMetrics.visitors,
      tiktokRegisteredUsers: tiktokMetrics.registeredUsers,
      tiktokDonations: tiktokDonationTotal,
      tiktokPremiumUsers,
      tiktokUsersStartedPlan: tiktokPlanStarts,
      tiktokToPremiumConversion,
      refreshedAt: new Date().toISOString(),
    };
  }
}
