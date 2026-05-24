import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

type PrayerCategorySeed = {
  name: string;
  verse: string;
  reference: string;
  focus: string;
  reflection: string;
  titles: [string, string, string];
};

const prayerCategories: PrayerCategorySeed[] = [
  {
    name: 'Dimineață',
    verse: 'Bunătățile Domnului nu s-au sfârșit, îndurările Lui nu sunt la capăt.',
    reference: 'Plângerile lui Ieremia 3:22-23',
    focus: 'începutul zilei cu pace și claritate',
    reflection: 'Alege un pas mic de credință pentru ziua de azi.',
    titles: ['Dimineață de încredințare', 'Rugăciune la început de zi', 'Doamne, condu-mi pașii de azi'],
  },
  {
    name: 'Seară',
    verse: 'În pace mă culc și adorm, căci numai Tu, Doamne, îmi dai liniște deplină.',
    reference: 'Psalmul 4:8',
    focus: 'odihna inimii după o zi grea',
    reflection: 'Predă în rugăciune tot ce nu poți controla.',
    titles: ['Rugăciune de seară pentru pace', 'Doamne, îți încredințez ziua', 'Odihnă în prezența Ta'],
  },
  {
    name: 'Familie',
    verse: 'Cât despre mine, eu și casa mea vom sluji Domnului.',
    reference: 'Iosua 24:15',
    focus: 'unitate, iertare și binecuvântare în familie',
    reflection: 'Spune un cuvânt de pace în casa ta chiar azi.',
    titles: ['Binecuvântare peste familie', 'Rugăciune pentru unitatea casei', 'Dragoste și pace în familie'],
  },
  {
    name: 'Copii',
    verse: 'Lăsați copiii să vină la Mine.',
    reference: 'Marcu 10:14',
    focus: 'protecție, creștere sănătoasă și lumină pentru copii',
    reflection: 'Roagă-te pe nume pentru copiii pe care îi porți în inimă.',
    titles: ['Rugăciune pentru copiii noștri', 'Doamne, păzește copiii', 'Creștere în lumină pentru copii'],
  },
  {
    name: 'Iertare',
    verse: 'Fiți buni unii cu alții, iertându-vă unul pe altul, cum v-a iertat și Dumnezeu.',
    reference: 'Efeseni 4:32',
    focus: 'vindecarea inimii prin iertare sinceră',
    reflection: 'Fă un pas mic spre împăcare, chiar dacă e dificil.',
    titles: ['Vindecare prin iertare', 'Rugăciune pentru inimă împăcată', 'Doamne, învață-mă să iert'],
  },
  {
    name: 'Frică',
    verse: 'Nu te teme, căci Eu sunt cu tine.',
    reference: 'Isaia 41:10',
    focus: 'curaj în fața neliniștii și a incertitudinii',
    reflection: 'Amintește-ți că nu ești singur în încercare.',
    titles: ['Când frica apasă', 'Doamne, dă-mi curaj', 'Rugăciune în vreme de teamă'],
  },
  {
    name: 'Liniște',
    verse: 'Opriți-vă și să știți că Eu sunt Dumnezeu.',
    reference: 'Psalmul 46:10',
    focus: 'așezarea sufletului în pacea lui Dumnezeu',
    reflection: 'Păstrează câteva minute de tăcere în prezența Lui.',
    titles: ['Liniște în prezența Ta', 'Doamne, oprește graba din mine', 'Pace pentru minte și inimă'],
  },
  {
    name: 'Recunoștință',
    verse: 'Mulțumiți lui Dumnezeu pentru toate lucrurile.',
    reference: '1 Tesaloniceni 5:18',
    focus: 'mulțumire pentru binele văzut și nevăzut',
    reflection: 'Numește trei motive concrete de recunoștință.',
    titles: ['Rugăciune de mulțumire', 'Doamne, îți mulțumesc', 'Inimă recunoscătoare'],
  },
  {
    name: 'Decizii grele',
    verse: 'Încrede-te în Domnul din toată inima ta.',
    reference: 'Proverbe 3:5-6',
    focus: 'înțelepciune și discernământ în alegeri importante',
    reflection: 'Caută pacea înaintea grabei în decizie.',
    titles: ['Înțelepciune pentru decizii', 'Doamne, luminează-mi alegerea', 'Rugăciune când nu știu ce să aleg'],
  },
  {
    name: 'Sănătate',
    verse: 'El vindecă pe cei cu inima zdrobită și le leagă rănile.',
    reference: 'Psalmul 147:3',
    focus: 'întărire în suferință și vindecare în trup și suflet',
    reflection: 'Primește ajutorul potrivit și roagă-te cu speranță.',
    titles: ['Rugăciune pentru sănătate', 'Doamne, atinge-mă cu vindecare', 'Întărire în boală'],
  },
  {
    name: 'Nădejde',
    verse: 'Cei ce se încred în Domnul își înnoiesc puterea.',
    reference: 'Isaia 40:31',
    focus: 'ridicare în vremuri de descurajare',
    reflection: 'Privește spre viitor cu speranță, pas cu pas.',
    titles: ['Nădejde pentru mâine', 'Rugăciune când e greu', 'Doamne, ridică-mi privirea'],
  },
  {
    name: 'Protecție',
    verse: 'Domnul te va păzi de orice rău, îți va păzi sufletul.',
    reference: 'Psalmul 121:7',
    focus: 'ocrotire pentru tine și cei dragi',
    reflection: 'Încredințează-ți drumul în mâna lui Dumnezeu.',
    titles: ['Rugăciune de protecție', 'Doamne, păzește-ne casa', 'Ocrotire în fiecare pas'],
  },
];

function buildPrayerContent(focus: string, verse: string, reference: string, variation: number) {
  const opening = [
    'Doamne, vin înaintea Ta cu inimă deschisă și cu dorința sinceră de a rămâne aproape de Tine.',
    'Doamne, în liniștea acestui moment îmi ridic sufletul către Tine și îți încredințez tot ce port în inimă.',
    'Tată ceresc, mă apropii de Tine cu credință și cu nădejde, știind că Tu asculți rugăciunea copiilor Tăi.',
  ][variation % 3];

  const middle = [
    `Te rog să-mi dăruiești ${focus}. Curăță-mi gândurile, întărește-mi pașii și ajută-mă să văd binele chiar și în zilele dificile.`,
    `Așază peste mine harul Tău în ${focus}. Învață-mă să trăiesc cu blândețe, cu răbdare și cu încredere în planul Tău.`,
    `Îți cer ajutor în ${focus}. Când sunt slăbit, ridică-mă; când mă tulbur, dă-mi pace; când mă tem, amintește-mi că ești cu mine.`,
  ][variation % 3];

  return `${opening}\n\n${middle}\n\nMă sprijin pe Cuvântul Tău: "${verse}" (${reference}). Fă ca adevărul acesta să coboare în inima mea și să-mi dea putere pentru ziua de azi. Îți mulțumesc pentru credincioșia Ta și pentru iubirea Ta care nu se schimbă. Amin.`;
}

async function main() {
  await prisma.userAcquisition.deleteMany();
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
  const adminPasswordHash = await bcrypt.hash('Admin1234!', 10);
  const helperPasswordHash = await bcrypt.hash('Parola123!', 10);

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@vorbesc-cu-dumnezeu.ro',
      passwordHash: adminPasswordHash,
      name: 'Administrator VCD',
      role: 'ADMIN',
      denomination: 'GENERAL',
      notifyDaily: true,
      notifyCommunity: true,
    },
  });

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@vorbesc-cu-dumnezeu.ro',
      passwordHash: demoPasswordHash,
      name: 'Utilizator Demo',
      role: 'USER',
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
      role: 'USER',
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
      stripePriceId: null,
      features: ['Versetul zilei', 'Rugăciuni de bază', 'Jurnal simplu', 'Comunitate', '3 planuri spirituale gratuite'],
    },
    {
      name: 'Premium Basic',
      slug: 'premium-basic',
      description: 'Pentru cei care doresc instrumente suplimentare și un ritm spiritual mai bogat.',
      priceMonthly: 1900,
      stripePriceId: null,
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
      stripePriceId: null,
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
        stripePriceId: plan.stripePriceId,
        features: JSON.stringify(plan.features),
      },
    });
  }

  for (const category of prayerCategories) {
    await prisma.prayerCategory.create({ data: { name: category.name } });
  }

  const catMap = await prisma.prayerCategory.findMany();
  const categoryByName = new Map(catMap.map((item) => [item.name, item.id]));

  for (const category of prayerCategories) {
    const categoryId = categoryByName.get(category.name);
    if (!categoryId) {
      continue;
    }

    for (let i = 0; i < category.titles.length; i += 1) {
      await prisma.prayer.create({
        data: {
          categoryId,
          title: category.titles[i],
          bibleVerse: category.verse,
          bibleReference: category.reference,
          shortReflection: category.reflection,
          content: buildPrayerContent(category.focus, category.verse, category.reference, i),
          isPremium: false,
        },
      });
    }
  }

  const verses = prayerCategories.map((item) => ({
    reference: item.reference,
    text: item.verse,
    topic: item.name,
  }));

  await prisma.verse.createMany({ data: verses });

  await prisma.encouragementMessage.createMany({
    data: [
      { topic: 'General', message: 'Un gând bun pentru tine: Dumnezeu nu te uită nici în zilele grele.' },
      { topic: 'Liniște', message: 'Respiră adânc. Ești în grija lui Dumnezeu, pas cu pas.' },
      { topic: 'Iertare', message: 'Vindecarea începe când alegi iertarea, chiar dacă e greu.' },
      { topic: 'Recunoștință', message: 'Mulțumirea deschide inima spre pace.' },
    ],
  });

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
      slug: 'ingrijorat',
      name: 'Mă simt îngrijorat/ă',
      warmMessage: 'Un gând bun pentru tine: Dumnezeu vede îngrijorarea ta și merge cu tine.',
      verse: 'Filipeni 4:6 - Nu vă îngrijorați de nimic, ci aduceți cererile voastre la Dumnezeu.',
      shortPrayer: 'Doamne, înlocuiește îngrijorarea mea cu pacea Ta.',
      reflectionQuestion: 'Ce grijă concretă poți transforma azi într-o rugăciune simplă?',
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
    { title: '7 zile pentru liniște', days: 7, premiumTier: null, descriptionTag: 'Liniște' },
    { title: '7 zile pentru iertare', days: 7, premiumTier: null, descriptionTag: 'Iertare' },
    { title: '7 zile de recunoștință', days: 7, premiumTier: null, descriptionTag: 'Recunoștință' },
    { title: '14 zile pentru vindecare sufletească', days: 14, premiumTier: 'PREMIUM_BASIC', descriptionTag: 'Vindecare sufletească' },
    { title: '30 zile cu Psalmii', days: 30, premiumTier: 'PREMIUM_BASIC', descriptionTag: 'Psalmi' },
    { title: '7 zile pentru mame', days: 7, premiumTier: 'PREMIUM_FAMILY', descriptionTag: 'Mame' },
    { title: '7 zile pentru adolescenți', days: 7, premiumTier: 'PREMIUM_FAMILY', descriptionTag: 'Adolescenți' },
    { title: '7 zile pentru curaj', days: 7, premiumTier: null, descriptionTag: 'Curaj' },
    { title: '7 zile pentru decizii grele', days: 7, premiumTier: null, descriptionTag: 'Decizii grele' },
  ];

  for (const plan of plans) {
    const createdPlan = await prisma.spiritualPlan.create({
      data: {
        title: plan.title,
        description: `Plan ghidat pentru ${plan.descriptionTag}. Potrivit pentru cei care doresc pași clari, zilnici și practici.`,
        durationDays: plan.days,
        isPremium: Boolean(plan.premiumTier),
        premiumTier: plan.premiumTier,
      },
    });

    for (let day = 1; day <= plan.days; day += 1) {
      const verse = verses[day % verses.length];
      await prisma.spiritualPlanDay.create({
        data: {
          spiritualPlanId: createdPlan.id,
          dayNumber: day,
          title: `Ziua ${day} - ${plan.descriptionTag}`,
          verse: `${verse.reference} - ${verse.text}`,
          explanation: 'Azi fă un pas simplu: citește versetul, rostește rugăciunea și notează o decizie concretă.',
          prayer: 'Doamne, călăuzește-mi pașii de azi, dă-mi răbdare și păstrează-mi inima aproape de Tine.',
          reflectionQuestion: 'Ce pas concret de credință aleg să fac astăzi?',
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
      shareTarget: 'APP_ONLY',
      facebookShareText: 'Bună! Am o cerere de rugăciune: Vă rog să vă rugați pentru sănătatea mamei mele. Mulțumesc celor care se roagă pentru mine.',
      status: 'APPROVED',
    },
  });

  await prisma.prayerRequest.create({
    data: {
      userId: helperUser.id,
      content: 'Rugăciune pentru pace în familie și înțelepciune în dialog.',
      anonymous: false,
      shareTarget: 'FACEBOOK_PREP',
      facebookShareText: 'Bună! Am o cerere de rugăciune: Rugăciune pentru pace în familie și înțelepciune în dialog. Mulțumesc celor care se roagă pentru mine.',
      status: 'PENDING',
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
        userId: adminUser.id,
        title: 'Moderare comunitate',
        body: 'Ai cereri noi care așteaptă aprobare în zona Admin.',
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

  await prisma.userAcquisition.createMany({
    data: [
      {
        userId: demoUser.id,
        source: 'facebook',
        medium: 'group',
        campaign: 'comunitate',
        landingPage: '/',
        referrer: 'https://www.facebook.com/groups/vorbestecudumnezeu',
        firstVisitAt: new Date(),
      },
      {
        source: 'facebook',
        medium: 'group',
        campaign: 'comunitate',
        landingPage: '/comunitate',
        referrer: 'https://www.facebook.com/groups/vorbestecudumnezeu',
        firstVisitAt: new Date(),
      },
    ],
  });

  await prisma.favoriteVerse.create({
    data: {
      userId: demoUser.id,
      reference: 'Filipeni 4:6-7',
      text: 'Pacea lui Dumnezeu va păzi inimile voastre și gândurile voastre.',
    },
  });

  console.log('Seed complet: roluri, rugăciuni biblice extinse, planuri și comunitate actualizate.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
