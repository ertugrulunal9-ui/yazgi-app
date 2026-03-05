import { HubActionCommand } from '../commands/ActionCommand';
import { getActionEffectiveMinAge, ACTION_CATEGORIES, SubAction } from '../data/actions';
import { selectCrisisEvent } from '../data/crisisEvents';
import { EVENTS, FALLBACK_EVENT } from '../data/events';
import { getEffectiveOwnedItems } from '../data/items';
import { selectMomentumGateEvent } from '../data/momentumEvents';
import { STORY_ARCS } from '../data/storyArcs';
import { TurnMediator } from '../systems/TurnMediator';
import {
  CareerResult,
  Choice,
  EventContext,
  FamilyWealth,
  GameEvent,
  GameState,
  LifeGoal,
  Stats,
} from '../types';
import {
  analyzeGoalMismatch,
  calculateEndingErrorDebt,
  calculateSelectedGoalStatProgress,
  EndingGoal,
  EndingResolution,
  resolveEnding,
} from '../utils/endingResolver';
import {
  getRecencyWindowSize,
  selectEventWithAdaptivePacing,
} from '../utils/eventSelection';
import {
  ensureStructuredGameState,
  getEventChoiceSet,
  mergeGameStateUpdate,
} from '../utils/gameStateAdapter';
import {
  getInitialGameState,
  getInitialStats,
  getMaxEnergy,
  getRandomInt,
  getRestedEnergy,
  shouldAgeUp,
} from '../utils/gameUtils';
import {
  buildInitialLifeGoalEvent,
  buildPivotLifeGoalEvent,
  mapEndingGoalToLifeGoal,
  shouldTriggerInitialLifeGoalEvent,
  shouldTriggerPivotLifeGoalEvent,
} from '../utils/lifeGoalSystem';
import { naturalStressRecovery } from '../utils/personalitySystem';
import { pickScheduledEvent, tickScheduledEvents } from '../utils/scheduledEvents';
import { selectStoryArcEvent, syncActiveArcsWithSelectedEvent } from '../utils/storyArcSelection';

type RNG = () => number;
type BotProfile = 'BALANCED' | 'RISKTAKER';

interface SimulationOptions {
  profile?: BotProfile;
  printReport?: boolean;
}

interface SimulationRunResult {
  endingTier: CareerResult['type'];
  endingId: string;
  selectedGoal: LifeGoal | null;
  targetSuccess: boolean;
  mismatchFailure: boolean;
  breakdownTriggered: boolean;
  breakdownCount: number;
  turnsPlayed: number;
}

interface SimulationSummary {
  profile: BotProfile;
  runs: number;
  averageTierScore: number;
  tiers: Record<CareerResult['type'], number>;
  breakdownRate: number;
  targetSuccessRate: number;
  targetSuccessRateAllRuns: number;
  goalChosenRuns: number;
}

interface SideBySideSummary {
  runs: number;
  balanced: SimulationSummary;
  risktaker: SimulationSummary;
}

interface WealthEconomySummary {
  wealth: FamilyWealth;
  runs: number;
  turns: number;
  averageMoney: number;
  medianMoney: number;
  minMoney: number;
  maxMoney: number;
  p10Money: number;
  p90Money: number;
}

interface WealthEconomyReport {
  runs: number;
  turns: number;
  profile: BotProfile;
  summaries: WealthEconomySummary[];
}

interface WealthEconomySimulationOptions {
  runs?: number;
  turns?: number;
  profile?: BotProfile;
  printReport?: boolean;
}

interface WealthNaturalEconomySummary {
  wealth: FamilyWealth;
  runs: number;
  averageMoney: number;
  medianMoney: number;
  minMoney: number;
  maxMoney: number;
  p10Money: number;
  p90Money: number;
  averageTurns: number;
  medianTurns: number;
  minTurns: number;
  maxTurns: number;
  p10Turns: number;
  p90Turns: number;
}

interface WealthNaturalEconomyReport {
  runs: number;
  profile: BotProfile;
  summaries: WealthNaturalEconomySummary[];
}

interface WealthNaturalEconomySimulationOptions {
  runs?: number;
  profile?: BotProfile;
  printReport?: boolean;
}

interface AdvanceTurnResult {
  gameState: GameState;
  stats: Stats;
  endingResolution: EndingResolution | null;
  breakdownTriggered: boolean;
}

interface EventSelectionResult {
  event: GameEvent;
  activeArcs: NonNullable<GameState['activeArcs']>;
  eventFrequency: NonNullable<GameState['eventFrequency']>;
  recentEvents: string[];
  scheduledEvents: GameState['scheduledEvents'];
  breakdownTriggered: boolean;
}

const ALLOWANCE_RANGE_BY_WEALTH: Record<FamilyWealth, [number, number]> = {
  POOR: [1, 6],
  MIDDLE: [16, 32],
  RICH: [65, 130],
};

const turnMediator = new TurnMediator();
const actionCommand = new HubActionCommand();

const GOAL_TO_ENDING_GOAL: Record<LifeGoal, EndingGoal> = {
  ACADEMIC: 'ACADEMIC',
  ATHLETIC: 'ATHLETIC',
  CREATIVE: 'CREATIVE',
  WEALTH: 'ENTERPRISE',
  SOCIAL: 'SOCIAL',
};

const TIER_TO_SCORE: Record<CareerResult['type'], number> = {
  FAILURE: 0,
  NORMAL: 1,
  SUCCESS: 2,
  LEGENDARY: 3,
};

const productivePrefixes = ['study_', 'work_', 'sports_', 'computer_'];
const recoveryPrefixes = ['baby_', 'family_', 'rest_', 'sleep'];
const risktakerAllowedPrefixes = ['study_', 'work_', 'sports_', 'computer_', 'arts_'];
const GOAL_ACTION_PREFIXES: Record<LifeGoal, string[]> = {
  ACADEMIC: ['study_', 'computer_'],
  ATHLETIC: ['sports_'],
  CREATIVE: ['arts_', 'study_art', 'study_music', 'computer_design'],
  WEALTH: ['work_', 'computer_', 'shopping_'],
  SOCIAL: ['family_'],
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

const getEventById = (eventId: string): GameEvent | undefined =>
  EVENTS.find(event => event.id === eventId);

const hasCriticalBurdenCrossed = (currentRisk: number, previousRisk: number): boolean =>
  currentRisk > 95 && previousRisk <= 95;

const buildEventContext = (
  gameState: GameState,
  stats: Stats,
  ageOverride?: number
): EventContext => ({
  age: ageOverride ?? gameState.age,
  traits: gameState.traits,
  stats,
  family: gameState.family,
  memories: gameState.memories,
  npcs: gameState.npcs,
  inventory: gameState.inventory,
  gameState,
  personality: gameState.personality,
  stress: gameState.stress,
  grades: gameState.schoolGrades,
  skills: gameState.skills,
});

const buildScheduledConditionContext = (
  gameState: GameState,
  stats: Stats,
  options?: {
    age?: number;
    turn?: number;
    stress?: number;
    seenEventIds?: Set<string>;
  }
) => ({
  age: options?.age ?? gameState.age,
  turn: options?.turn ?? gameState.turn,
  stress: options?.stress ?? gameState.stress.current,
  selectedGoal: gameState.selectedGoal ?? null,
  traits: gameState.traits ?? [],
  inventory: gameState.inventory ?? [],
  seenEventIds: options?.seenEventIds ?? getEventChoiceSet(gameState),
  stats,
  skills: gameState.skills ?? {},
});

const resolveChoice = (
  choice: Choice | ((context: EventContext) => Choice),
  context: EventContext
): Choice => {
  if (typeof choice === 'function') {
    try {
      return choice(context);
    } catch {
      return {
        text: 'Devam Et',
        effect: {},
        feedback: 'Bir hata olustu ama ilerlemeye devam ettin.',
      };
    }
  }
  return choice;
};

const pickGoalMilestoneEvent = (
  gameState: GameState,
  stats: Stats,
  currentAge: number
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

const applyStateUpdate = (
  gameState: GameState,
  stats: Stats,
  updates: Parameters<typeof mergeGameStateUpdate>[1]
): { gameState: GameState; stats: Stats } => {
  const nextState = mergeGameStateUpdate(
    gameState,
    {
      ...updates,
      stats,
    },
    stats
  );

  return {
    gameState: nextState,
    stats: nextState.stats ?? stats,
  };
};

const isProductiveAction = (action: SubAction): boolean =>
  productivePrefixes.some(prefix => action.id.startsWith(prefix));

const isRecoveryAction = (action: SubAction): boolean =>
  recoveryPrefixes.some(prefix => action.id.startsWith(prefix))
  || action.energyCost <= 8
  || (action.effect.energy ?? 0) > 0;

const getGoalActionBonus = (
  actionId: string,
  selectedGoal: LifeGoal | null | undefined,
  profile: BotProfile
): number => {
  if (!selectedGoal) return 0;
  const aligned = GOAL_ACTION_PREFIXES[selectedGoal].some(prefix => actionId.startsWith(prefix));
  if (!aligned) return 0;
  return profile === 'RISKTAKER' ? 8 : 0;
};

const scoreActionForBot = (
  action: SubAction,
  risk: number,
  profile: BotProfile,
  selectedGoal: LifeGoal | null | undefined,
  stats?: Stats
): number => {
  const effect = action.effect || {};
  const positiveEnergy = Math.max(0, effect.energy ?? 0);
  const positiveHealth = Math.max(0, effect.health ?? 0);
  const positiveFamily = Math.max(0, effect.familyRelation ?? 0);
  const positiveIntelligence = Math.max(0, effect.intelligence ?? 0);
  const positiveDiscipline = Math.max(0, effect.discipline ?? 0);
  const moneyGain = Math.max(0, effect.money ?? 0);
  const stressCost = Math.max(0, -(action.stressEffect ?? 0));

  const skillBonus = action.skillUpdates
    ? Object.values(action.skillUpdates).reduce((sum, value) => {
      if (typeof value !== 'number') return sum;
      return sum + Math.max(0, value);
    }, 0)
    : 0;
  const goalBonus = getGoalActionBonus(action.id, selectedGoal, profile);

  if (profile === 'RISKTAKER') {
    const healthCritical = (stats?.health ?? 50) < 35;
    const disciplineCritical = (stats?.discipline ?? 50) < 30;
    const statFloorCritical = healthCritical || disciplineCritical;
    const healthBonus = healthCritical ? positiveHealth * 3.0 : 0;
    const disciplineBonus = disciplineCritical ? positiveDiscipline * 2.0 : 0;
    const growth = (
      positiveIntelligence * 2.1
      + positiveDiscipline * 1.7
      + moneyGain * 0.08
      + skillBonus * 1.1
      + positiveHealth * 0.9
      + (isProductiveAction(action) ? 6 : 0)
      + goalBonus
      + healthBonus
      + disciplineBonus
    );
    // Stat floor modunda recovery cezasi kaldirilir
    const recoveryPenalty = (isRecoveryAction(action) && !statFloorCritical) ? 25 : 0;
    const riskPushBonus = risk > 70 ? 4 : 0;
    return growth + riskPushBonus - recoveryPenalty;
  }

  if (risk > 50) {
    return (
      positiveEnergy * 2.5
      + positiveHealth * 1.8
      + positiveFamily * 1.2
      + (isRecoveryAction(action) ? 10 : 0)
      + (action.energyCost <= 6 ? 3 : 0)
      + stressCost * 0.5
      + goalBonus * 0.7
      - (isProductiveAction(action) ? 4 : 0)
    );
  }

  return (
    positiveIntelligence * 1.8
    + positiveDiscipline * 1.6
    + moneyGain * 0.06
    + skillBonus * 0.9
    + positiveHealth * 0.8
    + (isProductiveAction(action) ? 5 : 0)
    + goalBonus
    - clamp(action.energyCost * 0.1, 0, 4)
  );
};

const getAvailableActions = (gameState: GameState): SubAction[] => {
  const ownedItems = getEffectiveOwnedItems(gameState.inventory || [], gameState.family?.wealth);

  return ACTION_CATEGORIES
    .filter(category => {
      if (category.minAge !== undefined && gameState.age < category.minAge) return false;
      if (category.maxAge !== undefined && gameState.age > category.maxAge) return false;
      return true;
    })
    .flatMap(category => category.subActions)
    .filter(action => {
      if (action.opensExamGame) return false;
      const requiredAge = getActionEffectiveMinAge(action, ownedItems);
      return requiredAge === undefined || gameState.age >= requiredAge;
    });
};

const executeBotAction = (
  gameState: GameState,
  stats: Stats,
  risk: number,
  rng: RNG,
  profile: BotProfile
): { gameState: GameState; stats: Stats } => {
  let actions = getAvailableActions(gameState);
  if (actions.length === 0) {
    return { gameState, stats };
  }

  const statFloorCritical = (stats?.health ?? 50) < 35 || (stats?.discipline ?? 50) < 30;

  if (profile === 'RISKTAKER' && risk > 70 && !statFloorCritical) {
    const nonRecovery = actions.filter(action => !isRecoveryAction(action));
    const aggressivePool = nonRecovery.filter(action =>
      risktakerAllowedPrefixes.some(prefix => action.id.startsWith(prefix))
    );
    actions = aggressivePool.length > 0 ? aggressivePool : nonRecovery;
  }

  if (profile === 'BALANCED' && risk > 45) {
    const recoveryPool = actions.filter(action => isRecoveryAction(action));
    if (recoveryPool.length > 0 && rng() < 0.75) {
      const nonRecoveryPool = actions.filter(action => !isRecoveryAction(action));
      actions = [...recoveryPool, ...nonRecoveryPool];
    }
  }

  const ranked = [...actions]
    .map(action => ({
      action,
      score: scoreActionForBot(action, risk, profile, gameState.selectedGoal, stats) + rng(),
    }))
    .sort((a, b) => b.score - a.score)
    .map(item => item.action);

  const orderedActions = (() => {
    if (profile !== 'BALANCED') return ranked;
    if (rng() < 0.35) {
      return [...ranked].sort(() => rng() - 0.5);
    }
    const topPoolSize = Math.min(4, ranked.length);
    const topPool = ranked.slice(0, topPoolSize);
    const shuffledTopPool = [...topPool].sort(() => rng() - 0.5);
    return [...shuffledTopPool, ...ranked.slice(topPoolSize)];
  })();

  for (const action of orderedActions) {
    const result = actionCommand.execute({
      action,
      currentStats: stats,
      gameState,
    });

    if (result.status !== 'success') {
      continue;
    }

    return applyStateUpdate(gameState, result.newStats, result.gameStateUpdates);
  }

  return { gameState, stats };
};

const isRecoveryChoice = (choice: Choice): boolean => {
  const text = (choice.text || '').toLowerCase();
  const feedback = (choice.feedback || '').toLowerCase();
  const energyGain = (choice.effect?.energy ?? 0) > 0;
  const stressRelief = (choice.stressEffect ?? 0) < -5; // dogrudan stres dusuruyor
  return energyGain
    || stressRelief
    || text.includes('dinlen')
    || text.includes('mola')
    || text.includes('uyu')
    || feedback.includes('dinlen')
    || feedback.includes('toparlan');
};

const getChoiceGoalBonus = (
  choice: Choice,
  selectedGoal: LifeGoal | null | undefined,
  profile: BotProfile
): number => {
  if (!selectedGoal) return 0;
  const effect = choice.effect || {};
  let value = 0;

  if (selectedGoal === 'ACADEMIC') {
    value = Math.max(0, effect.intelligence ?? 0) + Math.max(0, effect.discipline ?? 0);
  } else if (selectedGoal === 'ATHLETIC') {
    value = Math.max(0, effect.health ?? 0) + Math.max(0, effect.discipline ?? 0);
  } else if (selectedGoal === 'CREATIVE') {
    value = Math.max(0, effect.charisma ?? 0) + Math.max(0, effect.intelligence ?? 0);
  } else if (selectedGoal === 'WEALTH') {
    value = Math.max(0, effect.discipline ?? 0) + (Math.max(0, effect.money ?? 0) / 40);
  } else {
    value = Math.max(0, effect.charisma ?? 0) + Math.max(0, effect.familyRelation ?? 0);
  }

  return value * (profile === 'RISKTAKER' ? 1.1 : 0);
};

const scoreChoiceForRisk = (
  choice: Choice,
  risk: number,
  profile: BotProfile,
  selectedGoal: LifeGoal | null | undefined,
  gameState?: GameState,
  stats?: Stats
): number => {
  const effect = choice.effect || {};
  const healing = Math.max(0, effect.health ?? 0) + Math.max(0, effect.energy ?? 0);
  const stability = Math.max(0, effect.familyRelation ?? 0) + Math.max(0, effect.discipline ?? 0);
  const growth = Math.max(0, effect.intelligence ?? 0) + Math.max(0, effect.charisma ?? 0);
  const money = Math.max(0, effect.money ?? 0) / 30;
  const goalBonus = getChoiceGoalBonus(choice, selectedGoal, profile);

  if (profile === 'RISKTAKER') {
    const stressCurrent = gameState?.stress?.current ?? 0;
    const stressThreshold = gameState?.stress?.threshold ?? 70;
    const stressCritical = stressCurrent >= stressThreshold * 0.70;

    // Stat floor koruması: health < 35 veya discipline < 30 → acil toparlanma modu
    const healthCritical = (stats?.health ?? 50) < 35;
    const disciplineCritical = (stats?.discipline ?? 50) < 30;
    if (healthCritical || disciplineCritical) {
      const healthBonus = healthCritical ? Math.max(0, (effect.health ?? 0)) * 2.5 : 0;
      const disciplineBonus = disciplineCritical ? Math.max(0, (effect.discipline ?? 0)) * 2 : 0;
      return healing + stability + growth + money + goalBonus + healthBonus + disciplineBonus;
    }

    const recoveryMod = isRecoveryChoice(choice) ? (stressCritical ? 12 : -18) : 0;
    // Risktaker hafif saglik korumasi — tamamen ihmal etmez
    return (growth * 1.6) + (stability * 1.1) + (healing * 0.4) + (money * 1.3) + goalBonus + recoveryMod;
  }

  if (risk > 60) {
    return (healing * 1.8) + (stability * 1.2) + (money * 0.5) + (goalBonus * 0.4);
  }

  return growth + stability + money + goalBonus;
};

const pickEventChoice = (
  gameState: GameState,
  stats: Stats,
  rng: RNG,
  profile: BotProfile
): { choice: Choice; choiceIndex: number } => {
  const event = gameState.currentEvent;
  if (!event || event.choices.length === 0) {
    return {
      choice: { text: 'Devam Et', effect: {}, feedback: 'Devam ettin.' },
      choiceIndex: 0,
    };
  }

  const context = buildEventContext(gameState, stats);
  const resolvedChoices = event.choices.map(choice => resolveChoice(choice, context));

  const goalChoices = resolvedChoices
    .map((choice, index) => ({ choice, index }))
    .filter(({ choice }) => choice.setSelectedGoal !== undefined);

  if (goalChoices.length > 0) {
    const scored = goalChoices.map(({ choice, index }) => {
      const risktakerGoalBias = profile === 'RISKTAKER' && choice.setSelectedGoal
        ? (
          choice.setSelectedGoal === 'ACADEMIC' ? 10
            : choice.setSelectedGoal === 'WEALTH' ? 7
              : choice.setSelectedGoal === 'ATHLETIC' ? 4
                : 0
        )
        : 0;
      const goalScore = choice.setSelectedGoal
        ? calculateSelectedGoalStatProgress(choice.setSelectedGoal, stats)
        : 0;
      return { choice, index, score: goalScore + risktakerGoalBias + rng() * 5 };
    });
    scored.sort((a, b) => b.score - a.score);
    if (profile === 'RISKTAKER') {
      return { choice: scored[0].choice, choiceIndex: scored[0].index };
    }

    const randomized = scored[Math.floor(rng() * scored.length)] || scored[0];
    return { choice: randomized.choice, choiceIndex: randomized.index };
  }

  const risk = calculateEndingErrorDebt(gameState, stats).total;
  const weighted = resolvedChoices.map((choice, index) => ({
    choice,
    index,
    score: scoreChoiceForRisk(choice, risk, profile, gameState.selectedGoal, gameState, stats) + rng(),
  }));
  weighted.sort((a, b) => b.score - a.score);

  if (profile === 'RISKTAKER' && risk > 70) {
    // Kritik streste veya stat floor modunda recovery filtrelemez
    const stressCurrent = gameState.stress?.current ?? 0;
    const stressThreshold = gameState.stress?.threshold ?? 70;
    const stressCritical = stressCurrent >= stressThreshold * 0.70;
    const statFloorCritical = (stats?.health ?? 50) < 35 || (stats?.discipline ?? 50) < 30;
    if (!stressCritical && !statFloorCritical) {
      const nonRecovery = weighted.filter(entry => !isRecoveryChoice(entry.choice));
      const picked = nonRecovery[0] || weighted[0];
      return { choice: picked.choice, choiceIndex: picked.index };
    }
  }

  if (risk > 60) {
    return { choice: weighted[0].choice, choiceIndex: weighted[0].index };
  }

  const randomIndex = Math.floor(rng() * resolvedChoices.length);
  return {
    choice: resolvedChoices[randomIndex] || resolvedChoices[0],
    choiceIndex: randomIndex,
  };
};

const buildEventSelectionResult = (
  event: GameEvent,
  gameState: GameState,
  newAge: number,
  activeArcs: NonNullable<GameState['activeArcs']>,
  eventFrequency: NonNullable<GameState['eventFrequency']>,
  scheduledEvents: GameState['scheduledEvents'],
  breakdownTriggered: boolean
): EventSelectionResult => {
  const windowSize = getRecencyWindowSize(newAge);

  return {
    event,
    activeArcs,
    eventFrequency,
    scheduledEvents,
    breakdownTriggered,
    recentEvents: [...gameState.recentEvents, event.id].slice(-windowSize),
  };
};

const selectTurnEvent = (
  gameState: GameState,
  stats: Stats,
  newAge: number,
  newTurn: number,
  updatedNPCs: GameState['npcs'],
  stressAfterRecovery: GameState['stress']
): EventSelectionResult => {
  const currentActiveArcs = gameState.activeArcs || [];
  const contextState: GameState = {
    ...gameState,
    age: newAge,
    turn: newTurn,
    npcs: updatedNPCs,
    stress: stressAfterRecovery,
  };
  const contextStats = {
    ...stats,
    energy: getRestedEnergy(getMaxEnergy(newAge, gameState.family, gameState.traits)),
  };
  const context = buildEventContext(contextState, contextStats, newAge);
  const allSeenEvents = getEventChoiceSet(gameState);
  const burdenRisk = calculateEndingErrorDebt(gameState, stats).total;
  const previousBurdenRisk = gameState.lastBurdenRisk ?? 0;
  const scheduledConditionContext = buildScheduledConditionContext(
    contextState,
    contextStats,
    {
      age: newAge,
      turn: newTurn,
      stress: stressAfterRecovery.current,
      seenEventIds: allSeenEvents,
    }
  );

  const scheduledTick = tickScheduledEvents(
    gameState.scheduledEvents || [],
    newAge,
    scheduledConditionContext
  );
  const dueScheduledEvents = [...scheduledTick.due];
  const pendingScheduledEvents = [...scheduledTick.pending];

  if (hasCriticalBurdenCrossed(burdenRisk, previousBurdenRisk)) {
    const crisisEvent = selectCrisisEvent(newAge, gameState.recentEvents);
    const activeArcs = syncActiveArcsWithSelectedEvent(
      currentActiveArcs,
      STORY_ARCS,
      crisisEvent.id,
      context
    );
    const frequency = {
      ...gameState.eventFrequency,
      [crisisEvent.id]: {
        count: ((gameState.eventFrequency ?? {})[crisisEvent.id]?.count ?? 0) + 1,
        lastSeenTurn: newTurn,
      },
    };

    return buildEventSelectionResult(
      crisisEvent,
      gameState,
      newAge,
      activeArcs,
      frequency,
      [...pendingScheduledEvents, ...dueScheduledEvents],
      true
    );
  }

  const forcedGoalEvent = pickGoalMilestoneEvent(gameState, stats, newAge);
  if (forcedGoalEvent) {
    const activeArcs = syncActiveArcsWithSelectedEvent(
      currentActiveArcs,
      STORY_ARCS,
      forcedGoalEvent.id,
      context
    );
    const frequency = {
      ...gameState.eventFrequency,
      [forcedGoalEvent.id]: {
        count: ((gameState.eventFrequency ?? {})[forcedGoalEvent.id]?.count ?? 0) + 1,
        lastSeenTurn: newTurn,
      },
    };

    return buildEventSelectionResult(
      forcedGoalEvent,
      gameState,
      newAge,
      activeArcs,
      frequency,
      [...pendingScheduledEvents, ...dueScheduledEvents],
      false
    );
  }

  const scheduledSelection = pickScheduledEvent(dueScheduledEvents);
  const scheduledEvent = scheduledSelection ? getEventById(scheduledSelection.eventId) : null;
  const remainingScheduledEvents = [
    ...pendingScheduledEvents,
    ...dueScheduledEvents
      .filter(event => event.id !== scheduledSelection?.id)
      .map(event => ({ ...event, remainingTurns: event.remainingTurns ?? 0 })),
  ];

  if (scheduledEvent) {
    const activeArcs = syncActiveArcsWithSelectedEvent(
      currentActiveArcs,
      STORY_ARCS,
      scheduledEvent.id,
      context
    );
    const frequency = {
      ...gameState.eventFrequency,
      [scheduledEvent.id]: {
        count: ((gameState.eventFrequency ?? {})[scheduledEvent.id]?.count ?? 0) + 1,
        lastSeenTurn: newTurn,
      },
    };

    return buildEventSelectionResult(
      scheduledEvent,
      gameState,
      newAge,
      activeArcs,
      frequency,
      remainingScheduledEvents,
      false
    );
  }

  const scheduledEventsForRandom = scheduledSelection
    ? remainingScheduledEvents
    : [...pendingScheduledEvents, ...dueScheduledEvents];

  const personalityGateEvent = selectMomentumGateEvent({
    personalityState: gameState.personalityState,
    context,
    recentEventIds: gameState.recentEvents,
    allSeenEvents,
  });

  if (personalityGateEvent) {
    const activeArcs = syncActiveArcsWithSelectedEvent(
      currentActiveArcs,
      STORY_ARCS,
      personalityGateEvent.id,
      context
    );
    const frequency = {
      ...gameState.eventFrequency,
      [personalityGateEvent.id]: {
        count: ((gameState.eventFrequency ?? {})[personalityGateEvent.id]?.count ?? 0) + 1,
        lastSeenTurn: newTurn,
      },
    };

    return buildEventSelectionResult(
      personalityGateEvent,
      gameState,
      newAge,
      activeArcs,
      frequency,
      scheduledEventsForRandom,
      false
    );
  }

  const arcSelection = selectStoryArcEvent({
    arcs: STORY_ARCS,
    activeArcs: currentActiveArcs,
    events: EVENTS,
    context,
    recentEventIds: gameState.recentEvents,
    allSeenEvents,
  });
  const adaptiveEvent = selectEventWithAdaptivePacing(
    EVENTS,
    context,
    gameState.recentEvents,
    allSeenEvents,
    {
      fallbackEvent: FALLBACK_EVENT,
      adaptivePacingStreak: gameState.adaptivePacingStreak,
      eventFrequency: gameState.eventFrequency,
      currentTurn: newTurn,
      selectedGoal: gameState.selectedGoal ?? null,
    }
  );
  const selectedEvent = arcSelection.event ?? adaptiveEvent;
  const activeArcs = arcSelection.event
    ? arcSelection.activeArcs
    : syncActiveArcsWithSelectedEvent(currentActiveArcs, STORY_ARCS, selectedEvent.id, context);
  const frequency = {
    ...gameState.eventFrequency,
    [selectedEvent.id]: {
      count: ((gameState.eventFrequency ?? {})[selectedEvent.id]?.count ?? 0) + 1,
      lastSeenTurn: newTurn,
    },
  };

  return buildEventSelectionResult(
    selectedEvent,
    gameState,
    newAge,
    activeArcs,
    frequency,
    scheduledEventsForRandom,
    false
  );
};

const advanceTurn = (
  gameState: GameState,
  stats: Stats
): AdvanceTurnResult => {
  const newTurn = gameState.turn + 1;
  const newTotalTurns = (gameState.totalTurns || 0) + 1;
  const didAgeUp = shouldAgeUp(gameState.age, newTurn);
  const newAge = didAgeUp ? gameState.age + 1 : gameState.age;
  const stressAfterRecovery = naturalStressRecovery(gameState.stress, gameState.personality);
  const burdenRisk = calculateEndingErrorDebt(gameState, stats).total;

  const updatedNPCs = didAgeUp
    ? gameState.npcs.map(npc => ({ ...npc, age: npc.age + 1 }))
    : gameState.npcs;

  if (newAge >= 18) {
    const endingResolution = resolveEnding({
      gameState,
      stats,
      achievements: gameState.unlockedAchievements,
    });

    const updated = applyStateUpdate(
      gameState,
      stats,
      {
        age: newAge,
        turn: newTurn,
        totalTurns: newTotalTurns,
        phase: 'GAME_OVER',
        currentEvent: null,
        stress: stressAfterRecovery,
        npcs: updatedNPCs,
        lastBurdenRisk: burdenRisk,
      }
    );

    return {
      gameState: updated.gameState,
      stats: updated.stats,
      endingResolution,
      breakdownTriggered: false,
    };
  }

  const refreshedStats: Stats = {
    ...stats,
    money: stats.money,
    energy: getRestedEnergy(getMaxEnergy(newAge, gameState.family, gameState.traits)),
  };

  const selectedEvent = selectTurnEvent(
    gameState,
    stats,
    newAge,
    newTurn,
    updatedNPCs,
    stressAfterRecovery
  );

  const updated = applyStateUpdate(
    gameState,
    refreshedStats,
    {
      age: newAge,
      turn: newTurn,
      totalTurns: newTotalTurns,
      phase: 'EVENT',
      currentEvent: selectedEvent.event,
      recentEvents: selectedEvent.recentEvents,
      scheduledEvents: selectedEvent.scheduledEvents,
      activeArcs: selectedEvent.activeArcs,
      eventFrequency: selectedEvent.eventFrequency,
      maxEnergy: getMaxEnergy(newAge, gameState.family, gameState.traits),
      stress: stressAfterRecovery,
      npcs: updatedNPCs,
      lastResult: null,
      lastBurdenRisk: burdenRisk,
    }
  );

  return {
    gameState: updated.gameState,
    stats: updated.stats,
    endingResolution: null,
    breakdownTriggered: selectedEvent.breakdownTriggered,
  };
};

const didReachTarget = (resolution: EndingResolution): boolean => {
  const selectedGoal = resolution.selectedGoal;
  if (!selectedGoal) return false;

  const expectedEndingGoal = GOAL_TO_ENDING_GOAL[selectedGoal];
  const sameGoal = expectedEndingGoal === resolution.goal;
  const successfulTier = resolution.tier === 'SUCCESS' || resolution.tier === 'LEGENDARY';

  return sameGoal && successfulTier && !resolution.mismatchFailure;
};

const runSingleSimulation = (
  profile: BotProfile,
  rng: RNG = Math.random
): SimulationRunResult => {
  const initialStats = getInitialStats();
  const baseGameState = getInitialGameState();
  let gameState = ensureStructuredGameState(
    {
      ...baseGameState,
      phase: 'HUB',
      currentEvent: null,
      childhood: {
        ...baseGameState.childhood,
        completed: true,
      },
      stats: initialStats,
    },
    undefined,
    initialStats
  );
  let stats = initialStats;

  let endingResolution: EndingResolution | null = null;
  let breakdownCount = 0;
  let guard = 0;

  while (gameState.phase !== 'GAME_OVER' && guard < 500) {
    guard += 1;

    if (gameState.phase === 'EVENT' && gameState.currentEvent) {
      const picked = pickEventChoice(gameState, stats, rng, profile);
      const eventResult = turnMediator.processEventChoice({
        gameState,
        stats,
        choice: picked.choice,
        choiceIndex: picked.choiceIndex,
      });
      const updated = applyStateUpdate(gameState, eventResult.newStats, eventResult.gameStateUpdates);
      gameState = updated.gameState;
      stats = updated.stats;
      continue;
    }

    const risk = calculateEndingErrorDebt(gameState, stats).total;
    const afterAction = executeBotAction(gameState, stats, risk, rng, profile);
    gameState = afterAction.gameState;
    stats = afterAction.stats;

    const afterTurn = advanceTurn(gameState, stats);
    gameState = afterTurn.gameState;
    stats = afterTurn.stats;
    if (afterTurn.breakdownTriggered) {
      breakdownCount += 1;
    }
    if (afterTurn.endingResolution) {
      endingResolution = afterTurn.endingResolution;
      break;
    }
  }

  const resolution = endingResolution ?? resolveEnding({
    gameState,
    stats,
    achievements: gameState.unlockedAchievements,
  });

  return {
    endingTier: resolution.tier,
    endingId: resolution.id,
    selectedGoal: resolution.selectedGoal,
    targetSuccess: didReachTarget(resolution),
    mismatchFailure: resolution.mismatchFailure,
    breakdownTriggered: breakdownCount > 0,
    breakdownCount,
    turnsPlayed: gameState.totalTurns || gameState.turn,
  };
};

const printSingleSummary = (summary: SimulationSummary): void => {
  console.log(`=== Faz 5 Auto-Player Simulation (${summary.profile}) ===`);
  console.log(`Toplam simulasyon: ${summary.runs}`);
  console.log(`Ortalama bitis tier puani (0-3): ${summary.averageTierScore}`);
  console.log('Tier dagilimi:');
  console.log(`  LEGENDARY: ${summary.tiers.LEGENDARY}`);
  console.log(`  SUCCESS: ${summary.tiers.SUCCESS}`);
  console.log(`  NORMAL: ${summary.tiers.NORMAL}`);
  console.log(`  FAILURE: ${summary.tiers.FAILURE}`);
  console.log(`Mental Breakdown tetiklenme orani: %${summary.breakdownRate}`);
  console.log(
    `Hedef ulasma orani (goal secen kosularda): %${summary.targetSuccessRate} (${summary.goalChosenRuns}/${summary.runs} goal secimi)`
  );
  console.log(`Hedef ulasma orani (tum kosular): %${summary.targetSuccessRateAllRuns}`);
};

export const runAutoPlayerSimulation = (
  runs: number = 50,
  options: SimulationOptions = {}
): SimulationSummary => {
  const safeRuns = Math.max(1, Math.floor(runs));
  const profile = options.profile ?? 'BALANCED';
  const printReport = options.printReport ?? true;
  const results: SimulationRunResult[] = [];

  for (let i = 0; i < safeRuns; i += 1) {
    results.push(runSingleSimulation(profile));
  }

  const tiers: Record<CareerResult['type'], number> = {
    LEGENDARY: 0,
    SUCCESS: 0,
    NORMAL: 0,
    FAILURE: 0,
  };

  for (const result of results) {
    tiers[result.endingTier] += 1;
  }

  const averageTierScore = results.reduce((sum, result) => (
    sum + TIER_TO_SCORE[result.endingTier]
  ), 0) / safeRuns;
  const breakdownTriggeredRuns = results.filter(result => result.breakdownTriggered).length;
  const goalChosenRuns = results.filter(result => result.selectedGoal !== null).length;
  const targetSuccessRuns = results.filter(result => result.targetSuccess).length;

  const summary: SimulationSummary = {
    profile,
    runs: safeRuns,
    averageTierScore: Number(averageTierScore.toFixed(2)),
    tiers,
    breakdownRate: Number(((breakdownTriggeredRuns / safeRuns) * 100).toFixed(2)),
    targetSuccessRate: Number(((
      goalChosenRuns > 0 ? targetSuccessRuns / goalChosenRuns : 0
    ) * 100).toFixed(2)),
    targetSuccessRateAllRuns: Number(((targetSuccessRuns / safeRuns) * 100).toFixed(2)),
    goalChosenRuns,
  };

  if (printReport) {
    printSingleSummary(summary);
  }

  return summary;
};

const printSideBySide = (report: SideBySideSummary): void => {
  console.log('=== Faz 5 Side-by-Side Simulation Report ===');
  console.log(`Kosu sayisi: ${report.runs}`);
  console.log('Bot | Success% | Breakdown% | Legendary | Success | Normal | Failure');
  console.log(
    `Balanced | ${report.balanced.targetSuccessRate} | ${report.balanced.breakdownRate} | ${report.balanced.tiers.LEGENDARY} | ${report.balanced.tiers.SUCCESS} | ${report.balanced.tiers.NORMAL} | ${report.balanced.tiers.FAILURE}`
  );
  console.log(
    `Risktaker | ${report.risktaker.targetSuccessRate} | ${report.risktaker.breakdownRate} | ${report.risktaker.tiers.LEGENDARY} | ${report.risktaker.tiers.SUCCESS} | ${report.risktaker.tiers.NORMAL} | ${report.risktaker.tiers.FAILURE}`
  );
  console.log('Hedef metrikler:');
  console.log('  Balanced Bot hedefi: %30 Success, %10 Breakdown');
  console.log('  Risktaker Bot hedefi: %60 Success, %50 Breakdown');
};

export const runSideBySideSimulation = (runs: number = 50): SideBySideSummary => {
  const balanced = runAutoPlayerSimulation(runs, {
    profile: 'BALANCED',
    printReport: false,
  });
  const risktaker = runAutoPlayerSimulation(runs, {
    profile: 'RISKTAKER',
    printReport: false,
  });
  const report: SideBySideSummary = {
    runs: Math.max(1, Math.floor(runs)),
    balanced,
    risktaker,
  };
  printSideBySide(report);
  return report;
};

const quantile = (values: number[], q: number): number => {
  if (values.length === 0) return 0;
  if (values.length === 1) return values[0];
  const clampedQ = clamp(q, 0, 1);
  const position = (values.length - 1) * clampedQ;
  const lowerIndex = Math.floor(position);
  const upperIndex = Math.ceil(position);
  if (lowerIndex === upperIndex) return values[lowerIndex];
  const weight = position - lowerIndex;
  return values[lowerIndex] + ((values[upperIndex] - values[lowerIndex]) * weight);
};

const createForcedWealthStart = (
  wealth: FamilyWealth
): { gameState: GameState; stats: Stats } => {
  const initialStats = getInitialStats();
  const baseGameState = getInitialGameState();
  const allowanceRange = ALLOWANCE_RANGE_BY_WEALTH[wealth];
  const familyDynamic = baseGameState.family?.dynamic ?? 'SUPPORTIVE';
  const forcedFamily = {
    wealth,
    dynamic: familyDynamic,
    allowance: getRandomInt(allowanceRange[0], allowanceRange[1]),
  };

  const gameState = ensureStructuredGameState(
    {
      ...baseGameState,
      family: forcedFamily,
      phase: 'HUB',
      currentEvent: null,
      childhood: {
        ...baseGameState.childhood,
        completed: true,
      },
      stats: initialStats,
    },
    undefined,
    initialStats
  );

  return {
    gameState,
    stats: initialStats,
  };
};

const runSingleWealthEconomySimulation = (
  wealth: FamilyWealth,
  turns: number,
  profile: BotProfile,
  rng: RNG = Math.random
): number => {
  const safeTurns = Math.max(1, Math.floor(turns));
  const start = createForcedWealthStart(wealth);
  let gameState = start.gameState;
  let stats = start.stats;
  let completedTurns = 0;

  while (completedTurns < safeTurns) {
    if (gameState.phase === 'GAME_OVER') {
      gameState = ensureStructuredGameState(
        {
          ...gameState,
          phase: 'HUB',
          currentEvent: null,
        },
        gameState,
        stats
      );
    }

    if (gameState.phase === 'EVENT' && gameState.currentEvent) {
      const picked = pickEventChoice(gameState, stats, rng, profile);
      const eventResult = turnMediator.processEventChoice({
        gameState,
        stats,
        choice: picked.choice,
        choiceIndex: picked.choiceIndex,
      });
      const updated = applyStateUpdate(gameState, eventResult.newStats, eventResult.gameStateUpdates);
      gameState = updated.gameState;
      stats = updated.stats;
      continue;
    }

    const risk = calculateEndingErrorDebt(gameState, stats).total;
    const afterAction = executeBotAction(gameState, stats, risk, rng, profile);
    gameState = afterAction.gameState;
    stats = afterAction.stats;

    const afterTurn = advanceTurn(gameState, stats);
    gameState = afterTurn.gameState;
    stats = afterTurn.stats;
    completedTurns += 1;
  }

  return stats.money;
};

const runSingleWealthNaturalEconomySimulation = (
  wealth: FamilyWealth,
  profile: BotProfile,
  rng: RNG = Math.random
): { finalMoney: number; turnsPlayed: number } => {
  const start = createForcedWealthStart(wealth);
  let gameState = start.gameState;
  let stats = start.stats;
  let guard = 0;

  while (gameState.phase !== 'GAME_OVER' && guard < 500) {
    guard += 1;

    if (gameState.phase === 'EVENT' && gameState.currentEvent) {
      const picked = pickEventChoice(gameState, stats, rng, profile);
      const eventResult = turnMediator.processEventChoice({
        gameState,
        stats,
        choice: picked.choice,
        choiceIndex: picked.choiceIndex,
      });
      const updated = applyStateUpdate(gameState, eventResult.newStats, eventResult.gameStateUpdates);
      gameState = updated.gameState;
      stats = updated.stats;
      continue;
    }

    const risk = calculateEndingErrorDebt(gameState, stats).total;
    const afterAction = executeBotAction(gameState, stats, risk, rng, profile);
    gameState = afterAction.gameState;
    stats = afterAction.stats;

    const afterTurn = advanceTurn(gameState, stats);
    gameState = afterTurn.gameState;
    stats = afterTurn.stats;
  }

  return {
    finalMoney: stats.money,
    turnsPlayed: gameState.totalTurns || gameState.turn,
  };
};

const printWealthEconomyReport = (report: WealthEconomyReport): void => {
  console.log('=== Wealth Economy Simulation ===');
  console.log(`Kosu: ${report.runs} | Tur: ${report.turns} | Profil: ${report.profile}`);
  console.log('Servet | Ortalama Para | Medyan | P10 | P90 | Min | Max');
  report.summaries.forEach(summary => {
    console.log(
      `${summary.wealth} | ${summary.averageMoney} | ${summary.medianMoney} | ${summary.p10Money} | ${summary.p90Money} | ${summary.minMoney} | ${summary.maxMoney}`
    );
  });
};

const printWealthNaturalEconomyReport = (report: WealthNaturalEconomyReport): void => {
  console.log('=== Wealth Economy Natural-End Simulation ===');
  console.log(`Kosu: ${report.runs} | Profil: ${report.profile}`);
  console.log('Servet | Ortalama Para | Medyan Para | Ortalama Tur | Medyan Tur | Min Tur | Max Tur');
  report.summaries.forEach(summary => {
    console.log(
      `${summary.wealth} | ${summary.averageMoney} | ${summary.medianMoney} | ${summary.averageTurns} | ${summary.medianTurns} | ${summary.minTurns} | ${summary.maxTurns}`
    );
  });
};

export const runWealthEconomySimulation = (
  options: WealthEconomySimulationOptions = {}
): WealthEconomyReport => {
  const runs = Math.max(1, Math.floor(options.runs ?? 100));
  const turns = Math.max(1, Math.floor(options.turns ?? 100));
  const profile = options.profile ?? 'BALANCED';
  const printReport = options.printReport ?? true;
  const wealthOrder: FamilyWealth[] = ['POOR', 'MIDDLE', 'RICH'];

  const summaries = wealthOrder.map((wealth): WealthEconomySummary => {
    const moneyResults: number[] = [];
    for (let i = 0; i < runs; i += 1) {
      moneyResults.push(runSingleWealthEconomySimulation(wealth, turns, profile));
    }

    const sorted = [...moneyResults].sort((a, b) => a - b);
    const averageMoney = moneyResults.reduce((sum, value) => sum + value, 0) / moneyResults.length;

    return {
      wealth,
      runs,
      turns,
      averageMoney: Number(averageMoney.toFixed(2)),
      medianMoney: Number(quantile(sorted, 0.5).toFixed(2)),
      minMoney: Number(sorted[0].toFixed(2)),
      maxMoney: Number(sorted[sorted.length - 1].toFixed(2)),
      p10Money: Number(quantile(sorted, 0.1).toFixed(2)),
      p90Money: Number(quantile(sorted, 0.9).toFixed(2)),
    };
  });

  const report: WealthEconomyReport = {
    runs,
    turns,
    profile,
    summaries,
  };

  if (printReport) {
    printWealthEconomyReport(report);
  }

  return report;
};

export const runWealthEconomyNaturalEndSimulation = (
  options: WealthNaturalEconomySimulationOptions = {}
): WealthNaturalEconomyReport => {
  const runs = Math.max(1, Math.floor(options.runs ?? 100));
  const profile = options.profile ?? 'BALANCED';
  const printReport = options.printReport ?? true;
  const wealthOrder: FamilyWealth[] = ['POOR', 'MIDDLE', 'RICH'];

  const summaries = wealthOrder.map((wealth): WealthNaturalEconomySummary => {
    const moneyResults: number[] = [];
    const turnResults: number[] = [];
    for (let i = 0; i < runs; i += 1) {
      const result = runSingleWealthNaturalEconomySimulation(wealth, profile);
      moneyResults.push(result.finalMoney);
      turnResults.push(result.turnsPlayed);
    }

    const sortedMoney = [...moneyResults].sort((a, b) => a - b);
    const sortedTurns = [...turnResults].sort((a, b) => a - b);
    const averageMoney = moneyResults.reduce((sum, value) => sum + value, 0) / moneyResults.length;
    const averageTurns = turnResults.reduce((sum, value) => sum + value, 0) / turnResults.length;

    return {
      wealth,
      runs,
      averageMoney: Number(averageMoney.toFixed(2)),
      medianMoney: Number(quantile(sortedMoney, 0.5).toFixed(2)),
      minMoney: Number(sortedMoney[0].toFixed(2)),
      maxMoney: Number(sortedMoney[sortedMoney.length - 1].toFixed(2)),
      p10Money: Number(quantile(sortedMoney, 0.1).toFixed(2)),
      p90Money: Number(quantile(sortedMoney, 0.9).toFixed(2)),
      averageTurns: Number(averageTurns.toFixed(2)),
      medianTurns: Number(quantile(sortedTurns, 0.5).toFixed(2)),
      minTurns: Number(sortedTurns[0].toFixed(2)),
      maxTurns: Number(sortedTurns[sortedTurns.length - 1].toFixed(2)),
      p10Turns: Number(quantile(sortedTurns, 0.1).toFixed(2)),
      p90Turns: Number(quantile(sortedTurns, 0.9).toFixed(2)),
    };
  });

  const report: WealthNaturalEconomyReport = {
    runs,
    profile,
    summaries,
  };

  if (printReport) {
    printWealthNaturalEconomyReport(report);
  }

  return report;
};

if (process.argv[1]?.includes('simulateGame')) {
  runSideBySideSimulation(50);
}
