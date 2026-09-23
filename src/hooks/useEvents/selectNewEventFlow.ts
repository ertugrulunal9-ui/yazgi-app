import type { EventContext, GameEvent, GameState, GameStateUpdate, Stats } from '../../types';
import { selectCrisisEvent } from '../../data/crisisEvents';
import {
  getDueScheduledEvents,
  isForcedScheduledEvent,
  pickScheduledEvent,
} from '../../utils/scheduledEvents';
import { getEventChoiceSet } from '../../utils/gameStateAdapter';
import { selectMomentumGateEvent } from '../../data/momentumEvents';
import { detectCausalLink } from '../../utils/causalChain';
import { STORY_ARCS } from '../../data/storyArcs';
import { syncActiveArcsWithSelectedEvent } from '../../utils/storyArcSelection';
import { logBurdenTrigger } from '../../utils/analyticsEvents';
import {
  buildEventFrequency,
  buildRecentEvents,
  getEventById,
  hasCriticalBurdenCrossed,
  pickGoalMilestoneEvent,
  resolveArcOrRandomEvent,
} from './shared';

type BuildScheduledConditionContext = (
  state: GameState,
  currentStats: Stats,
  options?: {
    age?: number;
    turn?: number;
    stress?: number;
    seenEventIds?: Set<string>;
  },
) => {
  age: number;
  turn: number;
  stress: number;
  selectedGoal: GameState['selectedGoal'];
  traits: string[];
  inventory: string[];
  seenEventIds: Set<string>;
  stats: Stats;
  skills: GameState['skills'];
};

type SelectNewEventFlowDependencies = {
  gameState: GameState;
  stats: Stats;
  updateGameState: (updates: GameStateUpdate) => void;
  buildEventContext: () => EventContext;
  buildScheduledConditionContext: BuildScheduledConditionContext;
  getBurdenRisk: () => number;
  getCachedEligibleEvents: (context: EventContext) => GameEvent[];
  logSelectedEventAnalytics: (event: GameEvent, age: number, turn: number) => void;
};

export const runSelectNewEvent = ({
  gameState,
  stats,
  updateGameState,
  buildEventContext,
  buildScheduledConditionContext,
  getBurdenRisk,
  getCachedEligibleEvents,
  logSelectedEventAnalytics,
}: SelectNewEventFlowDependencies): void => {
  const context = buildEventContext();
  const scheduledEvents = gameState.scheduledEvents || [];
  const allSeenEvents = getEventChoiceSet(gameState);
  const scheduledConditionContext = buildScheduledConditionContext(
    gameState,
    stats,
    {
      age: gameState.age,
      turn: gameState.turn,
      stress: gameState.stress.current,
      seenEventIds: allSeenEvents,
    },
  );
  const dueScheduled = getDueScheduledEvents(
    scheduledEvents,
    gameState.age,
    scheduledConditionContext,
  );
  const currentActiveArcs = gameState.activeArcs || [];
  const burdenRisk = getBurdenRisk();
  const previousBurdenRisk = gameState.lastBurdenRisk ?? 0;
  const criticalBurdenCrossed = hasCriticalBurdenCrossed(burdenRisk, previousBurdenRisk);

  const applySelectedEvent = ({
    event,
    nextActiveArcs,
    scheduledEvents: nextScheduledEvents,
    currentCausalLink,
  }: {
    event: GameEvent;
    nextActiveArcs: NonNullable<GameState['activeArcs']>;
    scheduledEvents?: GameState['scheduledEvents'];
    currentCausalLink?: GameState['currentCausalLink'];
  }): void => {
    logSelectedEventAnalytics(event, gameState.age, gameState.turn);
    updateGameState({
      currentEvent: event,
      phase: 'EVENT',
      recentEvents: buildRecentEvents(gameState.recentEvents, event.id, gameState.age),
      ...(nextScheduledEvents !== undefined ? { scheduledEvents: nextScheduledEvents } : {}),
      activeArcs: nextActiveArcs,
      eventFrequency: buildEventFrequency(gameState.eventFrequency, event.id, gameState.turn),
      lastBurdenRisk: burdenRisk,
      ...(currentCausalLink !== undefined ? { currentCausalLink } : {}),
    });
  };

  const tryApplyScheduledSelection = (candidatePool: typeof dueScheduled): boolean => {
    const scheduled = pickScheduledEvent(candidatePool);
    if (!scheduled) return false;

    const event = getEventById(scheduled.eventId);
    const remainingScheduled = scheduledEvents.filter(entry => entry.id !== scheduled.id);
    if (!event) {
      updateGameState({ scheduledEvents: remainingScheduled });
      return true;
    }

    applySelectedEvent({
      event,
      nextActiveArcs: syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        event.id,
        context,
      ),
      scheduledEvents: remainingScheduled,
    });
    return true;
  };

  const forcedDueScheduled = dueScheduled.filter(isForcedScheduledEvent);
  if (forcedDueScheduled.length > 0 && tryApplyScheduledSelection(forcedDueScheduled)) {
    return;
  }

  if (criticalBurdenCrossed) {
    const crisisEvent = selectCrisisEvent(gameState.age, gameState.recentEvents);
    void logBurdenTrigger({
      burdenRisk,
      age: gameState.age,
      turn: gameState.turn,
      selectedGoal: gameState.selectedGoal ?? null,
    });
    applySelectedEvent({
      event: crisisEvent,
      nextActiveArcs: syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        crisisEvent.id,
        context,
      ),
    });
    return;
  }

  const forcedGoalEvent = pickGoalMilestoneEvent(gameState, stats, gameState.age);
  if (forcedGoalEvent) {
    applySelectedEvent({
      event: forcedGoalEvent,
      nextActiveArcs: syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        forcedGoalEvent.id,
        context,
      ),
    });
    return;
  }

  if (dueScheduled.length > 0 && tryApplyScheduledSelection(dueScheduled)) {
    return;
  }

  const personalityGateEvent = selectMomentumGateEvent({
    personalityState: gameState.personalityState,
    context,
    recentEventIds: gameState.recentEvents,
    allSeenEvents,
  });

  if (personalityGateEvent) {
    applySelectedEvent({
      event: personalityGateEvent,
      nextActiveArcs: syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        personalityGateEvent.id,
        context,
      ),
    });
    return;
  }

  const cachedEligibleEvents = getCachedEligibleEvents(context);
  const { event, nextActiveArcs } = resolveArcOrRandomEvent({
    cachedEligibleEvents,
    context,
    recentEventIds: gameState.recentEvents,
    allSeenEvents,
    currentActiveArcs,
    adaptivePacingStreak: gameState.adaptivePacingStreak,
    eventFrequency: gameState.eventFrequency,
    currentTurn: gameState.turn,
    selectedGoal: gameState.selectedGoal,
  });

  applySelectedEvent({
    event,
    nextActiveArcs,
    currentCausalLink: detectCausalLink(event, gameState.memories, allSeenEvents) ?? null,
  });
};
