import { useCallback, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import {
  Choice,
  PersonalityMomentumSignal,
  PersonalityState,
  PersonalityTendency,
  StatKey,
} from '../types';
import {
  applyMomentumSignal,
  getDominantTendency,
  getMomentumMultiplierForStat,
  getSpecialPathProgress as getSpecialPathProgressValue,
  isSpecialPathUnlocked as isSpecialPathUnlockedValue,
  normalizePersonalityState,
  resolveMomentumSignal,
} from '../systems/PersonalityMomentumEngine';

interface RegisterMomentumInput {
  momentumTag?: PersonalityMomentumSignal;
  personalityEffects?: Choice['personalityEffects'];
  statEffect?: Choice['effect'];
}

export interface UsePersonalityResult {
  personality: ReturnType<typeof useGame>['gameState']['personality'];
  stress: ReturnType<typeof useGame>['gameState']['stress'];
  personalityHistory: ReturnType<typeof useGame>['gameState']['personalityHistory'];
  personalityState: PersonalityState;
  dominantTendency: PersonalityTendency | null;
  registerMomentum: (input: RegisterMomentumInput) => PersonalityState;
  registerMomentumSignal: (signal: PersonalityMomentumSignal | null) => PersonalityState;
  getStatMomentumMultiplier: (statKey: StatKey) => number;
  isSpecialPathUnlocked: (tendency: PersonalityTendency, threshold?: number) => boolean;
  getSpecialPathProgress: (tendency: PersonalityTendency, threshold?: number) => number;
}

export const usePersonality = (): UsePersonalityResult => {
  const { gameState, updateGameState } = useGame();

  const personalityState = useMemo(
    () => normalizePersonalityState(gameState.personalityState),
    [gameState.personalityState]
  );

  const registerMomentumSignal = useCallback((signal: PersonalityMomentumSignal | null): PersonalityState => {
    const result = applyMomentumSignal(personalityState, signal);
    updateGameState({ personalityState: result.nextState });
    return result.nextState;
  }, [personalityState, updateGameState]);

  const registerMomentum = useCallback((input: RegisterMomentumInput): PersonalityState => {
    const signal = resolveMomentumSignal({
      momentumTag: input.momentumTag,
      personalityEffects: input.personalityEffects,
      statEffect: input.statEffect,
    });

    return registerMomentumSignal(signal);
  }, [registerMomentumSignal]);

  const getStatMomentumMultiplier = useCallback((statKey: StatKey): number => {
    return getMomentumMultiplierForStat(statKey, personalityState).multiplier;
  }, [personalityState]);

  const isSpecialPathUnlocked = useCallback((tendency: PersonalityTendency, threshold?: number): boolean => {
    return isSpecialPathUnlockedValue(personalityState, tendency, threshold);
  }, [personalityState]);

  const getSpecialPathProgress = useCallback((tendency: PersonalityTendency, threshold?: number): number => {
    return getSpecialPathProgressValue(personalityState, tendency, threshold);
  }, [personalityState]);

  return {
    personality: gameState.personality,
    stress: gameState.stress,
    personalityHistory: gameState.personalityHistory,
    personalityState,
    dominantTendency: getDominantTendency(personalityState),
    registerMomentum,
    registerMomentumSignal,
    getStatMomentumMultiplier,
    isSpecialPathUnlocked,
    getSpecialPathProgress,
  };
};

export default usePersonality;
