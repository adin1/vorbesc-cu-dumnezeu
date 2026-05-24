import {
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { DashboardCacheService } from '../../common/dashboard-cache.service';
import { MonetizationService } from '../monetization/monetization.service';
import {
  CreateFavoriteVerseDto,
  UpdateProfileDto,
  UpdateSpiritualPreferenceDto,
} from './dto';

@Injectable()
export class ProfileService {
  private readonly logger = new Logger(ProfileService.name);
  private readonly cacheOperationBuckets = new Map<string, { count: number; windowStart: number }>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly dashboardCache: DashboardCacheService,
    private readonly configService: ConfigService,
    private readonly monetizationService: MonetizationService,
  ) {}

  async getDashboard(userId: string, days = 7) {
    const cached = this.dashboardCache.get<{
      stats: {
        favoriteVerses: number;
        savedPrayers: number;
        unreadNotifications: number;
        journalEntries: number;
        prayerRequests: number;
      };
      trend: {
        days: number;
        items: Array<{ date: string; count: number }>;
      };
      latestNotifications: Array<{
        id: string;
        title: string;
        body: string;
        read: boolean;
        createdAt: Date;
      }>;
      recommendation: {
        title: string;
        message: string;
        verse: string;
        actionLabel: string;
        actionPath: string;
      };
      quickActions: Array<{ label: string; path: string; priority: number }>;
    }>(userId, days);

    if (cached) {
      return cached;
    }

    const [stats, trend, latestNotifications] = await Promise.all([
      this.getStats(userId),
      this.getJournalTrend(userId, days),
      this.prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 3,
      }),
    ]);

    const recommendation = this.generateRecommendation(stats);
    const quickActions = this.generateQuickActions(stats);

    const value = {
      stats,
      trend,
      latestNotifications,
      recommendation,
      quickActions,
    };

    this.dashboardCache.set(userId, days, value, 45_000);

    return value;
  }

  getDashboardCacheStats() {
    return this.dashboardCache.getStats();
  }

  resetDashboardCacheStats(currentUserId: string, currentUserEmail: string) {
    this.assertCacheOperationAllowed(currentUserId, 'reset-stats');
    const reset = this.dashboardCache.resetStats();
    this.logger.log(`Dashboard cache metrics reset by ${currentUserEmail}`);
    return reset;
  }

  clearDashboardCacheForUser(userId: string, currentUserEmail: string) {
    this.assertCacheOperationAllowed(userId, 'clear-user');
    const removed = this.dashboardCache.invalidateUser(userId);
    this.logger.log(
      `Dashboard cache cleared for user ${userId} by ${currentUserEmail}; removed entries: ${removed}`,
    );
    return {
      removed,
      stats: this.dashboardCache.getStats(),
    };
  }

  getDashboardCachePermissions(currentUserEmail: string) {
    const adminEmail = this.configService.get<string>('DASHBOARD_CACHE_ADMIN_EMAIL', '');
    const canClearAll = Boolean(adminEmail) && currentUserEmail.toLowerCase() === adminEmail.toLowerCase();
    return { canClearAll };
  }

  clearDashboardCacheForAllUsers(currentUserId: string, currentUserEmail: string) {
    this.assertCacheOperationAllowed(currentUserId, 'clear-all');

    const adminEmail = this.configService.get<string>('DASHBOARD_CACHE_ADMIN_EMAIL', '');
    if (!adminEmail || currentUserEmail.toLowerCase() !== adminEmail.toLowerCase()) {
      throw new ForbiddenException('Not allowed to clear global dashboard cache');
    }

    const removed = this.dashboardCache.clearAllEntries();
    this.logger.warn(`Dashboard cache cleared globally by ${currentUserEmail}; removed entries: ${removed}`);
    return {
      removed,
      stats: this.dashboardCache.getStats(),
    };
  }

  private assertCacheOperationAllowed(userId: string, action: string) {
    const windowMs = this.getNumberConfig('DASHBOARD_CACHE_OP_WINDOW_MS', 60_000);
    const maxOps = this.getNumberConfig('DASHBOARD_CACHE_OP_MAX_REQUESTS', 8);
    if (maxOps <= 0) {
      return;
    }

    const key = `${userId}:${action}`;
    const now = Date.now();
    const existing = this.cacheOperationBuckets.get(key);
    if (!existing || now - existing.windowStart >= windowMs) {
      this.cacheOperationBuckets.set(key, { count: 1, windowStart: now });
      this.pruneCacheOperationBuckets(now, windowMs);
      return;
    }

    if (existing.count >= maxOps) {
      throw new HttpException(
        'Too many cache operations. Please retry shortly.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    existing.count += 1;
    this.cacheOperationBuckets.set(key, existing);
  }

  private pruneCacheOperationBuckets(now: number, windowMs: number) {
    for (const [bucketKey, bucket] of this.cacheOperationBuckets.entries()) {
      if (now - bucket.windowStart >= windowMs) {
        this.cacheOperationBuckets.delete(bucketKey);
      }
    }
  }

  private getNumberConfig(key: string, fallback: number): number {
    const value = this.configService.get<string>(key);
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  }

  async getJournalTrend(userId: string, days = 7) {
    const safeDays = Math.min(Math.max(days, 1), 31);
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (safeDays - 1));

    const entries = await this.prisma.journalEntry.findMany({
      where: {
        userId,
        createdAt: { gte: start },
      },
      select: { createdAt: true },
      orderBy: { createdAt: 'asc' },
    });

    const counts = new Map<string, number>();
    for (let i = 0; i < safeDays; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      const key = date.toISOString().slice(0, 10);
      counts.set(key, 0);
    }

    for (const entry of entries) {
      const key = entry.createdAt.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }

    return {
      days: safeDays,
      items: Array.from(counts.entries()).map(([date, count]) => ({ date, count })),
    };
  }

  async getStats(userId: string) {
    const [favoriteVerses, savedPrayers, unreadNotifications, journalEntries, prayerRequests] =
      await Promise.all([
        this.prisma.favoriteVerse.count({ where: { userId } }),
        this.prisma.prayer.count({ where: { userId } }),
        this.prisma.notification.count({ where: { userId, read: false } }),
        this.prisma.journalEntry.count({ where: { userId } }),
        this.prisma.prayerRequest.count({ where: { userId } }),
      ]);

    return {
      favoriteVerses,
      savedPrayers,
      unreadNotifications,
      journalEntries,
      prayerRequests,
    };
  }

  async getProfile(userId: string) {
    const [user, monetization] = await Promise.all([
      this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        spiritualPreference: true,
        favoriteVerses: { orderBy: { createdAt: 'desc' } },
      },
      }),
      this.monetizationService.getUserMonetizationSummary(userId),
    ]);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...this.sanitizeUser(user),
      spiritualPreference:
        user.spiritualPreference ??
        ({ preferredTone: 'GENTLE', spiritualGoal: '', confession: user.denomination } as const),
      savedPrayers: (await this.listSavedPrayers(userId, 10, 0)).items,
      monetization,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
      include: { spiritualPreference: true },
    });

    this.dashboardCache.invalidateUser(userId);

    return this.sanitizeUser(user);
  }

  async upsertSpiritualPreference(userId: string, dto: UpdateSpiritualPreferenceDto) {
    const pref = await this.prisma.spiritualPreference.upsert({
      where: { userId },
      create: {
        userId,
        preferredTone: dto.preferredTone ?? 'GENTLE',
        spiritualGoal: dto.spiritualGoal ?? '',
        confession: dto.confession ?? 'GENERAL',
      },
      update: {
        ...(dto.preferredTone ? { preferredTone: dto.preferredTone } : {}),
        ...(dto.spiritualGoal ? { spiritualGoal: dto.spiritualGoal } : {}),
        ...(dto.confession ? { confession: dto.confession } : {}),
      },
    });

    if (dto.confession) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { denomination: dto.confession },
      });
    }

    this.dashboardCache.invalidateUser(userId);

    return pref;
  }

  async listFavoriteVerses(userId: string, limit = 10, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.favoriteVerse.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.favoriteVerse.count({ where: { userId } }),
    ]);

    return { items, total, limit, offset };
  }

  async addFavoriteVerse(userId: string, dto: CreateFavoriteVerseDto) {
    await this.monetizationService.ensureFavoriteVerseCapacity(userId);
    this.dashboardCache.invalidateUser(userId);
    return this.prisma.favoriteVerse.create({
      data: { userId, reference: dto.reference, text: dto.text },
    });
  }

  async removeFavoriteVerse(userId: string, verseId: string) {
    const verse = await this.prisma.favoriteVerse.findUnique({ where: { id: verseId } });
    if (!verse || verse.userId !== userId) {
      throw new NotFoundException('Favorite verse not found');
    }

    const deleted = await this.prisma.favoriteVerse.delete({
      where: { id: verseId },
    });

    this.dashboardCache.invalidateUser(userId);
    return deleted;
  }

  async listSavedPrayers(userId: string, limit = 10, offset = 0) {
    const [items, total] = await Promise.all([
      this.prisma.prayer.findMany({
        where: { userId },
        include: { category: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.prayer.count({ where: { userId } }),
    ]);

    return { items, total, limit, offset };
  }

  async removeSavedPrayer(userId: string, prayerId: string) {
    const prayer = await this.prisma.prayer.findUnique({ where: { id: prayerId } });
    if (!prayer || prayer.userId !== userId) {
      throw new NotFoundException('Saved prayer not found');
    }

    const deleted = await this.prisma.prayer.delete({ where: { id: prayerId } });
    this.dashboardCache.invalidateUser(userId);
    return deleted;
  }

  private generateRecommendation(stats: {
    favoriteVerses: number;
    savedPrayers: number;
    unreadNotifications: number;
    journalEntries: number;
    prayerRequests: number;
  }) {
    if (stats.journalEntries === 0) {
      return {
        title: 'Primul pas pentru liniște',
        message: 'Începe azi cu o intrare scurtă în jurnal, chiar și 3 rânduri.',
        verse: 'Psalmul 46:10',
        actionLabel: 'Scrie în jurnal',
        actionPath: '/journal',
      };
    }

    if (stats.unreadNotifications > 0) {
      return {
        title: 'Verifică mesajele recente',
        message: 'Ai notificări necitite care te pot ajuta să rămâi conectat.',
        verse: '1 Corinteni 14:33',
        actionLabel: 'Deschide notificările',
        actionPath: '/notifications',
      };
    }

    if (stats.savedPrayers === 0) {
      return {
        title: 'Construiește biblioteca ta de rugăciuni',
        message: 'Salvează o rugăciune care ți-a adus pace, pentru momentele grele.',
        verse: 'Filipeni 4:6-7',
        actionLabel: 'Explorează rugăciuni',
        actionPath: '/prayers',
      };
    }

    return {
      title: 'Rămâi constant în credință',
      message: 'Continuă cu un dialog scurt de reflecție pentru ziua de azi.',
      verse: 'Matei 11:28',
      actionLabel: 'Deschide chatul spiritual',
      actionPath: '/chat',
    };
  }

  private generateQuickActions(stats: {
    favoriteVerses: number;
    savedPrayers: number;
    unreadNotifications: number;
    journalEntries: number;
    prayerRequests: number;
  }) {
    const actions = [
      { label: 'Deschide chat', path: '/chat', priority: 3 },
      { label: 'Adaugă în jurnal', path: '/journal', priority: stats.journalEntries === 0 ? 1 : 4 },
      {
        label: 'Verifică notificări',
        path: '/notifications',
        priority: stats.unreadNotifications > 0 ? 2 : 6,
      },
      {
        label: 'Publică cerere comunitate',
        path: '/community',
        priority: stats.prayerRequests === 0 ? 5 : 7,
      },
    ];

    return actions.sort((a, b) => a.priority - b.priority).slice(0, 3);
  }

  private sanitizeUser(user: { passwordHash: string } & Record<string, unknown>) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
