import {
  Choice,
  PersonalityEffect,
  PersonalityMomentumSignal,
  PersonalityState,
  PersonalityTendency,
  StatKey,
  Stats,
} from '../types';
import { MOMENTUM_CONSTANTS } from '../constants/gameConstants';

const BASE_MULTIPLIER = 1;
const STREAK_START_THRESHOLD = 3;
const MAX_MULTIPLIER = 2.5;
const OPPOSITE_STREAK_HIT_FACTOR = 0.2;
const CRISIS_STREAK_PRESERVE_FACTOR = 0.7;
const DEFAULT_SPECIAL_PATH_THRESHOLD = 1.35;

export const HIGH_MOMENTUM_THRESHOLD = MOMENTUM_CONSTANTS.HIGH_MOMENTUM_THRESHOLD;

const TENDENCIES: PersonalityTendency[] = ['HELPFUL', 'PRAGMATIC', 'AGGRESSIVE'];

export const MOMENTUM_TENDENCY_LABELS: Record<PersonalityTendency, string> = {
  HELPFUL: 'Yardimsever',
  PRAGMATIC: 'Pragmatik',
  AGGRESSIVE: 'Agresif',
};

const OPPOSITE_SIGNAL_TO_TENDENCY: Partial<Record<PersonalityMomentumSignal, PersonalityTendency>> = {
  SELFISH: 'HELPFUL',
  IMPULSIVE: 'PRAGMATIC',
  PACIFIST: 'AGGRESSIVE',
};

const MOMENTUM_SIGNAL_SET = new Set<PersonalityTendency>(TENDENCIES);

export const MOMENTUM_STAT_ALIGNMENT: Record<StatKey, PersonalityTendency[]> = {
  health: ['AGGRESSIVE'],
  intelligence: ['PRAGMATIC'],
  charisma: ['HELPFUL'],
  discipline: ['PRAGMATIC', 'AGGRESSIVE'],
  money: ['PRAGMATIC'],
  energy: [],
  familyRelation: ['HELPFUL'],
};

export interface MomentumUpdateResult {
  signal: PersonalityMomentumSignal | null;
  tendency: PersonalityTendency | null;
  nextState: PersonalityState;
  unlockedTendencies: PersonalityTendency[];
}

export interface MomentumStatMultiplierResult {
  multiplier: number;
  tendency: PersonalityTendency | null;
}

const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

const roundTo2 = (value: number): number => {
  return Math.round(value * 100) / 100;
};

export const createInitialPersonalityState = (): PersonalityState => ({
  HELPFUL: {
    count: 0,
    streak: 0,
    multiplier: BASE_MULTIPLIER,
  },
  PRAGMATIC: {
    count: 0,
    streak: 0,
    multiplier: BASE_MULTIPLIER,
  },
  AGGRESSIVE: {
    count: 0,
    streak: 0,
    multiplier: BASE_MULTIPLIER,
  },
});

export const normalizePersonalityState = (state: Partial<PersonalityState> | undefined): PersonalityState => {
  const defaults = createInitialPersonalityState();
  if (!state) return defaults;

  return {
    HELPFUL: {
      count: state.HELPFUL?.count ?? defaults.HELPFUL.count,
      streak: state.HELPFUL?.streak ?? defaults.HELPFUL.streak,
      multiplier: state.HELPFUL?.multiplier ?? defaults.HELPFUL.multiplier,
    },
    PRAGMATIC: {
      count: state.PRAGMATIC?.count ?? defaults.PRAGMATIC.count,
      streak: state.PRAGMATIC?.streak ?? defaults.PRAGMATIC.streak,
      multiplier: state.PRAGMATIC?.multiplier ?? defaults.PRAGMATIC.multiplier,
    },
    AGGRESSIVE: {
      count: state.AGGRESSIVE?.count ?? defaults.AGGRESSIVE.count,
      streak: state.AGGRESSIVE?.streak ?? defaults.AGGRESSIVE.streak,
      multiplier: state.AGGRESSIVE?.multiplier ?? defaults.AGGRESSIVE.multiplier,
    },
  };
};

/**
 * Log tabanli artis: streak 3'ten sonra bonus devreye girer.
 * Ornek akisa yakin degerler: 1.0 -> 1.1 -> 1.25
 */
export const getMultiplierForStreak = (streak: number): number => {
  if (streak < STREAK_START_THRESHOLD) {
    return BASE_MULTIPLIER;
  }

  const normalizedStreak = Math.max(2, streak - 1);
  const growth = Math.pow(Math.log2(normalizedStreak), 1.35) * 0.1;
  const multiplier = BASE_MULTIPLIER + growth;

  return clamp(roundTo2(multiplier), BASE_MULTIPLIER, MAX_MULTIPLIER);
};

const withUpdatedMultiplier = (entry: PersonalityState[PersonalityTendency]): PersonalityState[PersonalityTendency] => ({
  ...entry,
  multiplier: getMultiplierForStreak(entry.streak),
});

const applyOppositeHit = (entry: PersonalityState[PersonalityTendency]): PersonalityState[PersonalityTendency] => {
  const reducedStreak = Math.floor(entry.streak * OPPOSITE_STREAK_HIT_FACTOR);
  return withUpdatedMultiplier({
    ...entry,
    streak: reducedStreak,
  });
};

export const inferMomentumSignalFromPersonalityEffects = (
  effects: PersonalityEffect[] | undefined
): PersonalityMomentumSignal | null => {
  if (!effects || effects.length === 0) return null;

  const scores = effects.reduce(
    (acc, effect) => {
      acc[effect.axis] += effect.change;
      return acc;
    },
    {
      openness: 0,
      courage: 0,
      empathy: 0,
      patience: 0,
      conformity: 0,
    }
  );

  const empathyScore = scores.empathy;
  const pragmaticScore = scores.patience + scores.conformity;
  const aggressionScore = scores.courage - Math.max(0, empathyScore);

  if (empathyScore <= -2) return 'SELFISH';
  if (pragmaticScore <= -2) return 'IMPULSIVE';
  if (scores.courage <= -2) return 'PACIFIST';

  if (aggressionScore >= 2 && scores.courage > 0) return 'AGGRESSIVE';
  if (empathyScore >= 2) return 'HELPFUL';
  if (pragmaticScore >= 2) return 'PRAGMATIC';

  if (empathyScore > 0) return 'HELPFUL';
  if (pragmaticScore > 0) return 'PRAGMATIC';
  if (scores.courage > 0) return 'AGGRESSIVE';

  return null;
};

export const inferMomentumSignalFromStatEffect = (
  effect: Partial<Stats> | undefined
): PersonalityMomentumSignal | null => {
  if (!effect) return null;

  const helpfulScore = (effect.charisma ?? 0) + (effect.familyRelation ?? 0) + Math.max(0, effect.health ?? 0) * 0.25;
  const pragmaticScore = (effect.intelligence ?? 0) + (effect.discipline ?? 0) + Math.max(0, effect.money ?? 0) * 0.02;
  const aggressiveScore = Math.max(0, effect.health ?? 0) + Math.max(0, effect.discipline ?? 0) * 0.5;

  const ranked = [
    { tendency: 'HELPFUL' as const, score: helpfulScore },
    { tendency: 'PRAGMATIC' as const, score: pragmaticScore },
    { tendency: 'AGGRESSIVE' as const, score: aggressiveScore },
  ].sort((a, b) => b.score - a.score);

  return ranked[0].score > 0 ? ranked[0].tendency : null;
};

export const resolveMomentumSignal = (params: {
  momentumTag?: PersonalityMomentumSignal;
  personalityEffects?: PersonalityEffect[];
  statEffect?: Partial<Stats>;
}): PersonalityMomentumSignal | null => {
  if (params.momentumTag) return params.momentumTag;

  const fromEffects = inferMomentumSignalFromPersonalityEffects(params.personalityEffects);
  if (fromEffects) return fromEffects;

  return inferMomentumSignalFromStatEffect(params.statEffect);
};

export interface MomentumSignalOptions {
  isCrisisContext?: boolean;
}

export const applyMomentumSignal = (
  currentState: Partial<PersonalityState> | undefined,
  signal: PersonalityMomentumSignal | null,
  options?: MomentumSignalOptions
): MomentumUpdateResult => {
  const normalized = normalizePersonalityState(currentState);
  if (!signal) {
    return {
      signal: null,
      tendency: null,
      nextState: normalized,
      unlockedTendencies: getUnlockedTendencies(normalized),
    };
  }

  const nextState: PersonalityState = {
    HELPFUL: { ...normalized.HELPFUL },
    PRAGMATIC: { ...normalized.PRAGMATIC },
    AGGRESSIVE: { ...normalized.AGGRESSIVE },
  };

  if (MOMENTUM_SIGNAL_SET.has(signal as PersonalityTendency)) {
    const activeTendency = signal as PersonalityTendency;

    TENDENCIES.forEach(tendency => {
      const currentEntry = normalized[tendency];

      if (tendency === activeTendency) {
        nextState[tendency] = withUpdatedMultiplier({
          ...currentEntry,
          count: currentEntry.count + 1,
          streak: currentEntry.streak + 1,
        });
      } else {
        nextState[tendency] = withUpdatedMultiplier({
          ...currentEntry,
          streak: 0,
        });
      }
    });

    return {
      signal,
      tendency: activeTendency,
      nextState,
      unlockedTendencies: getUnlockedTendencies(nextState),
    };
  }

  // Opposite signals break active streaks and apply a heavy hit to the mapped tendency.
  // Softfall: Crisis context'te streak tamamen sıfırlanmaz, %70 korunur.
  const target = OPPOSITE_SIGNAL_TO_TENDENCY[signal];

  if (options?.isCrisisContext) {
    TENDENCIES.forEach(tendency => {
      nextState[tendency] = withUpdatedMultiplier({
        ...normalized[tendency],
        streak: Math.floor(normalized[tendency].streak * CRISIS_STREAK_PRESERVE_FACTOR),
      });
    });
  } else {
    TENDENCIES.forEach(tendency => {
      nextState[tendency] = withUpdatedMultiplier({
        ...normalized[tendency],
        streak: 0,
      });
    });

    if (target) {
      nextState[target] = applyOppositeHit(normalized[target]);
    }
  }

  return {
    signal,
    tendency: target ?? null,
    nextState,
    unlockedTendencies: getUnlockedTendencies(nextState),
  };
};

export const getDominantTendency = (
  state: Partial<PersonalityState> | undefined
): PersonalityTendency | null => {
  const normalized = normalizePersonalityState(state);

  return TENDENCIES
    .slice()
    .sort((a, b) => {
      if (normalized[b].multiplier !== normalized[a].multiplier) {
        return normalized[b].multiplier - normalized[a].multiplier;
      }
      if (normalized[b].streak !== normalized[a].streak) {
        return normalized[b].streak - normalized[a].streak;
      }
      return normalized[b].count - normalized[a].count;
    })[0] ?? null;
};

export const getMomentumMultiplierForStat = (
  statKey: StatKey,
  state: Partial<PersonalityState> | undefined
): MomentumStatMultiplierResult => {
  const normalized = normalizePersonalityState(state);
  const aligned = MOMENTUM_STAT_ALIGNMENT[statKey];

  if (!aligned || aligned.length === 0) {
    return {
      multiplier: BASE_MULTIPLIER,
      tendency: null,
    };
  }

  let best: MomentumStatMultiplierResult = {
    multiplier: BASE_MULTIPLIER,
    tendency: null,
  };

  aligned.forEach(tendency => {
    const multiplier = normalized[tendency].multiplier;
    if (multiplier > best.multiplier) {
      best = {
        multiplier,
        tendency,
      };
    }
  });

  return best;
};

export const isSpecialPathUnlocked = (
  state: Partial<PersonalityState> | undefined,
  tendency: PersonalityTendency,
  threshold: number = DEFAULT_SPECIAL_PATH_THRESHOLD
): boolean => {
  const normalized = normalizePersonalityState(state);
  return normalized[tendency].multiplier >= threshold;
};

export const getSpecialPathProgress = (
  state: Partial<PersonalityState> | undefined,
  tendency: PersonalityTendency,
  threshold: number = DEFAULT_SPECIAL_PATH_THRESHOLD
): number => {
  const normalized = normalizePersonalityState(state);
  const currentMultiplier = normalized[tendency].multiplier;
  if (threshold <= BASE_MULTIPLIER) return 1;

  return clamp(
    (currentMultiplier - BASE_MULTIPLIER) / (threshold - BASE_MULTIPLIER),
    0,
    1
  );
};

export const getUnlockedTendencies = (
  state: Partial<PersonalityState> | undefined,
  threshold: number = DEFAULT_SPECIAL_PATH_THRESHOLD
): PersonalityTendency[] => {
  const normalized = normalizePersonalityState(state);

  return TENDENCIES.filter(tendency => isSpecialPathUnlocked(normalized, tendency, threshold));
};

export const resolveMomentumFromChoice = (
  choice: Pick<Choice, 'momentumTag' | 'personalityEffects' | 'effect'>
): PersonalityMomentumSignal | null => {
  return resolveMomentumSignal({
    momentumTag: choice.momentumTag,
    personalityEffects: choice.personalityEffects,
    statEffect: choice.effect,
  });
};
