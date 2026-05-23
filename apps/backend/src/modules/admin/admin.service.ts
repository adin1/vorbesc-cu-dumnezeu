import { ForbiddenException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async metrics(userEmail: string) {
    this.assertAdmin(userEmail);

    const [users, prayers, journalEntries, prayerRequests, activePlanRows] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.prayer.count({ where: { userId: null } }),
      this.prisma.journalEntry.count(),
      this.prisma.prayerRequest.count(),
      this.prisma.userPlanProgress.findMany({
        where: { completed: false },
        distinct: ['planId'],
        select: { planId: true },
      }),
    ]);

    return {
      users,
      prayers,
      journalEntries,
      prayerRequests,
      activePlans: activePlanRows.length,
      refreshedAt: new Date().toISOString(),
    };
  }

  private assertAdmin(userEmail: string) {
    const adminEmail = this.configService.get<string>('DASHBOARD_CACHE_ADMIN_EMAIL', '');
    if (!adminEmail || userEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      throw new ForbiddenException('Nu ai permisiunea pentru zona de administrare.');
    }
  }
}
