import { tRuntime } from '../i18n/strings';
import { Family, FamilyEvolutionState, ScheduledEvent } from '../types';

interface FamilyEvolutionParams {
  previousState?: FamilyEvolutionState;
  family: Family | null;
  familyRelation: number;
  age: number;
  now?: () => number;
  randomFn?: () => number;
}

interface FamilyThoughtParams {
  family: Family | null;
  familyRelation: number;
  age: number;
  turn: number;
  evolution?: FamilyEvolutionState;
}

export const DEFAULT_FAMILY_EVOLUTION_STATE: FamilyEvolutionState = {
  yearsAtHighRelation: 0,
  yearsAtLowRelation: 0,
  strictWarmthTriggered: false,
  familyCrisisTriggered: false,
};

export const normalizeFamilyEvolutionState = (
  state?: FamilyEvolutionState
): FamilyEvolutionState => ({
  ...DEFAULT_FAMILY_EVOLUTION_STATE,
  ...(state || {}),
});

const buildScheduledEvolutionEvent = (
  eventId: string,
  age: number,
  now: () => number,
  randomFn: () => number
): ScheduledEvent => ({
  id: `scheduled_${eventId}_${now()}_${randomFn().toString(36).slice(2, 7)}`,
  eventId,
  triggerAge: age,
  priority: 'HIGH',
  sourceEventId: 'family_evolution',
});

export const updateFamilyEvolutionOnAgeUp = ({
  previousState,
  family,
  familyRelation,
  age,
  now = Date.now,
  randomFn = Math.random,
}: FamilyEvolutionParams): { nextState: FamilyEvolutionState; scheduledEvents: ScheduledEvent[] } => {
  const current = normalizeFamilyEvolutionState(previousState);
  const nextState: FamilyEvolutionState = {
    ...current,
    yearsAtHighRelation: familyRelation >= 80 ? current.yearsAtHighRelation + 1 : 0,
    yearsAtLowRelation: familyRelation <= 20 ? current.yearsAtLowRelation + 1 : 0,
  };
  const scheduledEvents: ScheduledEvent[] = [];

  if (
    family?.dynamic === 'STRICT' &&
    !current.strictWarmthTriggered &&
    nextState.yearsAtHighRelation >= 5
  ) {
    nextState.strictWarmthTriggered = true;
    scheduledEvents.push(buildScheduledEvolutionEvent('fam_evo_strict_softening', age, now, randomFn));
  }

  if (!current.familyCrisisTriggered && nextState.yearsAtLowRelation >= 3) {
    nextState.familyCrisisTriggered = true;
    scheduledEvents.push(buildScheduledEvolutionEvent('fam_evo_family_silence', age, now, randomFn));
  }

  return { nextState, scheduledEvents };
};

export const isFamilyThoughtTurn = (turn: number): boolean => {
  const cycle = turn % 7;
  return cycle === 3 || cycle === 0;
};

export const getFamilyThought = ({
  family,
  familyRelation,
  age,
  turn,
  evolution,
}: FamilyThoughtParams): string | null => {
  if (!family || age < 7 || !isFamilyThoughtTurn(turn)) return null;

  const state = normalizeFamilyEvolutionState(evolution);
  const thoughts: string[] = [];

  if (family.dynamic === 'STRICT' && familyRelation < 40) {
    thoughts.push(tRuntime('narrative.family.thoughts.strictLowRelation'));
  }

  if (family.dynamic === 'CHAOTIC' && age >= 12) {
    thoughts.push(tRuntime('narrative.family.thoughts.chaoticTeen'));
  }

  if (family.dynamic === 'SUPPORTIVE' && age >= 10 && familyRelation >= 65) {
    thoughts.push(tRuntime('narrative.family.thoughts.supportiveHighRelation'));
  }

  if (family.wealth === 'POOR' && age >= 8) {
    thoughts.push(tRuntime('narrative.family.thoughts.poor'));
  }

  if (family.wealth === 'RICH' && age >= 10) {
    thoughts.push(tRuntime('narrative.family.thoughts.rich'));
  }

  if (state.strictWarmthTriggered && family.dynamic === 'STRICT' && familyRelation >= 60) {
    thoughts.push(tRuntime('narrative.family.thoughts.strictWarmth'));
  }

  if (state.familyCrisisTriggered && familyRelation < 35) {
    thoughts.push(tRuntime('narrative.family.thoughts.crisis'));
  }

  if (thoughts.length === 0) {
    if (family.dynamic === 'STRICT') {
      thoughts.push(tRuntime('narrative.family.thoughts.fallback.strict'));
    } else if (family.dynamic === 'CHAOTIC') {
      thoughts.push(tRuntime('narrative.family.thoughts.fallback.chaotic'));
    } else {
      thoughts.push(tRuntime('narrative.family.thoughts.fallback.supportive'));
    }
  }

  const index = Math.floor(turn / 3) % thoughts.length;
  return thoughts[index];
};

export const getFamilyAtmosphereLabel = (
  family: Family | null,
  familyRelation: number,
  evolution?: FamilyEvolutionState
): string => {
  if (!family) return tRuntime('narrative.family.atmosphere.unknown');

  const state = normalizeFamilyEvolutionState(evolution);
  if (state.familyCrisisTriggered && familyRelation <= 35) {
    return tRuntime('narrative.family.atmosphere.crisis');
  }
  if (family.dynamic === 'STRICT' && state.strictWarmthTriggered) {
    return tRuntime('narrative.family.atmosphere.softening');
  }
  if (familyRelation >= 80) return tRuntime('narrative.family.atmosphere.secure');
  if (familyRelation <= 25) return tRuntime('narrative.family.atmosphere.fragile');

  if (family.dynamic === 'STRICT') return tRuntime('narrative.family.atmosphere.strict');
  if (family.dynamic === 'CHAOTIC') return tRuntime('narrative.family.atmosphere.chaotic');
  return tRuntime('narrative.family.atmosphere.supportive');
};
