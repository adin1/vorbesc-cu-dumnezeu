import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SpiritualGuideMessageDto } from './dto';

@Injectable()
export class SpiritualGuideService {
  constructor(private readonly prisma: PrismaService) {}

  async listMoods() {
    return this.prisma.spiritualMood.findMany({
      orderBy: { createdAt: 'asc' },
      include: { guides: true },
    });
  }

  async getDailyContent() {
    const [verses, prayers] = await Promise.all([
      this.prisma.verse.findMany({ orderBy: { createdAt: 'asc' } }),
      this.prisma.prayer.findMany({ where: { userId: null }, orderBy: { createdAt: 'asc' } }),
    ]);

    const dayIndex = Math.floor(Date.now() / 86_400_000);
    const verse = verses.length ? verses[dayIndex % verses.length] : null;
    const prayer = prayers.length ? prayers[dayIndex % prayers.length] : null;

    return {
      verseOfDay: verse
        ? `${verse.reference} - ${verse.text}`
        : 'Psalmul 46:10 - Opriți-vă și să știți că Dumnezeu este aproape.',
      prayerOfDay:
        prayer?.content ??
        'Doamne, pune pace în inima mea și călăuzește-mă cu blândețe în această zi.',
    };
  }

  async message(dto: SpiritualGuideMessageDto) {
    const moodRecord = await this.resolveMood(dto);
    if (moodRecord?.guides[0]) {
      const guide = moodRecord.guides[0];
      return {
        mood: moodRecord.name,
        warmMessage: guide.warmMessage,
        verse: guide.verse,
        prayer: guide.shortPrayer,
        reflectionQuestion: guide.reflectionQuestion,
      };
    }

    const fallback = await this.prisma.encouragementMessage.findFirst({
      where: { topic: 'General' },
      orderBy: { createdAt: 'asc' },
    });

    return {
      mood: 'General',
      warmMessage:
        fallback?.message ?? 'Un gând bun pentru tine: Dumnezeu este cu tine pas cu pas.',
      verse: 'Matei 11:28 - Veniți la Mine, toți cei trudiți și împovărați.',
      prayer:
        'Doamne, îți încredințez ce port în inimă. Dă-mi pace și încredere pentru azi.',
      reflectionQuestion: 'Care este un pas mic și bun pe care îl poți face chiar azi?',
    };
  }

  private async resolveMood(dto: SpiritualGuideMessageDto) {
    if (dto.moodId) {
      return this.prisma.spiritualMood.findUnique({
        where: { id: dto.moodId },
        include: { guides: true },
      });
    }

    const guessedSlug = this.detectMoodSlug(dto.mood ?? dto.userText ?? '');
    const moodText = (dto.mood ?? '').toLowerCase().trim();

    const mood =
      (await this.prisma.spiritualMood.findFirst({
        where: {
          OR: [
            { slug: guessedSlug },
            { slug: moodText },
            { name: { contains: dto.mood ?? '' } },
          ],
        },
        include: { guides: true },
      })) ??
      (guessedSlug
        ? await this.prisma.spiritualMood.findFirst({
            where: { slug: guessedSlug },
            include: { guides: true },
          })
        : null);

    return mood;
  }

  private detectMoodSlug(input: string) {
    const text = input.toLowerCase();

    if (text.includes('frica') || text.includes('team') || text.includes('anxiet')) {
      return 'ingrijorat';
    }

    if (text.includes('iertare') || text.includes('vina') || text.includes('greseala')) {
      return 'iertare';
    }

    if (text.includes('copii') || text.includes('familie')) {
      return 'linistit';
    }

    if (text.includes('oboseala') || text.includes('obosit') || text.includes('greu') || text.includes('nu mai pot')) {
      return 'obosit';
    }

    if (text.includes('multumesc') || text.includes('bine') || text.includes('recunosc')) {
      return 'recunoscator';
    }

    if (text.includes('curaj')) {
      return 'curaj';
    }

    if (text.includes('rabdare')) {
      return 'rabdare';
    }

    if (text.includes('trist')) {
      return 'trist';
    }

    if (text.includes('linist')) {
      return 'linistit';
    }

    return '';
  }
}
