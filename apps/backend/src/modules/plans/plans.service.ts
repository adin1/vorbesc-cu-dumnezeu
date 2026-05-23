import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class PlansService {
  constructor(private readonly prisma: PrismaService) {}

  list() {
    return this.prisma.spiritualPlan.findMany({
      include: { days: true },
      orderBy: { durationDays: 'asc' },
    });
  }

  byId(id: string) {
    return this.prisma.spiritualPlan.findUnique({
      where: { id },
      include: { days: { orderBy: { dayNumber: 'asc' } } },
    });
  }

  start(userId: string, planId: string) {
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
}
