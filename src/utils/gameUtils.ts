
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stats, StatKey, Family, GameState, CareerResult, NPC, FamilyWealth, FamilyDynamic, NPCPersonality, NPCTrait, ZodiacSign, PlayerGender, CharacterInfo, Skills, SchoolGrades, EventMemory, Personality } from '../types';
import { TRAIT_DEFINITIONS } from '../data/traits';
import { BALANCE_CONTRACT, calculateInitialEnergy } from '../config/balanceContract';
import { DEFAULT_FAMILY_EVOLUTION_STATE } from './familyNarrative';
import { getPersonalityArchetype, getArchetypeDescription, PersonalityArchetype } from './personalitySystem';

export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

// --- YAŞLANMA ALGORİTMASI (GDD Bölüm 2.2) ---
// GDD Şartı: 0-7 yaş: Her 2 tur, 7-18 yaş: Her 5 tur
export const shouldAgeUp = (currentAge: number, turnCount: number): boolean => {
  if (currentAge < 7) {
    return turnCount % 2 === 0;
  } else if (currentAge < 18) {
    return turnCount % 5 === 0;
  }
  return false; // 18 yaşından sonra yaşlanma durur (oyun biter)
};

// --- AİLE SİSTEMİ BAŞLATMA (KRİTİK) ---
export const createRandomFamily = (): Family => {
  // Wealth dağılımı: %30 Poor, %50 Middle, %20 Rich
  const wealthRoll = Math.random();
  let wealth: FamilyWealth;
  if (wealthRoll < 0.3) {
    wealth = 'POOR';
  } else if (wealthRoll < 0.8) {
    wealth = 'MIDDLE';
  } else {
    wealth = 'RICH';
  }

  // Dynamic dağılımı: %40 Supportive, %35 Strict, %25 Chaotic
  const dynamicRoll = Math.random();
  let dynamic: FamilyDynamic;
  if (dynamicRoll < 0.4) {
    dynamic = 'SUPPORTIVE';
  } else if (dynamicRoll < 0.75) {
    dynamic = 'STRICT';
  } else {
    dynamic = 'CHAOTIC';
  }

  // Allowance: Wealth'e göre belirlenir
  let allowance = 0;
  switch (wealth) {
    case 'POOR':
      allowance = getRandomInt(5, 15);
      break;
    case 'MIDDLE':
      allowance = getRandomInt(20, 40);
      break;
    case 'RICH':
      allowance = getRandomInt(50, 100);
      break;
  }

  return { wealth, dynamic, allowance };
};

// --- KALITSAL ÖZELLİKLER (GENETIC TRAITS) ---
// GDD Şartı: Doğumda rastgele atanır (%5-15 şans)
export const assignGeneticTraits = (): string[] => {
  const geneticTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'GENETIC');
  const assignedTraits: string[] = [];

  // Her genetic trait için %5-15 şans ile atama
  geneticTraits.forEach(trait => {
    const chance = getRandomInt(5, 15);
    if (Math.random() * 100 < chance) {
      assignedTraits.push(trait.id);
    }
  });

  return assignedTraits;
};

// --- ENERJİ TÜKETİMİ SİSTEMİ ---
// GDD Şartı: Her aktivite -5 ila -20 enerji
export const calculateEnergyCost = (actionId: string, traitIds: string[]): number => {
  // Temel enerji maliyeti (aksiyon tipine göre)
  let baseCost = 10;

  // Aksiyon tipine göre maliyet
  if (actionId.includes('study')) baseCost = 15;
  else if (actionId.includes('sports')) baseCost = 20;
  else if (actionId.includes('work')) baseCost = 18;
  else if (actionId.includes('social')) baseCost = 8;
  else if (actionId.includes('coding') || actionId.includes('music') || actionId.includes('art')) baseCost = 12;
  else if (actionId.includes('rest') || actionId.includes('sleep')) baseCost = 5;

  // Trait multiplier'ı uygula
  const multiplier = getEnergyCostMultiplier(traitIds);

  return Math.floor(baseCost * multiplier);
};

// --- OKUL SİSTEMİ (RAPOR KARTI) ---
// GDD Şartı: Her 5 tur (7-18 yaş) rapor kartı
export const shouldGenerateReportCard = (currentAge: number, turnCount: number): boolean => {
  if (currentAge < 7 || currentAge >= 18) return false;
  return turnCount % 5 === 0;
};

// --- SAVE SYSTEM V3 (MULTI-SLOT) ---
// Legacy key kept for backward compatibility
export const SAVE_KEY = 'lifesim_save_data_v2';

// BAŞLANGIÇ VERİLERİNİ ÜRETEN FONKSİYONLAR
// Not: 0 yaş için cap'ler düşük olduğundan başlangıç değerleri buna uygun ayarlanmalı
// age=0 için: health cap=30, intelligence/charisma/discipline cap=30
export const getInitialStats = (): Stats => {
  const health = BALANCE_CONTRACT.initialStats.health; // 0 yaş cap'i 30, başlangıç bunun altında olmalı
  const energy = calculateInitialEnergy(health);
  return {
    health,
    intelligence: BALANCE_CONTRACT.initialStats.intelligence,
    charisma: BALANCE_CONTRACT.initialStats.charisma, // 0 yaş cap'i 30, başlangıç düşük
    discipline: BALANCE_CONTRACT.initialStats.discipline,
    money: BALANCE_CONTRACT.initialStats.money,
    energy,
    familyRelation: BALANCE_CONTRACT.initialStats.familyRelation
  };
};

export const getMaxEnergy = (age: number, family: Family | null = null, traitIds: string[] = []): number => {
  return getStatCap(age, 'energy', family, traitIds);
};

export const getRestedEnergy = (maxEnergy: number): number => {
  return Math.max(0, Math.round(maxEnergy));
};

export const getInitialGameState = (): GameState => {
  // Aile sistemi başlatma (KRİTİK)
  const family = createRandomFamily();

  // Kalıtsal özellikler (Genetic Traits) atama (YÜKSEK)
  const geneticTraits = assignGeneticTraits();

  // Başlangıç NPC'leri (oyuncuyla aynı yaşta başlarlar)
  const npcs = generateNPCs(0, 1);
  const maxEnergy = getMaxEnergy(0, family, geneticTraits);

  return {
    age: 0,
    turn: 1,
    phase: 'SETUP',
    currentEvent: null,
    pendingReportCard: false,
    characterInfo: null, // Karakter oluşturma ekranında set edilecek
    lastResult: null,
    historyLog: [],
    family,
    maxEnergy,
    schoolGrades: { math: 50, science: 50, language: 50, turkish: 50, history: 50, geography: 50, art: 50, music: 50 },

    skills: {
      coding: 0,
      music: 0,
      sports: 0,
      design: 0,
      athletics: 0,
      logic: 0,
      reading: 0,
      teamwork: 0,
      art: 0,
      writing: 0,
      work_ethic: 0,
      business: 0,
    },
    talent: 'NONE',
    streak: { actionId: null, count: 0 },
    traits: geneticTraits, // Genetic traits başlangıçta atanır
    traitProgress: {},
    actionCounts: {},
    actionHistory: [],
    eventChoiceHistory: [],
    memories: [],
    scheduledEvents: [],
    activeArcs: [],
    familyEvolution: { ...DEFAULT_FAMILY_EVOLUTION_STATE },
    inventory: [],
    npcs, // Başlangıç NPC'leri
    selectedNpcId: null,
    innerThought: "",
    floatingTexts: [],
    totalTurns: 0,
    sessionCount: 0,
    adaptivePacingStreak: 0,
    lastInteracted: {
      math: 0, science: 0, language: 0,
      coding: 0, music: 0, sports: 0, design: 0,
      athletics: 0, logic: 0, reading: 0, teamwork: 0,
      art: 0, writing: 0, work_ethic: 0, business: 0,
    },
    recentEvents: [],
    eventFrequency: {},
    unlockedAchievements: [],
    achievementProgress: {},
    // Personality System - all values start at 50 (neutral)
    personality: {
      openness: 50,
      courage: 50,
      empathy: 50,
      patience: 50,
      conformity: 50
    },
    stress: {
      current: 0,
      threshold: 70,
      turnsSinceBreakdown: 0,
      sources: []
    },
    personalityHistory: [],
    // Sosyal sistem
    socialGroups: [],
    socialReputation: 50,
    // Childhood prolog
    childhood: {
      completed: false,
      sceneIndex: 0,
      memories: [],
      selectedMemoryId: null,
    },
    // Sınav sistemi
    examsTakenThisYear: [],
    isExamPeriod: false
  };
};

// --- MULTI-SLOT SAVE SYSTEM INTEGRATION ---
// Current slot ID - defaults to Slot 1 for backwards compatibility
let currentSlotId: string = '1';
const CURRENT_SLOT_KEY = '@yazgi_save/current_slot';

export const setCurrentSlotId = (slotId: string) => {
  currentSlotId = slotId;
  void AsyncStorage.setItem(CURRENT_SLOT_KEY, slotId);
};

export const getCurrentSlotId = (): string => {
  return currentSlotId;
};

export const getAsyncStorage = async (key: string) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.error('Failed to read value from async storage', e);
    return null;
  }
};

/**
 * Initialize save system (call once on app start)
 * Migrates legacy saves automatically
 */
export const initializeSaveSystem = async () => {
  try {
    const storedSlotId = await AsyncStorage.getItem(CURRENT_SLOT_KEY);
    if (storedSlotId) {
      currentSlotId = storedSlotId;
    }
    const legacyData = await getAsyncStorage(SAVE_KEY);
    if (legacyData) {
      console.log('Legacy save data found. Migration will be handled by SaveManager.');
    }
    const SaveManager = (await import('../save/SaveManager')).default;
    await SaveManager.initialize();
    return true;
  } catch (error) {
    console.error("Save system initialization failed:", error);
    return false;
  }
};

export const clearSlotSave = async (slotId: string): Promise<boolean> => {
  try {
    const SaveManager = (await import('../save/SaveManager')).default;
    const success = await SaveManager.clearSlot(slotId);
    return success;
  } catch (error) {
    console.error('Clear slot save failed:', error);
    return false;
  }
};

/**
 * Save game to current slot (backwards compatible wrapper)
 */
export const saveGame = async (data: { stats: Stats, gameState: GameState, playerName: string }) => {
  try {
    const SaveManager = (await import('../save/SaveManager')).default;
    const success = await SaveManager.saveToSlot(
      currentSlotId,
      data.playerName,
      data.stats,
      data.gameState
    );
    return success;
  } catch (error) {
    console.error("Kaydederken hata oluştu:", error);
    return false;
  }
};

/**
 * Load game from current slot (backwards compatible wrapper)
 */
export const loadGame = async () => {
  try {
    const SaveManager = (await import('../save/SaveManager')).default;
    const saveData = await SaveManager.loadFromSlot(currentSlotId);
    return saveData;
  } catch (error) {
    console.error("Yüklerken hata oluştu:", error);
    return null;
  }
};

/**
 * Reset/delete current slot (backwards compatible wrapper)
 */
export const resetGameStorage = async () => {
  try {
    const SaveManager = (await import('../save/SaveManager')).default;
    const success = await SaveManager.deleteSlot(currentSlotId);
    return success;
  } catch (error) {
    console.error("Sıfırlarken hata oluştu:", error);
    return false;
  }
};

/**
 * Auto-save to dedicated auto-save slot
 */
export const autoSaveGame = async (data: { stats: Stats, gameState: GameState, playerName: string }) => {
  try {
    const SaveManager = (await import('../save/SaveManager')).default;
    const success = await SaveManager.autoSave(
      data.playerName,
      data.stats,
      data.gameState
    );
    return success;
  } catch (error) {
    console.error("Auto-save failed:", error);
    return false;
  }
};

export const getStatCap = (age: number, statKey: StatKey, family?: Family | null, traitIds: string[] = []): number => {
  if (statKey === 'money') return Infinity;

  if (statKey === 'energy') {
    let energyCap = 100;
    if (age >= 3 && age <= 6) energyCap += 10;
    if (family && family.wealth === 'POOR') energyCap -= 10;
    if (traitIds.includes('BURNOUT_PRONE')) energyCap -= 15;
    if (traitIds.includes('ATHLETIC')) energyCap += 10;
    return energyCap;
  }

  if (statKey === 'familyRelation') return 100;

  let baseCap = 100;

  if (statKey === 'health' && traitIds.includes('SICKLY')) {
    return 60;
  }

  // Yaşa bağlı soft cap (Sınıf düzeyi mantığı)
  if (age < 7) baseCap = 30;       // Okul öncesi
  else if (age < 10) baseCap = 50; // İlkokul
  else if (age < 14) baseCap = 70; // Ortaokul
  else if (age < 18) baseCap = 90; // Lise
  else baseCap = 100;              // Yetişkin

  if (family) {
    if (family.wealth === 'RICH') {
      if (statKey === 'health') baseCap += 5;
      if (statKey === 'charisma') baseCap += 5;
    }
    if (family.wealth === 'POOR') {
      if (statKey === 'health') baseCap -= 10;
      if (statKey === 'intelligence') baseCap -= 5;
    }
    if (family.dynamic === 'STRICT') {
      if (statKey === 'discipline') baseCap += 10;
      if (statKey === 'charisma') baseCap -= 10;
    }
    if (family.dynamic === 'CHAOTIC') {
      if (statKey === 'discipline') baseCap -= 20;
    }
  }

  return clamp(baseCap, 25, 100);
};

export const getTraitMultiplier = (traitIds: string[], statKey: string): number => {
  let multiplier = 1.0;

  traitIds.forEach(id => {
    switch (id) {
      // --- GENETIC ---
      case 'GENIUS':
        if (['intelligence', 'math', 'science', 'language', 'coding', 'design', 'logic', 'reading', 'writing'].includes(statKey)) multiplier += 0.3;
        break;
      case 'ATHLETIC':
        if (['sports', 'health', 'athletics'].includes(statKey)) multiplier += 0.3;
        break;
      case 'CHARISMATIC':
        if (['charisma', 'familyRelation', 'teamwork'].includes(statKey)) multiplier += 0.3;
        break;
      case 'CLUMSY':
        if (['sports', 'coding', 'music', 'design', 'athletics', 'art'].includes(statKey)) multiplier -= 0.15;
        break;
      case 'SICKLY':
        if (['health', 'sports', 'athletics'].includes(statKey)) multiplier -= 0.1;
        break;

      // --- ACQUIRED POSITIVE ---
      case 'EMPATHETIC':
        if (['charisma', 'familyRelation'].includes(statKey)) multiplier += 0.25;
        break;
      case 'ORGANIZED':
        if (['discipline', 'math', 'science', 'language'].includes(statKey)) multiplier += 0.2;
        break;
      case 'BRAVE':
        if (['charisma', 'sports'].includes(statKey)) multiplier += 0.2;
        break;
      case 'DISCIPLINED':
        if (['discipline', 'intelligence', 'coding', 'math', 'science', 'work_ethic'].includes(statKey)) multiplier += 0.15;
        break;
      case 'AMBITIOUS':
        if (['money'].includes(statKey)) multiplier += 0.3;
        if (['intelligence'].includes(statKey)) multiplier += 0.1;
        break;
      case 'CREATIVE':
        if (['design', 'music', 'art', 'writing'].includes(statKey)) multiplier += 0.3;
        if (['coding'].includes(statKey)) multiplier += 0.1;
        break;
      case 'BOOKWORM':
        if (['language', 'intelligence', 'reading', 'writing', 'logic'].includes(statKey)) multiplier += 0.4;
        if (['sports', 'athletics'].includes(statKey)) multiplier -= 0.1;
        break;
      case 'SOCIAL_BUTTERFLY':
        if (['charisma', 'familyRelation', 'teamwork'].includes(statKey)) multiplier += 0.25;
        if (['discipline'].includes(statKey)) multiplier -= 0.05;
        break;
      case 'ENTREPRENEUR':
        if (['money', 'business'].includes(statKey)) multiplier += 0.25;
        break;
      case 'HONEST':
        if (['familyRelation'].includes(statKey)) multiplier += 0.2;
        break;
      case 'NIGHT_OWL':
        if (['coding', 'music', 'design'].includes(statKey)) multiplier += 0.2;
        break;

      // --- ACQUIRED NEGATIVE/NEUTRAL ---
      case 'LAZY':
        if (['discipline', 'sports', 'money', 'work_ethic', 'athletics'].includes(statKey)) multiplier -= 0.2;
        break;
      case 'GAMER':
        if (['intelligence', 'coding', 'design'].includes(statKey)) multiplier += 0.15;
        if (['charisma', 'health'].includes(statKey)) multiplier -= 0.1;
        break;
      case 'LONE_WOLF':
        if (['intelligence', 'coding', 'art', 'writing'].includes(statKey)) multiplier += 0.15;
        if (['charisma', 'familyRelation'].includes(statKey)) multiplier -= 0.2;
        break;
      case 'REBELLIOUS':
        if (['discipline', 'familyRelation'].includes(statKey)) multiplier -= 0.2;
        if (['charisma'].includes(statKey)) multiplier += 0.1;
        break;
      case 'CHEATER':
        if (['discipline'].includes(statKey)) multiplier -= 0.15;
        break;
      case 'COWARD':
        if (['charisma'].includes(statKey)) multiplier -= 0.2;
        break;
      case 'PROCRASTINATOR':
        if (['discipline', 'math', 'science', 'work_ethic'].includes(statKey)) multiplier -= 0.1;
        break;
      case 'PRAGMATIC':
        if (['money', 'intelligence', 'business'].includes(statKey)) multiplier += 0.1;
        if (['familyRelation'].includes(statKey)) multiplier -= 0.1;
        break;
    }
  });

  return multiplier;
};

export const getEnergyCostMultiplier = (traitIds: string[]): number => {
  let multiplier = 1.0;

  // Genetic
  if (traitIds.includes('ATHLETIC')) multiplier -= 0.15;
  if (traitIds.includes('SICKLY')) multiplier += 0.15;

  // Acquired
  if (traitIds.includes('LAZY')) multiplier += 0.25;
  if (traitIds.includes('DISCIPLINED')) multiplier -= 0.15;
  if (traitIds.includes('ORGANIZED')) multiplier -= 0.10;
  if (traitIds.includes('BURNOUT_PRONE')) multiplier += 0.20;
  if (traitIds.includes('LONE_WOLF')) multiplier -= 0.05;
  if (traitIds.includes('PROCRASTINATOR')) multiplier += 0.10;

  return multiplier;
};

// GÜNCELLENMİŞ STAT KAZANIM FORMÜLÜ (Azalan Getiri)
export const calculateStatGain = (currentValue: number, baseGain: number, cap: number = 100): number => {
  if (baseGain <= 0) return baseGain;

  // 1. Cap'in %70'inin altındaysa: TAM PUAN (Hızlı Gelişim)
  if (currentValue < cap * 0.7) {
    return baseGain;
  }
  // 2. Cap'e yaklaştıysa: YARI PUAN (Zorlaşan Dersler)
  else if (currentValue < cap) {
    return Math.ceil(baseGain * 0.5);
  }
  // 3. Cap'i aştıysa: MİNİMUM PUAN (Sınırı zorlamak çok zor)
  else {
    return Math.ceil(baseGain * 0.2); // Genelde 1 puan
  }
};

export const updateStats = (currentStats: Stats, changes: Partial<Stats>, age: number = 18, family: Family | null = null, traitIds: string[] = []): Stats => {
  const newStats = { ...currentStats };

  (Object.keys(changes) as StatKey[]).forEach((key) => {
    if (changes[key] !== undefined) {
      let changeVal = changes[key] || 0;
      const dynamicCap = getStatCap(age, key, family, traitIds);

      if (changeVal > 0 && key !== 'money' && key !== 'energy') {
        changeVal = calculateStatGain(newStats[key], changeVal, dynamicCap);
      }

      let newValue = newStats[key] + changeVal;
      let minLimit = 0;
      if (key === 'money') minLimit = 0;

      newStats[key] = clamp(newValue, minLimit, dynamicCap + 10); // Soft Cap'i biraz aşmaya izin ver
    }
  });

  return newStats;
};

export interface SkillChangeResult {
  newSkills: Skills;
  appliedChanges: Partial<Skills>;
}

const getSkillRatio = (value: number): number => clamp(value / 100, 0, 1);

const scalePositive = (value: number, ratio: number, maxBonus: number): number => {
  if (value <= 0) return value;
  return Math.ceil(value * (1 + maxBonus * ratio));
};

const scaleNegative = (value: number, ratio: number, maxReduction: number): number => {
  if (value >= 0) return value;
  return Math.floor(value * (1 - maxReduction * ratio));
};

export interface HubActionSkillAdjustment {
  energyCost: number;
  effect: Partial<Stats>;
  gradeUpdates?: Partial<SchoolGrades>;
}

export interface SocialInteractionCost {
  energy: number;
  money: number;
}

export const applySkillsToSocialCost = (
  cost: SocialInteractionCost,
  skills?: Skills
): SocialInteractionCost => {
  if (!skills) return cost;
  const teamworkRatio = getSkillRatio(skills.teamwork);
  const businessRatio = getSkillRatio(skills.business);
  return {
    energy: Math.max(0, Math.ceil(cost.energy * (1 - 0.08 * teamworkRatio))),
    money: cost.money > 0
      ? Math.max(0, Math.ceil(cost.money * (1 - 0.15 * businessRatio)))
      : cost.money,
  };
};

export const getTeamworkRelationMultiplier = (skills?: Skills): number => {
  if (!skills) return 1;
  const teamworkRatio = getSkillRatio(skills.teamwork);
  return 1 + (teamworkRatio * 0.2);
};

export const applySkillsToHubAction = (
  actionId: string,
  baseEffect: Partial<Stats>,
  baseEnergyCost: number,
  baseGradeUpdates: Partial<SchoolGrades> | undefined,
  skills: Skills
): HubActionSkillAdjustment => {
  const nextEffect: Partial<Stats> = { ...baseEffect };
  let energyCost = baseEnergyCost;
  const nextGrades: Partial<SchoolGrades> = { ...(baseGradeUpdates || {}) };

  const athleticsRatio = getSkillRatio(skills.athletics);
  const logicRatio = getSkillRatio(skills.logic);
  const readingRatio = getSkillRatio(skills.reading);
  const teamworkRatio = getSkillRatio(skills.teamwork);
  const artRatio = getSkillRatio(skills.art);
  const musicRatio = getSkillRatio(skills.music);
  const writingRatio = getSkillRatio(skills.writing);
  const workEthicRatio = getSkillRatio(skills.work_ethic);
  const businessRatio = getSkillRatio(skills.business);
  const codingRatio = getSkillRatio(skills.coding);
  const designRatio = getSkillRatio(skills.design);

  if (actionId.startsWith('sports_')) {
    energyCost = Math.max(1, Math.ceil(energyCost * (1 - 0.15 * athleticsRatio)));
    if (nextEffect.health !== undefined) {
      nextEffect.health = scalePositive(nextEffect.health, athleticsRatio, 0.2);
    }
    if (nextEffect.discipline !== undefined) {
      nextEffect.discipline = scalePositive(nextEffect.discipline, athleticsRatio, 0.08);
    }
    if (actionId.includes('football') && nextEffect.charisma !== undefined) {
      nextEffect.charisma = scalePositive(nextEffect.charisma, teamworkRatio, 0.15);
    }
  }

  if (actionId.startsWith('study_')) {
    energyCost = Math.max(1, Math.ceil(energyCost * (1 - 0.08 * logicRatio)));
    if (nextEffect.intelligence !== undefined) {
      nextEffect.intelligence = scalePositive(nextEffect.intelligence, logicRatio, 0.2);
    }
    if (actionId.includes('turkish') || actionId.includes('english') || actionId.includes('book')) {
      if (nextGrades.language !== undefined) {
        nextGrades.language = scalePositive(nextGrades.language, readingRatio, 0.15);
      }
      if (nextGrades.turkish !== undefined) {
        nextGrades.turkish = scalePositive(nextGrades.turkish, readingRatio, 0.15);
      }
      if (nextEffect.charisma !== undefined) {
        nextEffect.charisma = scalePositive(nextEffect.charisma, writingRatio, 0.12);
      }
    }
    if (actionId.includes('homework')) {
      const homeworkBoost = Math.max(readingRatio, writingRatio);
      if (nextEffect.discipline !== undefined) {
        nextEffect.discipline = scalePositive(nextEffect.discipline, homeworkBoost, 0.12);
      }
    }
    if (nextGrades.math !== undefined) {
      nextGrades.math = scalePositive(nextGrades.math, logicRatio, 0.15);
    }
    if (nextGrades.science !== undefined) {
      nextGrades.science = scalePositive(nextGrades.science, logicRatio, 0.15);
    }
    if (nextGrades.art !== undefined) {
      nextGrades.art = scalePositive(nextGrades.art, artRatio, 0.12);
    }
    if (nextGrades.music !== undefined) {
      nextGrades.music = scalePositive(nextGrades.music, musicRatio, 0.12);
    }
  }

  if (actionId.startsWith('arts_')) {
    if (nextEffect.charisma !== undefined) {
      nextEffect.charisma = scalePositive(nextEffect.charisma, artRatio, 0.15);
    }
    if (actionId.includes('write') && nextEffect.intelligence !== undefined) {
      nextEffect.intelligence = scalePositive(nextEffect.intelligence, writingRatio, 0.15);
    }
  }

  if (actionId.startsWith('computer_')) {
    energyCost = Math.max(1, Math.ceil(energyCost * (1 - 0.08 * codingRatio)));
    if (nextEffect.intelligence !== undefined) {
      nextEffect.intelligence = scalePositive(nextEffect.intelligence, codingRatio, 0.12);
    }
    if (actionId.includes('design') && nextEffect.charisma !== undefined) {
      nextEffect.charisma = scalePositive(nextEffect.charisma, designRatio, 0.12);
    }
  }

  if (actionId.startsWith('work_')) {
    energyCost = Math.max(1, Math.ceil(energyCost * (1 - 0.08 * workEthicRatio)));
    if (nextEffect.money !== undefined) {
      const combinedRatio = Math.max(workEthicRatio, businessRatio);
      nextEffect.money = scalePositive(nextEffect.money, combinedRatio, 0.2);
    }
  }

  if (actionId.startsWith('shopping_')) {
    if (nextEffect.money !== undefined) {
      nextEffect.money = scaleNegative(nextEffect.money, businessRatio, 0.15);
    }
  }

  return {
    energyCost,
    effect: nextEffect,
    gradeUpdates: Object.keys(nextGrades).length > 0 ? nextGrades : baseGradeUpdates,
  };
};

export const applySkillUpdates = (
  currentSkills: Skills,
  updates: Partial<Skills>,
  traitIds: string[] = []
): SkillChangeResult => {
  const newSkills = { ...currentSkills };
  const appliedChanges: Partial<Skills> = {};

  (Object.keys(updates) as (keyof Skills)[]).forEach((key) => {
    const delta = updates[key];
    if (delta === undefined || delta === 0) return;

    const currentValue = newSkills[key] ?? 0;
    let appliedDelta = delta;

    if (delta > 0) {
      appliedDelta = calculateStatGain(currentValue, delta, 100);
      const multiplier = getTraitMultiplier(traitIds, String(key));
      appliedDelta = Math.ceil(appliedDelta * multiplier);
    }

    const nextValue = clamp(currentValue + appliedDelta, 0, 100);
    newSkills[key] = nextValue;

    const actualDelta = nextValue - currentValue;
    if (actualDelta !== 0) {
      appliedChanges[key] = actualDelta;
    }
  });

  return { newSkills, appliedChanges };
};

export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const hasItem = (inventory: string[], itemId: string): boolean => {
  return inventory.includes(itemId);
};

// =================================================================
// NPC SİSTEMİ
// =================================================================

// Genişletilmiş Türk isim havuzları (100+ isim)
const maleNames = [
  // Klasik isimler
  "Ahmet", "Mehmet", "Mustafa", "Ali", "Hüseyin", "Hasan", "İbrahim", "Osman", "Yusuf", "Ömer",
  // Modern isimler
  "Can", "Burak", "Emre", "Kerem", "Mert", "Deniz", "Volkan", "Cem", "Arda", "Efe",
  "Bora", "Sinan", "Kaan", "Yiğit", "Berkay", "Oğuz", "Tolga", "Onur", "Serkan", "Hakan",
  "Eren", "Alp", "Barış", "Doruk", "Emir", "Furkan", "Görkem", "Halil", "İlker", "Kağan",
  "Levent", "Murat", "Okan", "Polat", "Rüzgar", "Selim", "Tarık", "Umut", "Zafer", "Aras",
  "Batuhan", "Caner", "Dağhan", "Engin", "Fatih", "Gökhan", "Hüsnü", "İsmail", "Koray", "Tuna",
  // Yeni nesil isimler
  "Atlas", "Poyraz", "Çınar", "Demir", "Eymen", "Yaman", "Alperen", "Utku", "Atakan", "Baran",
  "Kuzey", "Ege", "Taner", "Meriç", "Atalay", "Berke", "Çağrı", "Doğukan", "Erdem", "Ferit",
  "Göktürk", "Harun", "İlhan", "Kıvanç", "Kutay", "Metehan", "Necip", "Orhan", "Özgür", "Rauf",
  "Sarp", "Taylan", "Uğur", "Vedat", "Yalçın", "Zeki", "Akın", "Bilge", "Cenk", "Devrim"
];

const femaleNames = [
  // Klasik isimler
  "Fatma", "Ayşe", "Emine", "Hatice", "Zeynep", "Elif", "Meryem", "Şerife", "Sultan", "Hanife",
  // Modern isimler
  "Melis", "Ceren", "Selin", "Ece", "Derya", "Sena", "Ezgi", "Buse", "Gizem", "İrem",
  "Gamze", "Deniz", "Aslı", "Başak", "Cansu", "Damla", "Ebru", "Fulya", "Gülşen", "Hande",
  "Ilgın", "Jale", "Kardelen", "Lale", "Meltem", "Nazlı", "Özge", "Pelin", "Rüya", "Simge",
  "Tuğçe", "Vildan", "Yağmur", "Zara", "Almila", "Bengisu", "Cemre", "Defne", "Esra", "Feyza",
  "Gökçe", "Hazal", "İpek", "Kübra", "Lara", "Miray", "Naz", "Öykü", "Pınar", "Rana",
  // Yeni nesil isimler
  "Ada", "Azra", "Beren", "Derin", "Ela", "Nehir", "Su", "Toprak", "Asya", "Dila",
  "Eliz", "Güneş", "İdil", "Kumsal", "Lina", "Maya", "Nil", "Pera", "Sude", "Tuana",
  "Yaren", "Zehra", "Beril", "Ceyda", "Dilara", "Eylül", "Gülce", "Hira", "İlayda", "Jülide",
  "Kader", "Leyla", "Melisa", "Nisan", "Oya", "Perihan", "Rabia", "Sibel", "Tülin", "Ülker"
];

const npcPersonalities: NPCPersonality[] = ['FRIENDLY', 'SHY', 'AGGRESSIVE', 'POPULAR', 'NERDY', 'ARTISTIC', 'ATHLETIC'];
const npcTraits: NPCTrait[] = ['LOYAL', 'JEALOUS', 'GOSSIPER', 'SUPPORTIVE', 'COMPETITIVE', 'ROMANTIC', 'MANIPULATIVE'];

/** Yaşa uygun rastgele NPC oluşturur */
export const createRandomNPC = (playerAge: number = 0, playerTurn: number = 1): NPC => {
  const gender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
  const list = gender === 'MALE' ? maleNames : femaleNames;
  const name = list[getRandomInt(0, list.length - 1)];
  const id = `npc_${Date.now()}_${getRandomInt(0, 999)}`;

  // Yaşa uygun NPC yaşı (±2 yıl)
  const npcAge = Math.max(0, playerAge + getRandomInt(-2, 2));

  // Rastgele kişilik
  const personality = npcPersonalities[getRandomInt(0, npcPersonalities.length - 1)];

  // 1-2 rastgele özellik
  const traitCount = getRandomInt(1, 2);
  const selectedTraits: NPCTrait[] = [];
  while (selectedTraits.length < traitCount) {
    const trait = npcTraits[getRandomInt(0, npcTraits.length - 1)];
    if (!selectedTraits.includes(trait)) {
      selectedTraits.push(trait);
    }
  }

  return {
    id,
    name,
    role: 'ACQUAINTANCE',
    relationship: getRandomInt(10, 40),
    romance: 0,
    gender,
    age: npcAge,
    personality,
    traits: selectedTraits,
    metAge: playerAge,
    metTurn: playerTurn,
    lastInteraction: playerTurn,
    sharedMemories: [],
    isInPlayerGroup: false
  };
};

/** Başlangıç NPC'lerini oluşturur (0 yaş için aile/komşu çocukları) */
export const generateNPCs = (playerAge: number = 0, playerTurn: number = 1): NPC[] => {
  return [
    createRandomNPC(playerAge, playerTurn),
    createRandomNPC(playerAge, playerTurn)
  ];
};

export const getSocialEndResult = (npcs: NPC[]): string => {
  const partners = npcs.filter(n => n.role === 'PARTNER');
  const bestFriends = npcs.filter(n => n.role === 'BEST_FRIEND');
  const friends = npcs.filter(n => n.role === 'FRIEND');
  const rivals = npcs.filter(n => n.role === 'RIVAL' || n.role === 'ENEMY');

  let result = "";
  if (partners.length > 0) result += `❤️ ${partners[0].name} ile evlendin ve mutlu bir yuva kurdun. `;
  else result += "💔 Gerçek aşkı bulamadan yılları devirdin. ";

  if (bestFriends.length > 0) result += `🤝 ${bestFriends[0].name} ile kardeşten öte oldunuz. `;
  else if (friends.length > 0) result += `👥 Arkadaş çevren genişti ama kimseyle çok derinleşmedin. `;

  if (rivals.length > 0) result += `⚔️ ${rivals[0].name} ile hala kanlı bıçaklısınız. `;

  return result;
};

// --- KARİYER SONUÇ SİSTEMİ (Kişilik + Hafıza Zenginleştirilmiş) ---

const CAREER_PERSONALITY_NARRATIVES: Record<string, Partial<Record<PersonalityArchetype, string>>> = {
  'Milli Sporcu': {
    EXTROVERT_BRAVE: 'Cesaretinle sınırlarını zorlayarak zirveye ulaştın.',
    INTROVERT_BRAVE: 'Sessiz ama kararlı antrenmanlarınla herkesin takdirini kazandın.',
    CONFORMIST: 'Disiplinin seni diğerlerinden ayırdı. Her gün, her antrenman mükemmeldi.',
    BALANCED: 'Dengeli yaklaşımın seni uzun vadeli başarıya taşıdı.',
  },
  'Rockstar / Virtüöz': {
    REBEL: 'Kurallara meydan okuyarak müzikte kendi yolunu çizdin.',
    EMPATH: 'Müziğinle insanların duygularına dokunuyorsun.',
    EXTROVERT_BRAVE: 'Sahne senin evin. Binlerce kişiye enerji veriyorsun.',
    BALANCED: 'Müzik yeteneğin seni konservatuar yoluna taşıdı.',
  },
  'Ünlü Yazar': {
    INTROVERT_CAUTIOUS: 'İç dünyanın zenginliği sayfalarına yansıdı.',
    EMPATH: 'İnsanları anlamak, onların hikayelerini yazmana olanak tanıdı.',
    REBEL: 'Cesur kalemin toplumun gerçeklerini gözler önüne serdi.',
    BALANCED: 'Yazma yeteneğin seni edebiyat dünyasına taşıdı.',
  },
  'Tıp Fakültesi': {
    EMPATH: 'Empatin hastalarını iyileştirmenin en büyük gücü oldu.',
    CONFORMIST: 'Disiplinli çalışman tıp eğitiminin zorluklarını aşmanı sağladı.',
    INTROVERT_CAUTIOUS: 'Dikkatli ve titiz yaklaşımın seni mükemmel bir hekim yapacak.',
    BALANCED: 'Çalışkanlığın ve zekan seni tıp yoluna taşıdı.',
  },
  'Yazılım Mühendisliği': {
    REBEL: 'Kurallara isyan ederek kendi startup\'ını kurmaya hazırlanıyorsun.',
    INTROVERT_CAUTIOUS: 'Sessiz oturarak büyük sistemler tasarladın.',
    CONFORMIST: 'Sistemli çalışmanla büyük şirketlerin en güvenilir mühendisi olacaksın.',
    EMPATH: 'İnsanlara yardım eden yazılımlar geliştirme hayalin var.',
    BALANCED: 'Kodlama yeteneğin seni teknoloji dünyasına taşıdı.',
  },
  'Girişimci': {
    REBEL: 'Kimsenin cesaret edemediği işlere girişerek fark yarattın.',
    EXTROVERT_BRAVE: 'Liderliğin ve cesaretinle ekip kurup büyüttün.',
    BALANCED: 'Ticari zekanla kendi yolunu çizdin.',
  },
  'Hukuk Fakültesi': {
    REBEL: 'Adaletsizliğe karşı savaşmak için hukuk silahını seçtin.',
    EMPATH: 'Ezilenlerin sesi olmak istiyorsun.',
    CONFORMIST: 'Kurallara ve yasalara olan saygın seni hukuk yoluna çekti.',
    BALANCED: 'Keskin zekan ve hitabetin seni hukuk yoluna taşıdı.',
  },
  'Mezuna Kaldın / İşsiz': {
    REBEL: 'Sistem seni yıktı ama isyan ateşin sönmedi.',
    INTROVERT_CAUTIOUS: 'Fırsatları kaçırdın. Ama yeni kapılar açılabilir.',
    BALANCED: 'Hayat her zaman planladığın gibi gitmiyor. Ama hikaye burada bitmez.',
  },
};

const getMemoryInfluence = (memories: EventMemory[]): string | undefined => {
  if (!memories || memories.length === 0) return undefined;

  const prideCount = memories.filter(m => m.emotion === 'PRIDE').length;
  const regretCount = memories.filter(m => m.emotion === 'REGRET').length;
  const guiltCount = memories.filter(m => m.emotion === 'GUILT').length;

  if (prideCount >= 5) return 'Başarılarla dolu bir geçmişin sana güç verdi.';
  if (regretCount >= 4) return 'Geçmiş pişmanlıkların seni daha dikkatli ve kararlı yaptı.';
  if (guiltCount >= 3) return 'Vicdanının sesi seni doğru yola yönlendirdi.';
  if (prideCount >= 3 && regretCount >= 2) return 'Hem zaferler hem yenilgiler seni olgunlaştırdı.';
  if (prideCount >= 3) return 'Başarılarının verdiği özgüvenle ilerliyorsun.';
  if (regretCount >= 2) return 'Geçmişten aldığın dersler seni şekillendirdi.';
  return undefined;
};

const enrichCareerResult = (
  base: CareerResult,
  personality: Personality | undefined,
  memories: EventMemory[] | undefined
): CareerResult => {
  if (!personality) return base;
  const archetype = getPersonalityArchetype(personality);
  const narratives = CAREER_PERSONALITY_NARRATIVES[base.title];
  const personalityNarrative = narratives?.[archetype]
    ?? narratives?.BALANCED
    ?? getArchetypeDescription(archetype);
  const memoryInfluence = getMemoryInfluence(memories ?? []);

  return {
    ...base,
    personalityNarrative,
    memoryInfluence,
  };
};

export const calculateCareerResult = (gameState: GameState, stats: Stats): CareerResult => {
  const { schoolGrades, skills, memories } = gameState;
  const personality = gameState.personality ?? { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50 };
  const artGrade = schoolGrades.art ?? 0;
  const musicGrade = schoolGrades.music ?? 0;
  const mems = memories ?? [];

  let base: CareerResult;

  if (skills.sports > 90) {
    base = { title: "Milli Sporcu", description: "Yıllar süren antrenmanlarının karşılığını aldın. Olimpiyatlara hazırlanıyorsun!", emoji: "\u{1F947}", type: "LEGENDARY", familyReaction: "Baban: 'Benim aslan oğlum/kızım!' diyor." };
  } else if (skills.music > 85 && musicGrade >= 70) {
    base = {
      title: "Rockstar / Virtüöz",
      description: "Konservatuarı dereceyle bitirdin. Albümlerin yok satıyor.",
      emoji: "\u{1F3B8}",
      type: "LEGENDARY",
      familyReaction: "Annen her konserine geliyor.",
      influences: [`Müzik notun (${musicGrade}) konservatuar başarını destekledi.`],
    };
  } else if (skills.music > 85) {
    base = {
      title: "Sahne Müzisyeni",
      description: "Müziğinle sahnelerde parladın ama akademik müzik notların konservatuar için yeterli olmadı.",
      emoji: "\u{1F3A4}",
      type: "SUCCESS",
      familyReaction: "Ailen sahneye çıkmandan mutluluk duyuyor.",
      influences: [`Müzik notun (${musicGrade}) akademik yolu sınırladı.`],
    };
  } else if (skills.writing > 85) {
    base = { title: "Ünlü Yazar", description: "Kitapların çok satanlar listesinde. İmza günlerinde uzun kuyruklar var.", emoji: "\u{270D}\u{FE0F}", type: "LEGENDARY", familyReaction: "Ailen raflarda adını görmekten gururlu." };
  } else if (skills.art > 85 && artGrade >= 70) {
    base = {
      title: "Sanatçı",
      description: "Sergilerin kapalı gişe. Eserlerin koleksiyonerler tarafından kapışılıyor.",
      emoji: "\u{1F3A8}",
      type: "LEGENDARY",
      familyReaction: "Ailen eserlerini duvarlarına asıyor.",
      influences: [`Görsel sanatlar notun (${artGrade}) sergi ve burs kapılarını açtı.`],
    };
  } else if (skills.art > 85) {
    base = {
      title: "Atölye Sanatçısı",
      description: "Yetenekli bir sanatçı oldun ama akademik notların prestijli okullara girişi zorlaştırdı.",
      emoji: "\u{1F3AD}",
      type: "SUCCESS",
      familyReaction: "Ailen atölyene destek oluyor.",
      influences: [`Görsel sanatlar notun (${artGrade}) akademik desteği zayıflattı.`],
    };
  } else if (schoolGrades.math > 80 && schoolGrades.science > 80 && stats.discipline > 60 && personality.patience >= 40) {
    base = { title: "Tıp Fakültesi", description: "Ülkenin en prestijli Tıp Fakültesini kazandın.", emoji: "\u{1FA7A}", type: "SUCCESS", familyReaction: "Ailen herkese 'Çocuğumuz Doktor olacak' diye hava atıyor." };
  } else if (personality.empathy >= 70 && personality.patience >= 60 && stats.intelligence > 60) {
    base = { title: "Psikolog", description: "İnsanları anlama yeteneğin seni psikoloji yoluna taşıdı.", emoji: "\u{1F9E0}", type: "SUCCESS", familyReaction: "Ailen: 'Her zaman insanları anlardı' diyor." };
  } else if (schoolGrades.math > 70 && skills.coding > 70) {
    base = { title: "Yazılım Mühendisliği", description: "Kodlama yeteneğin seni teknoloji dünyasına taşıdı.", emoji: "\u{1F4BB}", type: "SUCCESS", familyReaction: "Ailen 'Bütün gün bilgisayar başındaydı ama işe yaradı' diyor." };
  } else if (skills.business > 75 && stats.money > 1500) {
    base = { title: "Girişimci", description: "Ticari zekanla kendi işini kurdun. Fikirlerin para ediyor.", emoji: "\u{1F4C8}", type: "SUCCESS", familyReaction: "Ailen işini merakla takip ediyor." };
  } else if (skills.logic > 75 && schoolGrades.math > 75) {
    base = { title: "Mühendislik", description: "Analitik düşüncen seni mühendislik yoluna taşıdı.", emoji: "\u{1F9E0}", type: "SUCCESS", familyReaction: "Ailen sayılarla olan bağını hep konuşuyordu." };
  } else if (personality.courage >= 75 && gameState.traits.includes('BRAVE') && skills.sports > 60) {
    base = { title: "Kurtarma Pilotu", description: "Cesaretin ve fiziksel gücün seni havacılık yoluna taşıdı.", emoji: "\u{2708}\u{FE0F}", type: "LEGENDARY", familyReaction: "Ailen: 'O her zaman cesurdu' diyor." };
  } else if (personality.conformity >= 70 && gameState.traits.includes('DISCIPLINED') && stats.discipline > 70) {
    base = { title: "Subay", description: "Disiplinin ve düzene saygın seni askerlik yoluna yöneltti.", emoji: "\u{1F396}\u{FE0F}", type: "SUCCESS", familyReaction: "Ailen: 'Kurallara hep saygılıydı' diyor." };
  } else if (personality.openness >= 60 && gameState.traits.includes('CREATIVE') && skills.art > 60) {
    base = { title: "Dijital Sanatçı", description: "Yaratıcılığın ve açık fikirliliğin dijital sanat dünyasında seni öne çıkardı.", emoji: "\u{1F3A8}", type: "SUCCESS", familyReaction: "Ailen eserlerini sosyal medyada paylaşıyor." };
  } else if (schoolGrades.language > 80 && stats.intelligence > 70) {
    base = { title: "Hukuk Fakültesi", description: "Keskin zekan ve hitabetinle Hukuk kazandın.", emoji: "\u{2696}\u{FE0F}", type: "SUCCESS", familyReaction: "Baban: 'Artık davalarımıza sen bakarsın' diyor." };
  } else if (stats.money > 2000) {
    base = { title: "Özel Üni - İşletme", description: "Notların parlak değildi ama ailenin imkanlarıyla İşletme kazandın.", emoji: "\u{1F393}", type: "NORMAL", familyReaction: "Ailen: 'Diploma diplomadır' diyor." };
  } else if (stats.intelligence > 50 && stats.discipline > 50) {
    base = { title: "İktisat / Kamu Yönetimi", description: "Ortalama bir puanla bir üniversite kazandın.", emoji: "\u{1F4DA}", type: "NORMAL", familyReaction: "Ailen: 'En azından bir yer kazandı' diyor." };
  } else {
    base = { title: "Mezuna Kaldın / İşsiz", description: "Sınav sonucun beklediğin gibi gelmedi.", emoji: "\u{1F480}", type: "FAILURE", familyReaction: "Evde derin bir sessizlik var." };
  }

  return enrichCareerResult(base, personality, mems);
};
// --- TRAIT LOGIC ---
export const checkTraitFormation = (
  actionId: string | null,
  choiceId: string | null,
  state: GameState,
  currentStats: Stats
): {
  newTraits: string[];
  removedTraits: string[];
  updatedProgress: GameState['traitProgress'];
  unlockMessage?: string;
  progressUpdates: string[]; // NEW: Returns which traits made progress
} => {
  let newTraits: string[] = [];
  let removedTraits: string[] = [];
  let updatedProgress = { ...state.traitProgress };
  let unlockMessage: string | undefined = undefined;
  let progressUpdates: string[] = [];

  // Filter relevant ACQUIRED traits that are NOT yet owned
  const potentialTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED' && t.formation && !state.traits.includes(t.id));

  potentialTraits.forEach(trait => {
    const formation = trait.formation!;

    // 1. Age Check
    if (state.age < formation.ageWindow[0] || state.age > formation.ageWindow[1]) return;

    // Initialize progress if not exists
    if (!updatedProgress[trait.id]) {
      updatedProgress[trait.id] = {
        points: 0,
        required: formation.pointsRequired || 5, // Default backup 
        firstTriggeredAge: state.age,
        isLocked: false
      };
    }

    // Skip if locked
    if (updatedProgress[trait.id].isLocked) return;

    // 2. Check Triggers & Calculate Points
    let triggered = false;
    let pointsToAdd = 0;

    formation.triggers.forEach(trigger => {
      let matched = false;
      // Action Trigger
      if (trigger.type === 'ACTION' && actionId) {
        if (trigger.pattern && actionId.startsWith(trigger.pattern)) matched = true;
        if (trigger.actionId && actionId === trigger.actionId) matched = true;
      }
      // Event Choice Logic
      if (trigger.type === 'EVENT_CHOICE') {
        if (choiceId && trigger.pattern && choiceId === trigger.pattern) matched = true;
        if (trigger.eventId && state.currentEvent?.id === trigger.eventId) {
          if (trigger.choice == null || (choiceId && choiceId === String(trigger.choice))) {
            matched = true;
          }
        }
      }
      // Logic for Stats (Thresholds)
      if (trigger.type === 'STAT_THRESHOLD') {
        if (trigger.statCondition) {
          const statVal = currentStats[trigger.statCondition.stat as StatKey];
          if (trigger.statCondition.operator === '>' && statVal > trigger.statCondition.value) matched = true;
          if (trigger.statCondition.operator === '<' && statVal < trigger.statCondition.value) matched = true;
        } else if (trigger.statKey && typeof trigger.threshold === 'number') {
          const statVal = currentStats[trigger.statKey];
          if (statVal >= trigger.threshold) matched = true;
        }
      }

      if (matched) {
        triggered = true;
        pointsToAdd += (trigger.count || 1); // Aggregate points from all matching triggers
      }
    });

    // 3. Logic & Multipliers
    if (triggered) {
      let multiplier = 1.0;

      // Age Difficulty: Harder to change after 14
      if (state.age >= 14) {
        multiplier = 0.5;
      }

      // Synergy Bonus: +1 point if player has synergistic traits
      const hasSynergy = trait.synergies?.some(s => state.traits.includes(s));
      if (hasSynergy) {
        pointsToAdd += 1;
      }

      // Apply points
      updatedProgress[trait.id].points += pointsToAdd * multiplier;

      // Add to UI feedback list (avoid duplicates)
      if (!progressUpdates.includes(trait.name)) {
        progressUpdates.push(trait.name);
      }

      // 4. Check Unlock
      if (updatedProgress[trait.id].points >= updatedProgress[trait.id].required) {
        newTraits.push(trait.id);
        unlockMessage = trait.name; // Keep mainly for single message logic if needed
        updatedProgress[trait.id].isLocked = true;

        // 5. Handle Conflicts
        if (trait.conflicts) {
          trait.conflicts.forEach(conflictId => {
            if (state.traits.includes(conflictId)) {
              removedTraits.push(conflictId);
              // Also clear progress for the conflicting trait if it existed (it shouldn't if already owned, but good safety)
              if (updatedProgress[conflictId]) delete updatedProgress[conflictId];
            }
          });
        }

        // Clear progress for the newly acquired trait to save space
        delete updatedProgress[trait.id];
      }
    }
  });

  return { newTraits, removedTraits, updatedProgress, unlockMessage, progressUpdates };
};

// =================================================================
// KİŞİLİK UYUMLULUK SİSTEMİ (NPC SOSYAL)
// =================================================================

/**
 * Oyuncunun kişiliği ile NPC kişiliğinin uyumluluğunu hesaplar
 * @returns -1 (çok uyumsuz) ile +1 (çok uyumlu) arası değer
 * Bu değer ilişki artışını etkiler: actual = base * (1 + compatibility)
 */
export const calculatePersonalityCompatibility = (
  playerPersonality: { openness: number; empathy: number; courage: number; conformity: number },
  npcPersonality: NPCPersonality
): number => {
  // Her NPC kişiliği için tercih edilen oyuncu özellikleri
  const compatibilityMatrix: Record<NPCPersonality, { trait: keyof typeof playerPersonality; threshold: number; bonus: number }[]> = {
    FRIENDLY: [
      { trait: 'openness', threshold: 60, bonus: 0.4 },
      { trait: 'empathy', threshold: 60, bonus: 0.3 },
    ],
    SHY: [
      { trait: 'empathy', threshold: 70, bonus: 0.5 },
      { trait: 'openness', threshold: 40, bonus: -0.3 }, // Çok açık sözlü olmamak
    ],
    AGGRESSIVE: [
      { trait: 'courage', threshold: 70, bonus: 0.4 },
      { trait: 'empathy', threshold: 50, bonus: -0.2 }, // Fazla duygusal olmamak
      { trait: 'conformity', threshold: 40, bonus: -0.2 }, // Uysallık kötü
    ],
    POPULAR: [
      { trait: 'openness', threshold: 60, bonus: 0.3 },
      { trait: 'conformity', threshold: 60, bonus: 0.2 }, // Trend takibi
    ],
    NERDY: [
      { trait: 'openness', threshold: 50, bonus: 0.2 },
      { trait: 'empathy', threshold: 60, bonus: 0.3 },
    ],
    ARTISTIC: [
      { trait: 'openness', threshold: 70, bonus: 0.5 },
      { trait: 'conformity', threshold: 40, bonus: -0.3 }, // Yaratıcılık için özgürlük
    ],
    ATHLETIC: [
      { trait: 'courage', threshold: 60, bonus: 0.3 },
      { trait: 'conformity', threshold: 50, bonus: 0.2 }, // Takım ruhu
    ],
  };

  const requirements = compatibilityMatrix[npcPersonality];
  let totalCompatibility = 0;

  requirements.forEach(({ trait, threshold, bonus }) => {
    const playerValue = playerPersonality[trait];

    if (bonus > 0) {
      // Pozitif bonus: eşik üzerinde olmak iyi
      if (playerValue >= threshold) {
        totalCompatibility += bonus;
      }
    } else {
      // Negatif bonus: eşik üzerinde olmak kötü
      if (playerValue >= threshold) {
        totalCompatibility += bonus;
      }
    }
  });

  // -1 ile +1 arası normalize et
  return Math.max(-1, Math.min(1, totalCompatibility));
};

// =================================================================
// KARAKTER OLUŞTURMA SİSTEMİ
// =================================================================

// Türkçe soyad havuzu (100+ soyad)
const turkishLastNames = [
  // En yaygın soyadlar
  "Yılmaz", "Kaya", "Demir", "Çelik", "Şahin", "Yıldız", "Yıldırım", "Öztürk", "Aydın", "Özdemir",
  "Arslan", "Doğan", "Kılıç", "Aslan", "Çetin", "Kara", "Koç", "Kurt", "Özkan", "Şimşek",
  "Polat", "Korkmaz", "Ünal", "Yavuz", "Akın", "Aksoy", "Aktaş", "Acar", "Güneş", "Tekin",
  "Erdoğan", "Bozkurt", "Güler", "Karaca", "Turan", "Özer", "Bulut", "Ateş", "Avcı", "Keskin",
  "Gül", "Erdem", "Kaplan", "Sezer", "Sarı", "Taş", "Toprak", "Duman", "Başaran", "Türk",
  // Ek soyadlar
  "Altın", "Ay", "Bayrak", "Cengiz", "Çakır", "Deniz", "Durmaz", "Ekinci", "Eren", "Genç",
  "Güven", "Han", "Işık", "Kahraman", "Kıran", "Koçak", "Mutlu", "Oğuz", "Orhan", "Öz",
  "Peker", "Sağlam", "Şen", "Tan", "Türkmen", "Uçar", "Uzun", "Ülker", "Vural", "Yalçın",
  "Yaman", "Zengin", "Akbulut", "Albayrak", "Balcı", "Bayram", "Bektaş", "Biçer", "Bilgin", "Candan",
  "Çakmak", "Çalışkan", "Dağ", "Dinç", "Durmuş", "Elmas", "Ercan", "Eroğlu", "Güngör", "Gürkan",
  "Işıklı", "İnan", "Karagöz", "Kaynak", "Kılınç", "Koşar", "Köse", "Kutlu", "Mert", "Namlı",
  "Ocak", "Ovalı", "Önal", "Özmen", "Parlak", "Reis", "Savaş", "Sönmez", "Şeker", "Tanrıverdi",
  "Temel", "Tokgöz", "Tunç", "Türker", "Ulusoy", "Uslu", "Üstün", "Vardar", "Yağcı", "Yılmazer"
];

// Türkiye illeri
export const turkishCities = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin",
  "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur",
  "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan",
  "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul",
  "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kırıkkale", "Kırklareli", "Kırşehir",
  "Kilis", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş",
  "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas",
  "Şanlıurfa", "Şırnak", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
];

// Türkçe ay isimleri
export const turkishMonths = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
];

// Burç bilgileri
export const zodiacInfo: Record<ZodiacSign, { name: string; emoji: string; dateRange: string }> = {
  KOC: { name: "Koç", emoji: "♈", dateRange: "21 Mart - 19 Nisan" },
  BOGA: { name: "Boğa", emoji: "♉", dateRange: "20 Nisan - 20 Mayıs" },
  IKIZLER: { name: "İkizler", emoji: "♊", dateRange: "21 Mayıs - 20 Haziran" },
  YENGEC: { name: "Yengeç", emoji: "♋", dateRange: "21 Haziran - 22 Temmuz" },
  ASLAN: { name: "Aslan", emoji: "♌", dateRange: "23 Temmuz - 22 Ağustos" },
  BASAK: { name: "Başak", emoji: "♍", dateRange: "23 Ağustos - 22 Eylül" },
  TERAZI: { name: "Terazi", emoji: "♎", dateRange: "23 Eylül - 22 Ekim" },
  AKREP: { name: "Akrep", emoji: "♏", dateRange: "23 Ekim - 21 Kasım" },
  YAY: { name: "Yay", emoji: "♐", dateRange: "22 Kasım - 21 Aralık" },
  OGLAK: { name: "Oğlak", emoji: "♑", dateRange: "22 Aralık - 19 Ocak" },
  KOVA: { name: "Kova", emoji: "♒", dateRange: "20 Ocak - 18 Şubat" },
  BALIK: { name: "Balık", emoji: "♓", dateRange: "19 Şubat - 20 Mart" }
};

/** Ay ve güne göre burç hesaplar */
export const calculateZodiacSign = (month: number, day: number): ZodiacSign => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'KOC';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'BOGA';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'IKIZLER';
  if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'YENGEC';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'ASLAN';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'BASAK';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'TERAZI';
  if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'AKREP';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'YAY';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'OGLAK';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'KOVA';
  return 'BALIK'; // 19 Şubat - 20 Mart
};

/** Rastgele Türkçe isim döndürür */
export const getRandomFirstName = (gender: PlayerGender): string => {
  const list = gender === 'MALE' ? maleNames : femaleNames;
  return list[getRandomInt(0, list.length - 1)];
};

/** Rastgele Türkçe soyad döndürür */
export const getRandomLastName = (): string => {
  return turkishLastNames[getRandomInt(0, turkishLastNames.length - 1)];
};

/** Rastgele şehir döndürür */
export const getRandomCity = (): string => {
  return turkishCities[getRandomInt(0, turkishCities.length - 1)];
};

/** Rastgele doğum tarihi oluşturur */
export const getRandomBirthDate = (): { month: number; day: number } => {
  const month = getRandomInt(1, 12);
  const maxDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  const day = getRandomInt(1, maxDays[month - 1]);
  return { month, day };
};

/** Tamamen rastgele karakter bilgisi oluşturur */
export const generateRandomCharacter = (): CharacterInfo => {
  const gender: PlayerGender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
  const firstName = getRandomFirstName(gender);
  const lastName = getRandomLastName();
  const birthCity = getRandomCity();
  const { month, day } = getRandomBirthDate();
  const zodiacSign = calculateZodiacSign(month, day);

  return {
    firstName,
    lastName,
    gender,
    birthMonth: month,
    birthDay: day,
    birthCity,
    zodiacSign
  };
};

/** Ayın maksimum gün sayısını döndürür */
export const getMaxDaysInMonth = (month: number): number => {
  const maxDays = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return maxDays[month - 1] || 31;
};






