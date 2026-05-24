import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { MonetizationService } from '../monetization/monetization.service';

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly monetizationService: MonetizationService,
  ) {}

  async list(userId: string) {
    const plans = await this.prisma.spiritualPlan.findMany({
      include: { days: true },
      orderBy: { durationDays: 'asc' },
    });

    return Promise.all(
      plans.map(async (plan) => ({
        ...plan,
        locked: plan.isPremium ? !(await this.canAccessPlan(userId, plan.premiumTier)) : false,
      })),
    );
  }

  async byId(userId: string, id: string) {
    const plan = await this.prisma.spiritualPlan.findUnique({
      where: { id },
      include: { days: { orderBy: { dayNumber: 'asc' } } },
    });

    if (!plan) {
      return null;
    }

    return {
      ...plan,
      locked: plan.isPremium ? !(await this.canAccessPlan(userId, plan.premiumTier)) : false,
    };
  }

  async start(userId: string, planId: string) {
    await this.monetizationService.assertPlanAccess(userId, planId);
    return this.prisma.userPlanProgress.create({
      data: {
        userId,
        planId,
        dayNumber: 1,
        completed: false,
      },
    });
  }

  updateProgress(progressId: string, dayNumber: number, completed = true) {
    return this.prisma.userPlanProgress.update({
      where: { id: progressId },
      data: { dayNumber, completed },
    });
  }

  private async canAccessPlan(userId: string, premiumTier: string | null) {
    if (!premiumTier) {
      return true;
    }

    const featureSlug = premiumTier === 'PREMIUM_FAMILY' ? 'family-profiles' : 'audio-prayers';
    return this.monetizationService.hasFeatureAccess(userId, featureSlug);
  }
}
