/**
 * YAZGI GAME BALANCE CONFIG
 * ========================
 * 
 * Tüm oyun mekaniklerinin sayısal değerlerini merkezi olarak yönetir.
 * Magic numbers'ı buradan değiştirerek oyun dengesiyle oynayabilirsiniz.
 * 
 * Düzenleme: Sadece değerleri değiştirin, yorum ve struct'ı aynı tutun.
 * Test: Değişiklik yaptıktan sonra oyunu açın ve test edin.
 * 
 * @version 2.0
 * @author Game Design Team
 */

// ============================================================================
// SECTION 1: BAŞLANGIÇ İSTATİSTİKLERİ (Initial Stats)
// ============================================================================
export const INITIAL_STATS = {
  /** Başlangıç sağlığı (0-100). Yüksek = daha güçlü başlangıç */
  health: 70,
  
  /** Başlangıç zekası (0-100). Okul başarısını etkiler */
  intelligence: 0,
  
  /** Başlangıç karizması (0-100). Sosyal etkileşim başarısını etkiler */
  charisma: 10,
  
  /** Başlangıç disiplini (0-100). Aktivite bonusu ve odak gücü */
  discipline: 0,
  
  /** Başlangıç parası (₺). Aile servetiyle çoğaltılır */
  money: 0,
  
  /** Başlangıç enerjisi (0-100). Her aktiviteyle tüketilir */
  energy: 100,
  
  /** Başlangıç aile ilişkisi (0-100). Rapor kartı ve miras etkiler */
  familyRelation: 50,
} as const;

// ============================================================================
// SECTION 2: ENERJİ SİSTEMİ
// ============================================================================
export const ENERGY_SYSTEM = {
  /** Maksimum enerji üst sınırı */
  maxEnergyBase: 100,
  
  /** Fakir aile: max enerji azalması */
  poorFamilyEnergyPenalty: 10,
  
  /** Atletik özelliği: max enerji bonusu */
  athleticEnergyBonus: 10,
  
  /** Tükenmişlik eğilimi: max enerji cezası */
  burnoutPronePenalty: 15,
  
  /** Her tur sonunda enerji sıfırlanması (gün sonunda) */
  resetEnergyDaily: true,
} as const;

// ============================================================================
// SECTION 3: DERS ÇALIŞMASı AKTİVİTESİ (Study Actions)
// ============================================================================
export const STUDY_ACTIONS = {
  math: {
    /** Matematik dersi: Enerji maliyeti */
    energyCost: 40,
    
    /** Zeka kazanımı */
    intelligence: 8,
    
    /** Matematik notu artışı */
    gradeBoost: { math: 3, science: 1 },
    
    /** Stress sebep olan aktiviteler için kullan */
    stressMultiplier: 1.2,
  },
  science: {
    energyCost: 40,
    intelligence: 8,
    gradeBoost: { science: 3, math: 1 },
    stressMultiplier: 1.1,
  },
  language: {
    energyCost: 35,
    intelligence: 6,
    gradeBoost: { language: 3 },
    stressMultiplier: 0.9, // Daha az stresli
  },
  art: {
    energyCost: 30,
    intelligence: 4,
    charisma: 3,
    gradeBoost: { language: 1 },
    stressMultiplier: 0.5, // Sanat rahatlatıcı
  },
} as const;

// ============================================================================
// SECTION 4: SPOR AKTİVİTESİ
// ============================================================================
export const SPORTS_ACTIONS = {
  /** Spor yap: Enerji maliyeti */
  energyCost: 45,
  
  /** Sağlık kazanımı */
  health: 12,
  
  /** Spor becerisi kazanımı */
  sportSkill: 5,
  
  /** Disiplin artışı */
  discipline: 3,
  
  /** Spor çok enerjik olduğu için enerji tüketim artışı */
  energyCostRatio: 1.0,
} as const;

// ============================================================================
// SECTION 5: BİLGİSAYAR / KODLAMA AKTİVİTESİ
// ============================================================================
export const COMPUTER_ACTIONS = {
  /** Bilgisayar kullan: Enerji maliyeti */
  energyCost: 40,
  
  /** Zeka kazanımı */
  intelligence: 5,
  
  /** Kodlama becerisi kazanımı */
  codingSkill: 7,
  
  /** Tasarım becerisi kazanımı (çok iyi yapılırsa) */
  designSkill: 2,
  
  /** Sağlık kaybı (oturmaktan) */
  healthPenalty: 2,
  
  /** Gözler yoruluyor */
  energyLossMultiplier: 0.1,
} as const;

// ============================================================================
// SECTION 6: SANAT AKTİVİTESİ
// ============================================================================
export const ART_ACTIONS = {
  /** Sanat yap: Enerji maliyeti */
  energyCost: 35,
  
  /** Karizması artışı */
  charisma: 5,
  
  /** Tasarım becerisi kazanımı */
  designSkill: 8,
  
  /** Müzik becerisi kazanımı */
  musicSkill: 4,
  
  /** Yaratıcılık sanat yapıyla artacağını belirtir */
  creativityMultiplier: 1.3,
} as const;

// ============================================================================
// SECTION 7: İŞ AKTİVİTESİ (WORK / JOBS)
// ============================================================================
export const JOBS = {
  /** ÇOCUKLUK İŞLERİ (0-13 yaş) */
  chores: {
    /** Ev işleri: Enerji maliyeti */
    energyCost: 10,
    /** Para kazanımı (cep harçlığı) */
    moneyGain: 10,
    /** Disiplin artışı */
    discipline: 3,
    /** Aile ilişkisi artışı */
    familyRelation: 5,
  },
  
  /** GAR SON (14-18 yaş, minimum requirements yok) */
  waiter: {
    energyCost: 40,
    moneyGain: 60,
    charisma: 5, // Müşteriyle konuşmak
    discipline: 2,
    healthPenalty: 3, // Ayakta durma
    minAge: 14,
  },
  
  /** ÖZEL DERS VERİCİ (14+ yaş, intelligence ≥ 70) */
  tutor: {
    energyCost: 50,
    moneyGain: 100,
    intelligence: 3,
    charisma: 3,
    minAge: 14,
    reqStats: { intelligence: 70 },
  },
  
  /** YAZILIM GELİŞTİRİCİ (15+ yaş, coding skill ≥ 60) */
  developer: {
    energyCost: 60,
    moneyGain: 150,
    intelligence: 5,
    codingSkill: 8,
    minAge: 15,
    reqSkills: { coding: 60 },
  },
} as const;

// ============================================================================
// SECTION 8: SOSYAL AKTİVİTE (Social Interactions)
// ============================================================================
export const SOCIAL_INTERACTION = {
  /** Sosyal aktivite: Enerji maliyeti */
  energyCost: 30,
  
  /** Karizma kazanımı */
  charisma: 4,
  
  /** NPC İLİŞKİ THRESHOLD'LAR */
  relationship: {
    /** İlişki < -20 → RIVAL */
    rivalThreshold: -20,
    
    /** İlişki < -80 → ENEMY */
    enemyThreshold: -80,
    
    /** İlişki > 50 → FRIEND */
    friendThreshold: 50,
    
    /** İlişki > 85 → BEST_FRIEND */
    bestFriendThreshold: 85,
  },
  
  /** ROMANCE THRESHOLDS */
  romance: {
    /** Romance > 40 ve relationship > 20 → CRUSH */
    crushThreshold: 40,
    /** Romance > 80 ve relationship > 50 → PARTNER */
    partnerThreshold: 80,
  },
} as const;

// ============================================================================
// SECTION 9: AİLE SİSTEMİ (Family System)
// ============================================================================
export const FAMILY_SYSTEM = {
  /** BAŞLANGIÇ PARASI (Aile servetine göre) */
  initialMoney: {
    POOR: 50,
    MIDDLE: 300,
    RICH: 1500,
  },
  
  /** AYLANAN HAR ÇIĞI (Her yaş) */
  allowance: {
    POOR: 5,
    MIDDLE: 50,
    RICH: 250,
  },
  
  /** MİRAS (18 yaşında alınan para) */
  inheritance: {
    POOR: { SUPPORTIVE: 1000, STRICT: 500, CHAOTIC: 200 },
    MIDDLE: { SUPPORTIVE: 5000, STRICT: 2500, CHAOTIC: 1000 },
    RICH: { SUPPORTIVE: 50000, STRICT: 25000, CHAOTIC: 10000 },
  },
  
  /** AİLE İLİŞKİSİ THRESHOLD'LAR (FamilyRelation stat'ının etkisi) */
  relationshipThresholds: {
    /** 0-30: Very Bad (öğrenci çıkırılır, ceza vs.) */
    veryBad: 30,
    /** 30-50: Bad */
    bad: 50,
    /** 50-75: Neutral */
    neutral: 75,
    /** 75-90: Good */
    good: 90,
    /** 90-100: Excellent */
    excellent: 100,
  },
} as const;

// ============================================================================
// SECTION 10: OKUL SİSTEMİ (School Report Cards)
// ============================================================================
export const SCHOOL_SYSTEM = {
  /** Not hesaplama: Zeka × çarpan */
  intelligenceMultiplier: 1.2,
  
  /** Not hesaplama: Stress (enerji eksikliği) × ceza */
  stressPenaltyRatio: 0.15,
  
  /** Not hesaplama: Sağlık bonusu (health > 70 ise) */
  healthBonusThreshold: 70,
  healthBonus: 5,
  
  /** Rapor kartı sıklığı (kaç tur'da bir gösterilir) */
  reportCardFrequency: 5,
  
  /** Rapor kartı başlama yaşı */
  reportCardStartAge: 7,
  
  /** Rapor kartı bitiş yaşı */
  reportCardEndAge: 18,
  
  /** ÖZELLIK BONUSLARI (Trait-based grade bonuses) */
  traitBonuses: {
    GENIUS: 10,
    BOOKWORM: 10, // Language only
    ORGANIZED: 5,
    DISCIPLINED: 3,
  },
} as const;

// ============================================================================
// SECTION 11: YAŞA BAĞLI STAT CAP'İ
// ============================================================================
export const AGE_BASED_STAT_CAPS = {
  /** 0-6: Okul öncesi. Düşük cap */
  ageGroup_0_6: 30,
  
  /** 7-9: İlkokul başlangıcı */
  ageGroup_7_9: 50,
  
  /** 10-13: Ortaokul */
  ageGroup_10_13: 70,
  
  /** 14-17: Lise */
  ageGroup_14_17: 90,
  
  /** 18+: Yetişkinlik. Full potential */
  ageGroup_18_plus: 100,
} as const;

// ============================================================================
// SECTION 12: STAT KAZANIM FORMÜLÜ (Diminishing Returns)
// ============================================================================
export const STAT_GAIN_FORMULA = {
  /** Cap'in altında (< 70%): Full gain */
  earlyGameRatio: 1.0,
  
  /** Cap'e yakın (70-100%): Yarı gain */
  midGameRatio: 0.5,
  
  /** Cap'i aştı (> 100%): Minimum gain */
  lateGameRatio: 0.2,
  
  /** Cap'in yüzdesi (hangi noktadan sonra azalan getiri başlasın?) */
  diminishingReturnsThreshold: 0.7, // 70% of cap
} as const;

// ============================================================================
// SECTION 13: DISIPLIN MEKANIKLERI
// ============================================================================
export const DISCIPLINE_MECHANICS = {
  /** Disiplin ≥ 60 ise başarı şansı */
  highDisciplineThreshold: 60,
  highDisciplineSuccessChance: (discipline: number) => (discipline - 40) / 100,
  
  /** Disiplin < 30 ise başarısızlık şansı */
  lowDisciplineThreshold: 30,
  lowDisciplineFailureChance: (discipline: number) => (40 - discipline) / 100,
  
  /** Başarıyla disiplin multiplier (aksiyon 1.3x daha etkili) */
  highDisciplineMultiplier: 1.3,
  
  /** Başarısızlıkla disiplin multiplier (aksiyon 0.7x daha etkisiz) */
  lowDisciplineMultiplier: 0.7,
} as const;

// ============================================================================
// SECTION 14: SERİ MEKANIKLERI (Streak Bonuses)
// ============================================================================
export const STREAK_SYSTEM = {
  /** 2 tur aynı aksiyon = multiplier */
  twoStreakMultiplier: 1.2,
  
  /** 3+ tur aynı aksiyon = multiplier */
  threeStreakMultiplier: 1.5,
  
  /** Seri Streak gösterimi: "🔥" emoji */
  streakEmoji: "🔥",
} as const;

// ============================================================================
// SECTION 15: GENETIC TRAITS (Doğuştan Gelen)
// ============================================================================
export const GENETIC_TRAITS = {
  GENIUS: {
    /** Zeka kazanım multiplier */
    statMultiplier: 0.3,
    /** Hangi statlar etkilenir: intelligence, math, science, language, coding, design */
    affectedStats: ["intelligence", "math", "science", "language", "coding", "design"],
  },
  
  ATHLETIC: {
    /** Spor kazanım multiplier */
    statMultiplier: 0.3,
    /** Enerji maliyet azalma */
    energyCostMultiplier: -0.15,
    affectedStats: ["sports", "health"],
  },
  
  SICKLY: {
    /** Sağlık kazanım penaltısı */
    statMultiplier: -0.1,
    /** Enerji maliyet artışı */
    energyCostMultiplier: 0.15,
    /** Max health capped 60'da */
    maxHealthCap: 60,
    affectedStats: ["health", "sports"],
  },
  
  CHARISMATIC: {
    statMultiplier: 0.3,
    affectedStats: ["charisma", "familyRelation"],
  },
  
  CLUMSY: {
    /** Beceri kaybı multiplier */
    statMultiplier: -0.15,
    affectedStats: ["sports", "coding", "music", "design"],
  },
} as const;

// ============================================================================
// SECTION 16: ACQUIRED TRAITS (Kazanılan Özellikler)
// ============================================================================
export const ACQUIRED_TRAITS = {
  EMPATHETIC: {
    statMultiplier: 0.25,
    affectedStats: ["charisma", "familyRelation"],
  },
  
  ORGANIZED: {
    statMultiplier: 0.2,
    energyCostMultiplier: -0.1,
    affectedStats: ["discipline", "math", "science", "language"],
  },
  
  BRAVE: {
    statMultiplier: 0.2,
    affectedStats: ["charisma", "sports"],
  },
  
  DISCIPLINED: {
    statMultiplier: 0.15,
    energyCostMultiplier: -0.15,
    affectedStats: ["discipline", "intelligence", "coding", "math", "science"],
  },
  
  AMBITIOUS: {
    /** Para kazanım */
    moneyMultiplier: 0.3,
    /** Zeka kazanım ek bonus */
    intelligenceBonus: 0.1,
  },
  
  CREATIVE: {
    statMultiplier: 0.3,
    affectedStats: ["design", "music"],
    /** Kodlama da yaratıcılıktan yararlanır */
    codingBonus: 0.1,
  },
  
  BOOKWORM: {
    statMultiplier: 0.4,
    affectedStats: ["language", "intelligence"],
    /** Spor penaltısı (çok okumaktan) */
    sportsPenalty: -0.1,
  },
  
  LAZY: {
    statMultiplier: -0.2,
    energyCostMultiplier: 0.25,
    affectedStats: ["discipline", "sports", "money"],
  },
  
  GAMER: {
    statMultiplier: 0.15,
    affectedStats: ["intelligence", "coding", "design"],
    /** Sosyal penaltı */
    charismaPenalty: -0.1,
    healthPenalty: -0.1,
  },
  
  LONE_WOLF: {
    statMultiplier: 0.15,
    affectedStats: ["intelligence", "coding", "art"],
    /** Sosyal penaltı */
    charismaPenalty: -0.2,
    familyRelationPenalty: -0.2,
  },
  
  REBELLIOUS: {
    statMultiplier: -0.2,
    affectedStats: ["discipline", "familyRelation"],
    /** Karizma bonusu (çelişki ama can be interpreted as "rebel cool") */
    charismaBonus: 0.1,
  },
} as const;

// ============================================================================
// SECTION 17: YETENEKLERİ (Talents - Doğuştan Özel Beceri)
// ============================================================================
export const INNATE_TALENTS = {
  /** Talent rastgelelik thresholds */
  coding: {
    /** 0.85 üstü: CODING */
    threshold: 0.85,
    /** Başlangıç kodlama becerisi */
    initialSkill: 20,
  },
  
  music: {
    /** 0.70-0.85: MUSIC */
    threshold: 0.7,
    initialSkill: 20,
  },
  
  sports: {
    /** 0.55-0.70: SPORTS */
    threshold: 0.55,
    initialSkill: 20,
  },
  
  /** Talent'i olmayan: NONE (varsayılan) */
  none: {
    threshold: 0.0,
    initialSkill: 0,
  },
} as const;

// ============================================================================
// SECTION 18: ÖZELLIK OLUŞUM TRIGGERS (Trait Formation)
// ============================================================================
export const TRAIT_FORMATION = {
  BOOKWORM: {
    /** Kaç saat ders çalışmak lazım */
    requiredStudyHours: 15,
    /** Yaş aralığı */
    minAge: 6,
    maxAge: 16,
  },
  
  EMPATHETIC: {
    /** Kaç tane sosyal pozitif seçim */
    requiredPositiveChoices: 4,
    minAge: 3,
    maxAge: 14,
  },
  
  DISCIPLINED: {
    /** Kaç tane spor etkinliği */
    requiredSportSessions: 10,
    minAge: 5,
    maxAge: 16,
  },
  
  GAMER: {
    /** Kaç tane bilgisayar oturumu */
    requiredComputerSessions: 8,
    minAge: 8,
    maxAge: 17,
  },
  
  MUSICIAN: {
    /** Kaç tane müzik yaptı */
    requiredMusicSessions: 6,
    minAge: 6,
    maxAge: 17,
  },
} as const;

// ============================================================================
// SECTION 19: YAŞA DAYALI AKSIYON PERIYODLARI
// ============================================================================
export const AGE_PROGRESSION = {
  /** 0-6: Her 2 tur yaş artar */
  youngAgeTurnPeriod: 2,
  youngAgeMax: 6,
  
  /** 7-18: Her 5 tur yaş artar */
  normalAgeTurnPeriod: 5,
  
  /** Maksimum oyun yaşı */
  maxGameAge: 18,
} as const;

// ============================================================================
// SECTION 20: SAKARLIQ ÖZELLİĞİ
// ============================================================================
export const CLUMSINESS_MECHANICS = {
  /** CLUMSY trait'i olan oyuncunun başarısızlık şansı */
  failureChance: 0.1, // 10%
  
  /** Başarısız olduğunda enerji kaybı (normalin 1/2'si) */
  energyRefundRatio: 0.5,
} as const;

// ============================================================================
// SECTION 21: NOT THRESHOLD'LAR
// ============================================================================
export const GRADE_THRESHOLDS = {
  A: 90,  // Mükemmel
  B: 80,  // İyi
  C: 70,  // Orta
  D: 60,  // Geçer
  F: 0,   // Başarısız
} as const;

// ============================================================================
// SECTION 22: YAŞA BAĞLI İlişKİ EFFECTS (Family Reaction)
// ============================================================================
export const FAMILY_REACTION_EFFECTS = {
  /** SUPPORTIVE AİLE: İyi notlara güçlü reward */
  supportiveGoodGrades: {
    charisma: 10,
    familyRelation: 15,
  },
  
  /** STRICT AİLE: İyi notlara ceza ve ödül mixed */
  strictGoodGrades: {
    discipline: 15,
    money: 50,
  },
  
  /** STRICT AİLE: Kötü notlara sert ceza */
  strictBadGrades: {
    discipline: -10,
    familyRelation: -10,
  },
  
  /** CHAOTIC AİLE: Random reactions */
  chaotic: {
    randomMultiplier: true,
  },
} as const;

// ============================================================================
// SECTION 23: TURN MEKANIKLERI
// ============================================================================
export const TURN_MECHANICS = {
  /** Oyun başladığında ilk tur numarası */
  startingTurn: 1,
  
  /** Her turda boş event gerçekleşme şansı (%) */
  idleEventChance: 0.0, // 0% - her turda bir şeyler olur
  
  /** Türkçe "Turn" karşılığı */
  turnName: "Tur",
} as const;


// ============================================================================
// SECTION 24: ENERJI RECOVERY (Phase 2A)
// ============================================================================
export const ENERGY_RECOVERY = {
  babyPhaseFullRecovery: true,
  youngRecoveryRate: 0.8, // 7-11 yas
  teenRecoveryRate: 0.65, // 12-17 yas
  youngAgeThreshold: 12,
} as const;

// ============================================================================
// SECTION 25: CESITLILIK BONUSU (Phase 2B)
// ============================================================================
export const VARIETY_BONUS_CONFIG = {
  windowSize: 5,
  minCategories: 3,
  statBonus: 3,
} as const;

// ============================================================================
// SECTION 26: TEKRAR CEZASI (Phase 2C)
// ============================================================================
export const REPETITION_PENALTY_CONFIG = {
  penaltyPerRepeat: 0.1, // +%10
  maxPenalty: 0.4, // +%40 cap
  windowSize: 5,
} as const;
// ============================================================================
// HELPER FUNCTIONS (Formula Generator'lar)
// ============================================================================

/**
 * Okul notu hesaplama formülü
 * @param intelligence Oyuncu zekas (0-100)
 * @param energy Oyuncu enerjisi (0-100)
 * @param luck Rastgele şans (0-10)
 * @param traits Oyuncu özelikleri
 * @returns Hesaplanan not (0-100)
 */
export const calculateGradeFormula = (
  intelligence: number,
  energy: number,
  luck: number,
  traits: string[] = []
): number => {
  const baseScore = intelligence * SCHOOL_SYSTEM.intelligenceMultiplier;
  const stress = 100 - energy;
  const stressPenalty = stress * SCHOOL_SYSTEM.stressPenaltyRatio;
  
  let score = baseScore - stressPenalty + luck;
  
  // Trait bonuses
  if (traits.includes('GENIUS')) score += SCHOOL_SYSTEM.traitBonuses.GENIUS;
  if (traits.includes('BOOKWORM')) score += SCHOOL_SYSTEM.traitBonuses.BOOKWORM;
  if (traits.includes('ORGANIZED')) score += SCHOOL_SYSTEM.traitBonuses.ORGANIZED;
  if (traits.includes('DISCIPLINED')) score += SCHOOL_SYSTEM.traitBonuses.DISCIPLINED;
  
  return Math.max(0, Math.min(100, Math.floor(score)));
};

/**
 * Diminishing returns (azalan getiri) formülü
 * @param currentValue Şu anki stat değeri
 * @param baseGain Kazanılacak base puan
 * @param cap Stat'ın üst sınırı
 * @returns Nihai kazanım (multiplier uygulanmış)
 */
export const calculateDiminishingReturns = (
  currentValue: number,
  baseGain: number,
  cap: number = 100
): number => {
  if (baseGain <= 0) return baseGain;
  
  const thresholdValue = cap * STAT_GAIN_FORMULA.diminishingReturnsThreshold;
  
  if (currentValue < thresholdValue) {
    // Early game: full gain
    return baseGain;
  } else if (currentValue < cap) {
    // Mid game: 50% gain
    return Math.ceil(baseGain * STAT_GAIN_FORMULA.midGameRatio);
  } else {
    // Late game: 20% gain
    return Math.ceil(baseGain * STAT_GAIN_FORMULA.lateGameRatio);
  }
};

/**
 * Aile miras hesaplama
 * @param wealth Aile serveti (POOR, MIDDLE, RICH)
 * @param dynamic Aile dinamiği (SUPPORTIVE, STRICT, CHAOTIC)
 * @param familyRelation Aile ilişkisi skoru (0-100)
 * @returns Miras miktarı (₺)
 */
export const calculateInheritance = (
  wealth: 'POOR' | 'MIDDLE' | 'RICH',
  dynamic: 'SUPPORTIVE' | 'STRICT' | 'CHAOTIC',
  familyRelation: number
): number => {
  const baseInheritance = FAMILY_SYSTEM.inheritance[wealth][dynamic];
  
  // Family relation multiplier (0.5x - 1.5x)
  const relationMultiplier = 0.5 + (familyRelation / 100) * 1.0;
  
  return Math.floor(baseInheritance * relationMultiplier);
};

/**
 * Trait multiplier hesaplama (tüm traits kombine etkisi)
 * @param traitIds Oyuncunun özelikleri
 * @param statKey Etkilenen stat (intelligence, charisma, etc.)
 * @returns Toplam multiplier (e.g., 1.3 = +30%)
 */
export const calculateTraitMultiplier = (
  traitIds: string[],
  statKey: string
): number => {
  let multiplier = 1.0;
  
  traitIds.forEach(id => {
    // Genetic checks
    if (id === 'GENIUS' && ["intelligence", "math", "science", "language", "coding", "design"].includes(statKey)) {
      multiplier += GENETIC_TRAITS.GENIUS.statMultiplier;
    }
    if (id === 'ATHLETIC' && ["sports", "health"].includes(statKey)) {
      multiplier += GENETIC_TRAITS.ATHLETIC.statMultiplier;
    }
    // ... add more trait checks as needed
  });
  
  return multiplier;
};

/**
 * Enerji maliyeti hesaplama (traits göz önüne alır)
 * @param baseCost Base enerji maliyeti (örn. 40)
 * @param traitIds Oyuncunun özelikleri
 * @returns Nihai enerji maliyeti
 */
export const calculateEnergyCost = (
  baseCost: number,
  traitIds: string[] = []
): number => {
  let multiplier = 1.0;
  
  if (traitIds.includes('ATHLETIC')) multiplier -= 0.15;
  if (traitIds.includes('LAZY')) multiplier += 0.25;
  if (traitIds.includes('DISCIPLINED')) multiplier -= 0.15;
  if (traitIds.includes('ORGANIZED')) multiplier -= 0.1;
  
  return Math.ceil(baseCost * multiplier);
};

// ============================================================================
// EXPORT DEFAULT CONFIG (Tüm ayarlar bir obje olarak)
// ============================================================================
export const GAME_BALANCE_CONFIG = {
  INITIAL_STATS,
  ENERGY_SYSTEM,
  STUDY_ACTIONS,
  SPORTS_ACTIONS,
  COMPUTER_ACTIONS,
  ART_ACTIONS,
  JOBS,
  SOCIAL_INTERACTION,
  FAMILY_SYSTEM,
  SCHOOL_SYSTEM,
  AGE_BASED_STAT_CAPS,
  STAT_GAIN_FORMULA,
  DISCIPLINE_MECHANICS,
  STREAK_SYSTEM,
  GENETIC_TRAITS,
  ACQUIRED_TRAITS,
  INNATE_TALENTS,
  TRAIT_FORMATION,
  AGE_PROGRESSION,
  CLUMSINESS_MECHANICS,
  GRADE_THRESHOLDS,
  FAMILY_REACTION_EFFECTS,
  TURN_MECHANICS,
  ENERGY_RECOVERY,
  VARIETY_BONUS_CONFIG,
  REPETITION_PENALTY_CONFIG,
} as const;

export default GAME_BALANCE_CONFIG;
