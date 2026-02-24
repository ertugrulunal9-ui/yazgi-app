import { EventContext, GameEvent, LifeGoal, MemoryWeight, NPCRole, SchoolGrades, Skills, Stats } from '../types';
import { GOAL_EVENT_WEIGHTING } from '../constants/gameConstants';
import { clamp } from './gameUtils';

export type AdaptivePacingBand = 'RECOVERY' | 'BALANCED' | 'CHALLENGE';

interface EventSelectionOptions {
  fallbackEvent: GameEvent;
  adaptivePacingStreak?: number;
  randomFn?: () => number;
  eventFrequency?: EventFrequencyMap;
  currentTurn?: number;
  selectedGoal?: LifeGoal | null;
  recentCategories?: string[];
}

type EventHistoryInput = string[] | Set<string>;

const BASE_RARITY_WEIGHTS: Record<'COMMON' | 'UNCOMMON' | 'RARE', number> = {
  COMMON: 50,
  UNCOMMON: 35,
  RARE: 15,
};

const MEMORY_WEIGHT_VALUES: Record<MemoryWeight, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const GOAL_KEYWORDS: Record<LifeGoal, string[]> = {
  ACADEMIC: ['study', 'library', 'exam', 'sinav', 'school', 'karne', 'yks', 'math', 'science'],
  ATHLETIC: ['sport', 'athletic', 'training', 'gym', 'run', 'match', 'turnuva', 'fitness'],
  CREATIVE: ['art', 'music', 'design', 'creative', 'konser', 'sergi', 'sahne', 'yaz'],
  WEALTH: ['work', 'money', 'business', 'trade', 'finance', 'startup', 'salary', 'yatirim'],
  SOCIAL: ['social', 'family', 'friend', 'npc', 'relationship', 'love', 'group', 'topluluk'],
};

const NPC_CHECKIN_TAG = 'npc_checkin';
const NPC_CHECKIN_BIAS_MULTIPLIER = 1.7;
const NPC_CHECKIN_BIAS_INTERVAL = 5;
const NPC_CHECKIN_BIAS_PRE_TURN = 4;

const normalizeEventSearchText = (event: GameEvent): string => {
  const textPart = typeof event.text === 'string' ? event.text : '';
  const tagsPart = (event.tags || []).join(' ');
  return `${event.id} ${tagsPart} ${textPart}`.toLowerCase();
};

const isGoalRelatedEvent = (event: GameEvent, selectedGoal?: LifeGoal | null): boolean => {
  if (!selectedGoal) return false;
  const keywords = GOAL_KEYWORDS[selectedGoal];
  if (!keywords || keywords.length === 0) return false;
  const searchSpace = normalizeEventSearchText(event);
  return keywords.some(keyword => searchSpace.includes(keyword));
};

const getGoalWeightMultiplier = (event: GameEvent, selectedGoal?: LifeGoal | null): number => {
  if (!selectedGoal) return 1;
  return isGoalRelatedEvent(event, selectedGoal)
    ? GOAL_EVENT_WEIGHTING.ALIGNED_MULTIPLIER
    : GOAL_EVENT_WEIGHTING.UNALIGNED_MULTIPLIER;
};

const shouldUseChaosSelection = (currentTurn?: number): boolean => (
  typeof currentTurn === 'number'
  && currentTurn > 0
  && currentTurn % GOAL_EVENT_WEIGHTING.CHAOS_INTERVAL === 0
);

export const calculateGoalAlignmentScore = (
  event: GameEvent,
  selectedGoal?: LifeGoal | null
): number => {
  if (!selectedGoal) return 50;
  return isGoalRelatedEvent(event, selectedGoal) ? 100 : 25;
};

export const getRecencyWindowSize = (age: number): number => {
  if (age < 7) return 4;
  if (age < 12) return 10;
  if (age < 16) return 15;
  return 18;
};

export interface EventFrequencyEntry {
  count: number;
  lastSeenTurn: number;
}

export type EventFrequencyMap = { [eventId: string]: EventFrequencyEntry };

const getFreshnessMultiplier = (
  eventId: string,
  frequency: EventFrequencyMap,
  currentTurn: number
): number => {
  const entry = frequency[eventId];
  if (!entry) return 1.0;
  const countPenalty = Math.max(0.3, 1 - entry.count * 0.1);
  const turnsSinceLastSeen = currentTurn - entry.lastSeenTurn;
  const recencyBoost = Math.min(1.0, turnsSinceLastSeen / 20);
  return countPenalty * recencyBoost;
};

const toSet = (ids: string[]): Set<string> => new Set(ids);
const toEventSet = (ids: EventHistoryInput): Set<string> => (ids instanceof Set ? ids : toSet(ids));

const meetsPersonality = (
  requirements: GameEvent['reqPersonality'],
  personality: EventContext['personality']
): boolean => {
  if (!requirements || requirements.length === 0) return true;
  return requirements.every(req => {
    const value = personality[req.axis];
    if (req.min !== undefined && value < req.min) return false;
    if (req.max !== undefined && value > req.max) return false;
    return true;
  });
};

const meetsStress = (
  reqStress: GameEvent['reqStress'],
  stress: EventContext['stress']
): boolean => {
  if (!reqStress) return true;
  if (reqStress.min !== undefined && stress.current < reqStress.min) return false;
  if (reqStress.max !== undefined && stress.current > reqStress.max) return false;
  return true;
};

const meetsFamily = (
  reqFamily: GameEvent['reqFamily'],
  family: EventContext['family']
): boolean => {
  if (!reqFamily) return true;
  if (!family) return false;
  if (reqFamily.wealth && !reqFamily.wealth.includes(family.wealth)) return false;
  if (reqFamily.dynamic && !reqFamily.dynamic.includes(family.dynamic)) return false;
  return true;
};

const meetsSkills = (
  reqSkills: GameEvent['reqSkills'],
  skills: EventContext['skills']
): boolean => {
  if (!reqSkills) return true;
  if (!skills) return false;
  return Object.entries(reqSkills).every(([key, value]) => {
    if (typeof value !== 'number') return true;
    const current = skills[key as keyof Skills] ?? 0;
    return current >= value;
  });
};

const meetsNpcRole = (reqNPCRole: NPCRole | undefined, npcs: EventContext['npcs']): boolean => {
  if (!reqNPCRole) return true;
  return Boolean(npcs?.some(npc => npc.role === reqNPCRole));
};

const meetsMemory = (
  reqMemory: GameEvent['reqMemory'],
  memories: EventContext['memories']
): boolean => {
  if (!reqMemory) return true;
  return memories.some(memory =>
    memory.emotion === reqMemory.emotion &&
    MEMORY_WEIGHT_VALUES[memory.weight] >= MEMORY_WEIGHT_VALUES[reqMemory.minWeight]
  );
};

const isDueScheduledEvent = (context: EventContext, eventId: string): boolean => {
  const scheduled = context.gameState?.scheduledEvents || [];
  return scheduled.some(item => {
    if (item.eventId !== eventId) return false;
    if (typeof item.remainingTurns === 'number') return item.remainingTurns <= 0;
    if (typeof item.triggerAge === 'number') return item.triggerAge <= context.age;
    return true;
  });
};

export const isEventEligible = (
  event: GameEvent,
  context: EventContext,
  recentEventIds: EventHistoryInput,
  allSeenEvents: EventHistoryInput
): boolean => {
  const allSeenSet = toEventSet(allSeenEvents);
  const recentSet = toEventSet(recentEventIds);
  return isEventEligibleWithSets(event, context, recentSet, allSeenSet);
};

const isEventEligibleWithSets = (
  event: GameEvent,
  context: EventContext,
  recentSet: Set<string>,
  allSeenSet: Set<string>
): boolean => {
  if (event.minAge > context.age || event.maxAge < context.age) return false;
  if (event.reqStats) {
    for (const [key, value] of Object.entries(event.reqStats)) {
      if (context.stats[key as keyof Stats] < value) return false;
    }
  }
  if (event.reqTraits && !event.reqTraits.every(trait => context.traits?.includes(trait))) return false;
  if (event.reqPersonality && !meetsPersonality(event.reqPersonality, context.personality)) return false;
  if (event.reqStress && !meetsStress(event.reqStress, context.stress)) return false;
  if (event.reqFamily && !meetsFamily(event.reqFamily, context.family)) return false;
  if (event.reqSkills && !meetsSkills(event.reqSkills, context.skills)) return false;
  if (event.reqMemory && !meetsMemory(event.reqMemory, context.memories)) return false;
  if (event.tags?.includes('scheduled_only') && !isDueScheduledEvent(context, event.id)) return false;
  if (event.reqEventIds && !event.reqEventIds.every(id => allSeenSet.has(id))) return false;
  if (event.blockEventIds && event.blockEventIds.some(id => allSeenSet.has(id))) return false;
  if (event.reqNoItem && event.reqNoItem.some(itemId => context.inventory?.includes(itemId))) return false;
  if (!meetsNpcRole(event.reqNPCRole, context.npcs)) return false;
  if (!event.isRepeatable && allSeenSet.has(event.id)) return false;
  if (event.isRepeatable && recentSet.has(event.id)) return false;
  return true;
};

export const getAdaptivePacingBand = (adaptivePacingStreak: number): AdaptivePacingBand => {
  if (adaptivePacingStreak <= -2) return 'RECOVERY';
  if (adaptivePacingStreak >= 2) return 'CHALLENGE';
  return 'BALANCED';
};

const getCategoryDiversityMultiplier = (
  category: string | undefined,
  recentCategories?: string[]
): number => {
  if (!category || !recentCategories || recentCategories.length === 0) return 1;
  const count = recentCategories.filter(c => c === category).length;
  return Math.max(0.4, 1 - count * 0.2);
};

const hasTag = (event: GameEvent, tag: string): boolean => Boolean(event.tags?.includes(tag));

const getNpcCheckInMultiplier = (event: GameEvent, currentTurn?: number): number => {
  if (!hasTag(event, NPC_CHECKIN_TAG)) return 1;
  if (typeof currentTurn !== 'number' || currentTurn <= 0) return 1;

  const turnMod = currentTurn % NPC_CHECKIN_BIAS_INTERVAL;
  if (turnMod === 0 || turnMod === NPC_CHECKIN_BIAS_PRE_TURN) {
    return NPC_CHECKIN_BIAS_MULTIPLIER;
  }
  return 1;
};

// =================================================================
// PURE WEIGHT CALCULATION LAYER (test edilebilir, yan etkisiz)
// =================================================================

/** Ağırlık hesaplamasının her bileşenini ayrı ayrı açıklar. */
export interface EventWeightBreakdown {
  rarityBase: number;
  adaptivePacingMultiplier: number;
  narrativeBonus: number;
  freshnessMultiplier: number;
  goalMultiplier: number;
  categoryMultiplier: number;
  npcCheckInMultiplier: number;
  finalWeight: number;
}

/** Ağırlığı hesaplanmış bir event kaydı. */
export interface WeightedEvent {
  event: GameEvent;
  weight: number;
  breakdown: EventWeightBreakdown;
}

/** `calculateEventWeights` için bağımsız context nesnesi. */
export interface EventSelectionContext {
  band: AdaptivePacingBand;
  selectedGoal?: LifeGoal | null;
  frequency?: EventFrequencyMap;
  currentTurn?: number;
  recentCategories?: string[];
}

const getAdaptivePacingMultiplier = (
  event: GameEvent,
  band: AdaptivePacingBand,
): number => {
  const difficulty = event.difficulty ?? 2;
  const rarity = event.rarity ?? 'COMMON';
  let m = 1;
  if (band === 'RECOVERY') {
    if (difficulty <= 2) m *= 1.35;
    if (difficulty >= 4) m *= 0.6;
    if (rarity === 'COMMON') m *= 1.2;
  } else if (band === 'CHALLENGE') {
    if (difficulty >= 4) m *= 1.6;
    if (difficulty <= 2) m *= 0.7;
    if (rarity === 'UNCOMMON') m *= 1.2;
    if (rarity === 'RARE') m *= 1.35;
  }
  return m;
};

/**
 * PURE — Yan etkisi yoktur, deterministiktir.
 *
 * Aday event listesini alır, her event için ağırlık + breakdown hesaplar.
 * Analytics entegrasyonu için breakdown objesi kullanılabilir:
 *   analytics.track('event_weight', { eventId: w.event.id, ...w.breakdown });
 *
 * @example
 * const weighted = calculateEventWeights(candidates, {
 *   band: 'CHALLENGE',
 *   selectedGoal: 'ACADEMIC',
 *   frequency: gameState.eventFrequency,
 *   currentTurn: gameState.turn,
 *   recentCategories,
 * });
 */
export function calculateEventWeights(
  candidates: GameEvent[],
  context: EventSelectionContext,
): WeightedEvent[] {
  return candidates.map((event) => {
    const rarity = event.rarity ?? 'COMMON';
    const rarityBase = BASE_RARITY_WEIGHTS[rarity];

    const adaptivePacingMultiplier = getAdaptivePacingMultiplier(event, context.band);
    const narrativeBonus = event.reqEventIds && event.reqEventIds.length > 0 ? 1.25 : 1;
    const freshnessMultiplier =
      context.frequency && context.currentTurn !== undefined
        ? getFreshnessMultiplier(event.id, context.frequency, context.currentTurn)
        : 1;
    const goalMultiplier = getGoalWeightMultiplier(event, context.selectedGoal);
    const categoryMultiplier = getCategoryDiversityMultiplier(
      event.personalityCategory,
      context.recentCategories,
    );
    const npcCheckInMultiplier = getNpcCheckInMultiplier(event, context.currentTurn);

    const finalWeight = Math.max(
      1,
      Math.round(
        rarityBase *
          adaptivePacingMultiplier *
          narrativeBonus *
          freshnessMultiplier *
          goalMultiplier *
          categoryMultiplier *
          npcCheckInMultiplier,
      ),
    );

    return {
      event,
      weight: finalWeight,
      breakdown: {
        rarityBase,
        adaptivePacingMultiplier,
        narrativeBonus,
        freshnessMultiplier,
        goalMultiplier,
        categoryMultiplier,
        npcCheckInMultiplier,
        finalWeight,
      },
    };
  });
}

/**
 * IMPURE — Rastgele seçim yapar.
 *
 * Deterministic testler için `rng` parametresine sabit seed'li fonksiyon ver:
 *   selectFromWeighted(weighted, () => 0.42)
 */
export function selectFromWeighted(
  weighted: WeightedEvent[],
  rng: () => number,
): GameEvent | null {
  return pickWeighted(weighted, rng);
}

// Internal — getEventWeight artık calculateEventWeights üzerinden çalışır.
const getEventWeight = (
  event: GameEvent,
  band: AdaptivePacingBand,
  selectedGoal?: LifeGoal | null,
  frequency?: EventFrequencyMap,
  currentTurn?: number,
  recentCategories?: string[],
): number =>
  calculateEventWeights([event], {
    band, selectedGoal, frequency, currentTurn, recentCategories,
  })[0].weight;

const pickWeighted = (
  weightedEvents: { event: GameEvent; weight: number }[],
  randomFn: () => number
): GameEvent | null => {
  if (weightedEvents.length === 0) return null;
  const totalWeight = weightedEvents.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) return null;

  let roll = randomFn() * totalWeight;
  for (const entry of weightedEvents) {
    roll -= entry.weight;
    if (roll <= 0) return entry.event;
  }

  return weightedEvents[weightedEvents.length - 1].event;
};

const pickChaosRandom = (
  candidates: GameEvent[],
  randomFn: () => number,
  currentTurn?: number
): GameEvent | null => {
  if (candidates.length === 0) return null;
  const neutralWeight = Math.max(0, GOAL_EVENT_WEIGHTING.CHAOS_MULTIPLIER);
  const weighted = candidates.map(event => ({
    event,
    weight: neutralWeight * getNpcCheckInMultiplier(event, currentTurn),
  }));
  return pickWeighted(weighted, randomFn);
};

export const getRecentCategories = (
  events: GameEvent[],
  recentEventIds: EventHistoryInput,
  lastN: number = 5
): string[] => {
  const recentArr = recentEventIds instanceof Set ? Array.from(recentEventIds) : recentEventIds;
  const last = recentArr.slice(-lastN);
  const eventMap = new Map(events.map(e => [e.id, e]));
  return last.reduce<string[]>((acc, id) => {
    const category = eventMap.get(id)?.personalityCategory;
    if (category) acc.push(category);
    return acc;
  }, []);
};

export const selectEventWithAdaptivePacing = (
  events: GameEvent[],
  context: EventContext,
  recentEventIds: EventHistoryInput,
  allSeenEvents: EventHistoryInput,
  options: EventSelectionOptions
): GameEvent => {
  const recentSet = toEventSet(recentEventIds);
  const allSeenSet = toEventSet(allSeenEvents);
  const candidates = events.filter(event => isEventEligibleWithSets(event, context, recentSet, allSeenSet));
  if (candidates.length === 0) return options.fallbackEvent;

  const rng = options.randomFn ?? Math.random;
  if (shouldUseChaosSelection(options.currentTurn)) {
    return pickChaosRandom(candidates, rng, options.currentTurn) ?? options.fallbackEvent;
  }

  const recentCategories = options.recentCategories ?? getRecentCategories(events, recentEventIds);
  const band = getAdaptivePacingBand(options.adaptivePacingStreak ?? 0);
  const weighted = candidates.map(event => ({
    event,
    weight: getEventWeight(event, band, options.selectedGoal, options.eventFrequency, options.currentTurn, recentCategories),
  }));
  return pickWeighted(weighted, rng) ?? options.fallbackEvent;
};

export const calculateOutcomeScore = (
  statChanges: Partial<Stats>,
  skillChanges: Partial<Skills>,
  gradeChanges: Partial<SchoolGrades>,
  eventDifficulty: number
): number => {
  const statScore = Object.values(statChanges).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
  const skillScore = Object.values(skillChanges).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
  const gradeScore = Object.values(gradeChanges).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
  const weighted = statScore + (skillScore * 0.8) + (gradeScore * 0.5);
  const difficultyScale = clamp(eventDifficulty || 1, 1, 5) / 3;
  return weighted * difficultyScale;
};

export const updateAdaptivePacingStreak = (currentStreak: number, outcomeScore: number): number => {
  const clampedCurrent = clamp(currentStreak, -5, 5);

  if (outcomeScore >= 6) {
    const next = clampedCurrent >= 0 ? clampedCurrent + 1 : 1;
    return clamp(next, -5, 5);
  }

  if (outcomeScore <= -6) {
    const next = clampedCurrent <= 0 ? clampedCurrent - 1 : -1;
    return clamp(next, -5, 5);
  }

  if (clampedCurrent > 0) return clampedCurrent - 1;
  if (clampedCurrent < 0) return clampedCurrent + 1;
  return 0;
};
