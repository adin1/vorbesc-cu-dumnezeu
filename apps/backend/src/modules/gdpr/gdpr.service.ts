import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class GdprService {
  constructor(private readonly prisma: PrismaService) {}

  async exportUserData(userId: string) {
    const [user, journal, prayerRequests, favorites, plans] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: userId } }),
      this.prisma.journalEntry.findMany({ where: { userId } }),
      this.prisma.prayerRequest.findMany({ where: { userId } }),
      this.prisma.favoriteVerse.findMany({ where: { userId } }),
      this.prisma.userPlanProgress.findMany({ where: { userId } }),
    ]);

    await this.prisma.gdprRequest.create({
      data: { userId, type: 'EXPORT', status: 'COMPLETED' },
    });

    return { user, journal, prayerRequests, favorites, plans };
  }

  async deleteAccount(userId: string) {
    await this.prisma.gdprRequest.create({
      data: { userId, type: 'DELETE_ACCOUNT', status: 'PROCESSING' },
    });

    await this.prisma.user.delete({ where: { id: userId } });

    return { success: true };
  }
}
