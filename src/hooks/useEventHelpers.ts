import { useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import type { EventContext, GameEvent, GameState, Stats } from '../types';
import { calculateEndingErrorDebt } from '../utils/endingResolver';
import { getEventChoiceSet } from '../utils/gameStateAdapter';
import { getEligibleEventsWithAgeCache } from '../utils/eventEligibilityCache';
import { EVENTS } from '../data/events';
import { calculateGoalAlignmentScore } from '../utils/eventSelection';
import { getGoalChainStage } from '../data/goalChainEvents';
import {
  logGoalAlignmentScore,
  logMilestoneReached,
} from '../utils/analyticsEvents';

/**
 * Extracted utility hook — state-derived computations shared across useEvents sub-functions.
 * None of these callbacks call updateGameState / advanceTurnInContext.
 */
export const useEventHelpers = () => {
  const { gameState, stats } = useGame();

  const eligibilityCache = useRef<{ age: number; eligible: GameEvent[] }>({ age: -1, eligible: [] });

  const getCachedEligibleEvents = useCallback((context: EventContext): GameEvent[] => {
    eligibilityCache.current = getEligibleEventsWithAgeCache(
      eligibilityCache.current,
      EVENTS,
      context.age,
    );
    return eligibilityCache.current.eligible;
  }, []);

  const buildEventContext = useCallback((): EventContext => ({
    age: gameState.age,
    stats,
    gameState,
    traits: gameState.traits,
    family: gameState.family,
    npcs: gameState.npcs,
    inventory: gameState.inventory,
    memories: gameState.memories,
    personality: gameState.personality,
    stress: gameState.stress,
    grades: gameState.schoolGrades,
    skills: gameState.skills,
  }), [gameState, stats]);

  const getBurdenRisk = useCallback((
    state: GameState = gameState,
    currentStats: Stats = stats,
  ): number => calculateEndingErrorDebt(state, currentStats).total, [gameState, stats]);

  const buildScheduledConditionContext = useCallback((
    state: GameState,
    currentStats: Stats,
    options?: {
      age?: number;
      turn?: number;
      stress?: number;
      seenEventIds?: Set<string>;
    },
  ) => {
    const seenEventIds = options?.seenEventIds ?? getEventChoiceSet(state);
    return {
      age: options?.age ?? state.age,
      turn: options?.turn ?? state.turn,
      stress: options?.stress ?? state.stress.current,
      selectedGoal: state.selectedGoal ?? null,
      traits: state.traits ?? [],
      inventory: state.inventory ?? [],
      seenEventIds,
      stats: currentStats,
      skills: state.skills ?? {},
    };
  }, []);

  const logSelectedEventAnalytics = useCallback((
    event: GameEvent,
    age: number,
    turn: number,
  ) => {
    const selectedGoal = gameState.selectedGoal ?? null;
    const alignmentScore = calculateGoalAlignmentScore(event, selectedGoal);
    void logGoalAlignmentScore({ eventId: event.id, selectedGoal, alignmentScore, age, turn });

    const stage = getGoalChainStage(event.id);
    if (stage && selectedGoal) {
      void logMilestoneReached({ arcId: 'arc_goal_path_chain', stage, selectedGoal, age, turn });
    }
  }, [gameState.selectedGoal]);

  return {
    getCachedEligibleEvents,
    buildEventContext,
    getBurdenRisk,
    buildScheduledConditionContext,
    logSelectedEventAnalytics,
  };
};
