import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.userSubscription.deleteMany();
  await prisma.donation.deleteMany();
  await prisma.subscriptionPlan.deleteMany();
  await prisma.premiumFeature.deleteMany();
  await prisma.prayerSupport.deleteMany();
  await prisma.prayerRequest.deleteMany();
  await prisma.userPlanProgress.deleteMany();
  await prisma.spiritualPlanDay.deleteMany();
  await prisma.spiritualPlan.deleteMany();
  await prisma.journalEntry.deleteMany();
  await prisma.favoriteVerse.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.moodGuide.deleteMany();
  await prisma.spiritualMood.deleteMany();
  await prisma.encouragementMessage.deleteMany();
  await prisma.verse.deleteMany();
  await prisma.prayer.deleteMany();
  await prisma.prayerCategory.deleteMany();
  await prisma.spiritualPreference.deleteMany();
  await prisma.user.deleteMany();

  const demoPasswordHash = await bcrypt.hash('Demo1234!', 10);
  const helperPasswordHash = await bcrypt.hash('Parola123!', 10);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@vorbesc-cu-dumnezeu.ro',
      passwordHash: demoPasswordHash,
      name: 'Utilizator Demo',
      denomination: 'ORTHODOX',
      notifyDaily: true,
      notifyCommunity: true,
    },
  });

  const helperUser = await prisma.user.create({
    data: {
      email: 'sprijin@vorbesc-cu-dumnezeu.ro',
      passwordHash: helperPasswordHash,
      name: 'Echipa Sprijin',
      denomination: 'GENERAL',
    },
  });

  const premiumFeatures = [
    {
      name: 'Rugăciuni audio',
      slug: 'audio-prayers',
      description: 'Ascultă rugăciuni rostite cu ton calm, potrivite pentru liniște și reflecție.',
    },
    {
      name: 'Export PDF elegant',
      slug: 'pdf-export',
      description: 'Exportă jurnalul și reflecțiile într-un format PDF curat și ușor de păstrat.',
    },
    {
      name: 'Teme premium',
      slug: 'premium-themes',
      description: 'Schimbă atmosfera vizuală a aplicației cu teme premium discrete.',
    },
    {
      name: 'Favorite nelimitate',
      slug: 'unlimited-favorites',
      description: 'Păstrează fără limită versetele care îți vorbesc cel mai mult.',
    },
    {
      name: 'Notificări personalizate',
      slug: 'custom-notifications',
      description: 'Primește notificări adaptate ritmului tău spiritual și momentelor importante.',
    },
    {
      name: 'Profiluri de familie',
      slug: 'family-profiles',
      description: 'Organizează trasee spirituale pentru familie într-un spațiu comun și blând.',
    },
  ];

  await prisma.premiumFeature.createMany({ data: premiumFeatures });

  const subscriptionPlans = [
    {
      name: 'Gratuit',
      slug: 'gratuit',
      description: 'Accesul de bază pentru rugăciune, reflecție și comunitate.',
      priceMonthly: 0,
      features: [
        'Versetul zilei',
        'Rugăciuni de bază',
        'Jurnal simplu',
        'Comunitate',
        '3 planuri spirituale gratuite',
      ],
    },
    {
      name: 'Premium Basic',
      slug: 'premium-basic',
      description: 'Pentru cei care doresc instrumente suplimentare și un ritm spiritual mai bogat.',
      priceMonthly: 1900,
      features: [
        'Toate planurile spirituale',
        'Favorite nelimitate',
        'Teme premium',
        'Rugăciuni audio',
        'Export PDF elegant',
        'Notificări personalizate',
      ],
    },
    {
      name: 'Premium Family',
      slug: 'premium-family',
      description: 'Un spațiu comun pentru familie, cu funcții extinse și acces anticipat la noutăți.',
      priceMonthly: 3900,
      features: [
        'Toate funcțiile premium',
        'Profiluri familie',
        'Jurnal comun',
        'Planuri pentru părinți și copii',
        'Acces anticipat la funcții noi',
      ],
    },
  ];

  for (const plan of subscriptionPlans) {
    await prisma.subscriptionPlan.create({
      data: {
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        priceMonthly: plan.priceMonthly,
        features: JSON.stringify(plan.features),
      },
    });
  }

  const categories = [
    'Dimineață',
    'Seară',
    'Familie',
    'Copii',
    'Iertare',
    'Frică',
    'Liniște',
    'Recunoștință',
    'Decizii grele',
    'Sănătate',
  ];

  for (const name of categories) {
    await prisma.prayerCategory.create({ data: { name } });
  }

  const catMap = await prisma.prayerCategory.findMany();
  const categoryByName = new Map(catMap.map((item) => [item.name, item.id]));

  const prayers = [
    {
      title: 'Rugăciune pentru începutul zilei',
      content:
        'Doamne, îți mulțumesc pentru această dimineață. Pune lumină în gândurile mele și blândețe în cuvintele mele.',
      category: 'Dimineață',
    },
    {
      title: 'Rugăciune de seară pentru pace',
      content:
        'Doamne, îți încredințez tot ce n-am putut duce azi. Așază pacea Ta peste inima mea și peste casa mea.',
      category: 'Seară',
    },
    {
      title: 'Rugăciune pentru familie unită',
      content:
        'Doamne, binecuvântează familia mea cu răbdare, iertare și dragoste curată. Ajută-ne să ne purtăm unii pe alții cu grijă.',
      category: 'Familie',
    },
    {
      title: 'Rugăciune pentru copii păziți',
      content:
        'Doamne, păzește copiii noștri, luminează-le pașii și dă-le inimă curată, curaj și bucurie.',
      category: 'Copii',
    },
    {
      title: 'Rugăciune pentru iertare',
      content:
        'Doamne, vindecă locurile unde am rănit și unde am fost rănit. Dă-mi puterea să iert și să cer iertare cu smerenie.',
      category: 'Iertare',
    },
    {
      title: 'Rugăciune când apare frica',
      content:
        'Doamne, când inima mea se tulbură, amintește-mi că ești aproape. Înlocuiește frica mea cu încredere în Tine.',
      category: 'Frică',
    },
    {
      title: 'Rugăciune pentru liniște interioară',
      content:
        'Doamne, oprește graba din mine și învață-mă să respir în pacea Ta. Așază liniște în minte și odihnă în suflet.',
      category: 'Liniște',
    },
    {
      title: 'Rugăciune de recunoștință',
      content:
        'Doamne, îți mulțumesc pentru binele văzut și nevăzut. Dă-mi ochi să recunosc darurile Tale în fiecare zi.',
      category: 'Recunoștință',
    },
    {
      title: 'Rugăciune pentru decizii grele',
      content:
        'Doamne, când nu știu ce alegere să fac, dă-mi înțelepciune și pace. Închide ușile care nu sunt bune pentru mine.',
      category: 'Decizii grele',
    },
    {
      title: 'Rugăciune pentru sănătate',
      content:
        'Doamne, atinge trupul și sufletul meu cu vindecare. Întărește-mă în zilele grele și trimite oameni buni aproape.',
      category: 'Sănătate',
    },
  ];

  for (const prayer of prayers) {
    const categoryId = categoryByName.get(prayer.category);
    if (!categoryId) {
      continue;
    }

    await prisma.prayer.create({
      data: {
        title: prayer.title,
        content: prayer.content,
        categoryId,
      },
    });
  }

  const verses = [
    { reference: 'Psalmul 46:10', text: 'Opriți-vă și să știți că Eu sunt Dumnezeu.', topic: 'Liniște' },
    {
      reference: 'Filipeni 4:6-7',
      text: 'Nu vă îngrijorați de nimic... iar pacea lui Dumnezeu vă va păzi inimile.',
      topic: 'Recunoștință',
    },
    {
      reference: 'Isaia 41:10',
      text: 'Nu te teme, căci Eu sunt cu tine; nu te uita cu îngrijorare.',
      topic: 'Curaj',
    },
    {
      reference: 'Matei 11:28',
      text: 'Veniți la Mine, toți cei trudiți și împovărați, și Eu vă voi da odihnă.',
      topic: 'Oboseală',
    },
    {
      reference: 'Efeseni 4:32',
      text: 'Fiți buni unii cu alții... iertați-vă cum v-a iertat și Dumnezeu.',
      topic: 'Iertare',
    },
    {
      reference: 'Proverbe 3:5-6',
      text: 'Încrede-te în Domnul din toată inima ta.',
      topic: 'Decizii grele',
    },
  ];

  await prisma.verse.createMany({ data: verses });

  const encouragements = [
    { topic: 'General', message: 'Un gând bun pentru tine: Dumnezeu nu te uită nici în zilele grele.' },
    { topic: 'Liniște', message: 'Respiră adânc. Ești în grija lui Dumnezeu, pas cu pas.' },
    { topic: 'Iertare', message: 'Vindecarea începe când alegi iertarea, chiar dacă e greu.' },
    { topic: 'Recunoștință', message: 'Mulțumirea deschide inima spre pace.' },
  ];

  await prisma.encouragementMessage.createMany({ data: encouragements });

  const moods = [
    {
      slug: 'linistit',
      name: 'Mă simt liniștit/ă',
      warmMessage: 'Un gând bun pentru tine: păstrează această pace și oferă-o și celor din jur.',
      verse: 'Psalmul 23:1 - Domnul este Păstorul meu: nu voi duce lipsă de nimic.',
      shortPrayer: 'Doamne, îți mulțumesc pentru pacea de azi. Ajută-mă să rămân aproape de Tine.',
      reflectionQuestion: 'Cum poți împărtăși azi această liniște cu cineva drag?',
    },
    {
      slug: 'obosit',
      name: 'Mă simt obosit/ă',
      warmMessage: 'Un gând bun pentru tine: nu trebuie să duci singur(ă) totul.',
      verse: 'Matei 11:28 - Veniți la Mine, toți cei trudiți și împovărați.',
      shortPrayer: 'Doamne, întărește-mă când sunt obosit(ă) și dă-mi odihnă în inima mea.',
      reflectionQuestion: 'Ce povară ai putea lăsa azi, în rugăciune, înaintea lui Dumnezeu?',
    },
    {
      slug: 'trist',
      name: 'Mă simt trist/ă',
      warmMessage: 'Un gând bun pentru tine: chiar și în tristețe, Dumnezeu rămâne aproape.',
      verse: 'Psalmul 34:18 - Domnul este aproape de cei cu inima înfrântă.',
      shortPrayer: 'Doamne, mângâie-mi sufletul și dă-mi speranță nouă.',
      reflectionQuestion: 'Ce persoană de încredere poți chema azi aproape de tine?',
    },
    {
      slug: 'recunoscator',
      name: 'Mă simt recunoscător/recunoscătoare',
      warmMessage: 'Un gând bun pentru tine: mulțumirea păstrează inima vie și plină de lumină.',
      verse: '1 Tesaloniceni 5:18 - Mulțumiți lui Dumnezeu pentru toate lucrurile.',
      shortPrayer: 'Doamne, îți mulțumesc pentru bunătatea Ta din viața mea.',
      reflectionQuestion: 'Care sunt cele trei daruri pentru care vrei să-I mulțumești azi?',
    },
    {
      slug: 'ingrijorat',
      name: 'Mă simt îngrijorat/ă',
      warmMessage: 'Un gând bun pentru tine: Dumnezeu vede îngrijorarea ta și merge cu tine.',
      verse: 'Filipeni 4:6 - Nu vă îngrijorați de nimic, ci aduceți cererile voastre la Dumnezeu.',
      shortPrayer: 'Doamne, înlocuiește îngrijorarea mea cu pacea Ta.',
      reflectionQuestion: 'Ce grijă concretă poți transforma azi într-o rugăciune simplă?',
    },
    {
      slug: 'curaj',
      name: 'Am nevoie de curaj',
      warmMessage: 'Un gând bun pentru tine: curajul crește când alegi să faci următorul pas mic.',
      verse: 'Iosua 1:9 - Fii tare și curajos! Domnul este cu tine.',
      shortPrayer: 'Doamne, dă-mi curaj să merg înainte cu încredere.',
      reflectionQuestion: 'Care este pasul mic de curaj pe care îl poți face chiar azi?',
    },
    {
      slug: 'iertare',
      name: 'Am nevoie de iertare',
      warmMessage: 'Un gând bun pentru tine: iertarea vindecă inima, chiar dacă procesul este greu.',
      verse: 'Coloseni 3:13 - Iertați-vă unul pe altul, cum v-a iertat Hristos.',
      shortPrayer: 'Doamne, învață-mă să iert și să primesc iertarea Ta cu smerenie.',
      reflectionQuestion: 'Ce conversație sinceră te-ar ajuta să faci un pas spre iertare?',
    },
    {
      slug: 'rabdare',
      name: 'Am nevoie de răbdare',
      warmMessage: 'Un gând bun pentru tine: răbdarea este un drum, nu o performanță de o zi.',
      verse: 'Romani 12:12 - Bucurați-vă în nădejde. Fiți răbdători în necaz.',
      shortPrayer: 'Doamne, pune în mine blândețe și răbdare când lucrurile nu merg cum vreau.',
      reflectionQuestion: 'În ce relație ai nevoie azi de mai multă blândețe?',
    },
  ];

  for (const mood of moods) {
    const createdMood = await prisma.spiritualMood.create({
      data: {
        slug: mood.slug,
        name: mood.name,
      },
    });

    await prisma.moodGuide.create({
      data: {
        moodId: createdMood.id,
        warmMessage: mood.warmMessage,
        verse: mood.verse,
        shortPrayer: mood.shortPrayer,
        reflectionQuestion: mood.reflectionQuestion,
      },
    });
  }

  const plans = [
    { title: '7 zile pentru liniște', days: 7, isPremium: false, premiumTier: null },
    { title: '7 zile pentru iertare', days: 7, isPremium: false, premiumTier: null },
    { title: '7 zile de recunoștință', days: 7, isPremium: false, premiumTier: null },
    { title: '14 zile pentru vindecare sufletească', days: 14, isPremium: true, premiumTier: 'PREMIUM_BASIC' },
    { title: '30 zile cu Psalmii', days: 30, isPremium: true, premiumTier: 'PREMIUM_BASIC' },
    { title: '7 zile pentru mame', days: 7, isPremium: true, premiumTier: 'PREMIUM_FAMILY' },
    { title: '7 zile pentru adolescenți', days: 7, isPremium: true, premiumTier: 'PREMIUM_FAMILY' },
  ];

  for (const plan of plans) {
    const createdPlan = await prisma.spiritualPlan.create({
      data: {
        title: plan.title,
        description: `Plan ghidat: ${plan.title}`,
        durationDays: plan.days,
        isPremium: plan.isPremium,
        premiumTier: plan.premiumTier,
      },
    });

    for (let day = 1; day <= plan.days; day++) {
      await prisma.spiritualPlanDay.create({
        data: {
          spiritualPlanId: createdPlan.id,
          dayNumber: day,
          title: `Ziua ${day} - ${plan.title}`,
          verse: verses[day % verses.length].reference,
          explanation: 'Azi fă un pas mic cu Dumnezeu: rugăciune scurtă, un verset și un moment de liniște.',
          prayer: 'Doamne, condu-mi pașii și păstrează-mi inima aproape de Tine în această zi.',
          reflectionQuestion: 'Ce pot trăi azi, concret, din ce am citit?',
        },
      });
    }
  }

  await prisma.journalEntry.create({
    data: {
      userId: demoUser.id,
      mood: 'Mă simt îngrijorat/ă',
      burden: 'Am multe decizii de luat.',
      gratitude: 'Sunt recunoscător pentru familie.',
      prayerToday: 'Doamne, dă-mi pace și claritate.',
    },
  });

  const demoRequest = await prisma.prayerRequest.create({
    data: {
      userId: demoUser.id,
      content: 'Vă rog să vă rugați pentru sănătatea mamei mele.',
      anonymous: true,
      status: 'ACTIVE',
    },
  });

  await prisma.prayerRequest.create({
    data: {
      userId: helperUser.id,
      content: 'Rugăciune pentru pace în familie.',
      anonymous: false,
      status: 'ACTIVE',
    },
  });

  await prisma.prayerSupport.create({
    data: {
      userId: helperUser.id,
      prayerRequestId: demoRequest.id,
    },
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Bine ai venit în aplicație',
        body: 'Ne bucurăm că ești aici. Poți începe cu Ghidul spiritual sau jurnalul.',
      },
      {
        userId: demoUser.id,
        title: 'Un verset pentru azi',
        body: 'Filipeni 4:6-7 - adu îngrijorările tale înaintea lui Dumnezeu.',
      },
      {
        userId: helperUser.id,
        title: 'Cerere nouă în comunitate',
        body: 'Cineva a postat o nouă cerere de rugăciune. Intră și oferă sprijin.',
      },
      {
        userId: demoUser.id,
        title: 'Sprijin pentru comunitate',
        body: 'Dacă aplicația îți este de folos, poți susține dezvoltarea ei printr-o donație sau un plan premium.',
      },
    ],
  });

  const premiumBasicPlan = await prisma.subscriptionPlan.findUnique({ where: { slug: 'premium-basic' } });

  if (premiumBasicPlan) {
    await prisma.userSubscription.create({
      data: {
        userId: helperUser.id,
        planId: premiumBasicPlan.id,
        status: 'ACTIVE',
        provider: 'MANUAL',
        startedAt: new Date(),
      },
    });
  }

  await prisma.donation.create({
    data: {
      userId: demoUser.id,
      amount: 2500,
      currency: 'RON',
      provider: 'MANUAL',
      providerPaymentId: 'seed-donation-1',
      message: 'Mulțumesc pentru liniștea pe care o aduce aplicația.',
    },
  });

  await prisma.favoriteVerse.create({
    data: {
      userId: demoUser.id,
      reference: 'Filipeni 4:6-7',
      text: 'Pacea lui Dumnezeu va păzi inimile voastre și gândurile voastre.',
    },
  });

  const linisteCategoryId = categoryByName.get('Liniște');
  if (linisteCategoryId) {
    await prisma.prayer.create({
      data: {
        userId: demoUser.id,
        categoryId: linisteCategoryId,
        title: 'Rugăciunea mea de liniște',
        content: 'Doamne, așază pacea Ta în casa și inima mea.',
        isGenerated: false,
      },
    });
  }

  console.log('Seed complet: date reale pentru MVP încărcate cu succes.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
