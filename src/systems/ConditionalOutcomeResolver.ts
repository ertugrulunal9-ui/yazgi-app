/**
 * ConditionalOutcomeResolver — Koşullu Sonuç Çözümleyici
 * Choice'un conditionalOutcomes dizisinden uygun sonucu seçer.
 * Fate sonucu ağırlıkları modifiye eder.
 */

import {
  Choice,
  ConditionalOutcome,
  EventContext,
  FateOutcome,
  FateRollResult,
  FutureEventConfig,
  MemoryEmotion,
  MemoryWeight,
  PersonalityEffect,
  PersonalityMomentumSignal,
  SchoolGrades,
  Skills,
  Stats,
} from '../types';

export interface ResolvedOutcome {
  source: 'conditional' | 'default';
  statChanges: Partial<Stats>;
  feedback: string;
  personalityEffects?: PersonalityEffect[];
  momentumTag?: PersonalityMomentumSignal;
  memoryEmotion?: MemoryEmotion;
  memoryWeight?: MemoryWeight;
  scheduleEvent?: FutureEventConfig;
  skillUpdates?: Partial<Skills>;
  gradeUpdates?: Partial<SchoolGrades>;
  stressEffect?: number;
}

const isPositiveOutcome = (outcome: ConditionalOutcome): boolean => {
  const totalStat = Object.values(outcome.statChanges).reduce(
    (sum, val) => sum + (typeof val === 'number' ? val : 0),
    0,
  );
  return totalStat >= 0;
};

const FATE_WEIGHT_BIAS: Record<FateOutcome, { positive: number; negative: number }> = {
  BLESSED:   { positive: 2.0, negative: 0.3 },
  FORTUNATE: { positive: 1.5, negative: 0.6 },
  NEUTRAL:   { positive: 1.0, negative: 1.0 },
  UNLUCKY:   { positive: 0.6, negative: 1.5 },
  CURSED:    { positive: 0.3, negative: 2.0 },
};

const weightedSelect = (
  outcomes: ConditionalOutcome[],
  fateRoll?: FateRollResult,
): ConditionalOutcome => {
  if (outcomes.length === 1) return outcomes[0];

  const fateBias = fateRoll ? FATE_WEIGHT_BIAS[fateRoll.outcome] : FATE_WEIGHT_BIAS.NEUTRAL;

  const adjustedWeights = outcomes.map(o => {
    const multiplier = isPositiveOutcome(o) ? fateBias.positive : fateBias.negative;
    return { outcome: o, adjustedWeight: Math.max(0.1, o.weight * multiplier) };
  });

  const totalWeight = adjustedWeights.reduce((sum, w) => sum + w.adjustedWeight, 0);
  const roll = Math.random() * totalWeight;

  let cumulative = 0;
  for (const w of adjustedWeights) {
    cumulative += w.adjustedWeight;
    if (roll <= cumulative) return w.outcome;
  }

  return outcomes[outcomes.length - 1];
};

export const resolveOutcome = (
  choice: Choice,
  ctx: EventContext,
  fateRoll?: FateRollResult,
): ResolvedOutcome => {
  if (!choice.conditionalOutcomes || choice.conditionalOutcomes.length === 0) {
    return {
      source: 'default',
      statChanges: choice.effect,
      feedback: choice.feedback,
      personalityEffects: choice.personalityEffects,
      momentumTag: choice.momentumTag,
      stressEffect: choice.stressEffect,
      skillUpdates: choice.skillUpdates,
      gradeUpdates: choice.gradeUpdates,
    };
  }

  const eligible = choice.conditionalOutcomes.filter(co => {
    try {
      return co.condition(ctx);
    } catch {
      return false;
    }
  });

  if (eligible.length === 0) {
    return {
      source: 'default',
      statChanges: choice.effect,
      feedback: choice.feedback,
      personalityEffects: choice.personalityEffects,
      momentumTag: choice.momentumTag,
      stressEffect: choice.stressEffect,
      skillUpdates: choice.skillUpdates,
      gradeUpdates: choice.gradeUpdates,
    };
  }

  const selected = weightedSelect(eligible, fateRoll);

  return {
    source: 'conditional',
    statChanges: selected.statChanges,
    feedback: selected.feedback,
    personalityEffects: selected.personalityEffects,
    momentumTag: selected.momentumTag,
    memoryEmotion: selected.memoryEmotion,
    memoryWeight: selected.memoryWeight,
    scheduleEvent: selected.scheduleEvent,
    skillUpdates: selected.skillUpdates,
    gradeUpdates: selected.gradeUpdates,
    stressEffect: selected.stressEffect,
  };
};
