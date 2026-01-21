/**
 * YAZGI GAME BALANCE CONFIG - USAGE EXAMPLES
 * ==========================================
 * 
 * gameBalance.ts config dosyasını nasıl kullanacağınızı gösteren
 * örnekler ve best practices.
 * 
 * @version 1.0
 */

// ============================================================================
// ÖRNEK 1: Basit Import ve Değerlere Erişim
// ============================================================================

import {
  INITIAL_STATS,
  JOBS,
  STUDY_ACTIONS,
  SPORTS_ACTIONS,
  FAMILY_SYSTEM,
  FAMILY_REACTION_EFFECTS,
  SCHOOL_SYSTEM,
  calculateGradeFormula,
  calculateDiminishingReturns,
  calculateInheritance,
  calculateEnergyCost,
} from '../config/gameBalance';

/**
 * ÖRNEK: Oyun başladığında stats'ı initialize et
 */
function initializePlayerStats() {
  return {
    health: INITIAL_STATS.health,       // 70
    intelligence: INITIAL_STATS.intelligence,  // 0
    charisma: INITIAL_STATS.charisma,        // 10
    discipline: INITIAL_STATS.discipline,     // 0
    money: INITIAL_STATS.money,           // 0
    energy: INITIAL_STATS.energy,         // 100
    familyRelation: INITIAL_STATS.familyRelation, // 50
  };
}

// ============================================================================
// ÖRNEK 2: Aktivitelerin Enerji ve Efekt Değerlerini Kullanma
// ============================================================================

/**
 * ÖRNEK: Matematik dersi seçilince ne olur?
 */
function studyMath(playerStats: any, playerTraits: string[]) {
  // Config'den değerleri al
  const energyCost = STUDY_ACTIONS.math.energyCost;  // 40
  const intelligenceGain = STUDY_ACTIONS.math.intelligence;  // 8
  
  // Traits multiplier ile hesapla (ör: GENIUS varsa +30%)
  const finalGain = Math.floor(intelligenceGain * (1 + 0.3));
  
  return {
    energyDecrease: energyCost,
    intelligenceIncrease: finalGain,
    message: `📚 Matematik dersi çalıştı! +${finalGain} Zeka`,
  };
}

/**
 * ÖRNEK: Spor yap aktivitesi
 */
function doSports(playerStats: any, playerTraits: string[]) {
  const baseCost = SPORTS_ACTIONS.energyCost;  // 45
  const healthGain = SPORTS_ACTIONS.health;    // 12
  const sportSkillGain = SPORTS_ACTIONS.sportSkill;  // 5
  
  // ATHLETIC trait varsa enerji maliyeti azalır
  const energyCost = calculateEnergyCost(baseCost, playerTraits);
  
  return {
    energyDecrease: energyCost,
    healthIncrease: healthGain,
    sportSkillIncrease: sportSkillGain,
    message: `⚽ Spor yaptı! +${healthGain} Sağlık, +${sportSkillGain} Spor Becerisi`,
  };
}

/**
 * ÖRNEK: İş yap (ör: Garson)
 */
function workAsWaiter(playerAge: number, playerTraits: string[]) {
  // Age check
  if (playerAge < JOBS.waiter.minAge) {
    return { error: `Garsonluk için en az ${JOBS.waiter.minAge} yaşında olmalısın!` };
  }
  
  const baseCost = JOBS.waiter.energyCost;  // 40
  const moneyGain = JOBS.waiter.moneyGain;   // 60
  const charismaGain = JOBS.waiter.charisma;  // 5
  
  // Enerji maliyetini traits ile ayarla
  const finalEnergyCost = calculateEnergyCost(baseCost, playerTraits);
  
  return {
    energyDecrease: finalEnergyCost,
    moneyGain: moneyGain,
    charismaGain: charismaGain,
    message: `💼 Garson olarak çalıştı! +${moneyGain}₺, +${charismaGain} Karizması`,
  };
}

// ============================================================================
// ÖRNEK 3: Okul Sistemi - Not Hesaplama
// ============================================================================

/**
 * ÖRNEK: Rapor kartı notu hesapla
 */
function calculateSchoolGrade(
  playerIntelligence: number,
  playerEnergy: number,
  playerTraits: string[],
  luck: number = Math.random() * 10
): number {
  return calculateGradeFormula(playerIntelligence, playerEnergy, luck, playerTraits);
}

// Kullanım:
// const studentGrade = calculateSchoolGrade(75, 60, ['GENIUS', 'BOOKWORM']);
// // Zeka (75) * 1.2 - Stress (40 * 0.15) + Luck (5) + Bonuses (20) = ~ 95 (A)

/**
 * ÖRNEK: Öğrenci notlarına aile tepkisi
 */
function getFamilyReaction(
  averageGrade: number,
  familyWealth: 'POOR' | 'MIDDLE' | 'RICH',
  familyDynamic: 'SUPPORTIVE' | 'STRICT' | 'CHAOTIC'
) {
  if (familyDynamic === 'SUPPORTIVE' && averageGrade >= 80) {
    return {
      message: "Harika! Ebeveynlerin çok mutlu 🎉",
      effects: FAMILY_REACTION_EFFECTS.supportiveGoodGrades,
      charisma: 10,
      familyRelation: 15,
    };
  }
  
  if (familyDynamic === 'STRICT' && averageGrade < 60) {
    return {
      message: "Ebeveynler hayal kırıklığına uğradı 😞",
      effects: FAMILY_REACTION_EFFECTS.strictBadGrades,
      discipline: -10,
      familyRelation: -10,
    };
  }
  
  return { message: "Ebeveynler ilgisiz gibi gözüküyor 🤷", effects: {} };
}

// ============================================================================
// ÖRNEK 4: Aile Sistemi - Başlangıç Parası ve Miras
// ============================================================================

/**
 * ÖRNEK: Oyun başında aile servetine göre başlangıç parası
 */
function getStartingMoney(familyWealth: 'POOR' | 'MIDDLE' | 'RICH'): number {
  return FAMILY_SYSTEM.initialMoney[familyWealth];
  // POOR: 50₺
  // MIDDLE: 300₺
  // RICH: 1500₺
}

/**
 * ÖRNEK: Aylık harçlık (her yaş ilerlemesininde verilir)
 */
function getMonthlyAllowance(familyWealth: 'POOR' | 'MIDDLE' | 'RICH'): number {
  return FAMILY_SYSTEM.allowance[familyWealth];
  // POOR: 5₺
  // MIDDLE: 50₺
  // RICH: 250₺
}

/**
 * ÖRNEK: 18 yaşında miras hesapla
 */
function calculateEndGameInheritance(
  familyWealth: 'POOR' | 'MIDDLE' | 'RICH',
  familyDynamic: 'SUPPORTIVE' | 'STRICT' | 'CHAOTIC',
  familyRelationScore: number
): number {
  return calculateInheritance(familyWealth, familyDynamic, familyRelationScore);
  
  // Örnek: RICH + SUPPORTIVE + familyRelation 80
  // = 50000 * (0.5 + 80/100) = 50000 * 1.3 = 65000₺
}

// ============================================================================
// ÖRNEK 5: Yaş Sistemleri
// ============================================================================

import { AGE_PROGRESSION } from '../config/gameBalance';

/**
 * ÖRNEK: Kaç turda bir yaş ilerler?
 */
function getTurnsToAgeUp(currentAge: number): number {
  if (currentAge < AGE_PROGRESSION.youngAgeMax) {
    return AGE_PROGRESSION.youngAgeTurnPeriod;  // Her 2 tur
  }
  return AGE_PROGRESSION.normalAgeTurnPeriod;  // Her 5 tur
}

/**
 * ÖRNEK: Rapor kartını göster mi?
 */
function shouldShowReportCard(age: number): boolean {
  return (
    age >= SCHOOL_SYSTEM.reportCardStartAge &&
    age <= SCHOOL_SYSTEM.reportCardEndAge
  );
  // 7-18 yaş arası rapor kartı gösterilir
}

// ============================================================================
// ÖRNEK 6: Stat Gain Formula (Diminishing Returns)
// ============================================================================

/**
 * ÖRNEK: Daha ileri seviyedeki istatistik kazanımı
 */
function applyStatGain(
  currentValue: number,
  baseGain: number,
  cap: number = 100
): number {
  return calculateDiminishingReturns(currentValue, baseGain, cap);
  
  // currentValue: 50, baseGain: 10, cap: 100
  // 50 < 70 → full gain = 10
  
  // currentValue: 75, baseGain: 10, cap: 100
  // 70-100 → half gain = 5
  
  // currentValue: 105, baseGain: 10, cap: 100
  // >100 → minimal gain = 2
}

// ============================================================================
// ÖRNEK 7: Disiplin Mekanikleri
// ============================================================================

import { DISCIPLINE_MECHANICS } from '../config/gameBalance';

/**
 * ÖRNEK: Aktivite başarılı oldu mu (disiplinin etkisi)?
 */
function checkDisciplineBonus(disciplineScore: number): {
  success: boolean;
  multiplier: number;
  feedback: string;
} {
  if (disciplineScore >= DISCIPLINE_MECHANICS.highDisciplineThreshold) {
    // 60+ disiplin: başarı şansı var
    const chance = DISCIPLINE_MECHANICS.highDisciplineSuccessChance(disciplineScore);
    if (Math.random() < chance) {
      return {
        success: true,
        multiplier: DISCIPLINE_MECHANICS.highDisciplineMultiplier,  // 1.3x
        feedback: "⚡ Disiplinli çalıştın! 1.3x daha etkili!",
      };
    }
  }
  
  if (disciplineScore < DISCIPLINE_MECHANICS.lowDisciplineThreshold) {
    // <30 disiplin: başarısızlık riski
    const failChance = DISCIPLINE_MECHANICS.lowDisciplineFailureChance(disciplineScore);
    if (Math.random() < failChance) {
      return {
        success: false,
        multiplier: DISCIPLINE_MECHANICS.lowDisciplineMultiplier,  // 0.7x
        feedback: "☁️ Dikkat dağınıklığı... 0.7x daha etkisiz oldu!",
      };
    }
  }
  
  return {
    success: true,
    multiplier: 1.0,
    feedback: "",
  };
}

// ============================================================================
// ÖRNEK 8: Seri Mekanikleri (Streak Bonuses)
// ============================================================================

import { STREAK_SYSTEM } from '../config/gameBalance';

/**
 * ÖRNEK: Aynı aktiviteyi tekrar tekrar yaptığında bonus
 */
function getStreakMultiplier(consecutiveCount: number): number {
  if (consecutiveCount >= 3) {
    return STREAK_SYSTEM.threeStreakMultiplier;  // 1.5x
  } else if (consecutiveCount === 2) {
    return STREAK_SYSTEM.twoStreakMultiplier;  // 1.2x
  }
  return 1.0;
}

// Kullanım:
// const multiplier = getStreakMultiplier(3);  // 1.5x
// const message = `Şimdi ${STREAK_SYSTEM.streakEmoji} çalışıyor!`;

// ============================================================================
// ÖRNEK 9: Özellik Formasyonu (Trait Formation)
// ============================================================================

import { TRAIT_FORMATION } from '../config/gameBalance';

/**
 * ÖRNEK: BOOKWORM özelliğine sahip mi?
 */
function checkBookwormTrait(
  currentAge: number,
  studyHoursLogged: number
): boolean {
  if (currentAge < TRAIT_FORMATION.BOOKWORM.minAge ||
      currentAge > TRAIT_FORMATION.BOOKWORM.maxAge) {
    return false;
  }
  
  return studyHoursLogged >= TRAIT_FORMATION.BOOKWORM.requiredStudyHours;
  // 6-16 yaş arası 15 saat ders çalışırsan BOOKWORM olursun
}

/**
 * ÖRNEK: MUSICIAN özelliğine sahip mi?
 */
function checkMusicianTrait(
  currentAge: number,
  musicSessionCount: number
): boolean {
  if (currentAge < TRAIT_FORMATION.MUSICIAN.minAge ||
      currentAge > TRAIT_FORMATION.MUSICIAN.maxAge) {
    return false;
  }
  
  return musicSessionCount >= TRAIT_FORMATION.MUSICIAN.requiredMusicSessions;
  // 6-17 yaş arası 6 müzik oturumu yaparsanız MUSICIAN olursunuz
}

// ============================================================================
// ÖRNEK 10: NPC İlişkileri (Relationship Thresholds)
// ============================================================================

import { SOCIAL_INTERACTION } from '../config/gameBalance';

/**
 * ÖRNEK: NPC'nin roleunu ilişki skoru'na göre belirle
 */
function determineNPCRole(relationshipScore: number, romanceScore: number): string {
  if (relationshipScore < SOCIAL_INTERACTION.relationship.rivalThreshold) {
    return "RIVAL";
  }
  
  if (relationshipScore < SOCIAL_INTERACTION.relationship.enemyThreshold) {
    return "ENEMY";
  }
  
  if (romanceScore > SOCIAL_INTERACTION.romance.partnerThreshold &&
      relationshipScore > SOCIAL_INTERACTION.romance.partnerThreshold) {
    return "PARTNER";  // 80+ romance ve 50+ relationship
  }
  
  if (romanceScore > SOCIAL_INTERACTION.romance.crushThreshold &&
      relationshipScore > 20) {
    return "CRUSH";  // 40+ romance ve 20+ relationship
  }
  
  if (relationshipScore > SOCIAL_INTERACTION.relationship.bestFriendThreshold) {
    return "BEST_FRIEND";  // 85+ relationship
  }
  
  if (relationshipScore > SOCIAL_INTERACTION.relationship.friendThreshold) {
    return "FRIEND";  // 50+ relationship
  }
  
  return "ACQUAINTANCE";  // Default
}

// ============================================================================
// ÖRNEK 11: ADVANCED - Tüm Kazanımları Birleştir
// ============================================================================

/**
 * ÖRNEK: Matematikçi olmak istiyorsanız (7-18 yaş) tüm multiplier'ları uygula
 */
function calculateMathGain(
  baseGain: number,          // 8 (STUDY_ACTIONS.math.intelligence)
  currentIntelligence: number, // 45
  maxIntelligence: number,    // 90 (yaş bazlı cap)
  playerTraits: string[],     // ['GENIUS', 'BOOKWORM', 'ORGANIZED']
  streakCount: number,        // 3 (aynı aktiviteyi 3 tur)
  disciplineScore: number     // 65
): number {
  let finalGain = baseGain;
  
  // 1. Diminishing returns
  finalGain = calculateDiminishingReturns(currentIntelligence, finalGain, maxIntelligence);
  
  // 2. Trait multipliers
  if (playerTraits.includes('GENIUS')) finalGain *= 1.3;  // +30%
  if (playerTraits.includes('BOOKWORM')) finalGain *= 1.4;  // +40%
  if (playerTraits.includes('ORGANIZED')) finalGain *= 1.2;  // +20%
  
  // 3. Streak multiplier
  const streakMult = getStreakMultiplier(streakCount);
  finalGain *= streakMult;
  
  // 4. Discipline bonus
  if (disciplineScore >= 60) {
    finalGain *= 1.3;  // +30% extra if disciplined
  }
  
  return Math.floor(finalGain);
  
  // Örnek: 8 * 1 * 1.3 * 1.4 * 1.2 * 1.5 * 1.3 = ~45 zeka kazanımı!
}

// ============================================================================
// ÖRNEK 12: Dinamik Config Değişme (Oyun Ortasında)
// ============================================================================

/**
 * ÖRNEK: Config'den değer oku ve runtime'da değiştir
 * (Type-safe olmak için dikkatli kullan!)
 */

// ❌ YANLIŞ: Config objesi doğrudan değiştirme
// STUDY_ACTIONS.math.energyCost = 20;  // Type-safety ihlali!

// ✅ DOĞRU: Local kopya oluştur
function modifyStudyActionForDebug() {
  const modifiedStudyActions = {
    ...STUDY_ACTIONS,
    math: {
      ...STUDY_ACTIONS.math,
      energyCost: 10,  // Debug için düşür
    },
  };
  return modifiedStudyActions;
}

// ============================================================================
// EXPORT
// ============================================================================

export {
  initializePlayerStats,
  studyMath,
  doSports,
  workAsWaiter,
  calculateSchoolGrade,
  getFamilyReaction,
  getStartingMoney,
  getMonthlyAllowance,
  calculateEndGameInheritance,
  getTurnsToAgeUp,
  shouldShowReportCard,
  applyStatGain,
  checkDisciplineBonus,
  getStreakMultiplier,
  checkBookwormTrait,
  checkMusicianTrait,
  determineNPCRole,
  calculateMathGain,
};
