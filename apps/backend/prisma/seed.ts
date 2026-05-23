import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    'dimineata',
    'seara',
    'familie',
    'copii',
    'iertare',
    'frica',
    'boala',
    'recunostinta',
    'decizii grele',
  ];

  for (const name of categories) {
    await prisma.prayerCategory.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const catMap = await prisma.prayerCategory.findMany();
  const byName = new Map(catMap.map((c) => [c.name, c.id]));

  const prayers = [
    {
      title: 'Rugaciune de dimineata',
      content: 'Doamne, iti multumesc pentru aceasta zi. Calauzeste-mi pasii in pace.',
      category: 'dimineata',
    },
    {
      title: 'Rugaciune de seara',
      content: 'Doamne, iti incredintez aceasta noapte. Daruieste odihna si vindecare inimii mele.',
      category: 'seara',
    },
    {
      title: 'Rugaciune pentru familie',
      content: 'Doamne, binecuvanteaza familia mea cu unitate, rabdare si dragoste curata.',
      category: 'familie',
    },
  ];

  for (const prayer of prayers) {
    const categoryId = byName.get(prayer.category);
    if (!categoryId) continue;

    await prisma.prayer.create({
      data: {
        title: prayer.title,
        content: prayer.content,
        categoryId,
      },
    });
  }

  const plans = [
    { title: '7 zile pentru liniste', days: 7 },
    { title: '7 zile pentru iertare', days: 7 },
    { title: '14 zile pentru vindecare sufleteasca', days: 14 },
    { title: '30 zile cu Psalmii', days: 30 },
    { title: '7 zile pentru mame', days: 7 },
    { title: '7 zile pentru adolescenti', days: 7 },
  ];

  for (const plan of plans) {
    const created = await prisma.spiritualPlan.create({
      data: {
        title: plan.title,
        description: `Plan spiritual: ${plan.title}`,
        durationDays: plan.days,
      },
    });

    for (let day = 1; day <= plan.days; day++) {
      await prisma.spiritualPlanDay.create({
        data: {
          spiritualPlanId: created.id,
          dayNumber: day,
          title: `Ziua ${day}`,
          verse: 'Psalmul 46:10',
          explanation: 'Ramai in liniste inaintea lui Dumnezeu si observa lucrarea Lui.',
          prayer: 'Doamne, invata-ma sa caut pacea Ta in aceasta zi.',
          reflectionQuestion: 'Ce pas concret de credinta pot face astazi?',
        },
      });
    }
  }

  console.log('Seed complete');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
