import { DomainStrings } from './types';

export const onboardingDomainStrings: DomainStrings = {
  tr: {
    onboardingFlow: {
      slides: {
        dreamTitle: 'Bu Hayatta Hayalin',
        requirementTitle: 'Bunun icin gereken:',
        requirementFallback: 'Temel statlarini gelistir',
        continue: 'Devam Et',
        back: 'Geri Don',
        skip: 'Atla',
        next: 'Devam',
        startLife: 'Hayatina Basla',
        introLine: 'Bir hayat baslayacak...',
        introBody: 'Dogumdan mezuniyete, her ani senin secimlerin belirleyecek.',
        choiceHeader: 'Her secim seni degistirir',
        choicePrompt: 'Arkadasin seni disari cagiriyor. Ne yaparsin?',
        choiceStudy: 'Ders calisirim',
        choiceSocial: 'Arkadaslarla bulusurum',
        choiceStudyResult: 'Zekan artti! Ama sosyal hayatin biraz geriledi.',
        choiceSocialResult: 'Karizma artti! Ama derslerden geri kaldin.',
        outroBody: 'Hayat simulasyonunda kararlar ver, karakterini olustur, kaderini belirle.',
      },
      cohorts: {
        SOCIALIZER: {
          label: 'Sosyal Kelebek',
          message: 'Sosyal yonun cok guclu! Arkadasliklar kurarak ilerle.',
        },
        SCHOLAR: {
          label: 'Akademisyen',
          message: 'Akademik yetenegin parliyor! Ders calismaya devam et.',
        },
        STRIVER: {
          label: 'Girisimci Ruh',
          message: 'Is dunyasina yatkinsin! Calisarak kendini gelistir.',
        },
        GENERALIST: {
          label: 'Kesifci',
          message: 'Dengeli oynuyorsun! Farkli alanlari kesfetmeye devam et.',
        },
      },
      tutorial: {
        step: {
          GOAL_VISION: {
            title: 'Hayalin',
            message: 'Bu hayatta {goalName} olmayi hedefliyorsun. Bunun icin {keyStats} gelistirmen gerekiyor.',
            returningTitle: 'Yeni Bir Hayat',
            returningMessage: 'Yeni bir yasam, ayni hayal: {goalName}. Hazir misin?',
          },
          WELCOME_HUB: {
            title: 'Hayatina Hos Geldin!',
            message: 'Bu senin yasam alanin. Aktiviteler secerek gununu gecirebilirsin. Her aktivite statlarini etkiler.',
            returningTitle: 'Tekrar Merhaba!',
            returningMessage: 'Tekrar hayata dondun. Bu sefer kaderini nasil yazacaksin?',
          },
          FIRST_ACTION: {
            title: 'Ilk Aktiviteni Sec',
            message: 'Bir aktiviteye dokun! Ders calisma zekani, spor sagligini, sosyal etkinlikler karizmayi artirir.',
          },
          STAT_CHANGE: {
            title: 'Statlarin Degisti!',
            message: 'Gordun mu? Secimlerin karakterini sekillendiriyor. Dengelemeyi unutma - tek yone asiri gitmek riskli!',
          },
          FIRST_EVENT: {
            title: 'Bir Olay Gerceklesti!',
            message: 'Hayatta rastgele olaylar olur. Secimlerin karakterini ve gelecegini belirler. Dikkatli karar ver!',
          },
          ENERGY_EXPLAIN: {
            title: 'Enerji Sistemi',
            message: 'Her aktivite enerji harcar. Enerji bittiginde gunu bitirmen gerekir. Ayrica stres, zorlayici secimlerle artar; gunu bitirmek ve daha dengeli secimler yapmak stresi azaltir.',
          },
          FATE_TOKEN_TUTORIAL: {
            title: 'Kader Tokeni',
            message: 'Ilk kader tokenini kazandin! Zor anlarda secimlerini tekrar yazmak icin bunu kullanabilirsin.',
          },
          PERSONALITY_MOMENTUM: {
            title: 'Kisilik Ivmesi',
            message: 'Ayni tarz secimler birikince momentum olusur. Seri yakaladiginda etkiler daha belirgin olur.',
          },
          NPC_INTRODUCTION: {
            title: 'NPC Rolleri',
            message: 'Iliskiler degistikce NPC rol degisimi olur. Kimin dost, kimin rakip oldugunu takip et.',
          },
        },
      },
    },
  },
  en: {
    onboardingFlow: {
      slides: {
        dreamTitle: 'Your Dream In This Life',
        requirementTitle: 'You will need:',
        requirementFallback: 'Improve your core stats',
        continue: 'Continue',
        back: 'Go Back',
        skip: 'Skip',
        next: 'Continue',
        startLife: 'Start Your Life',
        introLine: 'A life is about to begin...',
        introBody: 'From birth to graduation, every moment is shaped by your choices.',
        choiceHeader: 'Every choice changes you',
        choicePrompt: 'Your friend invites you out. What do you do?',
        choiceStudy: 'I study',
        choiceSocial: 'I hang out with friends',
        choiceStudyResult: 'Your intelligence improved, but your social life fell behind.',
        choiceSocialResult: 'Your charisma improved, but you lagged in school.',
        outroBody: 'Make decisions in this life simulation, shape your character, and define your fate.',
      },
      cohorts: {
        SOCIALIZER: {
          label: 'Social Butterfly',
          message: 'Your social side is strong. Keep building friendships.',
        },
        SCHOLAR: {
          label: 'Scholar',
          message: 'Your academic potential stands out. Keep studying.',
        },
        STRIVER: {
          label: 'Driven Builder',
          message: 'You are naturally inclined to work and growth. Keep pushing.',
        },
        GENERALIST: {
          label: 'Explorer',
          message: 'You are playing in a balanced way. Keep exploring different paths.',
        },
      },
      tutorial: {
        step: {
          GOAL_VISION: {
            title: 'Your Goal',
            message: 'In this life, you aim to become {goalName}. To do that, you need to improve {keyStats}.',
            returningTitle: 'A New Life',
            returningMessage: 'A new life, the same dream: {goalName}. Ready?',
          },
          WELCOME_HUB: {
            title: 'Welcome To Your Life!',
            message: 'This is your living area. You can spend your day by choosing activities. Every activity affects your stats.',
            returningTitle: 'Welcome Back!',
            returningMessage: 'You are back in life again. How will you write your fate this time?',
          },
          FIRST_ACTION: {
            title: 'Choose Your First Action',
            message: 'Tap an activity. Studying raises intelligence, sports improve health, and social actions raise charisma.',
          },
          STAT_CHANGE: {
            title: 'Your Stats Changed!',
            message: 'See? Your choices shape your character. Keep balance - going too hard in one direction can be risky.',
          },
          FIRST_EVENT: {
            title: 'An Event Happened!',
            message: 'Random events happen in life. Your choices shape both your character and your future. Decide carefully!',
          },
          ENERGY_EXPLAIN: {
            title: 'Energy System',
            message: 'Every action costs energy. When energy is depleted, you need to end the day. Stress rises with demanding choices, and it drops when you end the day and make more balanced choices.',
          },
          FATE_TOKEN_TUTORIAL: {
            title: 'Fate Token',
            message: 'You earned your first fate token! You can use it to rewrite choices in difficult moments.',
          },
          PERSONALITY_MOMENTUM: {
            title: 'Personality Momentum',
            message: 'When similar choices stack up, momentum forms. Once you build a streak, effects become stronger.',
          },
          NPC_INTRODUCTION: {
            title: 'NPC Roles',
            message: 'As relationships change, NPC roles can change too. Track who is friend and who is rival.',
          },
        },
      },
    },
  },
};
