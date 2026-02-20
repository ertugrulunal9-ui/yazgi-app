import { TraitDefinition } from '../types';

export const TRAIT_DEFINITIONS: TraitDefinition[] = [
  // ===== GENETIC TRAITS =====
  {
    id: 'GENIUS',
    name: '🧠 Deha',
    description: 'Doğuştan zekisin. Matematik, fizik ve kompleks problemler sana kolay geliyor.',
    type: 'POSITIVE',
    category: 'GENETIC',
    effects: {
      statMultipliers: { intelligence: 1.3 }
    }
  },
  {
    id: 'ATHLETIC',
    name: '⚽ Sporcu',
    description: 'Doğal atlet. Fiziksel aktivitelerde parlaksın, hızlı ve çeviksin.',
    type: 'POSITIVE',
    category: 'GENETIC',
    effects: {
      statMultipliers: { health: 1.2 },
      energyCostMultiplier: 0.85
    }
  },
  {
    id: 'CHARISMATIC',
    name: '✨ Karizmatik',
    description: 'Doğal liderlik yeteneği var. İnsanlar senden hoşlanıyor ve güveniyor.',
    type: 'POSITIVE',
    category: 'GENETIC',
    effects: {
      statMultipliers: { charisma: 1.25 }
    }
  },
  {
    id: 'SICKLY',
    name: '🤒 Hastalıklı',
    description: 'Bağışıklık sistemi zayıf. Sık hastalanıyorsun, iyileşmek uzun sürüyor.',
    type: 'NEGATIVE',
    category: 'GENETIC',
    effects: {
      statMultipliers: { health: 0.75 }
    }
  },
  {
    id: 'CLUMSY',
    name: '🪶 Beceriksiz',
    description: 'Hareket koordinasyonunda problem yaşıyorsun. Sık sık şeyler düşürüyor ve çarpıyorsun.',
    type: 'NEGATIVE',
    category: 'GENETIC',
    effects: {
      statMultipliers: { charisma: 0.85 }
    }
  },

  // ===== ACQUIRED POSITIVE TRAITS =====
  {
    id: 'EMPATHETIC',
    name: '❤️ Empatik',
    description: 'İnsanların duygularını anlayabiliyorsun. Başkasının acısını kendi acın gibi hissediyorsun.',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'social', count: 4, ageWindow: [3, 14] },
        { type: 'EVENT_CHOICE', eventId: 'pers_grup_zorbaligi', choice: 'zorbalik_mudahale', ageWindow: [6, 14] }
      ],
      ageWindow: [3, 18],
      pointsRequired: 4
    },
    effects: {
      statMultipliers: { charisma: 1.1 }
    }
  },
  {
    id: 'ORGANIZED',
    name: '📋 Organize',
    description: 'Hayatın düzenli, her şey yerine konuyor. Planlama yapabiliyorsun ve disiplinlisin.',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'study', count: 5, ageWindow: [7, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 5
    },
    effects: {
      statMultipliers: { discipline: 1.2 }
    }
  },
  {
    id: 'BRAVE',
    name: '🦁 Cesur',
    description: 'Korkun çok az. Riskli durumları seversin ve zorluktan kaçmazsın.',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'pers_grup_zorbaligi', choice: 'zorbalik_mudahale', ageWindow: [6, 18] }
      ],
      ageWindow: [6, 18],
      pointsRequired: 2
    },
    effects: {
      statMultipliers: { discipline: 1.15 }
    }
  },
  {
    id: 'DISCIPLINED',
    name: '💪 Disiplinli',
    description: 'Kendine katı kurallar koymuşsun. Hedeflerine ulaşmak için gerekirse ne yapman gerekiyorsa yapıyorsun.',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'study', count: 6, ageWindow: [7, 18] },
        { type: 'ACTION', actionId: 'sports', count: 5, ageWindow: [0, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 6
    },
    effects: {
      statMultipliers: { discipline: 1.3 }
    },
    conflicts: ['LAZY', 'PROCRASTINATOR']
  },
  {
    id: 'AMBITIOUS',
    name: '🚀 Hırslı',
    description: "Büyük hayallerin var. Dünya'yı fethetme, tarihe adını yazdırma gibi fikirleri seviyorsun.",
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'STAT_THRESHOLD', statKey: 'intelligence', threshold: 60, ageWindow: [10, 18] },
        { type: 'ACTION', actionId: 'work', count: 4, ageWindow: [14, 18] }
      ],
      ageWindow: [10, 18],
      pointsRequired: 5
    },
    effects: {
      statMultipliers: { intelligence: 1.1 }
    }
  },
  {
    id: 'CREATIVE',
    name: '🎨 Yaratıcı',
    description: 'İmajinatifsin ve orijinal fikirlerin var. Sanat, tasarım, yazı vb. alanlarda parla.',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'art', count: 5, ageWindow: [7, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 5
    },
    effects: {
      statMultipliers: { intelligence: 1.15 }
    }
  },
  {
    id: 'BOOKWORM',
    name: '📚 Kitap Kurdu',
    description: 'Okumayı çok seversin. Kitaplar senin en iyi arkadaşın. Diller konusunda yeteneklisin.',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'study', count: 8, ageWindow: [7, 18] },
        { type: 'STAT_THRESHOLD', statKey: 'intelligence', threshold: 70, ageWindow: [10, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 8
    },
    effects: {
      statMultipliers: { intelligence: 1.2 }
    }
  },
  {
    id: 'NIGHT_OWL',
    name: '🌙 Gece Kuşu',
    description: 'Gece saatlerinde çok daha verimlisin. Güne başlayınca yavaş hareketlisin ama gece dinçleşiyorsun.',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'coding', count: 4, ageWindow: [10, 18] }
      ],
      ageWindow: [10, 18],
      pointsRequired: 4
    },
    effects: {}
  },
  {
    id: 'SOCIAL_BUTTERFLY',
    name: '🦋 Sosyal Kelebek',
    description: 'İnsanlardan hoşlanıyorsun ve rahatça dostluk kurabiliyorsun. Partiler senin alanın.',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'social', count: 6, ageWindow: [7, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 6
    },
    effects: {
      statMultipliers: { charisma: 1.25 }
    }
  },
  {
    id: 'ENTREPRENEUR',
    name: '💼 Girişimci',
    description: 'Parayla ilişki kurman doğal. İşletmecilik, yatırım ve finansal konularda yetenekhisin.',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'work', count: 6, ageWindow: [14, 18] },
        { type: 'STAT_THRESHOLD', statKey: 'money', threshold: 500, ageWindow: [14, 18] }
      ],
      ageWindow: [14, 18],
      pointsRequired: 6
    },
    effects: {
      statMultipliers: { intelligence: 1.1 }
    }
  },
  {
    id: 'HONEST',
    name: '✅ Dürüst',
    description: 'Doğruluğu her şeyden öne alıyorsun. Yalan söylemek seni rahatsız ediyor.',
    type: 'POSITIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'dilemma_kopya_satin_alma', choice: 'kopya_alma', ageWindow: [14, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 1
    },
    effects: {
      statMultipliers: { familyRelation: 1.1 }
    }
  },

  // ===== ACQUIRED NEGATIVE TRAITS =====
  {
    id: 'LAZY',
    name: '😴 Tembel',
    description: 'Hiçbir şey yapmak istemiyorsun. Enerji seviyende ise sorun yok ama çalışmak sana korkunç geliyor.',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'STAT_THRESHOLD', statKey: 'discipline', threshold: 20, ageWindow: [7, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 1
    },
    effects: {
      energyCostMultiplier: 1.2
    },
    conflicts: ['DISCIPLINED', 'ORGANIZED']
  },
  {
    id: 'PROCRASTINATOR',
    name: '⏰ Ertelemeci',
    description: 'Her zaman son dakikaya bırakıyorsun. Zaman yönetiminde sorun yaşıyorsun ve stres altındasın.',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'STAT_THRESHOLD', statKey: 'discipline', threshold: 30, ageWindow: [7, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 2
    },
    effects: {}
  },
  {
    id: 'COWARD',
    name: '😰 Korkak',
    description: 'Riskli durumlardan kaçıyorsun. Hayal kırıklığı ve başarısızlıktan çok korkuyorsun.',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'pers_grup_zorbaligi', choice: 'zorbalik_izle', ageWindow: [6, 18] }
      ],
      ageWindow: [6, 18],
      pointsRequired: 2
    },
    effects: {
      statMultipliers: { charisma: 0.9 }
    }
  },
  {
    id: 'CHEATER',
    name: '😏 Hileci',
    description: 'Kuralları önemsiyor. Her yolu denemeye ve hile yapmaya isteklisin.',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'dilemma_kopya_satin_alma', choice: 'kopya_al', ageWindow: [14, 18] }
      ],
      ageWindow: [7, 18],
      pointsRequired: 2
    },
    effects: {}
  },
  {
    id: 'BURNOUT_PRONE',
    name: '🔥 Tükenmişlik Eğilimli',
    description: 'Çok çalışıyorsun ve kendine hiç bakamıyorsun. Yorgunluğun çok kolaylıkla ölümcül hale geliyor.',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'STAT_THRESHOLD', statCondition: { stat: 'energy', operator: '<', value: 30 }, ageWindow: [10, 18] },
        { type: 'ACTION', actionId: 'study', ageWindow: [10, 18] },
        { type: 'ACTION', actionId: 'work', ageWindow: [14, 18] },
        { type: 'ACTION', actionId: 'coding', ageWindow: [10, 18] }
      ],
      ageWindow: [10, 18],
      pointsRequired: 3
    },
    effects: {
      energyCostMultiplier: 1.15
    }
  },
  {
    id: 'REBELLIOUS',
    name: '🔥 İsyankar',
    description: 'Otoriteye karşı direniş gösteriyorsun. Kuralları kırmaktan hoşlanıyorsun.',
    type: 'NEGATIVE',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'dilemma_aile_beklentisi', choice: 'follow_dreams', ageWindow: [14, 18] }
      ],
      ageWindow: [10, 18],
      pointsRequired: 2
    },
    effects: {
      statMultipliers: { familyRelation: 0.85 }
    }
  },

  // ===== NEUTRAL/SPECIAL TRAITS =====
  {
    id: 'GAMER',
    name: '🎮 Oyuncu',
    description: 'Video oyunları çok seviyorsun ve çoğu oyunda başarılısın. Bu zamanını çalabilir ama eğleniyorsun.',
    type: 'NEUTRAL',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'ACTION', actionId: 'coding', count: 3, ageWindow: [10, 18] }
      ],
      ageWindow: [10, 18],
      pointsRequired: 3
    },
    effects: {}
  },
  {
    id: 'LONE_WOLF',
    name: '🐺 Yalnız Kurt',
    description: 'İnsanlardan daha çok yalnız olmayı tercih ediyorsun. Kalabalık ortamlarda rahatsız hissediyorsun.',
    type: 'NEUTRAL',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'EVENT_CHOICE', eventId: 'pers_bir_gun_yalniz', choice: 'yalniz_rahat', ageWindow: [10, 18] },
        { type: 'STAT_THRESHOLD', statCondition: { stat: 'charisma', operator: '<', value: 45 }, ageWindow: [10, 18] }
      ],
      ageWindow: [10, 18],
      pointsRequired: 2
    },
    effects: {}
  },
  {
    id: 'PRAGMATIC',
    name: '🎯 Pragmatik',
    description: 'Rasyonelsin ve pratik çözümleri seversin. Romantizm sana pek ilginç gelmiyor.',
    type: 'NEUTRAL',
    category: 'ACQUIRED',
    formation: {
      triggers: [
        { type: 'STAT_THRESHOLD', statKey: 'intelligence', threshold: 75, ageWindow: [12, 18] }
      ],
      ageWindow: [12, 18],
      pointsRequired: 1
    },
    effects: {}
  }
];

export const getTrait = (traitId: string): TraitDefinition | undefined => {
  return TRAIT_DEFINITIONS.find(t => t.id === traitId);
};

export const getTraitName = (traitId: string): string => {
  return getTrait(traitId)?.name ?? traitId;
};

export const getRandomGeneticTraits = (count: number = 1): string[] => {
  const geneticTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'GENETIC');
  const result: string[] = [];
  const shuffled = [...geneticTraits].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < count && i < shuffled.length; i++) {
    result.push(shuffled[i].id);
  }
  
  return result;
};
