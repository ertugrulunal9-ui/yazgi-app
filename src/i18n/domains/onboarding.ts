import { DomainStrings } from './types';

export const onboardingDomainStrings: DomainStrings = {
  tr: {
    onboardingFlow: {
      slides: {
        dreamTitle: 'Bu Hayatta Hayalin',
        requirementTitle: 'Bunun için gereken:',
        requirementFallback: 'Temel statlarını geliştir',
        continue: 'Devam Et',
        back: 'Geri Dön',
        skip: 'Atla',
        next: 'Devam',
        startLife: 'Hayatına Başla',
        introLine: 'Bir hayat başlayacak...',
        introBody: 'Doğumdan mezuniyete, her anı senin seçimlerin belirleyecek.',
        choiceHeader: 'Her seçim seni değiştirir',
        choicePrompt: 'Arkadaşın seni dışarı çağırıyor. Ne yaparsın?',
        choiceStudy: 'Ders çalışırım',
        choiceSocial: 'Arkadaşlarla buluşurum',
        choiceStudyResult: 'Zekan arttı! Ama sosyal hayatın biraz geriledi.',
        choiceSocialResult: 'Karizma arttı! Ama derslerden geri kaldın.',
        outroBody: 'Hayat simülasyonunda kararlar ver, karakterini oluştur, kaderini belirle.',
      },
      cohorts: {
        SOCIALIZER: {
          label: 'Sosyal Kelebek',
          message: 'Sosyal yönün çok güçlü! Arkadaşlıklar kurarak ilerle.',
        },
        SCHOLAR: {
          label: 'Akademisyen',
          message: 'Akademik yeteneğin parlıyor! Ders çalışmaya devam et.',
        },
        STRIVER: {
          label: 'Girişimci Ruh',
          message: 'İş dünyasına yatkınsın! Çalışarak kendini geliştir.',
        },
        GENERALIST: {
          label: 'Keşifçi',
          message: 'Dengeli oynuyorsun! Farklı alanları keşfetmeye devam et.',
        },
      },
      tutorial: {
        step: {
          GOAL_VISION: {
            title: 'Hayalin',
            message: 'Bu hayatta {goalName} olmayı hedefliyorsun. Bunun için {keyStats} geliştirmen gerekiyor.',
            returningTitle: 'Yeni Bir Hayat',
            returningMessage: 'Yeni bir yaşam, aynı hayal: {goalName}. Hazır misin?',
          },
          WELCOME_HUB: {
            title: 'Hayatına Hoş Geldin!',
            message: 'Bu senin yaşam alanın. Aktiviteler seçerek gününü geçirebilirsin. Her aktivite statlarını etkiler.',
            returningTitle: 'Tekrar Merhaba!',
            returningMessage: 'Tekrar hayata döndün. Bu sefer kaderini nasıl yazacaksın?',
          },
          FIRST_ACTION: {
            title: 'İlk Aktiviteni Seç',
            message: 'Bir aktiviteye dokun! Ders çalışma zekanı, spor sağlığını, sosyal etkinlikler karizmayı artırır.',
          },
          STAT_CHANGE: {
            title: 'Statların Değişti!',
            message: 'Gördün mü? Seçimlerin karakterini şekillendiriyor. Dengelemeyi unutma - tek yöne aşırı gitmek riskli!',
          },
          FIRST_EVENT: {
            title: 'Bir Olay Gerçekleşti!',
            message: 'Hayatta rastgele olaylar olur. Seçimlerin karakterini ve geleceğini belirler. Dikkatli karar ver!',
          },
          ENERGY_EXPLAIN: {
            title: 'Enerji Sistemi',
            message: 'Her aktivite enerji harcar. Enerji bittiğinde günü bitirmen gerekir. Ayrıca stres, zorlayıcı seçimlerle artar; günü bitirmek ve daha dengeli seçimler yapmak stresi azaltır.',
          },
          FATE_TOKEN_TUTORIAL: {
            title: 'Kader Tokeni',
            message: 'İlk kader tokenini kazandın! Zor anlarda seçimlerini tekrar yazmak için bunu kullanabilirsin.',
          },
          PERSONALITY_MOMENTUM: {
            title: 'Kişilik İvmesi',
            message: 'Aynı tarz seçimler birikince ivme oluşur. Seri yakaladığında etkiler daha belirgin olur.',
          },
          NPC_INTRODUCTION: {
            title: 'NPC Rolleri',
            message: 'İlişkiler değiştikçe NPC rol değişimi olur. Kimin dost, kimin rakip olduğunu takip et.',
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
