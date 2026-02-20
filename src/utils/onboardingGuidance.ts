import { GameState } from '../types';

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

const getPrefixScore = (ids: string[], prefixes: string[]): number => {
  return ids.reduce((score, id) => score + (prefixes.some(prefix => id.startsWith(prefix)) ? 1 : 0), 0);
};

const getUniqueActionRoots = (ids: string[]): Set<string> => {
  const roots = ids.map(id => id.split('_')[0]).filter(Boolean);
  return new Set(roots);
};

export const isInOnboardingWindow = (gameState: GameState): boolean => {
  const sessionCount = gameState.sessionCount || 0;
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

/** Turkish display names for cohort types */
export const COHORT_DISPLAY_NAMES: Record<OnboardingCohort, { label: string; message: string }> = {
  SOCIALIZER: {
    label: 'Sosyal Kelebek',
    message: 'Sosyal yönün çok güçlü! Arkadaşlıklar kurarak ilerle.',
  },
  SCHOLAR: {
    label: 'Akademisyen',
    message: 'Akademik yeteneğin parlıyor! Ders çalışmaya devam et.',
  },
  STRIVER: {
    label: 'Girişimci Ruh',
    message: 'İş dünyasına yatkınsın! Çalışarak kendini geliştir.',
  },
  GENERALIST: {
    label: 'Keşifçi',
    message: 'Dengeli oynuyorsun! Farklı alanları keşfetmeye devam et.',
  },
};
