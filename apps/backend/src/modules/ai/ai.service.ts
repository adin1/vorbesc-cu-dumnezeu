import { Injectable } from '@nestjs/common';
import { AI_SYSTEM_PROMPT } from './ai-system-prompt';

@Injectable()
export class AiService {
  private readonly crisisKeywords = [
    'sinucid',
    'vreau sa mor',
    'nu mai vreau sa traiesc',
    'autovatamare',
    'abuz',
    'violenta',
    'depresie severa',
  ];

  chat(message: string) {
    const normalized = message.toLowerCase();
    const isCrisis = this.crisisKeywords.some((keyword) => normalized.includes(keyword));

    if (isCrisis) {
      return {
        type: 'crisis',
        guidance:
          'Îmi pare rău că treci prin asta. Siguranța ta este prioritară. Te rog contactează acum o persoană de încredere și serviciile de urgență locale (112 în România) sau o linie de criză.',
        structured: {
          warmMessage: 'Îți răspund ca un ghid spiritual inspirat de Scriptură. Nu ești singur(ă) în acest moment greu.',
          verse: 'Psalmul 34:18 - "Domnul este aproape de cei cu inima înfrântă."',
          prayer: 'Doamne, adu protecție, pace și oameni buni aproape de această persoană chiar acum.',
          reflectionQuestion: 'Pe cine poți suna chiar acum, în următoarele 5 minute, ca să fii în siguranță?',
        },
        disclaimer:
          'Răspunsurile sunt generate automat pentru sprijin spiritual și nu înlocuiesc preotul, duhovnicul, psihologul sau ajutorul de urgență.',
      };
    }

    return {
      type: 'normal',
      promptVersion: AI_SYSTEM_PROMPT,
      structured: {
        warmMessage:
          'Îți răspund ca un ghid spiritual inspirat de Scriptură. Mulțumesc că ai împărtășit ce porți în suflet.',
        verse:
          'Matei 11:28 - "Veniți la Mine, toți cei trudiți și împovărați, și Eu vă voi da odihnă."',
        prayer:
          'Doamne, dă liniște inimii mele, lumină în gânduri și încredere pentru pașii de azi. Amin.',
        reflectionQuestion:
          'Poți privi această situație prin întrebarea: care este un pas mic de credință pe care îl pot face astăzi?',
      },
      disclaimer:
        'Răspunsurile sunt generate automat pentru sprijin spiritual și nu înlocuiesc preotul, duhovnicul, psihologul sau ajutorul de urgență.',
    };
  }

  generatePrayer(topic: string) {
    return {
      topic,
      prayer: `Doamne, îți aduc înainte tema "${topic}". Dă-mi înțelepciune, pace și răbdare să merg înainte cu credință. Amin.`,
      verse: 'Proverbe 3:5-6',
      disclaimer:
        'Răspunsurile sunt generate automat pentru sprijin spiritual și nu înlocuiesc preotul, duhovnicul, psihologul sau ajutorul de urgență.',
    };
  }

  explainVerse(verse: string) {
    return {
      verse,
      explanation:
        'Un verset care poate aduce lumină este înțeles mai bine în contextul capitolului și al vieții de rugăciune. Mesajul central este să rămâi în încredere, smerenie și speranță.',
      reflectionQuestion:
        'Ce cuvânt din acest verset simți că te cheamă la acțiune astăzi?',
    };
  }
}
