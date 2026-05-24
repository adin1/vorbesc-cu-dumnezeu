import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MonetizationService } from '../monetization/monetization.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monetizationService: MonetizationService,
  ) {}

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
          where: { source: 'facebook' },
          select: { userId: true },
        }),
      ]);

    const facebookVisitors = acquisitionRows.length;
    const registeredSet = new Set(acquisitionRows.map((row) => row.userId).filter(Boolean));
    const facebookUserIds = Array.from(registeredSet).filter((id): id is string => Boolean(id));
    const facebookRegisteredUsers = registeredSet.size;

    const [planStartsRows, prayerPostRows] = facebookUserIds.length
      ? await Promise.all([
          this.prisma.userPlanProgress.findMany({
            where: { userId: { in: facebookUserIds } },
            select: { userId: true },
          }),
          this.prisma.prayerRequest.findMany({
            where: { userId: { in: facebookUserIds } },
            select: { userId: true },
          }),
        ])
      : [[], []];

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
      facebookVisitors,
      facebookRegisteredUsers,
      facebookUsersStartedPlan: new Set(planStartsRows.map((row) => row.userId)).size,
      facebookUsersPostedPrayerRequest: new Set(prayerPostRows.map((row) => row.userId)).size,
      refreshedAt: new Date().toISOString(),
    };
  }
}
