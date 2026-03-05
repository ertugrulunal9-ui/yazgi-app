
import AsyncStorage from '@react-native-async-storage/async-storage';
import { devLog } from './devLogger';
import { Stats, StatKey, Family, GameState, CareerResult, NPC, NPCRole, FamilyWealth, FamilyDynamic, NPCPersonality, NPCTrait, ZodiacSign, PlayerGender, CharacterInfo, Skills, SchoolGrades, EventMemory, Personality, TraitTrigger } from '../types';
import { TRAIT_DEFINITIONS } from '../data/traits';
import { BALANCE_CONTRACT, calculateInitialEnergy } from '../config/balanceContract';
import {
  BUFF_RULES,
  CONSUMABLE_CONFIG,
  ENERGY_RECOVERY,
  REPETITION_PENALTY_CONFIG,
  VARIETY_BONUS_CONFIG,
} from '../config/gameBalance';
import { isFeatureEnabled } from '../config/featureFlags';
import { DEFAULT_FAMILY_EVOLUTION_STATE } from './familyNarrative';
import { getPersonalityArchetype, getArchetypeDescription, PersonalityArchetype } from './personalitySystem';
import { createInitialPersonalityState } from '../systems/PersonalityMomentumEngine';
import { resolveEnding } from './endingResolver';
import { AppLocale, getRuntimeLocale, tRuntime } from '../i18n/strings';

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
  // POOR daha zorlayıcı, RICH daha rahat bir ekonomik başlangıç sunar.
  let allowance = 0;
  switch (wealth) {
    case 'POOR':
      allowance = getRandomInt(1, 6);
      break;
    case 'MIDDLE':
      allowance = getRandomInt(16, 32);
      break;
    case 'RICH':
      allowance = getRandomInt(65, 130);
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

export interface NewGameBootstrapOptions {
  fastStart?: boolean;
  legacyLevel?: number;
  legacyPerksEnabled?: boolean;
  selectedGeneticTraitId?: string;
  starterItemId?: string;
}

const FAST_START_BASELINE = {
  health: 20,
  intelligence: 8,
  charisma: 8,
  discipline: 5,
} as const;

const canUseFastStart = (options?: NewGameBootstrapOptions): boolean => {
  const legacyPerksEnabled = options?.legacyPerksEnabled ?? isFeatureEnabled('LEGACY_PERKS');
  const legacyLevel = options?.legacyLevel ?? 0;
  return Boolean(options?.fastStart && legacyPerksEnabled && legacyLevel >= 1);
};
// BAŞLANGIÇ VERİLERİNİ ÜRETEN FONKSİYONLAR
// Not: 0 yaş için cap'ler düşük olduğundan başlangıç değerleri buna uygun ayarlanmalı
// age=0 için: health cap=30, intelligence/charisma/discipline cap=30
export const getInitialStats = (options?: NewGameBootstrapOptions): Stats => {
  const useFastStart = canUseFastStart(options);
  const health = useFastStart
    ? FAST_START_BASELINE.health
    : BALANCE_CONTRACT.initialStats.health; // 0 yas cap'i 30, baslangic bunun altinda olmali
  const intelligence = useFastStart
    ? FAST_START_BASELINE.intelligence
    : BALANCE_CONTRACT.initialStats.intelligence;
  const charisma = useFastStart
    ? FAST_START_BASELINE.charisma
    : BALANCE_CONTRACT.initialStats.charisma;
  const discipline = useFastStart
    ? FAST_START_BASELINE.discipline
    : BALANCE_CONTRACT.initialStats.discipline;
  const energy = calculateInitialEnergy(health);
  return {
    health,
    intelligence,
    charisma,
    discipline,
    money: BALANCE_CONTRACT.initialStats.money,
    energy,
    familyRelation: BALANCE_CONTRACT.initialStats.familyRelation,
  };
};

export const getMaxEnergy = (age: number, family: Family | null = null, traitIds: string[] = []): number => {
  return getStatCap(age, 'energy', family, traitIds);
};

const ACTION_CATEGORY_PREFIXES: Array<{ id: string; prefixes: string[] }> = [
  { id: 'study', prefixes: ['study_'] },
  { id: 'sports', prefixes: ['sports_'] },
  { id: 'arts', prefixes: ['arts_'] },
  { id: 'work', prefixes: ['work_'] },
  { id: 'social', prefixes: ['social_', 'family_'] },
  { id: 'computer', prefixes: ['computer_'] },
  { id: 'explore', prefixes: ['explore_'] },
];

export const getActionCategoryFromId = (actionId: string): string => {
  const bucket = ACTION_CATEGORY_PREFIXES.find(({ prefixes }) => (
    prefixes.some(prefix => actionId.startsWith(prefix))
  ));
  return bucket?.id ?? 'other';
};

export const getRestedEnergy = (
  maxEnergy: number,
  currentEnergy: number = maxEnergy,
  age: number = 0,
  partialRecoveryEnabled: boolean = isFeatureEnabled('PARTIAL_ENERGY_RECOVERY')
): number => {
  const safeMaxEnergy = Math.max(0, Math.round(maxEnergy));
  if (!partialRecoveryEnabled) {
    return safeMaxEnergy;
  }

  if (age <= 6 && ENERGY_RECOVERY.babyPhaseFullRecovery) {
    return safeMaxEnergy;
  }

  const boundedCurrentEnergy = clamp(Math.round(currentEnergy), 0, safeMaxEnergy);
  const deficit = Math.max(0, safeMaxEnergy - boundedCurrentEnergy);
  const recoveryRate = age < ENERGY_RECOVERY.youngAgeThreshold
    ? ENERGY_RECOVERY.youngRecoveryRate
    : ENERGY_RECOVERY.teenRecoveryRate;
  const recoveredEnergy = boundedCurrentEnergy + Math.round(deficit * recoveryRate);
  return clamp(recoveredEnergy, 0, safeMaxEnergy);
};

export const calculateVarietyBonus = (
  actionHistory: Array<{ actionId: string }>,
  windowSize: number = VARIETY_BONUS_CONFIG.windowSize,
  varietyBonusEnabled: boolean = isFeatureEnabled('VARIETY_BONUS')
): number => {
  if (!varietyBonusEnabled) return 0;
  const effectiveWindow = Math.max(1, windowSize);
  const recentActions = actionHistory.slice(-effectiveWindow);
  if (recentActions.length < effectiveWindow) return 0;

  const uniqueCategories = new Set(
    recentActions.map(({ actionId }) => getActionCategoryFromId(actionId))
  );
  return uniqueCategories.size >= VARIETY_BONUS_CONFIG.minCategories
    ? VARIETY_BONUS_CONFIG.statBonus
    : 0;
};

export type ActiveBuffState = NonNullable<GameState['activeBuffs']>[number];

export type ConsumableItemId =
  | 'item_energy_drink'
  | 'item_tutor_session'
  | 'item_gym_pass'
  | 'item_fashion_outfit'
  | 'item_investment';

const INVESTMENT_ITEM_ID: ConsumableItemId = 'item_investment';

const CONSUMABLE_ITEM_CONFIG = {
  item_energy_drink: CONSUMABLE_CONFIG.energyDrink,
  item_tutor_session: CONSUMABLE_CONFIG.tutorSession,
  item_gym_pass: CONSUMABLE_CONFIG.gymPass,
  item_fashion_outfit: CONSUMABLE_CONFIG.fashionOutfit,
  item_investment: CONSUMABLE_CONFIG.investment,
} as const;

const STATS_WITH_SOFT_CAP: Array<keyof Stats> = [
  'health',
  'intelligence',
  'charisma',
  'discipline',
  'familyRelation',
];

export const isConsumableItemId = (itemId: string): itemId is ConsumableItemId => (
  itemId in CONSUMABLE_ITEM_CONFIG
);

export const getConsumableConfigByItemId = (
  itemId: ConsumableItemId
): typeof CONSUMABLE_ITEM_CONFIG[ConsumableItemId] => CONSUMABLE_ITEM_CONFIG[itemId];

const applyStatsEffect = (stats: Stats, effect: Partial<Stats>): Stats => {
  const nextStats: Stats = { ...stats };

  (Object.entries(effect) as Array<[keyof Stats, number | undefined]>).forEach(([key, rawValue]) => {
    if (typeof rawValue !== 'number' || rawValue === 0) return;
    const currentValue = nextStats[key];
    const sum = currentValue + rawValue;

    if (key === 'money') {
      nextStats[key] = Math.max(0, sum);
      return;
    }
    if (key === 'energy') {
      nextStats[key] = Math.max(0, sum);
      return;
    }
    if (STATS_WITH_SOFT_CAP.includes(key)) {
      nextStats[key] = clamp(sum, 0, 100);
      return;
    }

    nextStats[key] = sum;
  });

  return nextStats;
};

export const createConsumableBuff = (
  itemId: ConsumableItemId,
  appliedAtTurn: number
): ActiveBuffState | null => {
  if (itemId === 'item_gym_pass') {
    return {
      itemId,
      turnsRemaining: CONSUMABLE_CONFIG.gymPass.duration,
      effect: { health: CONSUMABLE_CONFIG.gymPass.healthPerTurn },
      appliedAt: appliedAtTurn,
    };
  }
  if (itemId === 'item_fashion_outfit') {
    return {
      itemId,
      turnsRemaining: CONSUMABLE_CONFIG.fashionOutfit.duration,
      effect: { charisma: CONSUMABLE_CONFIG.fashionOutfit.charismaBoost },
      appliedAt: appliedAtTurn,
    };
  }
  if (itemId === 'item_investment') {
    return {
      itemId,
      turnsRemaining: CONSUMABLE_CONFIG.investment.duration,
      effect: {},
      appliedAt: appliedAtTurn,
    };
  }
  return null;
};

export const applyTurnBuffEffects = (
  stats: Stats,
  activeBuffs: GameState['activeBuffs'],
): {
  nextStats: Stats;
  nextActiveBuffs: ActiveBuffState[];
  maturedInvestmentCount: number;
} => {
  const safeBuffs = (activeBuffs || []).filter(buff => (buff.turnsRemaining ?? 0) > 0);
  if (safeBuffs.length === 0) {
    return {
      nextStats: stats,
      nextActiveBuffs: [],
      maturedInvestmentCount: 0,
    };
  }

  let nextStats = { ...stats };
  const nextActiveBuffs: ActiveBuffState[] = [];
  let maturedInvestmentCount = 0;

  safeBuffs.forEach((buff) => {
    nextStats = applyStatsEffect(nextStats, buff.effect || {});

    const decremented = Math.max(0, buff.turnsRemaining - 1);
    if (decremented > 0) {
      nextActiveBuffs.push({
        ...buff,
        turnsRemaining: decremented,
      });
      return;
    }

    if (buff.itemId === INVESTMENT_ITEM_ID) {
      maturedInvestmentCount += 1;
    }
  });

  return {
    nextStats,
    nextActiveBuffs,
    maturedInvestmentCount,
  };
};

export const tickConsumableCooldowns = (
  cooldowns: GameState['consumableCooldowns']
): Record<string, number> => {
  const safeCooldowns = cooldowns || {};
  const nextCooldowns: Record<string, number> = {};

  Object.entries(safeCooldowns).forEach(([itemId, turns]) => {
    if (typeof turns !== 'number' || turns <= 0) return;
    const decremented = turns - 1;
    if (decremented > 0) {
      nextCooldowns[itemId] = decremented;
    }
  });

  return nextCooldowns;
};

export const calculateInvestmentEarlyExitPayout = (
  activeBuffs: GameState['activeBuffs']
): number => {
  const safeBuffs = activeBuffs || [];
  const totalReturnDelta = CONSUMABLE_CONFIG.investment.returnAmount - CONSUMABLE_CONFIG.investment.base;
  const duration = CONSUMABLE_CONFIG.investment.duration;

  return safeBuffs
    .filter(buff => buff.itemId === INVESTMENT_ITEM_ID && buff.turnsRemaining > 0)
    .reduce((sum, buff) => {
      const elapsedTurns = clamp(duration - buff.turnsRemaining, 0, duration);
      const maturityRatio = elapsedTurns / duration;
      const payout = Math.round(CONSUMABLE_CONFIG.investment.base + totalReturnDelta * maturityRatio);
      return sum + payout;
    }, 0);
};

export const applyBuffSlotPolicy = (
  activeBuffs: GameState['activeBuffs'],
  incomingBuff: ActiveBuffState
): { accepted: boolean; nextActiveBuffs: ActiveBuffState[]; reason?: 'MAX_ACTIVE_BUFFS' } => {
  const safeBuffs = [...(activeBuffs || [])];
  const sameTypeIndices = safeBuffs
    .map((buff, index) => ({ buff, index }))
    .filter(entry => entry.buff.itemId === incomingBuff.itemId)
    .map(entry => entry.index);

  const hasSameType = sameTypeIndices.length > 0;
  if (hasSameType && BUFF_RULES.sameTypePriority === 'REPLACE') {
    const withoutSameType = safeBuffs.filter(buff => buff.itemId !== incomingBuff.itemId);
    return {
      accepted: true,
      nextActiveBuffs: [...withoutSameType, incomingBuff],
    };
  }

  if (safeBuffs.length >= BUFF_RULES.maxActiveBuffs) {
    return {
      accepted: false,
      nextActiveBuffs: safeBuffs,
      reason: 'MAX_ACTIVE_BUFFS',
    };
  }

  return {
    accepted: true,
    nextActiveBuffs: [...safeBuffs, incomingBuff],
  };
};

export const getInitialGameState = (options?: NewGameBootstrapOptions): GameState => {
  const legacyPerksEnabled = options?.legacyPerksEnabled ?? isFeatureEnabled('LEGACY_PERKS');
  const legacyLevel = Math.max(0, options?.legacyLevel ?? 0);
  const fastStart = canUseFastStart(options);
  const startAge = fastStart ? 7 : 0;

  // Aile sistemi baslatma (KRITIK)
  const family = createRandomFamily();

  // Kalitsal ozellikler (Genetic Traits) atama
  const selectedGeneticTraitId = options?.selectedGeneticTraitId;
  const canSelectGeneticTrait = (
    legacyPerksEnabled
    && legacyLevel >= 2
    && typeof selectedGeneticTraitId === 'string'
    && TRAIT_DEFINITIONS.some(trait => trait.id === selectedGeneticTraitId && trait.category === 'GENETIC')
  );
  const geneticTraits = canSelectGeneticTrait
    ? [selectedGeneticTraitId]
    : assignGeneticTraits();

  // Baslangic NPC'leri (oyuncuyla ayni yasta baslar)
  const npcCount = legacyPerksEnabled && legacyLevel >= 3 ? 2 : 1;
  const npcs = generateNPCs(startAge, npcCount);
  const maxEnergy = getMaxEnergy(startAge, family, geneticTraits);
  const inventory = (
    legacyPerksEnabled
    && legacyLevel >= 5
    && typeof options?.starterItemId === 'string'
    && options.starterItemId.length > 0
  ) ? [options.starterItemId] : [];

  return {
    age: startAge,
    turn: 1,
    phase: fastStart ? 'HUB' : 'SETUP',
    currentEvent: null,
    pendingReportCard: false,
    characterInfo: null,
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
    selectedGoal: null,
    streak: { actionId: null, count: 0 },
    traits: geneticTraits,
    traitProgress: {},
    actionCounts: {},
    actionHistory: [],
    eventChoiceHistory: [],
    memories: [],
    scheduledEvents: [],
    activeArcs: [],
    familyEvolution: { ...DEFAULT_FAMILY_EVOLUTION_STATE },
    inventory,
    purchasedItems: [],
    npcs,
    selectedNpcId: null,
    innerThought: '',
    innerThoughtType: 'IDLE' as const,
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
    activeBuffs: [],
    consumableCooldowns: {},
    consumableUsageThisTurn: {},
    unlockedAchievements: [],
    achievementProgress: {},
    personality: {
      openness: 50,
      courage: 50,
      empathy: 50,
      patience: 50,
      conformity: 50,
    },
    personalityState: createInitialPersonalityState(),
    stress: {
      current: 0,
      threshold: 70,
      turnsSinceBreakdown: 0,
      sources: [],
    },
    personalityHistory: [],
    socialGroups: [],
    socialReputation: 50,
    childhood: {
      completed: fastStart,
      sceneIndex: 0,
      memories: [],
      selectedMemoryId: null,
    },
    examsTakenThisYear: [],
    isExamPeriod: false,
    lastBurdenRisk: 0,
    fate: undefined,
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
    devLog.error('Failed to read value from async storage', e);
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
      devLog.log('Legacy save data found. Migration will be handled by SaveManager.');
    }
    const SaveManager = (await import('../save/SaveManager')).default;
    await SaveManager.initialize();
    return true;
  } catch (error) {
    devLog.error("Save system initialization failed:", error);
    return false;
  }
};

export const clearSlotSave = async (slotId: string): Promise<boolean> => {
  try {
    const SaveManager = (await import('../save/SaveManager')).default;
    const success = await SaveManager.clearSlot(slotId);
    return success;
  } catch (error) {
    devLog.error('Clear slot save failed:', error);
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
    devLog.error("Kaydederken hata oluştu:", error);
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
    devLog.error("Yüklerken hata oluştu:", error);
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
    devLog.error("Sıfırlarken hata oluştu:", error);
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
    devLog.error("Auto-save failed:", error);
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

const calculateRepetitionPenaltyMultiplier = (
  actionId: string,
  actionHistory: Array<{ actionId: string }>,
  repetitionPenaltyEnabled: boolean = isFeatureEnabled('REPETITION_PENALTY')
): number => {
  if (!repetitionPenaltyEnabled) return 1;

  const windowSize = Math.max(1, REPETITION_PENALTY_CONFIG.windowSize);
  const recentActions = actionHistory.slice(-windowSize);
  if (recentActions.length === 0) return 1;

  const actionCategory = getActionCategoryFromId(actionId);
  const repetitionCount = recentActions.filter(({ actionId: previousActionId }) => (
    getActionCategoryFromId(previousActionId) === actionCategory
  )).length;

  if (repetitionCount <= 0) return 1;
  const penaltyRatio = Math.min(
    REPETITION_PENALTY_CONFIG.maxPenalty,
    repetitionCount * REPETITION_PENALTY_CONFIG.penaltyPerRepeat
  );
  return 1 + penaltyRatio;
};

export const applySkillsToHubAction = (
  actionId: string,
  baseEffect: Partial<Stats>,
  baseEnergyCost: number,
  baseGradeUpdates: Partial<SchoolGrades> | undefined,
  skills: Skills,
  actionHistory: Array<{ actionId: string }> = []
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

  const repetitionPenaltyMultiplier = calculateRepetitionPenaltyMultiplier(actionId, actionHistory);
  energyCost = Math.max(1, Math.ceil(energyCost * repetitionPenaltyMultiplier));

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

type NPCNameLocale = Extract<AppLocale, 'tr' | 'en'>;

export interface NPCGenerationOptions {
  locale?: NPCNameLocale;
  deterministicSeed?: number;
}

const npcNamePools: Record<NPCNameLocale, Record<'MALE' | 'FEMALE', string[]>> = {
  tr: {
    MALE: [
      'Ahmet', 'Mehmet', 'Mustafa', 'Ali', 'Hüseyin', 'Hasan', 'İbrahim', 'Osman', 'Yusuf', 'Ömer',
      'Can', 'Burak', 'Emre', 'Kerem', 'Mert', 'Deniz', 'Volkan', 'Cem', 'Arda', 'Efe',
      'Bora', 'Sinan', 'Kaan', 'Yiğit', 'Berkay', 'Oğuz', 'Tolga', 'Onur', 'Serkan', 'Hakan',
      'Eren', 'Alp', 'Barış', 'Doruk', 'Emir', 'Furkan', 'Görkem', 'Halil', 'İlker', 'Kağan',
      'Levent', 'Murat', 'Okan', 'Polat', 'Rüzgar', 'Selim', 'Tarık', 'Umut', 'Zafer', 'Aras',
      'Batuhan', 'Caner', 'Dağhan', 'Engin', 'Fatih', 'Gökhan', 'Hüsnü', 'İsmail', 'Koray', 'Tuna',
      'Atlas', 'Poyraz', 'Çınar', 'Demir', 'Eymen', 'Yaman', 'Alperen', 'Utku', 'Atakan', 'Baran',
      'Kuzey', 'Ege', 'Taner', 'Meriç', 'Atalay', 'Berke', 'Çağrı', 'Doğukan', 'Erdem', 'Ferit',
      'Göktürk', 'Harun', 'İlhan', 'Kıvanç', 'Kutay', 'Metehan', 'Necip', 'Orhan', 'Özgür', 'Rauf',
      'Sarp', 'Taylan', 'Uğur', 'Vedat', 'Yalçın', 'Zeki', 'Akın', 'Bilge', 'Cenk', 'Devrim',
    ],
    FEMALE: [
      'Fatma', 'Ayşe', 'Emine', 'Hatice', 'Zeynep', 'Elif', 'Meryem', 'Şerife', 'Sultan', 'Hanife',
      'Melis', 'Ceren', 'Selin', 'Ece', 'Derya', 'Sena', 'Ezgi', 'Buse', 'Gizem', 'İrem',
      'Gamze', 'Deniz', 'Aslı', 'Başak', 'Cansu', 'Damla', 'Ebru', 'Fulya', 'Gülşen', 'Hande',
      'Ilgın', 'Jale', 'Kardelen', 'Lale', 'Meltem', 'Nazlı', 'Özge', 'Pelin', 'Rüya', 'Simge',
      'Tuğçe', 'Vildan', 'Yağmur', 'Zara', 'Almila', 'Bengisu', 'Cemre', 'Defne', 'Esra', 'Feyza',
      'Gökçe', 'Hazal', 'İpek', 'Kübra', 'Lara', 'Miray', 'Naz', 'Öykü', 'Pınar', 'Rana',
      'Ada', 'Azra', 'Beren', 'Derin', 'Ela', 'Nehir', 'Su', 'Toprak', 'Asya', 'Dila',
      'Eliz', 'Güneş', 'İdil', 'Kumsal', 'Lina', 'Maya', 'Nil', 'Pera', 'Sude', 'Tuana',
      'Yaren', 'Zehra', 'Beril', 'Ceyda', 'Dilara', 'Eylül', 'Gülce', 'Hira', 'İlayda', 'Jülide',
      'Kader', 'Leyla', 'Melisa', 'Nisan', 'Oya', 'Perihan', 'Rabia', 'Sibel', 'Tülin', 'Ülker',
    ],
  },
  en: {
    MALE: [
      'James', 'Michael', 'William', 'David', 'Joseph', 'Daniel', 'Matthew', 'Andrew', 'Joshua', 'Ryan',
      'Nathan', 'Ethan', 'Noah', 'Liam', 'Mason', 'Logan', 'Lucas', 'Aiden', 'Jackson', 'Levi',
      'Benjamin', 'Samuel', 'Henry', 'Jack', 'Caleb', 'Connor', 'Owen', 'Wyatt', 'Isaac', 'Julian',
      'Theodore', 'Thomas', 'Charles', 'Leo', 'Adrian', 'Grayson', 'Asher', 'Hudson', 'Miles', 'Eli',
      'Everett', 'Colin', 'Dominic', 'Rowan', 'Silas', 'Parker', 'Brooks', 'Nolan', 'Gavin', 'Jasper',
      'Brandon', 'Dylan', 'Aaron', 'Ian', 'Evan', 'Alex', 'Christian', 'Jonathan', 'Kevin', 'Jason',
      'Adam', 'Brian', 'Sean', 'Scott', 'Kyle', 'Eric', 'Patrick', 'Tyler', 'Zachary', 'Cole',
      'Reid', 'Blake', 'Chase', 'Grant', 'Riley', 'Shane', 'Spencer', 'Toby', 'Vincent', 'Wesley',
      'Xavier', 'Felix', 'Oliver', 'George', 'Robert', 'Edward', 'Arthur', 'Harvey', 'Louis', 'Oscar',
      'Frank', 'Freddie', 'Harry', 'Finley', 'Callum', 'Alfie', 'Rhys', 'Kieran', 'Elliot', 'Marcus',
    ],
    FEMALE: [
      'Emma', 'Olivia', 'Sophia', 'Ava', 'Isabella', 'Mia', 'Amelia', 'Harper', 'Evelyn', 'Abigail',
      'Ella', 'Scarlett', 'Grace', 'Chloe', 'Lily', 'Hannah', 'Sofia', 'Aria', 'Zoe', 'Layla',
      'Nora', 'Luna', 'Aurora', 'Ellie', 'Stella', 'Lucy', 'Claire', 'Audrey', 'Violet', 'Hazel',
      'Alice', 'Sadie', 'Madeline', 'Brooklyn', 'Naomi', 'Eva', 'Ruby', 'Ivy', 'Elena', 'Leah',
      'Sarah', 'Anna', 'Julia', 'Maya', 'Eliza', 'Ariana', 'Quinn', 'Rose', 'Jasmine', 'Sydney',
      'Ashley', 'Brianna', 'Caroline', 'Danielle', 'Erin', 'Faith', 'Gabrielle', 'Hailey', 'Jenna', 'Kaitlyn',
      'Lauren', 'Megan', 'Nicole', 'Paige', 'Rachel', 'Samantha', 'Taylor', 'Vanessa', 'Whitney', 'Yasmin',
      'Alyssa', 'Bethany', 'Caitlin', 'Delilah', 'Elise', 'Fiona', 'Gemma', 'Heather', 'Imogen', 'Joanna',
      'Kelsey', 'Lydia', 'Molly', 'Natalie', 'Phoebe', 'Rosalie', 'Savannah', 'Tessa', 'Veronica', 'Willow',
      'Alexis', 'Bianca', 'Celeste', 'Daphne', 'Ember', 'Frances', 'Genevieve', 'Hallie', 'Isla', 'Juliette',
    ],
  },
};

const npcPersonalities: NPCPersonality[] = ['FRIENDLY', 'SHY', 'AGGRESSIVE', 'POPULAR', 'NERDY', 'ARTISTIC', 'ATHLETIC'];
const npcTraits: NPCTrait[] = ['LOYAL', 'JEALOUS', 'GOSSIPER', 'SUPPORTIVE', 'COMPETITIVE', 'ROMANTIC', 'MANIPULATIVE'];

const createSeededRandom = (seed: number): (() => number) => {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
};

const getRandomIntWithGenerator = (
  min: number,
  max: number,
  generator: () => number
): number => Math.floor(generator() * (max - min + 1)) + min;

const resolveNPCNameLocale = (locale?: NPCNameLocale): NPCNameLocale => {
  if (locale) return locale;
  const runtimeLocale = getRuntimeLocale();
  return runtimeLocale === 'en' ? 'en' : 'tr';
};

const sanitizeNPCName = (rawName: string, fallbackName: string): string => {
  const cleaned = rawName
    .normalize('NFKC')
    .replace(/[^\p{L}\s'-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned.length > 0 ? cleaned : fallbackName;
};

/** Yaşa uygun rastgele NPC oluşturur */
export const createRandomNPC = (
  playerAge: number = 0,
  playerTurn: number = 1,
  options: NPCGenerationOptions = {}
): NPC => {
  const locale = resolveNPCNameLocale(options.locale);
  const randomSource = options.deterministicSeed === undefined
    ? Math.random
    : createSeededRandom(options.deterministicSeed);
  const nextInt = (min: number, max: number): number => (
    getRandomIntWithGenerator(min, max, randomSource)
  );

  const gender = randomSource() > 0.5 ? 'MALE' : 'FEMALE';
  const list = npcNamePools[locale][gender];
  const rawName = list[nextInt(0, list.length - 1)];
  const fallbackName = locale === 'tr'
    ? (gender === 'MALE' ? 'Can' : 'Ece')
    : (gender === 'MALE' ? 'Alex' : 'Emily');
  const name = sanitizeNPCName(rawName, fallbackName);
  const id = `npc_${Date.now()}_${getRandomInt(0, 999)}`;

  // Yaşa uygun NPC yaşı (±2 yıl)
  const npcAge = Math.max(0, playerAge + nextInt(-2, 2));

  // Rastgele kişilik
  const personality = npcPersonalities[nextInt(0, npcPersonalities.length - 1)];

  // 1-2 rastgele özellik
  const traitCount = nextInt(1, 2);
  const selectedTraits: NPCTrait[] = [];
  while (selectedTraits.length < traitCount) {
    const trait = npcTraits[nextInt(0, npcTraits.length - 1)];
    if (!selectedTraits.includes(trait)) {
      selectedTraits.push(trait);
    }
  }

  return {
    id,
    name,
    role: 'ACQUAINTANCE',
    relationship: nextInt(10, 40),
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
export const generateNPCs = (
  playerAge: number = 0,
  playerTurn: number = 1,
  options: NPCGenerationOptions = {}
): NPC[] => {
  const secondSeed = options.deterministicSeed === undefined
    ? undefined
    : options.deterministicSeed + 1;

  return [
    createRandomNPC(playerAge, playerTurn, options),
    createRandomNPC(playerAge, playerTurn, { ...options, deterministicSeed: secondSeed }),
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

// --- SOSYAL ÖZET SİSTEMİ ---

const ROLE_EMOJI: Record<NPCRole, string> = {
  PARTNER: '❤️',
  BEST_FRIEND: '🤝',
  FRIEND: '👥',
  CRUSH: '💕',
  RIVAL: '⚔️',
  ENEMY: '🔥',
  ACQUAINTANCE: '👋',
};

const ROLE_ORDER: NPCRole[] = ['PARTNER', 'BEST_FRIEND', 'CRUSH', 'FRIEND', 'RIVAL', 'ENEMY'];

export interface NPCSummary {
  name: string;
  role: NPCRole;
  relationship: number;
  metAge: number;
  sharedMemoryCount: number;
  emoji: string;
  narrativeLine: string;
}

const buildNPCNarrative = (npc: NPC): string => {
  const yearsKnown = Math.max(0, 18 - npc.metAge);
  const memCount = npc.sharedMemories.length;

  switch (npc.role) {
    case 'PARTNER':
      return tRuntime(
        'social.epilogue.templates.PARTNER',
        { name: npc.name, metAge: npc.metAge, yearsKnown },
        `${npc.name} ile ${npc.metAge} yasinda tanistin. ${yearsKnown} yil boyunca birlikte buyudunuz ve mezuniyette el ele tutuyordunuz.`
      );
    case 'BEST_FRIEND':
      return memCount > 2
        ? tRuntime(
          'social.epilogue.templates.BEST_FRIEND_MEMORIES',
          { name: npc.name, metAge: npc.metAge, memCount },
          `${npc.name}, ${npc.metAge} yasindan beri yaninda. ${memCount} ortak aniniz var, o senin kardesin.`
        )
        : tRuntime(
          'social.epilogue.templates.BEST_FRIEND',
          { name: npc.name, metAge: npc.metAge },
          `${npc.name} ile ${npc.metAge} yasindan beri birbirinize bagli kaldiniz.`
        );
    case 'CRUSH':
      return tRuntime(
        'social.epilogue.templates.CRUSH',
        { name: npc.name },
        `${npc.name} ile aranizda bir seyler var ama henuz netlesmediniz.`
      );
    case 'FRIEND':
      return yearsKnown >= 5
        ? tRuntime(
          'social.epilogue.templates.FRIEND_LONG',
          { name: npc.name, yearsKnown },
          `${npc.name} ile ${yearsKnown} yildir arkadassiniz. Iyi gunleri paylastiniz.`
        )
        : tRuntime(
          'social.epilogue.templates.FRIEND_SHORT',
          { name: npc.name },
          `${npc.name} ile ara sira takiliyorsun. Iyi bir arkadas ama derin bir bag kuramadin.`
        );
    case 'RIVAL':
      return tRuntime(
        'social.epilogue.templates.RIVAL',
        { name: npc.name, metAge: npc.metAge },
        `${npc.name} ile ${npc.metAge} yasinda yollariniz ayrildi. Hala birbirinize soguk bakiyorsunuz.`
      );
    case 'ENEMY':
      return tRuntime(
        'social.epilogue.templates.ENEMY',
        { name: npc.name, hateScore: Math.abs(npc.relationship) },
        `${npc.name} ile aran hic duzelmedi. ${Math.abs(npc.relationship)} puan nefret biriktirdiniz.`
      );
    default:
      return tRuntime(
        'social.epilogue.templates.DEFAULT',
        { name: npc.name },
        `${npc.name} ile yollariniz kesisti ama derin bir bag kuramadin.`
      );
  }
};

export const buildSocialSummary = (npcs: NPC[]): NPCSummary[] => {
  const significant = npcs.filter(n => ROLE_ORDER.includes(n.role));
  const sorted = significant.sort((a, b) => {
    const aOrder = ROLE_ORDER.indexOf(a.role);
    const bOrder = ROLE_ORDER.indexOf(b.role);
    return aOrder - bOrder;
  });

  return sorted.slice(0, 5).map(npc => ({
    name: npc.name,
    role: npc.role,
    relationship: npc.relationship,
    metAge: npc.metAge,
    sharedMemoryCount: npc.sharedMemories.length,
    emoji: ROLE_EMOJI[npc.role] ?? '👋',
    narrativeLine: buildNPCNarrative(npc),
  }));
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
  const { memories } = gameState;
  const personality = gameState.personality ?? { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50 };
  const mems = memories ?? [];

  const endingResolution = resolveEnding({
    gameState,
    stats,
    achievements: gameState.unlockedAchievements,
  });

  return enrichCareerResult(endingResolution.result, personality, mems);
};
// --- TRAIT LOGIC ---
const ACTION_TRIGGER_ALIASES: Record<string, string[]> = {
  art: ['arts_', 'study_art'],
  coding: ['computer_code', 'work_freelance'],
};

const isWithinAgeWindow = (age: number, ageWindow?: [number, number]): boolean => {
  if (!ageWindow) return true;
  return age >= ageWindow[0] && age <= ageWindow[1];
};

const matchesActionTrigger = (actionId: string, trigger: TraitTrigger): boolean => {
  if (trigger.pattern && actionId.startsWith(trigger.pattern)) {
    return true;
  }

  if (!trigger.actionId) return false;
  if (actionId === trigger.actionId) return true;
  if (actionId.startsWith(`${trigger.actionId}_`)) return true;

  const aliases = ACTION_TRIGGER_ALIASES[trigger.actionId] || [];
  return aliases.some(alias => actionId === alias || actionId.startsWith(alias));
};

const matchesEventChoiceTrigger = (
  choiceId: string | null,
  state: GameState,
  trigger: TraitTrigger
): boolean => {
  if (trigger.pattern && choiceId === trigger.pattern) {
    return true;
  }

  if (!trigger.eventId || state.currentEvent?.id !== trigger.eventId) {
    return false;
  }

  if (trigger.choice == null) {
    return true;
  }

  return choiceId !== null && choiceId === String(trigger.choice);
};

const isStatThresholdMet = (trigger: TraitTrigger, currentStats: Stats): boolean => {
  if (trigger.statCondition) {
    const statValue = currentStats[trigger.statCondition.stat as StatKey];
    if (typeof statValue !== 'number') return false;
    if (trigger.statCondition.operator === '>') return statValue > trigger.statCondition.value;
    if (trigger.statCondition.operator === '<') return statValue < trigger.statCondition.value;
    return false;
  }

  if (trigger.statKey && typeof trigger.threshold === 'number') {
    return currentStats[trigger.statKey] >= trigger.threshold;
  }

  return false;
};

interface ResolveTraitChangesInput {
  currentTraits: string[];
  gainedTraits?: string[];
  removedTraits?: string[];
}

interface ResolveTraitChangesResult {
  traits: string[];
  gainedTraits: string[];
  removedTraits: string[];
}

export const resolveTraitChanges = ({
  currentTraits,
  gainedTraits = [],
  removedTraits = [],
}: ResolveTraitChangesInput): ResolveTraitChangesResult => {
  const nextTraits = new Set(currentTraits);
  const appliedGained: string[] = [];
  const appliedRemoved = new Set<string>();

  removedTraits.forEach(traitId => {
    if (nextTraits.delete(traitId)) {
      appliedRemoved.add(traitId);
    }
  });

  gainedTraits.forEach(traitId => {
    if (!traitId) return;

    const traitDefinition = TRAIT_DEFINITIONS.find(t => t.id === traitId);
    if (!traitDefinition) {
      devLog.warn(`[TraitSystem] Unknown trait id ignored: ${traitId}`);
      return;
    }

    if (traitDefinition.conflicts && traitDefinition.conflicts.length > 0) {
      traitDefinition.conflicts.forEach(conflictId => {
        if (nextTraits.delete(conflictId)) {
          appliedRemoved.add(conflictId);
        }
      });
    }

    if (!nextTraits.has(traitId)) {
      nextTraits.add(traitId);
      appliedGained.push(traitId);
    }
  });

  return {
    traits: Array.from(nextTraits),
    gainedTraits: appliedGained,
    removedTraits: Array.from(appliedRemoved),
  };
};

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
  const hasDirectInteraction = actionId !== null || choiceId !== null;

  // Filter relevant ACQUIRED traits that are NOT yet owned
  const potentialTraits = TRAIT_DEFINITIONS.filter(t => t.category === 'ACQUIRED' && t.formation && !state.traits.includes(t.id));

  potentialTraits.forEach(trait => {
    const formation = trait.formation;
    if (!formation) return; // filter above guarantees this, but TS needs explicit narrowing

    // 1. Age Check
    if (!isWithinAgeWindow(state.age, formation.ageWindow)) return;
    const eligibleTriggers = formation.triggers.filter(trigger => isWithinAgeWindow(state.age, trigger.ageWindow));
    if (eligibleTriggers.length === 0) return;

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
    let pointsToAdd = 0;
    const hasActionOrChoiceTriggers = eligibleTriggers.some(
      trigger => trigger.type === 'ACTION' || trigger.type === 'EVENT_CHOICE'
    );
    const hasStatThresholdTriggers = eligibleTriggers.some(trigger => trigger.type === 'STAT_THRESHOLD');
    let thresholdRequirementsMet = true;
    let hasProgressSource = false;

    eligibleTriggers.forEach(trigger => {
      if (trigger.type === 'ACTION') {
        if (actionId && matchesActionTrigger(actionId, trigger)) {
          hasProgressSource = true;
          pointsToAdd += 1;
        }
        return;
      }

      if (trigger.type === 'EVENT_CHOICE') {
        if (matchesEventChoiceTrigger(choiceId, state, trigger)) {
          hasProgressSource = true;
          pointsToAdd += 1;
        }
        return;
      }

      if (trigger.type === 'STAT_THRESHOLD') {
        const thresholdMet = isStatThresholdMet(trigger, currentStats);
        if (!thresholdMet) {
          thresholdRequirementsMet = false;
          return;
        }

        // Threshold-only traits should progress only during a direct player interaction.
        if (!hasActionOrChoiceTriggers && hasDirectInteraction) {
          hasProgressSource = true;
          pointsToAdd += 1;
        }
      }
    });

    // For mixed trigger traits, thresholds are prerequisites and should not generate progress by themselves.
    if (hasStatThresholdTriggers && !thresholdRequirementsMet) return;
    if (!hasProgressSource || pointsToAdd <= 0) return;
    const cooldownTurns = formation.progressCooldownTurns ?? 0;
    const lastProgressTurn = updatedProgress[trait.id].lastProgressTurn;
    if (
      cooldownTurns > 0
      && typeof lastProgressTurn === 'number'
      && state.turn - lastProgressTurn < cooldownTurns
    ) {
      return;
    }

    // 3. Logic & Multipliers
    if (hasProgressSource) {
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
      updatedProgress[trait.id].lastProgressTurn = state.turn;

      // Add to UI feedback list (avoid duplicates)
      if (!progressUpdates.includes(trait.id)) {
        progressUpdates.push(trait.id);
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

export const turkishMonths = [
  'Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran',
  'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik',
];

export const englishMonths = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// Burç bilgileri
export const zodiacInfo: Record<ZodiacSign, {
  name: string;
  emoji: string;
  dateRange: string;
  personality: string;
  strength: string;
  challenge: string;
}> = {
  KOC: {
    name: "Koc",
    emoji: "♈",
    dateRange: "21 Mart - 19 Nisan",
    personality: "Riskte atak, buyumede hizli ama catismada cabuk alevlenen bir ruh.",
    strength: "Cesaret ve hizli karar",
    challenge: "Catismada sabir",
  },
  BOGA: {
    name: "Boga",
    emoji: "♉",
    dateRange: "20 Nisan - 20 Mayis",
    personality: "Degerlerine sadik, adim adim ilerleyen ve riskte frene basan bir karakter.",
    strength: "Guven ve istikrar",
    challenge: "Belirsizlikte cesur adim",
  },
  IKIZLER: {
    name: "Ikizler",
    emoji: "♊",
    dateRange: "21 Mayis - 20 Haziran",
    personality: "Sosyallikte parlayan, firsati hizla yakalayan ama ilkesel dengede zorlanan bir zihin.",
    strength: "Iletisim ve ceviklik",
    challenge: "Degerlerde tutarlilik",
  },
  YENGEC: {
    name: "Yengec",
    emoji: "♋",
    dateRange: "21 Haziran - 22 Temmuz",
    personality: "Vicdani guclu, insanlarla sicak bag kuran ama gerilimde geri cekilen bir kalp.",
    strength: "Sefkat ve bag kurma",
    challenge: "Catismada dayanma",
  },
  ASLAN: {
    name: "Aslan",
    emoji: "♌",
    dateRange: "23 Temmuz - 22 Agustos",
    personality: "Sahnede guclu, catismada cesur ama vicdani dengede zorlanabilen bir liderlik enerjisi.",
    strength: "Liderlik ve etki",
    challenge: "Empati ve olcululuk",
  },
  BASAK: {
    name: "Basak",
    emoji: "♍",
    dateRange: "23 Agustos - 22 Eylul",
    personality: "Gelisimi sabirla isleyen, etik durusu koruyan ve riskte kontrollu kalan bir ruh.",
    strength: "Disiplinli gelisim",
    challenge: "Guvenli alandan cikmak",
  },
  TERAZI: {
    name: "Terazi",
    emoji: "♎",
    dateRange: "23 Eylul - 22 Ekim",
    personality: "Sosyal dengeyi kuran, adalet duygusu yuksek ama sert gerilimde zorlanan bir karakter.",
    strength: "Uzlasi ve adalet",
    challenge: "Sert catismada karar",
  },
  AKREP: {
    name: "Akrep",
    emoji: "♏",
    dateRange: "23 Ekim - 21 Kasim",
    personality: "Catismada guclu, riskte cesur ama sosyal iliskilerde zorlanan bir ruh.",
    strength: "Cesaret ve kararlilik",
    challenge: "Empati ve baglanti",
  },
  YAY: {
    name: "Yay",
    emoji: "♐",
    dateRange: "22 Kasim - 21 Aralik",
    personality: "Kesfe acik, riskte istekli ve buyumeye odakli; deger dengesini korumakta zorlanan bir yolcu.",
    strength: "Kesif cesareti",
    challenge: "Sorumlulukta istikrar",
  },
  OGLAK: {
    name: "Oglak",
    emoji: "♑",
    dateRange: "22 Aralik - 19 Ocak",
    personality: "Uzun vadede sabirli, etik cizgisi guclu ve riskte temkinli bir stratejist.",
    strength: "Sabir ve strateji",
    challenge: "Cesur risk alma",
  },
  KOVA: {
    name: "Kova",
    emoji: "♒",
    dateRange: "20 Ocak - 18 Subat",
    personality: "Toplulukta yenilikci, riskte atik ama gerilimde mesafelenen bir vizyon.",
    strength: "Yenilik ve sosyal vizyon",
    challenge: "Gerilimde denge",
  },
  BALIK: {
    name: "Balik",
    emoji: "♓",
    dateRange: "19 Subat - 20 Mart",
    personality: "Vicdani ve sosyal bagi guclu, catismada sinir cizmekte zorlanan duygusal bir ruh.",
    strength: "Empati ve sezgi",
    challenge: "Catismada net sinir",
  },
};
export const zodiacInfoEn: Record<ZodiacSign, {
  name: string;
  emoji: string;
  dateRange: string;
  personality: string;
  strength: string;
  challenge: string;
}> = {
  KOC: {
    name: 'Aries',
    emoji: '\u2648',
    dateRange: 'March 21 - April 19',
    personality: 'Bold in risk, fast in growth, and quick to ignite during conflict.',
    strength: 'Courage and quick decisions',
    challenge: 'Patience during conflict',
  },
  BOGA: {
    name: 'Taurus',
    emoji: '\u2649',
    dateRange: 'April 20 - May 20',
    personality: 'Steady, loyal to values, and careful around uncertainty.',
    strength: 'Stability and trust',
    challenge: 'Taking bold steps in ambiguity',
  },
  IKIZLER: {
    name: 'Gemini',
    emoji: '\u264A',
    dateRange: 'May 21 - June 20',
    personality: 'Social and agile, quick to spot opportunities but tested by consistency.',
    strength: 'Communication and adaptability',
    challenge: 'Value consistency',
  },
  YENGEC: {
    name: 'Cancer',
    emoji: '\u264B',
    dateRange: 'June 21 - July 22',
    personality: 'Emotionally warm and loyal, yet tends to retreat under pressure.',
    strength: 'Care and emotional bonding',
    challenge: 'Standing firm in tension',
  },
  ASLAN: {
    name: 'Leo',
    emoji: '\u264C',
    dateRange: 'July 23 - August 22',
    personality: 'Strong on stage, fearless in conflict, learning to balance empathy.',
    strength: 'Leadership and influence',
    challenge: 'Measured empathy',
  },
  BASAK: {
    name: 'Virgo',
    emoji: '\u264D',
    dateRange: 'August 23 - September 22',
    personality: 'Disciplined and ethical, with controlled risk-taking.',
    strength: 'Structured growth',
    challenge: 'Leaving the comfort zone',
  },
  TERAZI: {
    name: 'Libra',
    emoji: '\u264E',
    dateRange: 'September 23 - October 22',
    personality: 'Builds social balance and fairness, but can hesitate in hard conflicts.',
    strength: 'Harmony and justice',
    challenge: 'Decisiveness under pressure',
  },
  AKREP: {
    name: 'Scorpio',
    emoji: '\u264F',
    dateRange: 'October 23 - November 21',
    personality: 'Powerful in conflict and risk, but challenged in soft social balance.',
    strength: 'Resolve and intensity',
    challenge: 'Empathy and openness',
  },
  YAY: {
    name: 'Sagittarius',
    emoji: '\u2650',
    dateRange: 'November 22 - December 21',
    personality: 'Curious and adventure-seeking, with growth drive and a need for discipline.',
    strength: 'Exploration and optimism',
    challenge: 'Long-term consistency',
  },
  OGLAK: {
    name: 'Capricorn',
    emoji: '\u2651',
    dateRange: 'December 22 - January 19',
    personality: 'Patient and strategic with strong ethical grounding.',
    strength: 'Patience and planning',
    challenge: 'Taking bold risks',
  },
  KOVA: {
    name: 'Aquarius',
    emoji: '\u2652',
    dateRange: 'January 20 - February 18',
    personality: 'Innovative and socially aware, sometimes distant in direct tension.',
    strength: 'Vision and innovation',
    challenge: 'Emotional grounding in conflict',
  },
  BALIK: {
    name: 'Pisces',
    emoji: '\u2653',
    dateRange: 'February 19 - March 20',
    personality: 'Deeply empathetic and intuitive, but can struggle with hard boundaries.',
    strength: 'Empathy and intuition',
    challenge: 'Clear boundaries in conflict',
  },
};

export type LocalizedDisplayLocale = 'tr' | 'en';

export const getLocalizedMonths = (locale: LocalizedDisplayLocale): string[] => (
  locale === 'en' ? englishMonths : turkishMonths
);

export const getLocalizedZodiacInfo = (
  locale: LocalizedDisplayLocale
): Record<ZodiacSign, {
  name: string;
  emoji: string;
  dateRange: string;
  personality: string;
  strength: string;
  challenge: string;
}> => (
  locale === 'en' ? zodiacInfoEn : zodiacInfo
);

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

/** Locale'e göre rastgele isim döndürür */
export const getRandomFirstName = (
  gender: PlayerGender,
  locale: NPCNameLocale = resolveNPCNameLocale()
): string => {
  const list = npcNamePools[locale][gender];
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
export const generateRandomCharacter = (
  locale: NPCNameLocale = resolveNPCNameLocale()
): CharacterInfo => {
  const gender: PlayerGender = Math.random() > 0.5 ? 'MALE' : 'FEMALE';
  const firstName = getRandomFirstName(gender, locale);
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












