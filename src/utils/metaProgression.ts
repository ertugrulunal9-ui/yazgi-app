import { CareerResult, LifeGoal, MetaProgression, MetaRunSummary, Stats } from '../types';
import { clamp } from './gameUtils';

const META_VERSION = 1;
const MAX_RECENT_RUNS = 6;

const TIER_BASE_POINTS: Record<CareerResult['type'], number> = {
  FAILURE: 8,
  NORMAL: 14,
  SUCCESS: 24,
  LEGENDARY: 36,
};

const TIER_RANK: Record<CareerResult['type'], number> = {
  FAILURE: 0,
  NORMAL: 1,
  SUCCESS: 2,
  LEGENDARY: 3,
};

const deriveLegacyLevel = (totalLegacyPoints: number): number =>
  Math.min(10, Math.floor(Math.max(0, totalLegacyPoints) / 80));

export interface LegacyBonusBreakdown {
  level: number;
  statBonus: number;
  relationBonus: number;
  moneyBonus: number;
}

export interface MetaRunInput {
  runId: string;
  endedAt?: number;
  age: number;
  endingId: string;
  endingTitle: string;
  tier: CareerResult['type'];
  compatibilityScore: number;
  selectedGoal: LifeGoal | null;
  unlockedAchievementIds: string[];
}

export const createInitialMetaProgression = (timestamp: number = Date.now()): MetaProgression => ({
  version: META_VERSION,
  totalRunsCompleted: 0,
  totalLegacyPoints: 0,
  legacyLevel: 0,
  bestTier: null,
  highestCompatibilityScore: 0,
  highestAgeReached: 0,
  lifetimeAchievementIds: [],
  lifetimeEndingIds: [],
  recentRuns: [],
  updatedAt: timestamp,
  goalCompletions: {},
  unlockedEventIds: [],
  unlockedRunModifiers: [],
});

export const calculateLegacyPointsForRun = ({
  tier,
  compatibilityScore,
  unlockedAchievementIds,
}: Pick<MetaRunInput, 'tier' | 'compatibilityScore' | 'unlockedAchievementIds'>): number => {
  const tierBase = TIER_BASE_POINTS[tier] ?? 0;
  const compatibilityBonus = Math.round(clamp(compatibilityScore, 0, 100) / 12);
  const achievementBonus = Math.min(20, unlockedAchievementIds.length * 2);
  return tierBase + compatibilityBonus + achievementBonus;
};

export const applyRunToMetaProgression = (
  current: MetaProgression,
  run: MetaRunInput
): { nextMeta: MetaProgression; runSummary: MetaRunSummary } => {
  const pointsEarned = calculateLegacyPointsForRun(run);
  const runSummary: MetaRunSummary = {
    runId: run.runId,
    endedAt: run.endedAt ?? Date.now(),
    age: run.age,
    endingId: run.endingId,
    endingTitle: run.endingTitle,
    tier: run.tier,
    pointsEarned,
    compatibilityScore: Math.round(run.compatibilityScore),
    selectedGoal: run.selectedGoal,
  };

  const bestTier = current.bestTier == null
    ? run.tier
    : (TIER_RANK[run.tier] > TIER_RANK[current.bestTier] ? run.tier : current.bestTier);

  const uniqueAchievementIds = new Set([
    ...(current.lifetimeAchievementIds || []),
    ...run.unlockedAchievementIds,
  ]);
  const uniqueEndingIds = new Set([
    ...(current.lifetimeEndingIds || []),
    run.endingId,
  ]);

  const totalLegacyPoints = Math.max(0, current.totalLegacyPoints + pointsEarned);

  // goalCompletions: her goal için en iyi tier'ı sakla
  const prevGoalCompletions = current.goalCompletions ?? {};
  const goalCompletions = { ...prevGoalCompletions };
  if (run.selectedGoal) {
    const prev = goalCompletions[run.selectedGoal];
    if (!prev || TIER_RANK[run.tier] > TIER_RANK[prev]) {
      goalCompletions[run.selectedGoal] = run.tier;
    }
  }

  const nextMeta: MetaProgression = {
    ...current,
    version: META_VERSION,
    totalRunsCompleted: current.totalRunsCompleted + 1,
    totalLegacyPoints,
    legacyLevel: deriveLegacyLevel(totalLegacyPoints),
    bestTier,
    highestCompatibilityScore: Math.max(current.highestCompatibilityScore || 0, Math.round(run.compatibilityScore)),
    highestAgeReached: Math.max(current.highestAgeReached || 0, run.age),
    lifetimeAchievementIds: Array.from(uniqueAchievementIds),
    lifetimeEndingIds: Array.from(uniqueEndingIds),
    recentRuns: [runSummary, ...(current.recentRuns || [])].slice(0, MAX_RECENT_RUNS),
    updatedAt: Date.now(),
    goalCompletions,
    unlockedEventIds: current.unlockedEventIds ?? [],
    unlockedRunModifiers: current.unlockedRunModifiers ?? [],
  };

  return { nextMeta, runSummary };
};

export const applyLegacyBonusesToStats = (baseStats: Stats, meta: MetaProgression): Stats => {
  const bonus = getLegacyBonusBreakdown(meta);
  if (bonus.level <= 0) {
    return baseStats;
  }

  return {
    ...baseStats,
    health: clamp(baseStats.health + bonus.statBonus, 0, 100),
    intelligence: clamp(baseStats.intelligence + bonus.statBonus, 0, 100),
    charisma: clamp(baseStats.charisma + bonus.statBonus, 0, 100),
    discipline: clamp(baseStats.discipline + bonus.statBonus, 0, 100),
    familyRelation: clamp(baseStats.familyRelation + bonus.relationBonus, 0, 100),
    money: Math.max(0, baseStats.money + bonus.moneyBonus),
  };
};

export const getLegacyBonusBreakdown = (meta: MetaProgression): LegacyBonusBreakdown => {
  const level = meta.legacyLevel || deriveLegacyLevel(meta.totalLegacyPoints || 0);
  if (level <= 0) {
    return {
      level: 0,
      statBonus: 0,
      relationBonus: 0,
      moneyBonus: 0,
    };
  }

  return {
    level,
    statBonus: Math.min(10, level),
    relationBonus: Math.min(8, Math.ceil(level / 2)),
    moneyBonus: level * 10,
  };
};

// =================================================================
// DAILY LOGIN REWARD
// =================================================================

export interface DailyLoginResult {
  isNewDay: boolean;
  streak: number;
  legacyPointsBonus: number;
  updatedMeta: MetaProgression;
}

const todayDateString = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const daysBetween = (a: string, b: string): number => {
  const msPerDay = 86400000;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
};

const STREAK_BONUS: Array<{ minStreak: number; points: number }> = [
  { minStreak: 7, points: 15 },
  { minStreak: 4, points: 10 },
  { minStreak: 1, points: 5 },
];

export const checkDailyLogin = (meta: MetaProgression): DailyLoginResult => {
  const today = todayDateString();
  const lastDate = meta.lastLoginDate;

  if (lastDate === today) {
    return { isNewDay: false, streak: meta.loginStreak ?? 1, legacyPointsBonus: 0, updatedMeta: meta };
  }

  const prevStreak = meta.loginStreak ?? 0;
  const diff = lastDate ? daysBetween(lastDate, today) : 999;
  const newStreak = diff === 1 ? prevStreak + 1 : 1;
  const bonus = (STREAK_BONUS.find(s => newStreak >= s.minStreak)?.points ?? 5);
  const newTotalPoints = (meta.totalLegacyPoints ?? 0) + bonus;

  const updatedMeta: MetaProgression = {
    ...meta,
    lastLoginDate: today,
    loginStreak: newStreak,
    totalLegacyPoints: newTotalPoints,
    legacyLevel: deriveLegacyLevel(newTotalPoints),
  };

  return { isNewDay: true, streak: newStreak, legacyPointsBonus: bonus, updatedMeta };
};

