import type { EventContext, GameEvent, GameState, Stats } from '../../types';
import { EVENTS, FALLBACK_EVENT } from '../../data/events';
import { selectEventWithAdaptivePacing, getRecencyWindowSize } from '../../utils/eventSelection';
import { STORY_ARCS } from '../../data/storyArcs';
import { selectStoryArcEvent, syncActiveArcsWithSelectedEvent } from '../../utils/storyArcSelection';
import { analyzeGoalMismatch } from '../../utils/endingResolver';
import {
  buildInitialLifeGoalEvent,
  buildPivotLifeGoalEvent,
  mapEndingGoalToLifeGoal,
  shouldTriggerInitialLifeGoalEvent,
  shouldTriggerPivotLifeGoalEvent,
} from '../../utils/lifeGoalSystem';
import { buildChoiceFeedbackKey, buildChoiceTextKey, buildEventTextKey } from '../../i18n/events/keyUtils';

export const FORCED_RECOVERY_EVENT_ID = 'forced_recovery_event';
export const FORCED_RECOVERY_ENERGY_GAIN = 20;
export const CRISIS_RECOVERY_RATIO = 0.5;
export const RECOVERABLE_STAT_KEYS: (keyof Stats)[] = [
  'health',
  'energy',
  'intelligence',
  'charisma',
  'discipline',
  'money',
  'familyRelation',
];

export const getEventById = (eventId: string): GameEvent | undefined =>
  EVENTS.find(evt => evt.id === eventId);

export const buildRecentEvents = (
  recentEvents: string[],
  eventId: string,
  age: number,
): string[] => [...recentEvents, eventId].slice(-getRecencyWindowSize(age));

export const buildEventFrequency = (
  eventFrequency: GameState['eventFrequency'],
  eventId: string,
  turn: number,
): NonNullable<GameState['eventFrequency']> => ({
  ...(eventFrequency ?? {}),
  [eventId]: {
    count: ((eventFrequency ?? {})[eventId]?.count ?? 0) + 1,
    lastSeenTurn: turn,
  },
});

export const resolveArcOrRandomEvent = ({
  cachedEligibleEvents,
  context,
  recentEventIds,
  allSeenEvents,
  currentActiveArcs,
  adaptivePacingStreak,
  eventFrequency,
  currentTurn,
  selectedGoal,
}: {
  cachedEligibleEvents: GameEvent[];
  context: EventContext;
  recentEventIds: string[];
  allSeenEvents: Set<string> | string[];
  currentActiveArcs: NonNullable<GameState['activeArcs']>;
  adaptivePacingStreak?: number;
  eventFrequency?: GameState['eventFrequency'];
  currentTurn: number;
  selectedGoal: GameState['selectedGoal'];
}): { event: GameEvent; nextActiveArcs: NonNullable<GameState['activeArcs']> } => {
  const arcSelection = selectStoryArcEvent({
    arcs: STORY_ARCS,
    activeArcs: currentActiveArcs,
    events: cachedEligibleEvents,
    context,
    recentEventIds,
    allSeenEvents,
  });
  const randomEvent = selectEventWithAdaptivePacing(
    cachedEligibleEvents,
    context,
    recentEventIds,
    allSeenEvents,
    {
      fallbackEvent: FALLBACK_EVENT,
      adaptivePacingStreak,
      eventFrequency,
      currentTurn,
      selectedGoal: selectedGoal ?? null,
    },
  );
  const event = arcSelection.event ?? randomEvent;
  const nextActiveArcs = arcSelection.event
    ? arcSelection.activeArcs
    : syncActiveArcsWithSelectedEvent(currentActiveArcs, STORY_ARCS, event.id, context);

  return { event, nextActiveArcs };
};

export const pickGoalMilestoneEvent = (
  gameState: GameState,
  stats: Stats,
  currentAge: number,
): GameEvent | null => {
  if (shouldTriggerInitialLifeGoalEvent(gameState, currentAge)) {
    return buildInitialLifeGoalEvent();
  }

  if (!gameState.selectedGoal) return null;

  const mismatch = analyzeGoalMismatch(gameState, stats);
  if (!shouldTriggerPivotLifeGoalEvent({
    gameState,
    currentAge,
    isMismatch: mismatch.isMismatch,
    mismatchGap: mismatch.gap,
  })) {
    return null;
  }

  const currentGoal = gameState.selectedGoal;
  const suggestedGoal = mapEndingGoalToLifeGoal(mismatch.dominantGoal, currentGoal);
  if (suggestedGoal === currentGoal) return null;

  return buildPivotLifeGoalEvent(currentGoal, suggestedGoal, mismatch.gap);
};

export const hasCriticalBurdenCrossed = (currentRisk: number, previousRisk: number): boolean => (
  currentRisk > 85 && previousRisk <= 85
);

export const buildForcedRecoveryEvent = (): GameEvent => ({
  id: FORCED_RECOVERY_EVENT_ID,
  text: 'Nefesin daraldi. Kisa bir mola ile toparlanabilirsin.',
  textKey: buildEventTextKey(FORCED_RECOVERY_EVENT_ID),
  minAge: 0,
  maxAge: 99,
  rarity: 'COMMON',
  isRepeatable: true,
  personalityCategory: 'GROWTH',
  difficulty: 1,
  tags: ['recovery', 'pacing', 'forced'],
  choices: [
    {
      id: 'forced_recovery_breath',
      text: 'Kisa bir mola ver',
      textKey: buildChoiceTextKey(FORCED_RECOVERY_EVENT_ID, 'forced_recovery_breath'),
      effect: { energy: FORCED_RECOVERY_ENERGY_GAIN, health: 2 },
      feedback: 'Biraz dinlendin. Nefesin ve enerjin toparlaniyor.',
      feedbackKey: buildChoiceFeedbackKey(FORCED_RECOVERY_EVENT_ID, 'forced_recovery_breath'),
      choiceType: 'PASSIVE',
    },
  ],
});
