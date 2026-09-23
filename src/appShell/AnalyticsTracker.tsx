import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { GameState, GameStateUpdate, Stats } from '../types';
import {
  handleCharacterCreation,
  handleGameStart as logGameStart,
  logOnboardingCohortGuidance,
  logSessionDropAnchor,
  logSessionRetentionSnapshot,
} from '../utils/analyticsEvents';
import { getOnboardingCohort, getOnboardingGuidanceAction, COHORT_DISPLAY_NAMES } from '../utils/onboardingGuidance';

interface AnalyticsTrackerProps {
  gameStarted: boolean;
  isLoading: boolean;
  playerName: string;
  gameState: GameState;
  stats: Stats;
  updateGameState: (updates: GameStateUpdate) => void;
}

export const AnalyticsTracker: React.FC<AnalyticsTrackerProps> = ({
  gameStarted,
  isLoading,
  playerName,
  gameState,
  stats,
  updateGameState,
}) => {
  const analyticsLoggedRef = useRef(false);
  const sessionTrackedRef = useRef(false);
  const appVisibilityRef = useRef(AppState.currentState);
  const latestProgressRef = useRef({
    age: gameState.age,
    turn: gameState.turn,
    totalTurns: gameState.totalTurns || 0,
    currentEnergy: stats.energy,
    maxEnergy: gameState.maxEnergy,
    eventChoices: gameState.eventChoiceHistory.length,
  });

  useEffect(() => {
    if (!gameStarted) {
      sessionTrackedRef.current = false;
      analyticsLoggedRef.current = false;
    }
  }, [gameStarted]);

  useEffect(() => {
    if (isLoading || !gameStarted || !playerName) return;
    if (sessionTrackedRef.current) return;

    sessionTrackedRef.current = true;
    const nextSessionCount = (gameState.sessionCount || 0) + 1;
    const cohort = getOnboardingCohort(gameState);
    const objective = getOnboardingGuidanceAction(cohort);

    const cohortInfo = COHORT_DISPLAY_NAMES[cohort];
    const guidanceMessages: Record<string, string> = {
      social: `${cohortInfo.label}: ${cohortInfo.message}`,
      study: `${cohortInfo.label}: ${cohortInfo.message}`,
      work: `${cohortInfo.label}: ${cohortInfo.message}`,
      explore: `${cohortInfo.label}: ${cohortInfo.message}`,
    };

    updateGameState({
      sessionCount: nextSessionCount,
      ...(nextSessionCount <= 3 ? { innerThought: guidanceMessages[objective] ?? '' } : {}),
    });

    if (nextSessionCount <= 3) {
      void logOnboardingCohortGuidance({
        sessionCount: nextSessionCount,
        cohort,
        objective,
        age: gameState.age,
        totalTurns: gameState.totalTurns || 0,
      });
    }
  }, [
    gameStarted,
    isLoading,
    playerName,
    gameState,
    gameState.sessionCount,
    gameState.age,
    gameState.totalTurns,
    updateGameState,
  ]);

  useEffect(() => {
    if (isLoading || !playerName || !gameState.characterInfo || analyticsLoggedRef.current) {
      return;
    }
    if (gameState.turn > 1) {
      return;
    }

    analyticsLoggedRef.current = true;
    const wealthMap: Record<string, number> = { POOR: 0, MIDDLE: 1, RICH: 2 };
    const wealth = gameState.family ? wealthMap[gameState.family.wealth] ?? 1 : 1;
    const familyType = gameState.family?.dynamic ?? 'UNKNOWN';

    void logGameStart(playerName, 'normal');
    void handleCharacterCreation({
      name: playerName,
      wealth,
      talent: gameState.talent === 'NONE' ? 0 : 1,
      traits: gameState.traits || [],
      familyType,
    });
  }, [
    gameState.characterInfo,
    gameState.family,
    gameState.talent,
    gameState.traits,
    gameState.turn,
    isLoading,
    playerName,
  ]);

  useEffect(() => {
    latestProgressRef.current = {
      age: gameState.age,
      turn: gameState.turn,
      totalTurns: gameState.totalTurns || 0,
      currentEnergy: stats.energy,
      maxEnergy: gameState.maxEnergy,
      eventChoices: gameState.eventChoiceHistory.length,
    };
  }, [
    gameState.age,
    gameState.eventChoiceHistory.length,
    gameState.maxEnergy,
    gameState.totalTurns,
    gameState.turn,
    stats.energy,
  ]);

  useEffect(() => {
    if (isLoading || !gameStarted) return;
    void logSessionRetentionSnapshot(latestProgressRef.current);
  }, [isLoading, gameStarted]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextState => {
      const previousState = appVisibilityRef.current;
      appVisibilityRef.current = nextState;

      if (previousState === 'active' && (nextState === 'inactive' || nextState === 'background')) {
        if (!isLoading && gameStarted) {
          void logSessionDropAnchor(latestProgressRef.current);
        }
      }

      if ((previousState === 'inactive' || previousState === 'background') && nextState === 'active') {
        if (!isLoading && gameStarted) {
          void logSessionRetentionSnapshot(latestProgressRef.current);
        }
      }
    });

    return () => subscription.remove();
  }, [gameStarted, isLoading]);

  return null;
};
