import { ALL_EXAM_SUBJECTS } from '../../types';
import type { EventContext, GameEvent, GameState, GameStateUpdate, Stats } from '../../types';
import type { AgeMilestoneSummary } from '../../types/game';
import { ageTransitionHaptic } from '../../animations/HapticFeedback';
import { CONSUMABLE_CONFIG } from '../../config/gameBalance';
import { isFeatureEnabled } from '../../config/featureFlags';
import { earnToken, getEarnedTokenCount } from '../../systems/FateEngine';
import {
  applyTurnBuffEffects,
  calculateInvestmentEarlyExitPayout,
  calculateVarietyBonus,
  getCurrentChapter,
  getMaxEnergy,
  getRestedEnergy,
  isChapterTransition,
  shouldAgeUp,
  shouldGenerateReportCard,
  tickConsumableCooldowns,
} from '../../utils/gameUtils';
import { naturalStressRecovery } from '../../utils/personalitySystem';
import {
  DEFAULT_FAMILY_EVOLUTION_STATE,
  getFamilyThought,
  updateFamilyEvolutionOnAgeUp,
} from '../../utils/familyNarrative';
import { buildAgeMilestone, buildChapterSummary } from '../../utils/milestoneBuilder';
import {
  calculateTurnAllowance,
  checkSavingGoalCompletion,
  getDefaultSavingGoals,
} from '../../utils/economySystem';
import {
  checkSeasonGoalCompletion,
  cleanupExpiredMicroGoals,
  generateMicroGoal,
  generateSeasonGoal,
  updateMicroGoalProgress,
} from '../../utils/goalTracking';
import { calculateSchoolReport } from '../../utils/schoolLogic';
import { analyzeGoalMismatch, resolveEnding } from '../../utils/endingResolver';
import { composeInnerThought, getStrategicMonologue } from '../../utils/internalMonologue';
import { getEventChoiceSet } from '../../utils/gameStateAdapter';
import { logBurdenTrigger, logGameEnding, logTurnProgress } from '../../utils/analyticsEvents';
import { tickScheduledEvents, isForcedScheduledEvent, pickScheduledEvent } from '../../utils/scheduledEvents';
import { STORY_ARCS } from '../../data/storyArcs';
import { syncActiveArcsWithSelectedEvent } from '../../utils/storyArcSelection';
import { selectCrisisEvent } from '../../data/crisisEvents';
import { selectMomentumGateEvent } from '../../data/momentumEvents';
import { tRuntime } from '../../i18n/strings';
import {
  buildEventFrequency,
  buildRecentEvents,
  getEventById,
  hasCriticalBurdenCrossed,
  pickGoalMilestoneEvent,
  resolveArcOrRandomEvent,
} from './shared';

type AdvanceTurnInContext = (updates: {
  newStats: Partial<Stats>;
  newGameState: GameStateUpdate;
}) => void;

type ShowFloatingText = (
  text: string,
  x: number,
  y: number,
  color: string,
  options?: { animationType?: 'arcadeFloat' | 'bounce' | 'curve'; duration?: number },
) => void;

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

type AdvanceTurnFlowDependencies = {
  gameState: GameState;
  stats: Stats;
  advanceTurnInContext: AdvanceTurnInContext;
  showFloatingText: ShowFloatingText;
  buildEventContext: () => EventContext;
  buildScheduledConditionContext: BuildScheduledConditionContext;
  getBurdenRisk: (state?: GameState, currentStats?: Stats) => number;
  getCachedEligibleEvents: (context: EventContext) => GameEvent[];
  logSelectedEventAnalytics: (event: GameEvent, age: number, turn: number) => void;
};

export const runAdvanceTurn = ({
  gameState,
  stats,
  advanceTurnInContext,
  showFloatingText,
  buildEventContext,
  buildScheduledConditionContext,
  getBurdenRisk,
  getCachedEligibleEvents,
  logSelectedEventAnalytics,
}: AdvanceTurnFlowDependencies): void => {
  const newTurn = gameState.turn + 1;
  const newTotalTurns = (gameState.totalTurns || 0) + 1;
  const didAgeUp = shouldAgeUp(gameState.age, newTurn);
  const newAge = didAgeUp ? gameState.age + 1 : gameState.age;

  if (didAgeUp) {
    ageTransitionHaptic();
  }

  const buffTick = applyTurnBuffEffects(stats, gameState.activeBuffs);
  const maturityPayout = buffTick.maturedInvestmentCount * CONSUMABLE_CONFIG.investment.returnAmount;
  const statsAfterBuffTick: Stats = maturityPayout > 0
    ? {
      ...buffTick.nextStats,
      money: buffTick.nextStats.money + maturityPayout,
    }
    : buffTick.nextStats;

  let moneyAfterAllowance = statsAfterBuffTick.money;
  if (isFeatureEnabled('ECONOMY_DEPTH')) {
    const autoAllowance = gameState.family
      ? calculateTurnAllowance(gameState.family, newAge, statsAfterBuffTick.familyRelation)
      : 0;
    moneyAfterAllowance += autoAllowance;
    if (autoAllowance > 0) {
      showFloatingText(
        `+${autoAllowance} TL`,
        24,
        96,
        '#22c55e',
        { animationType: 'curve', duration: 1600 },
      );
    }
  }

  const nextActiveBuffs = buffTick.nextActiveBuffs;
  const nextConsumableCooldowns = tickConsumableCooldowns(gameState.consumableCooldowns);
  const nextConsumableUsageThisTurn: Record<string, number> = {};
  const stressAfterRecovery = naturalStressRecovery(gameState.stress, gameState.personality);
  const currentActiveArcs = gameState.activeArcs || [];
  const burdenRisk = getBurdenRisk(gameState, statsAfterBuffTick);
  const previousBurdenRisk = gameState.lastBurdenRisk ?? 0;
  const criticalBurdenCrossed = hasCriticalBurdenCrossed(burdenRisk, previousBurdenRisk);

  let updatedFate = gameState.fate;
  if (updatedFate) {
    const earnedTokens = getEarnedTokenCount(gameState, gameState.age, newAge);
    if (earnedTokens > 0) {
      updatedFate = earnToken(updatedFate, earnedTokens);
    }
  }

  let updatedNPCs = gameState.npcs;
  if (didAgeUp && updatedNPCs.length > 0) {
    updatedNPCs = updatedNPCs.map(npc => ({
      ...npc,
      age: npc.age + 1,
    }));
  }

  let pendingMilestone: AgeMilestoneSummary | undefined;
  let nextAgeStartStats = gameState._ageStartStats;
  if (didAgeUp && isFeatureEnabled('MILESTONE_SUMMARY')) {
    const prevStats = gameState._ageStartStats ?? stats;
    const prevTraits = gameState.traits ?? [];
    pendingMilestone = buildAgeMilestone({
      age: gameState.age,
      prevStats,
      currentStats: statsAfterBuffTick,
      prevTraits,
      currentTraits: gameState.traits,
      memories: gameState.memories ?? [],
      prevNpcs: (gameState._ageStartNpcs ?? gameState.npcs ?? []).map(npc => ({
        id: npc.id,
        name: npc.name,
        role: npc.role,
      })),
      currentNpcs: updatedNPCs,
      prevGrades: gameState._ageStartGrades ?? gameState.schoolGrades,
      currentGrades: gameState.schoolGrades,
    });
    nextAgeStartStats = { ...statsAfterBuffTick };
  }

  let chapterUpdates: GameStateUpdate = {};
  if (didAgeUp && isFeatureEnabled('CHAPTER_SYSTEM') && isChapterTransition(gameState.age, newAge)) {
    const completedChapter = getCurrentChapter(gameState.age);
    const chapterMilestones = (
      pendingMilestone
        ? [...(gameState.ageMilestoneSummaries ?? []), pendingMilestone]
        : (gameState.ageMilestoneSummaries ?? [])
    ).filter(milestone => (
      milestone.age >= completedChapter.ageStart && milestone.age <= completedChapter.ageEnd
    ));

    const chapterSummary = buildChapterSummary(completedChapter, chapterMilestones);
    chapterUpdates = {
      chapterSummaries: [...(gameState.chapterSummaries ?? []), chapterSummary],
      chapter: getCurrentChapter(newAge).id,
    };
  } else if (didAgeUp) {
    chapterUpdates = { chapter: getCurrentChapter(newAge).id };
  }

  const milestoneUpdates: GameStateUpdate = {
    ...(pendingMilestone ? {
      ageMilestoneSummaries: [
        ...(gameState.ageMilestoneSummaries ?? []),
        pendingMilestone,
      ],
    } : {}),
    ...(didAgeUp ? {
      _ageStartStats: nextAgeStartStats,
      _ageStartNpcs: [...updatedNPCs],
      _ageStartGrades: { ...gameState.schoolGrades },
      undosUsedThisAge: 0,
      statSnapshots: [
        ...(gameState.statSnapshots ?? []),
        { age: gameState.age, stats: { ...statsAfterBuffTick } },
      ],
    } : {}),
    ...chapterUpdates,
  };

  let economyUpdates: GameStateUpdate = {};
  if (isFeatureEnabled('ECONOMY_DEPTH')) {
    const currentGoals = gameState.savingGoals ?? getDefaultSavingGoals();
    const { updatedGoals, completed } = checkSavingGoalCompletion(moneyAfterAllowance, newAge, currentGoals);
    if (completed.length > 0) {
      for (const goal of completed) {
        Object.entries(goal.statBonus).forEach(([key, value]) => {
          if (typeof value === 'number') {
            (statsAfterBuffTick as unknown as Record<string, number>)[key] =
              ((statsAfterBuffTick as unknown as Record<string, number>)[key] ?? 0) + value;
          }
        });
      }
    }
    economyUpdates = { savingGoals: updatedGoals };
  }

  let goalUpdates: GameStateUpdate = {};
  if (isFeatureEnabled('MICRO_GOALS')) {
    let currentMicros = (gameState.microGoals ?? []).map(goal =>
      updateMicroGoalProgress(goal, { stats: statsAfterBuffTick }),
    );
    currentMicros = cleanupExpiredMicroGoals(currentMicros);

    const activeCount = currentMicros.filter(goal => !goal.completed && goal.turnsRemaining > 0).length;
    if (activeCount === 0) {
      const recentIds = currentMicros.map(goal => goal.id.replace(/_\d+$/, ''));
      const newGoal = generateMicroGoal(newAge, statsAfterBuffTick, recentIds);
      if (newGoal) {
        currentMicros.push(newGoal);
      }
    }

    let currentSeason = gameState.seasonGoal ?? null;
    if (didAgeUp) {
      if (currentSeason && !currentSeason.completed) {
        const completed = checkSeasonGoalCompletion(currentSeason, statsAfterBuffTick, gameState.schoolGrades);
        if (completed) {
          currentSeason = { ...currentSeason, completed: true };
          const reward = currentSeason.reward;
          if (reward.money) {
            moneyAfterAllowance += reward.money;
          }
          if (reward.statBonus) {
            Object.entries(reward.statBonus).forEach(([key, value]) => {
              if (typeof value === 'number') {
                (statsAfterBuffTick as unknown as Record<string, number>)[key] =
                  ((statsAfterBuffTick as unknown as Record<string, number>)[key] ?? 0) + value;
              }
            });
          }
        }
      }
      currentSeason = generateSeasonGoal(newAge, statsAfterBuffTick, currentSeason?.id);
    }

    goalUpdates = {
      microGoals: currentMicros.slice(-10),
      seasonGoal: currentSeason,
    };
  }

  let nextFamilyEvolution = gameState.familyEvolution || { ...DEFAULT_FAMILY_EVOLUTION_STATE };
  let familyEvolutionScheduledEvents: GameState['scheduledEvents'] = [];
  if (didAgeUp) {
    const evolutionUpdate = updateFamilyEvolutionOnAgeUp({
      previousState: nextFamilyEvolution,
      family: gameState.family,
      familyRelation: statsAfterBuffTick.familyRelation,
      age: newAge,
    });
    nextFamilyEvolution = evolutionUpdate.nextState;
    familyEvolutionScheduledEvents = evolutionUpdate.scheduledEvents;
  }

  let examsTakenThisYear = gameState.examsTakenThisYear || [];
  let pendingReportCard = gameState.pendingReportCard;
  let isExamPeriod = gameState.isExamPeriod || false;
  let newGrades = gameState.schoolGrades;
  let shouldResetExamsAfterReportCard = false;

  if (shouldGenerateReportCard(newAge, newTurn)) {
    if (newAge >= 7 && newAge < 18) {
      const allExamsTaken = ALL_EXAM_SUBJECTS.every(subject => examsTakenThisYear.includes(subject));
      if (allExamsTaken) {
        newGrades = calculateSchoolReport(statsAfterBuffTick, gameState);
        pendingReportCard = true;
        isExamPeriod = false;
        shouldResetExamsAfterReportCard = true;
      } else {
        isExamPeriod = true;
        pendingReportCard = false;
      }
    } else {
      newGrades = calculateSchoolReport(statsAfterBuffTick, gameState);
      pendingReportCard = true;
    }
  }

  if (shouldResetExamsAfterReportCard) {
    examsTakenThisYear = [];
  }

  const familyThought = getFamilyThought({
    family: gameState.family,
    familyRelation: statsAfterBuffTick.familyRelation,
    age: newAge,
    turn: newTurn,
    evolution: nextFamilyEvolution,
  });
  const strategicResult = getStrategicMonologue({
    burdenRisk,
    age: newAge,
    selectedGoal: gameState.selectedGoal ?? null,
    goalMismatch: analyzeGoalMismatch(gameState, statsAfterBuffTick),
    traitProgress: gameState.traitProgress,
    personalityState: gameState.personalityState,
    turn: newTurn,
    pendingCliffhanger: gameState.pendingCliffhanger,
    personality: gameState.personality,
    memories: gameState.memories,
    lastEventNpcId: gameState.currentEvent?.relatedNpcId,
    npcs: updatedNPCs,
  });
  const composed = composeInnerThought(familyThought, strategicResult, gameState.innerThought);
  const nextInnerThought = composed.text;
  const nextInnerThoughtType = composed.type;
  const newMaxEnergy = getMaxEnergy(newAge, gameState.family, gameState.traits);
  const newEnergy = getRestedEnergy(newMaxEnergy, statsAfterBuffTick.energy, newAge);
  const varietyBonus = calculateVarietyBonus(gameState.actionHistory || []);
  const statsAfterVarietyBonus: Stats = varietyBonus > 0
    ? {
      ...statsAfterBuffTick,
      health: statsAfterBuffTick.health + varietyBonus,
      intelligence: statsAfterBuffTick.intelligence + varietyBonus,
      charisma: statsAfterBuffTick.charisma + varietyBonus,
      discipline: statsAfterBuffTick.discipline + varietyBonus,
    }
    : statsAfterBuffTick;
  const nextTurnStats: Stats = {
    ...statsAfterVarietyBonus,
    energy: newEnergy,
    money: moneyAfterAllowance,
  };
  const turnProgressStats = {
    health: statsAfterVarietyBonus.health,
    intelligence: statsAfterVarietyBonus.intelligence,
    charisma: statsAfterVarietyBonus.charisma,
    discipline: statsAfterVarietyBonus.discipline,
    money: moneyAfterAllowance,
    energy: newEnergy,
  };
  const shouldSyncMoney = didAgeUp || moneyAfterAllowance !== stats.money;
  const turnAdvanceStats: Partial<Stats> = {
    health: statsAfterVarietyBonus.health,
    intelligence: statsAfterVarietyBonus.intelligence,
    charisma: statsAfterVarietyBonus.charisma,
    discipline: statsAfterVarietyBonus.discipline,
    familyRelation: statsAfterVarietyBonus.familyRelation,
    energy: newEnergy,
    ...(shouldSyncMoney ? { money: moneyAfterAllowance } : {}),
  };
  const gameOverStats: Partial<Stats> = {
    health: statsAfterVarietyBonus.health,
    intelligence: statsAfterVarietyBonus.intelligence,
    charisma: statsAfterVarietyBonus.charisma,
    discipline: statsAfterVarietyBonus.discipline,
    familyRelation: statsAfterVarietyBonus.familyRelation,
    ...(shouldSyncMoney ? { money: moneyAfterAllowance } : {}),
  };
  const allSeenEvents = getEventChoiceSet(gameState);
  const scheduledConditionContext = buildScheduledConditionContext(
    gameState,
    nextTurnStats,
    {
      age: newAge,
      turn: newTurn,
      stress: stressAfterRecovery.current,
      seenEventIds: allSeenEvents,
    },
  );
  const scheduledTick = tickScheduledEvents(
    gameState.scheduledEvents || [],
    newAge,
    scheduledConditionContext,
  );
  let dueScheduledEvents = [...scheduledTick.due];
  const pendingScheduledEvents = [...scheduledTick.pending];
  if (familyEvolutionScheduledEvents.length > 0) {
    const familyEvolutionTick = tickScheduledEvents(
      familyEvolutionScheduledEvents,
      newAge,
      scheduledConditionContext,
    );
    dueScheduledEvents = [...dueScheduledEvents, ...familyEvolutionTick.due];
    pendingScheduledEvents.push(...familyEvolutionTick.pending);
  }
  const buildRemainingScheduledEvents = (selectedEventId?: string) => [
    ...pendingScheduledEvents,
    ...dueScheduledEvents
      .filter(event => event.id !== selectedEventId)
      .map(event => ({ ...event, remainingTurns: event.remainingTurns ?? 0 })),
  ];

  const nextTurnContext: EventContext = {
    ...buildEventContext(),
    age: newAge,
    stress: stressAfterRecovery,
    npcs: updatedNPCs,
    stats: nextTurnStats,
  };

  const baseTurnState: GameStateUpdate = {
    ...milestoneUpdates,
    ...economyUpdates,
    ...goalUpdates,
    age: newAge,
    turn: newTurn,
    totalTurns: newTotalTurns,
    schoolGrades: newGrades,
    pendingReportCard,
    lastResult: null,
    npcs: updatedNPCs,
    maxEnergy: newMaxEnergy,
    stress: stressAfterRecovery,
    familyEvolution: nextFamilyEvolution,
    innerThought: nextInnerThought,
    innerThoughtType: nextInnerThoughtType,
    fate: updatedFate,
    lastBurdenRisk: burdenRisk,
    dailyDecisionCount: 0,
    activeBuffs: nextActiveBuffs,
    consumableCooldowns: nextConsumableCooldowns,
    consumableUsageThisTurn: nextConsumableUsageThisTurn,
  };

  const commitPhase = (newGameState: GameStateUpdate, newStats: Partial<Stats> = turnAdvanceStats): void => {
    advanceTurnInContext({
      newStats,
      newGameState,
    });
  };

  const commitEventPhase = ({
    event,
    scheduledEvents,
    activeArcs,
    isExamPeriodValue = false,
    nextEventTeaser,
  }: {
    event: GameEvent;
    scheduledEvents: GameState['scheduledEvents'];
    activeArcs?: NonNullable<GameState['activeArcs']>;
    isExamPeriodValue?: boolean;
    nextEventTeaser?: string;
  }): void => {
    const resolvedActiveArcs = activeArcs ?? syncActiveArcsWithSelectedEvent(
      currentActiveArcs,
      STORY_ARCS,
      event.id,
      nextTurnContext,
    );

    logSelectedEventAnalytics(event, newAge, newTurn);
    commitPhase({
      ...baseTurnState,
      phase: 'EVENT',
      currentEvent: event,
      recentEvents: buildRecentEvents(gameState.recentEvents, event.id, newAge),
      isExamPeriod: isExamPeriodValue,
      examsTakenThisYear,
      scheduledEvents,
      activeArcs: resolvedActiveArcs,
      eventFrequency: buildEventFrequency(gameState.eventFrequency, event.id, newTurn),
      ...(nextEventTeaser ? { nextEventTeaser } : {}),
    });
  };

  if (newAge >= 18) {
    const investmentEarlyExitPayout = calculateInvestmentEarlyExitPayout(nextActiveBuffs);
    const endingMoney = moneyAfterAllowance + investmentEarlyExitPayout;
    const endingStats = {
      ...statsAfterVarietyBonus,
      money: endingMoney,
    };
    const endingResolution = resolveEnding({
      gameState,
      stats: endingStats,
      achievements: gameState.unlockedAchievements,
    });
    const careerResult = endingResolution.result;
    void logGameEnding({
      age: newAge,
      stats: {
        health: endingStats.health,
        intelligence: endingStats.intelligence,
        charisma: endingStats.charisma,
        discipline: endingStats.discipline,
        money: endingMoney,
        energy: newEnergy,
      },
      playtimeMinutes: Math.max(0, Math.round(newTotalTurns * 5)),
      endingType: endingResolution.id,
    });
    commitPhase({
      ...baseTurnState,
      phase: 'GAME_OVER',
      isExamPeriod: false,
      examsTakenThisYear: [],
      activeArcs: currentActiveArcs,
      activeBuffs: [],
      consumableCooldowns: {},
      consumableUsageThisTurn: {},
      lastResult: {
        feedback: `${careerResult.title}: ${careerResult.description}`,
        changes: {},
      },
    }, {
      ...gameOverStats,
      money: endingMoney,
    });
    return;
  }

  void logTurnProgress(newAge, turnProgressStats, {
    turn: newTurn,
    totalTurns: newTotalTurns,
    maxEnergy: newMaxEnergy,
    energySpent: Math.max(0, gameState.maxEnergy - stats.energy),
  });

  const forcedDueScheduledEvents = dueScheduledEvents.filter(isForcedScheduledEvent);
  if (forcedDueScheduledEvents.length > 0) {
    const forcedSelection = pickScheduledEvent(forcedDueScheduledEvents);
    if (forcedSelection) {
      const forcedEvent = getEventById(forcedSelection.eventId);
      if (forcedEvent) {
        commitEventPhase({
          event: forcedEvent,
          scheduledEvents: buildRemainingScheduledEvents(forcedSelection.id),
        });
        return;
      }

      dueScheduledEvents = dueScheduledEvents.filter(event => event.id !== forcedSelection.id);
    }
  }

  if (criticalBurdenCrossed) {
    const turnCrisisEvent = selectCrisisEvent(newAge, gameState.recentEvents);
    void logBurdenTrigger({
      burdenRisk,
      age: newAge,
      turn: newTurn,
      selectedGoal: gameState.selectedGoal ?? null,
    });
    commitEventPhase({
      event: turnCrisisEvent,
      scheduledEvents: [...pendingScheduledEvents, ...dueScheduledEvents],
    });
    return;
  }

  const forcedGoalEvent = pickGoalMilestoneEvent(gameState, statsAfterVarietyBonus, newAge);
  if (forcedGoalEvent) {
    commitEventPhase({
      event: forcedGoalEvent,
      scheduledEvents: [...pendingScheduledEvents, ...dueScheduledEvents],
      isExamPeriodValue: isExamPeriod,
    });
    return;
  }

  if (isExamPeriod) {
    commitPhase({
      ...baseTurnState,
      phase: 'HUB',
      currentEvent: null,
      pendingReportCard: false,
      isExamPeriod: true,
      examsTakenThisYear,
      scheduledEvents: [...pendingScheduledEvents, ...dueScheduledEvents],
      activeArcs: currentActiveArcs,
    });
    return;
  }

  const scheduledSelection = pickScheduledEvent(dueScheduledEvents);
  const scheduledEvent = scheduledSelection ? getEventById(scheduledSelection.eventId) : null;
  const remainingScheduledEvents = buildRemainingScheduledEvents(scheduledSelection?.id);
  if (scheduledEvent) {
    commitEventPhase({
      event: scheduledEvent,
      scheduledEvents: remainingScheduledEvents,
    });
    return;
  }

  const scheduledEventsForRandom = scheduledSelection
    ? remainingScheduledEvents
    : [...pendingScheduledEvents, ...dueScheduledEvents];

  const personalityGateEvent = selectMomentumGateEvent({
    personalityState: gameState.personalityState,
    context: nextTurnContext,
    recentEventIds: gameState.recentEvents,
    allSeenEvents,
  });

  if (personalityGateEvent) {
    commitEventPhase({
      event: personalityGateEvent,
      scheduledEvents: scheduledEventsForRandom,
    });
    return;
  }

  const cachedEligibleEvents = getCachedEligibleEvents(nextTurnContext);
  const { event, nextActiveArcs } = resolveArcOrRandomEvent({
    cachedEligibleEvents,
    context: nextTurnContext,
    recentEventIds: gameState.recentEvents,
    allSeenEvents,
    currentActiveArcs,
    adaptivePacingStreak: gameState.adaptivePacingStreak,
    eventFrequency: gameState.eventFrequency,
    currentTurn: newTurn,
    selectedGoal: gameState.selectedGoal,
  });

  const nextEventTeaser = (() => {
    if ((event.difficulty ?? 0) >= 4) return tRuntime('narrative.eventTeaser.criticalDecision');
    if (event.personalityCategory === 'BREAKDOWN') return tRuntime('narrative.eventTeaser.breakdown');
    if (event.personalityCategory === 'MORAL') return tRuntime('narrative.eventTeaser.moral');
    if (event.personalityCategory === 'RISK') return tRuntime('narrative.eventTeaser.risk');
    if (typeof event.text === 'string') {
      const firstSentence = event.text.split(/[.!?]/)[0]?.trim() ?? '';
      if (firstSentence.length > 0 && firstSentence.length <= 80) {
        return firstSentence + '...';
      }
    }
    return tRuntime('narrative.eventTeaser.agePage', { age: newAge });
  })();

  commitEventPhase({
    event,
    scheduledEvents: scheduledEventsForRandom,
    activeArcs: nextActiveArcs,
    nextEventTeaser,
  });
};
