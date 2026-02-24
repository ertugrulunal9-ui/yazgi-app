import { GameState } from '../types';
import { tRuntime } from '../i18n/strings';

export type OnboardingCohort = 'SOCIALIZER' | 'SCHOLAR' | 'STRIVER' | 'GENERALIST';

const SOCIAL_PREFIXES = ['social_'];
const SCHOLAR_PREFIXES = ['study_'];
const STRIVER_PREFIXES = ['work_', 'coding_', 'business_'];

const getActionIds = (gameState: GameState): string[] =>
  (gameState.actionHistory || []).map(entry => entry.actionId);

export const hasActionPrefix = (gameState: GameState, prefixes: string[]): boolean => {
  const ids = getActionIds(gameState);
  return ids.some(id => prefixes.some(prefix => id.startsWith(prefix)));
};

const getPrefixScore = (ids: string[], prefixes: string[]): number => (
  ids.reduce((score, id) => score + (prefixes.some(prefix => id.startsWith(prefix)) ? 1 : 0), 0)
);

const getUniqueActionRoots = (ids: string[]): Set<string> => {
  const roots = ids.map(id => id.split('_')[0]).filter(Boolean);
  return new Set(roots);
};

export const normalizeSessionCount = (value: number | null | undefined): number => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.floor(value));
};

export const isInOnboardingWindow = (gameState: GameState): boolean => {
  const sessionCount = normalizeSessionCount(gameState.sessionCount);
  return sessionCount > 0 && sessionCount <= 3;
};

export const getOnboardingCohort = (gameState: GameState): OnboardingCohort => {
  const ids = getActionIds(gameState).slice(-20);
  if (ids.length === 0) return 'GENERALIST';

  const socialScore = getPrefixScore(ids, SOCIAL_PREFIXES);
  const scholarScore = getPrefixScore(ids, SCHOLAR_PREFIXES);
  const striverScore = getPrefixScore(ids, STRIVER_PREFIXES);

  if (socialScore >= scholarScore + 1 && socialScore >= striverScore + 1) return 'SOCIALIZER';
  if (scholarScore >= socialScore + 1 && scholarScore >= striverScore + 1) return 'SCHOLAR';
  if (striverScore >= socialScore + 1 && striverScore >= scholarScore + 1) return 'STRIVER';
  return 'GENERALIST';
};

export const getOnboardingGuidanceAction = (cohort: OnboardingCohort): string => {
  switch (cohort) {
    case 'SOCIALIZER':
      return 'social';
    case 'SCHOLAR':
      return 'study';
    case 'STRIVER':
      return 'work';
    case 'GENERALIST':
    default:
      return 'explore';
  }
};

export const meetsCohortGuidanceObjective = (gameState: GameState): boolean => {
  const cohort = getOnboardingCohort(gameState);

  if (cohort === 'SOCIALIZER') return hasActionPrefix(gameState, SOCIAL_PREFIXES);
  if (cohort === 'SCHOLAR') return hasActionPrefix(gameState, SCHOLAR_PREFIXES);
  if (cohort === 'STRIVER') return hasActionPrefix(gameState, STRIVER_PREFIXES);

  const ids = getActionIds(gameState);
  return getUniqueActionRoots(ids).size >= 2;
};

export const hasBalancedOnboardingRoutine = (gameState: GameState): boolean => {
  const ids = getActionIds(gameState).slice(-24);
  const uniqueRoots = getUniqueActionRoots(ids);
  const hasEventMomentum = (gameState.eventChoiceHistory || []).length >= 2;
  const hasEnergySafety = gameState.maxEnergy > 0;
  return uniqueRoots.size >= 3 && hasEventMomentum && hasEnergySafety;
};

const COHORT_DISPLAY_FALLBACK: Record<OnboardingCohort, { label: string; message: string }> = {
  SOCIALIZER: {
    label: 'Sosyal Kelebek',
    message: 'Sosyal yonun cok guclu! Arkadasliklar kurarak ilerle.',
  },
  SCHOLAR: {
    label: 'Akademisyen',
    message: 'Akademik yetenegin parliyor! Ders calismaya devam et.',
  },
  STRIVER: {
    label: 'Girisimci Ruh',
    message: 'Is dunyasina yatkinsin! Calisarak kendini gelistir.',
  },
  GENERALIST: {
    label: 'Kesifci',
    message: 'Dengeli oynuyorsun! Farkli alanlari kesfetmeye devam et.',
  },
};

export const getCohortDisplayMeta = (cohort: OnboardingCohort): { label: string; message: string } => {
  const fallback = COHORT_DISPLAY_FALLBACK[cohort];
  return {
    label: tRuntime(`onboardingFlow.cohorts.${cohort}.label`, undefined, fallback.label),
    message: tRuntime(`onboardingFlow.cohorts.${cohort}.message`, undefined, fallback.message),
  };
};

/**
 * Backward-compatible fallback map.
 * Use `getCohortDisplayMeta` for runtime locale-aware values.
 */
export const COHORT_DISPLAY_NAMES = COHORT_DISPLAY_FALLBACK;
