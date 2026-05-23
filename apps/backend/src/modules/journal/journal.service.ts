import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardCacheService } from '../../common/dashboard-cache.service';
import { CreateJournalDto, UpdateJournalDto } from './dto';

@Injectable()
export class JournalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardCache: DashboardCacheService,
  ) {}

  list(userId: string) {
    return this.prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateJournalDto) {
    const created = await this.prisma.journalEntry.create({
      data: { ...dto, userId },
    });
    this.dashboardCache.invalidateUser(userId);
    return created;
  }

  async update(userId: string, id: string, dto: UpdateJournalDto) {
    const updated = await this.prisma.journalEntry.update({
      where: { id_userId: { id, userId } },
      data: dto,
    });
    this.dashboardCache.invalidateUser(userId);
    return updated;
  }

  async delete(userId: string, id: string) {
    const deleted = await this.prisma.journalEntry.delete({ where: { id_userId: { id, userId } } });
    this.dashboardCache.invalidateUser(userId);
    return deleted;
  }

  async export(userId: string) {
    const entries = await this.prisma.journalEntry.findMany({ where: { userId } });
    return {
      format: ['json', 'pdf'],
      json: entries,
      pdfPlaceholder:
        'Export PDF va fi implementat cu un motor de template (ex: pdfkit) in versiunea urmatoare.',
    };
  }
}
