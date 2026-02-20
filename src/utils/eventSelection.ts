import { EventContext, GameEvent, LifeGoal, MemoryWeight, NPCRole, SchoolGrades, Skills, Stats } from '../types';
import { GOAL_EVENT_WEIGHTING } from '../constants/gameConstants';

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

const clamp = (value: number, min: number, max: number): number => Math.min(Math.max(value, min), max);

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

const getEventWeight = (
  event: GameEvent,
  band: AdaptivePacingBand,
  selectedGoal?: LifeGoal | null,
  frequency?: EventFrequencyMap,
  currentTurn?: number,
  recentCategories?: string[]
): number => {
  const rarity = event.rarity ?? 'COMMON';
  const baseWeight = BASE_RARITY_WEIGHTS[rarity];
  const difficulty = event.difficulty ?? 2;
  let multiplier = 1;

  if (band === 'RECOVERY') {
    if (difficulty <= 2) multiplier *= 1.35;
    if (difficulty >= 4) multiplier *= 0.6;
    if (rarity === 'COMMON') multiplier *= 1.2;
  } else if (band === 'CHALLENGE') {
    if (difficulty >= 4) multiplier *= 1.6;
    if (difficulty <= 2) multiplier *= 0.7;
    if (rarity === 'UNCOMMON') multiplier *= 1.2;
    if (rarity === 'RARE') multiplier *= 1.35;
  }

  if (event.reqEventIds && event.reqEventIds.length > 0) {
    multiplier *= 1.25;
  }

  if (frequency && currentTurn !== undefined) {
    multiplier *= getFreshnessMultiplier(event.id, frequency, currentTurn);
  }

  multiplier *= getGoalWeightMultiplier(event, selectedGoal);
  multiplier *= getCategoryDiversityMultiplier(event.personalityCategory, recentCategories);

  return Math.max(1, Math.round(baseWeight * multiplier));
};

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

  const recentCategories = options.recentCategories ?? getRecentCategories(events, recentEventIds);
  const band = getAdaptivePacingBand(options.adaptivePacingStreak ?? 0);
  const weighted = candidates.map(event => ({
    event,
    weight: getEventWeight(event, band, options.selectedGoal, options.eventFrequency, options.currentTurn, recentCategories),
  }));
  const rng = options.randomFn ?? Math.random;
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
