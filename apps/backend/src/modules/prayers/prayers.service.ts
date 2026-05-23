import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { DashboardCacheService } from '../../common/dashboard-cache.service';
import { SaveGeneratedPrayerDto } from './dto';

@Injectable()
export class PrayersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardCache: DashboardCacheService,
  ) {}

  categories() {
    return this.prisma.prayerCategory.findMany({ orderBy: { name: 'asc' } });
  }

  list() {
    return this.prisma.prayer.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  generate(topic: string) {
    return {
      topic,
      prayer:
        'Doamne, în această zi îți încredințez acest gând. Lucrează în inima mea cu pace, răbdare și înțelepciune. Amin.',
      suggestion: 'Recitește Psalmul 23 și stai 3 minute în liniște.',
    };
  }

  async saveGeneratedPrayerForUser(userId: string, dto: SaveGeneratedPrayerDto) {
    const category = await this.prisma.prayerCategory.upsert({
      where: { name: 'Personalizata' },
      update: {},
      create: { name: 'Personalizata' },
    });

    const created = await this.prisma.prayer.create({
      data: {
        userId,
        categoryId: category.id,
        title: `Rugaciune personalizata - ${dto.topic}`,
        content: dto.prayer,
        isGenerated: true,
      },
      include: { category: true },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Rugaciune generata salvata',
        body: `Rugaciunea pentru tema "${dto.topic}" a fost adaugata in profilul tau.`,
      },
    });

    this.dashboardCache.invalidateUser(userId);

    return created;
  }

  async savePrayerForUser(userId: string, prayerId: string) {
    const prayer = await this.prisma.prayer.findUnique({ where: { id: prayerId } });
    if (!prayer) {
      throw new NotFoundException('Prayer not found');
    }

    const created = await this.prisma.prayer.create({
      data: {
        userId,
        categoryId: prayer.categoryId,
        title: prayer.title,
        content: prayer.content,
        isGenerated: prayer.isGenerated,
      },
      include: { category: true },
    });

    await this.prisma.notification.create({
      data: {
        userId,
        title: 'Rugăciune salvată',
        body: `Rugăciunea "${created.title}" a fost adăugată în profilul tău.`,
      },
    });

    this.dashboardCache.invalidateUser(userId);

    return created;
  }
}
