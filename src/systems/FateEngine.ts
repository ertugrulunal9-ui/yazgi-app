/**
 * FateEngine — Kader Sistemi
 * Seeded RNG, burç modifikatörleri, jeton yönetimi ve kader ruloları.
 * Tüm fonksiyonlar pure — side-effect yok.
 */

import { FateOutcome, FateRollResult, FateState, GameState, Stats, ZodiacSign } from '../types';

// ===== MULBERRY32 SEEDED PRNG =====

export const mulberry32 = (seed: number): number => {
  let t = (seed + 0x6D2B79F5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

// ===== SABİTLER =====

const FATE_THRESHOLDS = {
  BLESSED: 0.90,
  FORTUNATE: 0.65,
  NEUTRAL: 0.35,
  UNLUCKY: 0.15,
} as const;

const TOKEN_EARN_AGES = new Set([0, 3, 6, 9, 12, 15, 18]);

interface TokenEarnContext {
  previousAge: number;
  newAge: number;
  dominantMomentumStreak: number;
  consecutiveBadRolls: number;
}

interface TokenEarnCondition {
  type: 'age_milestone' | 'achievement' | 'streak_reward';
  condition: (context: TokenEarnContext) => boolean;
  reward: number;
}

const crossesAnyMilestone = (previousAge: number, newAge: number): boolean => {
  for (let age = previousAge + 1; age <= newAge; age++) {
    if (TOKEN_EARN_AGES.has(age)) return true;
  }
  return false;
};

const getDominantMomentumStreak = (state: GameState): number => {
  const momentum = state.personalityState;
  return Math.max(
    momentum.HELPFUL?.streak ?? 0,
    momentum.PRAGMATIC?.streak ?? 0,
    momentum.AGGRESSIVE?.streak ?? 0,
  );
};

const TOKEN_EARN_CONDITIONS: TokenEarnCondition[] = [
  {
    type: 'age_milestone',
    condition: ({ previousAge, newAge }) => crossesAnyMilestone(previousAge, newAge),
    reward: 1,
  },
  {
    type: 'streak_reward',
    condition: ({ dominantMomentumStreak }) => dominantMomentumStreak === 5,
    reward: 1,
  },
  {
    type: 'achievement',
    condition: ({ consecutiveBadRolls }) => consecutiveBadRolls === 4,
    reward: 1,
  },
];

const FATE_MULTIPLIERS: Record<FateOutcome, { positive: number; negative: number }> = {
  BLESSED:   { positive: 1.5,  negative: 0.5 },
  FORTUNATE: { positive: 1.25, negative: 0.75 },
  NEUTRAL:   { positive: 1.0,  negative: 1.0 },
  UNLUCKY:   { positive: 0.8,  negative: 1.2 },
  CURSED:    { positive: 0.6,  negative: 1.5 },
};

const MAX_OUTCOME_HISTORY = 50;
const PITY_PER_BAD = 0.05;
const MAX_PITY = 0.25;

// ===== BURÇ MODİFİKATÖRLERİ =====
// personalityCategory → şans modifikasyonu (pozitif = şanslı, negatif = şanssız)

type PersonalityCategory = 'SOCIAL' | 'RISK' | 'MORAL' | 'CONFLICT' | 'GROWTH' | 'BREAKDOWN';

export const ZODIAC_MODIFIERS: Record<ZodiacSign, Partial<Record<PersonalityCategory, number>>> = {
  KOC:     { RISK: 0.08, GROWTH: 0.05, CONFLICT: -0.05 },
  BOGA:    { MORAL: 0.06, GROWTH: 0.04, RISK: -0.06 },
  IKIZLER: { SOCIAL: 0.08, RISK: 0.03, MORAL: -0.05 },
  YENGEC:  { MORAL: 0.07, SOCIAL: 0.04, CONFLICT: -0.06 },
  ASLAN:   { SOCIAL: 0.07, CONFLICT: 0.05, MORAL: -0.04 },
  BASAK:   { GROWTH: 0.08, MORAL: 0.04, RISK: -0.05 },
  TERAZI:  { SOCIAL: 0.06, MORAL: 0.05, CONFLICT: -0.07 },
  AKREP:   { CONFLICT: 0.08, RISK: 0.05, SOCIAL: -0.05 },
  YAY:     { RISK: 0.07, GROWTH: 0.05, MORAL: -0.04 },
  OGLAK:   { GROWTH: 0.07, MORAL: 0.05, RISK: -0.05 },
  KOVA:    { SOCIAL: 0.05, RISK: 0.06, CONFLICT: -0.04 },
  BALIK:   { MORAL: 0.08, SOCIAL: 0.04, CONFLICT: -0.06 },
};

// ===== CORE FONKSİYONLAR =====

export const createInitialFateState = (zodiacSign: ZodiacSign): FateState => ({
  seed: (Date.now() ^ (Math.random() * 0xFFFFFFFF)) >>> 0,
  tokens: 1,
  totalRolls: 0,
  outcomeHistory: [],
  zodiacSign,
  consecutiveBadOutcomes: 0,
});

const classifyOutcome = (roll: number): FateOutcome => {
  if (roll >= FATE_THRESHOLDS.BLESSED) return 'BLESSED';
  if (roll >= FATE_THRESHOLDS.FORTUNATE) return 'FORTUNATE';
  if (roll >= FATE_THRESHOLDS.NEUTRAL) return 'NEUTRAL';
  if (roll >= FATE_THRESHOLDS.UNLUCKY) return 'UNLUCKY';
  return 'CURSED';
};

const isBadOutcome = (outcome: FateOutcome): boolean =>
  outcome === 'UNLUCKY' || outcome === 'CURSED';

export const getPityModifier = (consecutiveBad: number): number =>
  Math.min(consecutiveBad * PITY_PER_BAD, MAX_PITY);

export const getZodiacModifier = (
  zodiacSign: ZodiacSign,
  personalityCategory?: string,
): number => {
  if (!personalityCategory) return 0;
  const modifiers = ZODIAC_MODIFIERS[zodiacSign];
  if (!modifiers) return 0;
  return modifiers[personalityCategory as PersonalityCategory] ?? 0;
};

export const rollFate = (
  state: FateState,
  personalityCategory?: string,
): { result: FateRollResult; nextState: FateState } => {
  const rawRoll = mulberry32(state.seed + state.totalRolls);
  const zodiacModifier = getZodiacModifier(state.zodiacSign, personalityCategory);
  const pityModifier = getPityModifier(state.consecutiveBadOutcomes);

  const modifiedRoll = Math.max(0, Math.min(1, rawRoll + zodiacModifier + pityModifier));
  const outcome = classifyOutcome(modifiedRoll);

  const result: FateRollResult = {
    outcome,
    rawRoll,
    modifiedRoll,
    zodiacModifier,
    pityModifier,
  };

  const newHistory = [...state.outcomeHistory, outcome].slice(-MAX_OUTCOME_HISTORY);
  const newConsecutiveBad = isBadOutcome(outcome)
    ? state.consecutiveBadOutcomes + 1
    : 0;

  const nextState: FateState = {
    ...state,
    totalRolls: state.totalRolls + 1,
    outcomeHistory: newHistory,
    consecutiveBadOutcomes: newConsecutiveBad,
  };

  return { result, nextState };
};

/**
 * Forced reroll — jeton kullanıldığında çağrılır.
 * FORTUNATE veya BLESSED garanti eder (pity maksimuma alınır).
 */
export const rollFateForced = (
  state: FateState,
  personalityCategory?: string,
): { result: FateRollResult; nextState: FateState } => {
  const rawRoll = mulberry32(state.seed + state.totalRolls);
  const zodiacModifier = getZodiacModifier(state.zodiacSign, personalityCategory);
  // Force: minimum FORTUNATE eşiği garanti
  const forcedRoll = Math.max(FATE_THRESHOLDS.FORTUNATE, rawRoll);
  const modifiedRoll = Math.min(1, forcedRoll + zodiacModifier);
  const outcome = classifyOutcome(modifiedRoll);

  const result: FateRollResult = {
    outcome,
    rawRoll,
    modifiedRoll,
    zodiacModifier,
    pityModifier: 0,
  };

  const newHistory = [...state.outcomeHistory, outcome].slice(-MAX_OUTCOME_HISTORY);

  const nextState: FateState = {
    ...state,
    totalRolls: state.totalRolls + 1,
    outcomeHistory: newHistory,
    consecutiveBadOutcomes: 0, // Reset pity after forced roll
  };

  return { result, nextState };
};

// ===== JETON YÖNETİMİ =====

export const shouldEarnToken = (previousAge: number, newAge: number): boolean => {
  return crossesAnyMilestone(previousAge, newAge);
};

export const getEarnedTokenCount = (
  state: GameState,
  previousAge: number,
  newAge: number,
): number => {
  const context: TokenEarnContext = {
    previousAge,
    newAge,
    dominantMomentumStreak: getDominantMomentumStreak(state),
    consecutiveBadRolls: state.fate?.consecutiveBadOutcomes ?? 0,
  };

  return TOKEN_EARN_CONDITIONS.reduce((sum, earnCondition) => {
    if (!earnCondition.condition(context)) return sum;
    return sum + earnCondition.reward;
  }, 0);
};

export const earnToken = (state: FateState, amount: number = 1): FateState => ({
  ...state,
  tokens: state.tokens + Math.max(0, Math.floor(amount)),
});

export const canSpendToken = (state: FateState): boolean => state.tokens > 0;

export const spendToken = (state: FateState): FateState => ({
  ...state,
  tokens: Math.max(0, state.tokens - 1),
});

// ===== STAT DEĞİŞİKLİĞİ MODİFİKASYONU =====

export const applyFateToStatChanges = (
  changes: Partial<Stats>,
  outcome: FateOutcome,
): Partial<Stats> => {
  const mult = FATE_MULTIPLIERS[outcome];
  const modified: Partial<Stats> = {};

  for (const [key, value] of Object.entries(changes)) {
    if (typeof value !== 'number' || value === 0) {
      modified[key as keyof Stats] = value;
      continue;
    }
    const multiplier = value > 0 ? mult.positive : mult.negative;
    modified[key as keyof Stats] = Math.round(value * multiplier);
  }

  return modified;
};
