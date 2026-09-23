import {
  MomentumStreakLevel,
  MomentumVisibility,
  PersonalityState,
  PersonalityTendency,
} from '../types';
import { getDominantTendency, normalizePersonalityState } from '../systems/PersonalityMomentumEngine';

export const MOMENTUM_STREAK_LEVEL_HINTS: Record<PersonalityTendency, Record<'BUILDING' | 'ACTIVE' | 'POWERFUL', string>> = {
  HELPFUL: {
    BUILDING: 'Son zamanlarda daha yardimsever kararlar veriyorsun.',
    ACTIVE: 'Yardimsever tarafin belirginlesiyor, insanlar bunu hissediyor.',
    POWERFUL: 'Yardimsever karakterin artik imzan haline geliyor.',
  },
  PRAGMATIC: {
    BUILDING: 'Kararlarinda planli bir tutarlilik olusuyor.',
    ACTIVE: 'Pragmatik bakisin olaylari daha net yonlendiriyor.',
    POWERFUL: 'Pragmatik refleksin zor anlarda seni tasiyan eksen oldu.',
  },
  AGGRESSIVE: {
    BUILDING: 'Sinirlarini daha sert cizmeye basladin.',
    ACTIVE: 'Sert tavrin etkisini giderek daha fazla hissettiriyor.',
    POWERFUL: 'Agresif refleksin artik karakterinin baskin tonu haline geldi.',
  },
};

const hasVisibleMomentum = (state: ReturnType<typeof normalizePersonalityState>): boolean => (
  state.HELPFUL.count > 0 || state.HELPFUL.streak > 0 || state.HELPFUL.multiplier > 1
  || state.PRAGMATIC.count > 0 || state.PRAGMATIC.streak > 0 || state.PRAGMATIC.multiplier > 1
  || state.AGGRESSIVE.count > 0 || state.AGGRESSIVE.streak > 0 || state.AGGRESSIVE.multiplier > 1
);

export const getMomentumStreakLevel = (streak: number): MomentumStreakLevel => {
  if (streak < 2) return 'BUILDING';
  if (streak < 5) return 'ACTIVE';
  return 'POWERFUL';
};

export const getMomentumVisibilityFromPersonalityState = (
  personalityState: Partial<PersonalityState> | undefined
): MomentumVisibility => {
  const normalized = normalizePersonalityState(personalityState);
  if (!hasVisibleMomentum(normalized)) {
    return {
      dominantTendency: null,
      streakLevel: 'NONE',
      hint: '',
    };
  }

  const dominant = getDominantTendency(normalized);
  if (!dominant) {
    return {
      dominantTendency: null,
      streakLevel: 'NONE',
      hint: '',
    };
  }

  const streakLevel = getMomentumStreakLevel(normalized[dominant].streak);
  if (streakLevel === 'NONE') {
    return {
      dominantTendency: dominant,
      streakLevel,
      hint: '',
    };
  }

  return {
    dominantTendency: dominant,
    streakLevel,
    hint: MOMENTUM_STREAK_LEVEL_HINTS[dominant][streakLevel],
  };
};
