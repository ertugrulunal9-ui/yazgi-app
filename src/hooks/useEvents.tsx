import { useCallback, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useUI } from '../context/UIContext';
import { Choice, EventContext, GameEvent, ExamSubject, ALL_EXAM_SUBJECTS, GameState, Stats } from '../types';
import { earnToken, getEarnedTokenCount, spendToken } from '../systems/FateEngine';
import { ageTransitionHaptic } from '../animations/HapticFeedback';
import { EVENTS, FALLBACK_EVENT } from '../data/events';
import { useEventHelpers } from './useEventHelpers';
import { selectCrisisEvent } from '../data/crisisEvents';
import {
  applyTurnBuffEffects,
  calculateInvestmentEarlyExitPayout,
  calculateVarietyBonus,
  shouldAgeUp,
  shouldGenerateReportCard,
  getMaxEnergy,
  getRestedEnergy,
  tickConsumableCooldowns,
} from '../utils/gameUtils';
import { CONSUMABLE_CONFIG } from '../config/gameBalance';
import { analyzeGoalMismatch, resolveEnding } from '../utils/endingResolver';
import { calculateSchoolReport } from '../utils/schoolLogic';
import { TurnMediator, TurnResult } from '../systems/TurnMediator';
import { getDueScheduledEvents, isForcedScheduledEvent, pickScheduledEvent, tickScheduledEvents } from '../utils/scheduledEvents';
import {
  handleEventChoice as logEventChoice,
  logBurdenTrigger,
  logGameEnding,
  logTraitFormed,
  logTurnProgress
} from '../utils/analyticsEvents';
import { selectEventWithAdaptivePacing, getRecencyWindowSize } from '../utils/eventSelection';
import { getEventChoiceSet } from '../utils/gameStateAdapter';
import { naturalStressRecovery } from '../utils/personalitySystem';
import {
  DEFAULT_FAMILY_EVOLUTION_STATE,
  getFamilyThought,
  updateFamilyEvolutionOnAgeUp,
} from '../utils/familyNarrative';
import { STORY_ARCS } from '../data/storyArcs';
import { selectStoryArcEvent, syncActiveArcsWithSelectedEvent } from '../utils/storyArcSelection';
import { buildMemoryAwareEventText } from '../utils/memoryLogic';
import { selectMomentumGateEvent } from '../data/momentumEvents';
import { composeInnerThought, getStrategicMonologue } from '../utils/internalMonologue';
import {
  buildInitialLifeGoalEvent,
  buildPivotLifeGoalEvent,
  mapEndingGoalToLifeGoal,
  shouldTriggerInitialLifeGoalEvent,
  shouldTriggerPivotLifeGoalEvent,
} from '../utils/lifeGoalSystem';
import { tRuntime } from '../i18n/strings';
import { buildChoiceFeedbackKey, buildChoiceTextKey, buildEventTextKey } from '../i18n/events/keyUtils';
import { detectCausalLink } from '../utils/causalChain';
import { buildAgeMilestone, buildChapterSummary } from '../utils/milestoneBuilder';
import { isFeatureEnabled } from '../config/featureFlags';
import { getCurrentChapter, isChapterTransition } from '../utils/gameUtils';
import { calculateTurnAllowance, checkSavingGoalCompletion, getDefaultSavingGoals } from '../utils/economySystem';
import {
  generateMicroGoal,
  updateMicroGoalProgress,
  generateSeasonGoal,
  checkSeasonGoalCompletion,
  cleanupExpiredMicroGoals,
} from '../utils/goalTracking';
import { isPremium as isPremiumUser } from '../services/subscriptionManager';
import { scheduleReengagement, scheduleNPCReminder } from '../services/notificationService';

const getEventById = (eventId: string): GameEvent | undefined =>
  EVENTS.find(evt => evt.id === eventId);

const resolveArcOrRandomEvent = ({
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
    }
  );
  const event = arcSelection.event ?? randomEvent;
  const nextActiveArcs = arcSelection.event
    ? arcSelection.activeArcs
    : syncActiveArcsWithSelectedEvent(currentActiveArcs, STORY_ARCS, event.id, context);

  return { event, nextActiveArcs };
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

const hasCriticalBurdenCrossed = (currentRisk: number, previousRisk: number): boolean => (
  currentRisk > 85 && previousRisk <= 85
);

const FORCED_RECOVERY_EVENT_ID = 'forced_recovery_event';
const FORCED_RECOVERY_ENERGY_GAIN = 20;
const CRISIS_RECOVERY_RATIO = 0.5;
const RECOVERABLE_STAT_KEYS: Array<keyof Stats> = [
  'health',
  'energy',
  'intelligence',
  'charisma',
  'discipline',
  'money',
  'familyRelation',
];

const buildForcedRecoveryEvent = (): GameEvent => ({
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

export const useEvents = () => {
  const { gameState, stats, advanceTurnInContext, updateGameState, updateStats, setStats } = useGame();
  const { showFloatingText } = useUI();
  const turnMediatorRef = useRef(new TurnMediator());

  const {
    getCachedEligibleEvents,
    buildEventContext,
    getBurdenRisk,
    buildScheduledConditionContext,
    logSelectedEventAnalytics,
  } = useEventHelpers();

  const resolveEventText = useCallback((evt: GameEvent): string => {
    const ctx = buildEventContext();
    let baseText: string;

    if (typeof evt.text === 'function') {
      try {
        baseText = evt.text(ctx);
      } catch (err) {
        console.error('Error resolving dynamic event text:', err);
        baseText = typeof evt.text === 'string' ? evt.text : '...';
      }
    } else {
      baseText = evt.text;
    }

    const localizedText = evt.textKey
      ? tRuntime(evt.textKey, undefined, baseText)
      : baseText;

    return buildMemoryAwareEventText(localizedText, ctx.memories, {
      eventId: evt.id,
      personalityCategory: evt.personalityCategory,
      currentAge: ctx.age,
      currentTurn: ctx.gameState?.turn ?? 0,
    });
  }, [buildEventContext]);

  const localizeChoiceContent = useCallback((choice: Choice): Choice => ({
    ...choice,
    text: choice.textKey
      ? tRuntime(choice.textKey, undefined, choice.text)
      : choice.text,
    feedback: choice.feedbackKey
      ? tRuntime(choice.feedbackKey, undefined, choice.feedback)
      : choice.feedback,
    conditionalOutcomes: choice.conditionalOutcomes?.map(outcome => ({
      ...outcome,
      feedback: outcome.feedbackKey
        ? tRuntime(outcome.feedbackKey, undefined, outcome.feedback)
        : outcome.feedback,
    })),
  }), []);

  const resolveChoice = useCallback((choice: Choice | ((ctx: EventContext) => Choice)): Choice => {
    if (typeof choice === 'function') {
      try {
        const ctx = buildEventContext();
        return localizeChoiceContent(choice(ctx));
      } catch (err) {
        console.error('Error resolving dynamic choice:', err);
        // Return a safe fallback if execution fails
        return {
          text: tRuntime('events.fallback.continueChoice'),
          effect: {},
          feedback: tRuntime(
            'events.fallback.continueFeedback',
            undefined,
            'Bir hata olustu ama devam ediyorsun.'
          ),
        };
      }
    }
    return localizeChoiceContent(choice);
  }, [buildEventContext, localizeChoiceContent]);

  const selectNewEvent = useCallback(() => {
    const ctx = buildEventContext();
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
      }
    );
    const dueScheduled = getDueScheduledEvents(
      scheduledEvents,
      gameState.age,
      scheduledConditionContext
    );
    const currentActiveArcs = gameState.activeArcs || [];
    const burdenRisk = getBurdenRisk();
    const previousBurdenRisk = gameState.lastBurdenRisk ?? 0;
    const criticalBurdenCrossed = hasCriticalBurdenCrossed(burdenRisk, previousBurdenRisk);

    const applyScheduledSelection = (candidatePool: typeof dueScheduled): boolean => {
      const scheduled = pickScheduledEvent(candidatePool);
      if (!scheduled) return false;

      const evt = getEventById(scheduled.eventId);
      const remainingScheduled = scheduledEvents.filter(e => e.id !== scheduled.id);
      if (!evt) {
        updateGameState({ scheduledEvents: remainingScheduled });
        return true;
      }

      const nextActiveArcs = syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        evt.id,
        ctx
      );
      const windowSize = getRecencyWindowSize(gameState.age);
      const updatedFrequency = {
        ...gameState.eventFrequency,
        [evt.id]: {
          count: ((gameState.eventFrequency ?? {})[evt.id]?.count ?? 0) + 1,
          lastSeenTurn: gameState.turn,
        },
      };
      logSelectedEventAnalytics(evt, gameState.age, gameState.turn);
      updateGameState({
        currentEvent: evt,
        phase: 'EVENT',
        recentEvents: [...gameState.recentEvents, evt.id].slice(-windowSize),
        scheduledEvents: remainingScheduled,
        activeArcs: nextActiveArcs,
        eventFrequency: updatedFrequency,
        lastBurdenRisk: burdenRisk,
      });
      return true;
    };

    const forcedDueScheduled = dueScheduled.filter(isForcedScheduledEvent);
    if (forcedDueScheduled.length > 0 && applyScheduledSelection(forcedDueScheduled)) {
      return;
    }

    if (criticalBurdenCrossed) {
      const crisisEvent = selectCrisisEvent(gameState.age, gameState.recentEvents);
      const nextActiveArcs = syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        crisisEvent.id,
        ctx
      );
      const windowSize = getRecencyWindowSize(gameState.age);
      const updatedFrequency = {
        ...gameState.eventFrequency,
        [crisisEvent.id]: {
          count: ((gameState.eventFrequency ?? {})[crisisEvent.id]?.count ?? 0) + 1,
          lastSeenTurn: gameState.turn,
        },
      };
      void logBurdenTrigger({
        burdenRisk,
        age: gameState.age,
        turn: gameState.turn,
        selectedGoal: gameState.selectedGoal ?? null,
      });
      logSelectedEventAnalytics(crisisEvent, gameState.age, gameState.turn);
      updateGameState({
        currentEvent: crisisEvent,
        phase: 'EVENT',
        recentEvents: [...gameState.recentEvents, crisisEvent.id].slice(-windowSize),
        activeArcs: nextActiveArcs,
        eventFrequency: updatedFrequency,
        lastBurdenRisk: burdenRisk,
      });
      return;
    }

    const forcedGoalEvent = pickGoalMilestoneEvent(gameState, stats, gameState.age);

    if (forcedGoalEvent) {
      const nextActiveArcs = syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        forcedGoalEvent.id,
        ctx
      );
      const windowSize = getRecencyWindowSize(gameState.age);
      const updatedFrequency = {
        ...gameState.eventFrequency,
        [forcedGoalEvent.id]: {
          count: ((gameState.eventFrequency ?? {})[forcedGoalEvent.id]?.count ?? 0) + 1,
          lastSeenTurn: gameState.turn,
        },
      };
      logSelectedEventAnalytics(forcedGoalEvent, gameState.age, gameState.turn);
      updateGameState({
        currentEvent: forcedGoalEvent,
        phase: 'EVENT',
        recentEvents: [...gameState.recentEvents, forcedGoalEvent.id].slice(-windowSize),
        activeArcs: nextActiveArcs,
        eventFrequency: updatedFrequency,
        lastBurdenRisk: burdenRisk,
      });
      return;
    }

    if (dueScheduled.length > 0 && applyScheduledSelection(dueScheduled)) {
      return;
    }

    const personalityGateEvent = selectMomentumGateEvent({
      personalityState: gameState.personalityState,
      context: ctx,
      recentEventIds: gameState.recentEvents,
      allSeenEvents,
    });

    if (personalityGateEvent) {
      const nextActiveArcs = syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        personalityGateEvent.id,
        ctx
      );
      const windowSize = getRecencyWindowSize(gameState.age);
      const updatedFrequency = {
        ...gameState.eventFrequency,
        [personalityGateEvent.id]: {
          count: ((gameState.eventFrequency ?? {})[personalityGateEvent.id]?.count ?? 0) + 1,
          lastSeenTurn: gameState.turn,
        },
      };
      logSelectedEventAnalytics(personalityGateEvent, gameState.age, gameState.turn);
      updateGameState({
        currentEvent: personalityGateEvent,
        phase: 'EVENT',
        recentEvents: [...gameState.recentEvents, personalityGateEvent.id].slice(-windowSize),
        activeArcs: nextActiveArcs,
        eventFrequency: updatedFrequency,
        lastBurdenRisk: burdenRisk,
      });
      return;
    }

    const cachedEligibleEvents = getCachedEligibleEvents(ctx);
    const { event: evt, nextActiveArcs } = resolveArcOrRandomEvent({
      cachedEligibleEvents,
      context: ctx,
      recentEventIds: gameState.recentEvents,
      allSeenEvents,
      currentActiveArcs,
      adaptivePacingStreak: gameState.adaptivePacingStreak,
      eventFrequency: gameState.eventFrequency,
      currentTurn: gameState.turn,
      selectedGoal: gameState.selectedGoal,
    });

    const windowSize = getRecencyWindowSize(gameState.age);
    const updatedFrequency = {
      ...gameState.eventFrequency,
      [evt.id]: {
        count: ((gameState.eventFrequency ?? {})[evt.id]?.count ?? 0) + 1,
        lastSeenTurn: gameState.turn,
      },
    };
    logSelectedEventAnalytics(evt, gameState.age, gameState.turn);
    const causalLink = detectCausalLink(
      evt,
      gameState.memories,
      allSeenEvents,
    );
    updateGameState({
      currentEvent: evt,
      phase: 'EVENT',
      recentEvents: [...gameState.recentEvents, evt.id].slice(-windowSize),
      activeArcs: nextActiveArcs,
      eventFrequency: updatedFrequency,
      lastBurdenRisk: burdenRisk,
      currentCausalLink: causalLink ?? null,
    });
  }, [
    buildEventContext,
    buildScheduledConditionContext,
    gameState,
    getBurdenRisk,
    getCachedEligibleEvents,
    logSelectedEventAnalytics,
    stats,
    updateGameState
  ]);

  const handleEventChoice = useCallback((choice: Choice | ((ctx: EventContext) => Choice), choiceIndex?: number): TurnResult => {
    const resolved = resolveChoice(choice);

    // Paket 10: Snapshot before choice for undo mechanic
    const undoSnapshotUpdate: Partial<GameState> = {};
    const unlimitedUndo = isPremiumUser();
    if (isFeatureEnabled('UNDO_MECHANIC') && (unlimitedUndo || (gameState.undosUsedThisAge ?? 0) < 1)) {
      undoSnapshotUpdate.undoSnapshot = { gameState: { ...gameState }, stats: { ...stats } };
    }

    const turnResult = turnMediatorRef.current.processEventChoice({
      choice: resolved,
      choiceIndex,
      gameState,
      stats,
    });

    if (turnResult.newStats !== stats) {
      setStats(turnResult.newStats);
    }

    const nextGameStateUpdates = turnResult.shouldForceRecovery && turnResult.gameStateUpdates.lastResult
      ? {
        ...turnResult.gameStateUpdates,
        lastResult: {
          ...turnResult.gameStateUpdates.lastResult,
          shouldForceRecovery: true,
        },
      }
      : turnResult.gameStateUpdates;

    updateGameState({ ...nextGameStateUpdates, ...undoSnapshotUpdate });

    if (turnResult.eventId) {
      const eventName = gameState.currentEvent
        ? resolveEventText(gameState.currentEvent)
        : turnResult.eventId;
      const eventType = gameState.currentEvent?.personalityCategory ?? 'event';
      const eventEnergyCost = Math.max(0, -(resolved.effect?.energy ?? 0));
      void logEventChoice(
        {
          id: turnResult.eventId,
          name: eventName,
          type: eventType,
          rarity: gameState.currentEvent?.rarity,
        },
        {
          index: turnResult.choiceIndexForAnalytics,
          text: resolved.text,
          energyCost: eventEnergyCost,
        },
        gameState.age,
        {
          turn: gameState.turn,
          totalTurns: gameState.totalTurns || 0,
          currentEnergy: stats.energy,
          maxEnergy: gameState.maxEnergy,
        }
      );
    }

    if (turnResult.newTraits.length > 0) {
      turnResult.newTraits.forEach(traitId => {
        void logTraitFormed(traitId, gameState.age);
      });
    }
    return turnResult;
  }, [gameState, stats, updateGameState, resolveChoice, resolveEventText, setStats]);

  const continueAfterResult = useCallback(() => {
    const shouldInjectRecoveryEvent = gameState.lastResult?.shouldForceRecovery === true;
    if (shouldInjectRecoveryEvent) {
      const recoveryEvent = buildForcedRecoveryEvent();
      const windowSize = getRecencyWindowSize(gameState.age);
      const updatedFrequency = {
        ...gameState.eventFrequency,
        [recoveryEvent.id]: {
          count: ((gameState.eventFrequency ?? {})[recoveryEvent.id]?.count ?? 0) + 1,
          lastSeenTurn: gameState.turn,
        },
      };

      updateGameState({
        phase: 'EVENT',
        currentEvent: recoveryEvent,
        lastResult: null,
        recentEvents: [...gameState.recentEvents, recoveryEvent.id].slice(-windowSize),
        eventFrequency: updatedFrequency,
      });
      return;
    }

    updateGameState({
      phase: 'HUB',
      lastResult: null,
      currentEvent: null,
    });
  }, [gameState, updateGameState]);

  const getCrisisRecoveryPreview = useCallback((): Partial<Stats> => {
    if (gameState.phase !== 'RESULT') return {};
    if (gameState.currentEvent?.personalityCategory !== 'BREAKDOWN') return {};
    if (!gameState.lastResult?.changes) return {};

    const preview: Partial<Stats> = {};
    RECOVERABLE_STAT_KEYS.forEach((statKey) => {
      const changeValue = gameState.lastResult?.changes?.[statKey];
      if (typeof changeValue !== 'number' || changeValue >= 0) return;
      const recoverAmount = Math.round(Math.abs(changeValue) * CRISIS_RECOVERY_RATIO);
      if (recoverAmount > 0) {
        preview[statKey] = recoverAmount;
      }
    });
    return preview;
  }, [gameState.currentEvent?.personalityCategory, gameState.lastResult?.changes, gameState.phase]);

  const applyCrisisRecovery = useCallback((): Partial<Stats> => {
    const preview = getCrisisRecoveryPreview();
    if (Object.keys(preview).length === 0) return {};

    updateStats(preview);

    if (gameState.lastResult) {
      updateGameState({
        lastResult: {
          ...gameState.lastResult,
          feedback: `${gameState.lastResult.feedback} Krizin etkilerinin bir kismini toparladin.`,
        },
      });
    }

    return preview;
  }, [gameState.lastResult, getCrisisRecoveryPreview, updateGameState, updateStats]);

  const advanceTurn = useCallback(() => {
    const newTurn = gameState.turn + 1;
    const newTotalTurns = (gameState.totalTurns || 0) + 1;
    let newAge = gameState.age;
    const didAgeUp = shouldAgeUp(gameState.age, newTurn);
    if (didAgeUp) {
      newAge = gameState.age + 1;
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
    let autoAllowance = 0;

    // Paket 8: Otomatik harclik (her tur)
    if (isFeatureEnabled('ECONOMY_DEPTH')) {
      autoAllowance = gameState.family
        ? calculateTurnAllowance(gameState.family, newAge, statsAfterBuffTick.familyRelation)
        : 0;
      moneyAfterAllowance += autoAllowance;
      if (autoAllowance > 0) {
        showFloatingText(
          `+${autoAllowance} TL`,
          24,
          96,
          '#22c55e',
          { animationType: 'curve', duration: 1600 }
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

    // Kader sistemi — yaş geçişinde jeton kazanımı
    let updatedFate = gameState.fate;
    if (updatedFate) {
      const earnedTokens = getEarnedTokenCount(gameState, gameState.age, newAge);
      if (earnedTokens > 0) {
        updatedFate = earnToken(updatedFate, earnedTokens);
      }
    }

    // NPC ya\u015Fland\u0131rma - oyuncu ya\u015Fland\u0131\u011F\u0131nda NPC'ler de ya\u015Flan\u0131r
    let updatedNPCs = gameState.npcs;
    if (didAgeUp && updatedNPCs.length > 0) {
      updatedNPCs = updatedNPCs.map(npc => ({
        ...npc,
        age: npc.age + 1,
      }));
    }

    // --- Milestone Summary (Paket 4) ---
    let pendingMilestone: import('../types/game').AgeMilestoneSummary | undefined;
    let nextAgeStartStats = gameState._ageStartStats;
    if (didAgeUp && isFeatureEnabled('MILESTONE_SUMMARY')) {
      const prevStats = gameState._ageStartStats ?? stats;
      const prevTraits = gameState.traits ?? [];
      pendingMilestone = buildAgeMilestone({
        age: gameState.age, // yaş henüz artmadı, tamamlanan yaşı logla
        prevStats,
        currentStats: statsAfterBuffTick,
        prevTraits,
        currentTraits: gameState.traits,
        memories: gameState.memories ?? [],
        prevNpcs: (gameState._ageStartNpcs ?? gameState.npcs ?? []).map(n => ({
          id: n.id, name: n.name, role: n.role,
        })),
        currentNpcs: updatedNPCs,
        prevGrades: gameState._ageStartGrades ?? gameState.schoolGrades,
        currentGrades: gameState.schoolGrades,
      });
      // Sonraki yaş için snapshot al
      nextAgeStartStats = { ...statsAfterBuffTick };
    }

    // --- Chapter (Bölüm) Sistemi — Faz 1A ---
    let chapterUpdates: Partial<import('../types/game').GameState> = {};
    if (didAgeUp && isFeatureEnabled('CHAPTER_SYSTEM') && isChapterTransition(gameState.age, newAge)) {
      const completedChapter = getCurrentChapter(gameState.age);
      // Tamamlanan bölüme ait tüm yaş milestone'larını topla
      const chapterMilestones = (
        pendingMilestone
          ? [...(gameState.ageMilestoneSummaries ?? []), pendingMilestone]
          : (gameState.ageMilestoneSummaries ?? [])
      ).filter(m => m.age >= completedChapter.ageStart && m.age <= completedChapter.ageEnd);

      const chapterSummary = buildChapterSummary(completedChapter, chapterMilestones);
      chapterUpdates = {
        chapterSummaries: [...(gameState.chapterSummaries ?? []), chapterSummary],
        chapter: getCurrentChapter(newAge).id,
      };
    } else if (didAgeUp) {
      chapterUpdates = { chapter: getCurrentChapter(newAge).id };
    }

    // Milestone state updates to spread into every advanceTurnInContext call
    const milestoneUpdates = {
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
        undosUsedThisAge: 0, // reset undo counter on age up
        // Faz 6B: stat snapshot — her yaş geçişinde kaydedilir
        statSnapshots: [
          ...(gameState.statSnapshots ?? []),
          { age: gameState.age, stats: { ...statsAfterBuffTick } },
        ],
      } : {}),
      ...chapterUpdates,
    };

    // Paket 8: Biriktirme hedefi kontrolu
    let economyUpdates: Partial<GameState> = {};
    if (isFeatureEnabled('ECONOMY_DEPTH')) {
      const currentGoals = gameState.savingGoals ?? getDefaultSavingGoals();
      const { updatedGoals, completed } = checkSavingGoalCompletion(moneyAfterAllowance, newAge, currentGoals);
      if (completed.length > 0) {
        for (const c of completed) {
          const bonus = c.statBonus;
          if (bonus.health) moneyAfterAllowance += 0; // stat bonuses applied below
          // Apply stat bonuses from completed goals
          Object.entries(bonus).forEach(([key, val]) => {
            if (typeof val === 'number') {
              (statsAfterBuffTick as any)[key] = ((statsAfterBuffTick as any)[key] ?? 0) + val;
            }
          });
        }
      }
      economyUpdates = { savingGoals: updatedGoals };
    }

    // Paket 5: Micro/season goal tracking
    let goalUpdates: Partial<GameState> = {};
    if (isFeatureEnabled('MICRO_GOALS')) {
      // Update existing micro-goals (tick turnsRemaining)
      let currentMicros = (gameState.microGoals ?? []).map(g =>
        updateMicroGoalProgress(g, { stats: statsAfterBuffTick })
      );
      currentMicros = cleanupExpiredMicroGoals(currentMicros);

      // Generate new micro-goal if none active
      const activeCount = currentMicros.filter(g => !g.completed && g.turnsRemaining > 0).length;
      if (activeCount === 0) {
        const recentIds = currentMicros.map(g => g.id.replace(/_\d+$/, ''));
        const newGoal = generateMicroGoal(newAge, statsAfterBuffTick, recentIds);
        if (newGoal) currentMicros.push(newGoal);
      }

      // Season goal: assign on age up, check completion
      let currentSeason = gameState.seasonGoal ?? null;
      if (didAgeUp) {
        // Check if previous season goal completed
        if (currentSeason && !currentSeason.completed) {
          const completed = checkSeasonGoalCompletion(currentSeason, statsAfterBuffTick, gameState.schoolGrades);
          if (completed) {
            currentSeason = { ...currentSeason, completed: true };
            // Apply season goal reward
            const reward = currentSeason.reward;
            if (reward.money) moneyAfterAllowance += reward.money;
            if (reward.statBonus) {
              Object.entries(reward.statBonus).forEach(([key, val]) => {
                if (typeof val === 'number') {
                  (statsAfterBuffTick as any)[key] = ((statsAfterBuffTick as any)[key] ?? 0) + val;
                }
              });
            }
          }
        }
        // Assign new season goal for the new age
        currentSeason = generateSeasonGoal(newAge, statsAfterBuffTick, currentSeason?.id);
      }

      goalUpdates = {
        microGoals: currentMicros.slice(-10), // keep max 10 in history
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

    // S\u0131nav takip sistemi - KARNE KONTROL\u00DCNDEN \u00D6NCE s\u0131f\u0131rlama yapma!
    // S\u0131navlar sadece karne g\u00F6sterildikten sonra s\u0131f\u0131rlanmal\u0131
    let examsTakenThisYear = gameState.examsTakenThisYear || [];
    let pendingReportCard = gameState.pendingReportCard;
    let isExamPeriod = gameState.isExamPeriod || false;
    let newGrades = gameState.schoolGrades;
    let shouldResetExamsAfterReportCard = false;

    // Karne zaman\u0131 geldi mi kontrol et
    if (shouldGenerateReportCard(newAge, newTurn)) {
      // Okul \u00E7a\u011F\u0131nda m\u0131y\u0131z?
      if (newAge >= 7 && newAge < 18) {
        // T\u00FCm s\u0131navlara girildi mi?
        const allExamsTaken = ALL_EXAM_SUBJECTS.every(subject =>
          examsTakenThisYear.includes(subject)
        );

        if (allExamsTaken) {
          // T\u00FCm s\u0131navlar tamam, karne g\u00F6ster
          newGrades = calculateSchoolReport(statsAfterBuffTick, gameState);
          pendingReportCard = true;
          isExamPeriod = false;
          shouldResetExamsAfterReportCard = true; // Karne sonras\u0131 s\u0131f\u0131rla
        } else {
          // S\u0131navlar eksik, s\u0131nav d\u00F6nemine gir
          isExamPeriod = true;
          pendingReportCard = false;
        }
      } else {
        // Okul \u00E7a\u011F\u0131nda de\u011Filse direkt karne
        newGrades = calculateSchoolReport(statsAfterBuffTick, gameState);
        pendingReportCard = true;
      }
    }

    // S\u0131navlar\u0131 s\u0131f\u0131rla (sadece karne g\u00F6sterilecekse)
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
      {
        ...statsAfterVarietyBonus,
        energy: newEnergy,
        money: moneyAfterAllowance,
      },
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
    let dueScheduledEvents = [...scheduledTick.due];
    const pendingScheduledEvents = [...scheduledTick.pending];
    if (familyEvolutionScheduledEvents.length > 0) {
      const familyEvolutionTick = tickScheduledEvents(
        familyEvolutionScheduledEvents,
        newAge,
        scheduledConditionContext
      );
      dueScheduledEvents = [...dueScheduledEvents, ...familyEvolutionTick.due];
      pendingScheduledEvents.push(...familyEvolutionTick.pending);
    }
    const buildRemainingScheduledEvents = (selectedEventId?: string) => [
      ...pendingScheduledEvents,
      ...dueScheduledEvents
        .filter(evt => evt.id !== selectedEventId)
        .map(evt => ({ ...evt, remainingTurns: evt.remainingTurns ?? 0 })),
    ];

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
      advanceTurnInContext({
        newStats: {
          ...gameOverStats,
          money: endingMoney,
        },
        newGameState: {
          ...milestoneUpdates,
          ...economyUpdates,
          ...goalUpdates,
          phase: 'GAME_OVER',
          age: newAge,
          turn: newTurn,
          totalTurns: newTotalTurns,
          schoolGrades: newGrades,
          pendingReportCard,
          isExamPeriod: false,
          examsTakenThisYear: [],
          maxEnergy: newMaxEnergy,
          stress: stressAfterRecovery,
          activeArcs: currentActiveArcs,
          familyEvolution: nextFamilyEvolution,
          innerThought: nextInnerThought,
          innerThoughtType: nextInnerThoughtType,
          fate: updatedFate,
          lastBurdenRisk: burdenRisk,
          dailyDecisionCount: 0,
          activeBuffs: [],
          consumableCooldowns: {},
          consumableUsageThisTurn: {},
          lastResult: {
            feedback: `${careerResult.title}: ${careerResult.description}`,
            changes: {},
          },
        }
      });
      return;
    }

    const forcedDueScheduledEvents = dueScheduledEvents.filter(isForcedScheduledEvent);
    if (forcedDueScheduledEvents.length > 0) {
      const forcedSelection = pickScheduledEvent(forcedDueScheduledEvents);
      if (forcedSelection) {
        const forcedEvent = getEventById(forcedSelection.eventId);
        if (forcedEvent) {
          const forcedContext: EventContext = {
            ...buildEventContext(),
            age: newAge,
            stress: stressAfterRecovery,
            npcs: updatedNPCs,
            stats: {
              ...statsAfterVarietyBonus,
              energy: newEnergy,
              money: moneyAfterAllowance,
            },
          };
          const forcedActiveArcs = syncActiveArcsWithSelectedEvent(
            currentActiveArcs,
            STORY_ARCS,
            forcedEvent.id,
            forcedContext
          );
          const forcedWindowSize = getRecencyWindowSize(newAge);
          const forcedFrequency = {
            ...gameState.eventFrequency,
            [forcedEvent.id]: {
              count: ((gameState.eventFrequency ?? {})[forcedEvent.id]?.count ?? 0) + 1,
              lastSeenTurn: newTurn,
            },
          };
          void logTurnProgress(newAge, turnProgressStats, {
            turn: newTurn,
            totalTurns: newTotalTurns,
            maxEnergy: newMaxEnergy,
            energySpent: Math.max(0, gameState.maxEnergy - stats.energy),
          });
          logSelectedEventAnalytics(forcedEvent, newAge, newTurn);
          advanceTurnInContext({
            newStats: turnAdvanceStats,
            newGameState: {
              ...milestoneUpdates,
          ...economyUpdates,
          ...goalUpdates,
              age: newAge,
              turn: newTurn,
              totalTurns: newTotalTurns,
              phase: 'EVENT',
              currentEvent: forcedEvent,
              recentEvents: [...gameState.recentEvents, forcedEvent.id].slice(-forcedWindowSize),
              schoolGrades: newGrades,
              pendingReportCard,
              isExamPeriod: false,
              examsTakenThisYear,
              lastResult: null,
              npcs: updatedNPCs,
              scheduledEvents: buildRemainingScheduledEvents(forcedSelection.id),
              maxEnergy: newMaxEnergy,
              stress: stressAfterRecovery,
              activeArcs: forcedActiveArcs,
              familyEvolution: nextFamilyEvolution,
              innerThought: nextInnerThought,
              innerThoughtType: nextInnerThoughtType,
              eventFrequency: forcedFrequency,
              fate: updatedFate,
              lastBurdenRisk: burdenRisk,
              dailyDecisionCount: 0,
          activeBuffs: nextActiveBuffs,
          consumableCooldowns: nextConsumableCooldowns,
          consumableUsageThisTurn: nextConsumableUsageThisTurn,
            }
          });
          return;
        }

        dueScheduledEvents = dueScheduledEvents.filter(evt => evt.id !== forcedSelection.id);
      }
    }

    if (criticalBurdenCrossed) {
      const turnCrisisEvent = selectCrisisEvent(newAge, gameState.recentEvents);
      const crisisContext: EventContext = {
        ...buildEventContext(),
        age: newAge,
        stress: stressAfterRecovery,
        npcs: updatedNPCs,
        stats: {
          ...statsAfterVarietyBonus,
          energy: newEnergy,
          money: moneyAfterAllowance,
        },
      };
      const crisisActiveArcs = syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        turnCrisisEvent.id,
        crisisContext
      );
      const crisisWindowSize = getRecencyWindowSize(newAge);
      const crisisFrequency = {
        ...gameState.eventFrequency,
        [turnCrisisEvent.id]: {
          count: ((gameState.eventFrequency ?? {})[turnCrisisEvent.id]?.count ?? 0) + 1,
          lastSeenTurn: newTurn,
        },
      };
      void logTurnProgress(newAge, turnProgressStats, {
        turn: newTurn,
        totalTurns: newTotalTurns,
        maxEnergy: newMaxEnergy,
        energySpent: Math.max(0, gameState.maxEnergy - stats.energy),
      });
      void logBurdenTrigger({
        burdenRisk,
        age: newAge,
        turn: newTurn,
        selectedGoal: gameState.selectedGoal ?? null,
      });
      logSelectedEventAnalytics(turnCrisisEvent, newAge, newTurn);
      advanceTurnInContext({
        newStats: turnAdvanceStats,
        newGameState: {
          ...milestoneUpdates,
          ...economyUpdates,
          ...goalUpdates,
          age: newAge,
          turn: newTurn,
          totalTurns: newTotalTurns,
          phase: 'EVENT',
          currentEvent: turnCrisisEvent,
          recentEvents: [...gameState.recentEvents, turnCrisisEvent.id].slice(-crisisWindowSize),
          schoolGrades: newGrades,
          pendingReportCard,
          isExamPeriod: false,
          examsTakenThisYear,
          lastResult: null,
          npcs: updatedNPCs,
          scheduledEvents: [...pendingScheduledEvents, ...dueScheduledEvents],
          maxEnergy: newMaxEnergy,
          stress: stressAfterRecovery,
          activeArcs: crisisActiveArcs,
          familyEvolution: nextFamilyEvolution,
          innerThought: nextInnerThought,
          innerThoughtType: nextInnerThoughtType,
          eventFrequency: crisisFrequency,
          fate: updatedFate,
          lastBurdenRisk: burdenRisk,
          dailyDecisionCount: 0,
          activeBuffs: nextActiveBuffs,
          consumableCooldowns: nextConsumableCooldowns,
          consumableUsageThisTurn: nextConsumableUsageThisTurn,
        }
      });
      return;
    }

    const forcedGoalEvent = pickGoalMilestoneEvent(gameState, statsAfterVarietyBonus, newAge);
    if (forcedGoalEvent) {
      const goalEventContext: EventContext = {
        ...buildEventContext(),
        age: newAge,
        stress: stressAfterRecovery,
        npcs: updatedNPCs,
        stats: {
          ...statsAfterVarietyBonus,
          energy: newEnergy,
          money: moneyAfterAllowance,
        },
      };
      const goalActiveArcs = syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        forcedGoalEvent.id,
        goalEventContext
      );
      const goalWindowSize = getRecencyWindowSize(newAge);
      const goalFrequency = {
        ...gameState.eventFrequency,
        [forcedGoalEvent.id]: {
          count: ((gameState.eventFrequency ?? {})[forcedGoalEvent.id]?.count ?? 0) + 1,
          lastSeenTurn: newTurn,
        },
      };
      void logTurnProgress(newAge, turnProgressStats, {
        turn: newTurn,
        totalTurns: newTotalTurns,
        maxEnergy: newMaxEnergy,
        energySpent: Math.max(0, gameState.maxEnergy - stats.energy),
      });
      logSelectedEventAnalytics(forcedGoalEvent, newAge, newTurn);
      advanceTurnInContext({
        newStats: turnAdvanceStats,
        newGameState: {
          ...milestoneUpdates,
          ...economyUpdates,
          ...goalUpdates,
          age: newAge,
          turn: newTurn,
          totalTurns: newTotalTurns,
          phase: 'EVENT',
          currentEvent: forcedGoalEvent,
          recentEvents: [...gameState.recentEvents, forcedGoalEvent.id].slice(-goalWindowSize),
          schoolGrades: newGrades,
          pendingReportCard,
          isExamPeriod,
          examsTakenThisYear,
          lastResult: null,
          npcs: updatedNPCs,
          scheduledEvents: [...pendingScheduledEvents, ...dueScheduledEvents],
          maxEnergy: newMaxEnergy,
          stress: stressAfterRecovery,
          activeArcs: goalActiveArcs,
          familyEvolution: nextFamilyEvolution,
          innerThought: nextInnerThought,
          innerThoughtType: nextInnerThoughtType,
          eventFrequency: goalFrequency,
          fate: updatedFate,
          lastBurdenRisk: burdenRisk,
          dailyDecisionCount: 0,
          activeBuffs: nextActiveBuffs,
          consumableCooldowns: nextConsumableCooldowns,
          consumableUsageThisTurn: nextConsumableUsageThisTurn,
        }
      });
      return;
    }

    void logTurnProgress(newAge, turnProgressStats, {
      turn: newTurn,
      totalTurns: newTotalTurns,
      maxEnergy: newMaxEnergy,
      energySpent: Math.max(0, gameState.maxEnergy - stats.energy),
    });

    // S\u0131nav d\u00F6nemindeyse event y\u00FCkleme - s\u0131nav ekran\u0131 g\u00F6sterilecek
    if (isExamPeriod) {
      advanceTurnInContext({
        newStats: turnAdvanceStats,
        newGameState: {
          ...milestoneUpdates,
          ...economyUpdates,
          ...goalUpdates,
          age: newAge,
          turn: newTurn,
          totalTurns: newTotalTurns,
          phase: 'HUB', // Event yerine hub'da kal
          currentEvent: null,
          schoolGrades: newGrades,
          pendingReportCard: false,
          isExamPeriod: true,
          examsTakenThisYear,
          lastResult: null,
          npcs: updatedNPCs,
          scheduledEvents: [...pendingScheduledEvents, ...dueScheduledEvents],
          maxEnergy: newMaxEnergy,
          stress: stressAfterRecovery,
          activeArcs: currentActiveArcs,
          familyEvolution: nextFamilyEvolution,
          innerThought: nextInnerThought,
          innerThoughtType: nextInnerThoughtType,
          fate: updatedFate,
          lastBurdenRisk: burdenRisk,
          dailyDecisionCount: 0,
          activeBuffs: nextActiveBuffs,
          consumableCooldowns: nextConsumableCooldowns,
          consumableUsageThisTurn: nextConsumableUsageThisTurn,
        }
      });
      return;
    }

    const scheduledSelection = pickScheduledEvent(dueScheduledEvents);
    const scheduledEvent = scheduledSelection ? getEventById(scheduledSelection.eventId) : null;
    const remainingScheduledEvents = buildRemainingScheduledEvents(scheduledSelection?.id);

    if (scheduledEvent) {
      const nextActiveArcs = syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        scheduledEvent.id,
        {
          ...buildEventContext(),
          age: newAge,
          stress: stressAfterRecovery,
          npcs: updatedNPCs,
          stats: {
            ...statsAfterVarietyBonus,
            energy: newEnergy,
            money: moneyAfterAllowance,
          },
        }
      );
      const schedWindowSize = getRecencyWindowSize(newAge);
      const schedFrequency = {
        ...gameState.eventFrequency,
        [scheduledEvent.id]: {
          count: ((gameState.eventFrequency ?? {})[scheduledEvent.id]?.count ?? 0) + 1,
          lastSeenTurn: newTurn,
        },
      };
      logSelectedEventAnalytics(scheduledEvent, newAge, newTurn);
      advanceTurnInContext({
        newStats: turnAdvanceStats,
        newGameState: {
          ...milestoneUpdates,
          ...economyUpdates,
          ...goalUpdates,
          age: newAge,
          turn: newTurn,
          totalTurns: newTotalTurns,
          phase: 'EVENT',
          currentEvent: scheduledEvent,
          recentEvents: [...gameState.recentEvents, scheduledEvent.id].slice(-schedWindowSize),
          schoolGrades: newGrades,
          pendingReportCard,
          isExamPeriod: false,
          examsTakenThisYear,
          lastResult: null,
          npcs: updatedNPCs,
          scheduledEvents: remainingScheduledEvents,
          maxEnergy: newMaxEnergy,
          stress: stressAfterRecovery,
          activeArcs: nextActiveArcs,
          familyEvolution: nextFamilyEvolution,
          innerThought: nextInnerThought,
          innerThoughtType: nextInnerThoughtType,
          eventFrequency: schedFrequency,
          fate: updatedFate,
          lastBurdenRisk: burdenRisk,
          dailyDecisionCount: 0,
          activeBuffs: nextActiveBuffs,
          consumableCooldowns: nextConsumableCooldowns,
          consumableUsageThisTurn: nextConsumableUsageThisTurn,
        }
      });
      return;
    }

    const scheduledEventsForRandom = scheduledSelection
      ? remainingScheduledEvents
      : [...pendingScheduledEvents, ...dueScheduledEvents];

    // Normal ak\u0131\u015F - event y\u00FCkle
    const ctx: EventContext = {
      ...buildEventContext(),
      age: newAge,
      stress: stressAfterRecovery,
      npcs: updatedNPCs,
      stats: {
        ...statsAfterVarietyBonus,
        energy: newEnergy,
        money: moneyAfterAllowance,
      },
    };
    const personalityGateEvent = selectMomentumGateEvent({
      personalityState: gameState.personalityState,
      context: ctx,
      recentEventIds: gameState.recentEvents,
      allSeenEvents,
    });

    if (personalityGateEvent) {
      const nextActiveArcs = syncActiveArcsWithSelectedEvent(
        currentActiveArcs,
        STORY_ARCS,
        personalityGateEvent.id,
        ctx
      );
      const advWindowSize = getRecencyWindowSize(newAge);
      const advFrequency = {
        ...gameState.eventFrequency,
        [personalityGateEvent.id]: {
          count: ((gameState.eventFrequency ?? {})[personalityGateEvent.id]?.count ?? 0) + 1,
          lastSeenTurn: newTurn,
        },
      };
      logSelectedEventAnalytics(personalityGateEvent, newAge, newTurn);
      advanceTurnInContext({
        newStats: turnAdvanceStats,
        newGameState: {
          ...milestoneUpdates,
          ...economyUpdates,
          ...goalUpdates,
          age: newAge,
          turn: newTurn,
          totalTurns: newTotalTurns,
          phase: 'EVENT',
          currentEvent: personalityGateEvent,
          recentEvents: [...gameState.recentEvents, personalityGateEvent.id].slice(-advWindowSize),
          schoolGrades: newGrades,
          pendingReportCard,
          isExamPeriod: false,
          examsTakenThisYear,
          lastResult: null,
          npcs: updatedNPCs,
          scheduledEvents: scheduledEventsForRandom,
          maxEnergy: newMaxEnergy,
          stress: stressAfterRecovery,
          activeArcs: nextActiveArcs,
          familyEvolution: nextFamilyEvolution,
          innerThought: nextInnerThought,
          innerThoughtType: nextInnerThoughtType,
          eventFrequency: advFrequency,
          fate: updatedFate,
          lastBurdenRisk: burdenRisk,
          dailyDecisionCount: 0,
          activeBuffs: nextActiveBuffs,
          consumableCooldowns: nextConsumableCooldowns,
          consumableUsageThisTurn: nextConsumableUsageThisTurn,
        }
      });
      return;
    }

    const cachedEligibleEvents = getCachedEligibleEvents(ctx);
    const { event: evt, nextActiveArcs } = resolveArcOrRandomEvent({
      cachedEligibleEvents,
      context: ctx,
      recentEventIds: gameState.recentEvents,
      allSeenEvents,
      currentActiveArcs,
      adaptivePacingStreak: gameState.adaptivePacingStreak,
      eventFrequency: gameState.eventFrequency,
      currentTurn: newTurn,
      selectedGoal: gameState.selectedGoal,
    });

    const advWindowSize = getRecencyWindowSize(newAge);
    const advFrequency = {
      ...gameState.eventFrequency,
      [evt.id]: {
        count: ((gameState.eventFrequency ?? {})[evt.id]?.count ?? 0) + 1,
        lastSeenTurn: newTurn,
      },
    };
    logSelectedEventAnalytics(evt, newAge, newTurn);

    const nextEventTeaser: string = (() => {
      if ((evt.difficulty ?? 0) >= 4) return tRuntime('narrative.eventTeaser.criticalDecision');
      if (evt.personalityCategory === 'BREAKDOWN') return tRuntime('narrative.eventTeaser.breakdown');
      if (evt.personalityCategory === 'MORAL') return tRuntime('narrative.eventTeaser.moral');
      if (evt.personalityCategory === 'RISK') return tRuntime('narrative.eventTeaser.risk');
      if (typeof evt.text === 'string') {
        const firstSentence = evt.text.split(/[.!?]/)[0]?.trim() ?? '';
        if (firstSentence.length > 0 && firstSentence.length <= 80) return firstSentence + '...';
      }
      return tRuntime('narrative.eventTeaser.agePage', { age: newAge });
    })();

    advanceTurnInContext({
      newStats: turnAdvanceStats,
      newGameState: {
        ...milestoneUpdates,
        age: newAge,
        turn: newTurn,
        totalTurns: newTotalTurns,
        phase: 'EVENT',
        currentEvent: evt,
        nextEventTeaser,
        recentEvents: [...gameState.recentEvents, evt.id].slice(-advWindowSize),
        schoolGrades: newGrades,
        pendingReportCard,
        isExamPeriod: false,
        examsTakenThisYear,
        lastResult: null,
        npcs: updatedNPCs,
        scheduledEvents: scheduledEventsForRandom,
        maxEnergy: newMaxEnergy,
        stress: stressAfterRecovery,
        activeArcs: nextActiveArcs,
        familyEvolution: nextFamilyEvolution,
        innerThought: nextInnerThought,
        innerThoughtType: nextInnerThoughtType,
        eventFrequency: advFrequency,
        fate: updatedFate,
        lastBurdenRisk: burdenRisk,
        dailyDecisionCount: 0,
          activeBuffs: nextActiveBuffs,
          consumableCooldowns: nextConsumableCooldowns,
          consumableUsageThisTurn: nextConsumableUsageThisTurn,
      }
    });
  }, [advanceTurnInContext, buildEventContext, buildScheduledConditionContext, gameState, getBurdenRisk, getCachedEligibleEvents, logSelectedEventAnalytics, stats]);

  // Kader jetonu ile yeniden çekme
  const rerollChoice = useCallback((choice: Choice, choiceIndex: number) => {
    if (!gameState.fate || gameState.fate.tokens <= 0) return;
    const fateAfterSpend = spendToken(gameState.fate);

    const turnResult = turnMediatorRef.current.processEventChoice({
      choice,
      choiceIndex,
      gameState: { ...gameState, fate: fateAfterSpend },
      stats,
      forceGoodFate: true,
      previousFateOutcome: gameState.lastResult?.fateRoll?.outcome,
    });

    if (turnResult.newStats !== stats) {
      setStats(turnResult.newStats);
    }
    const nextGameStateUpdates = turnResult.shouldForceRecovery && turnResult.gameStateUpdates.lastResult
      ? {
        ...turnResult.gameStateUpdates,
        lastResult: {
          ...turnResult.gameStateUpdates.lastResult,
          shouldForceRecovery: true,
        },
      }
      : turnResult.gameStateUpdates;

    updateGameState({ ...nextGameStateUpdates, lastSessionEndedAt: Date.now() });
  }, [gameState, stats, setStats, updateGameState]);

  // S\u0131nav tamamland\u0131\u011F\u0131nda \u00E7a\u011Fr\u0131l\u0131r
  const markExamTaken = useCallback((subject: ExamSubject) => {
    const currentExams = gameState.examsTakenThisYear || [];
    if (currentExams.includes(subject)) return; // Zaten al\u0131nm\u0131\u015F

    const newExamsTaken = [...currentExams, subject];
    const allExamsTaken = ALL_EXAM_SUBJECTS.every(s => newExamsTaken.includes(s));
    const shouldOpenReportCard = allExamsTaken && gameState.isExamPeriod;

    updateGameState({
      examsTakenThisYear: shouldOpenReportCard ? [] : newExamsTaken,
      // T\u00FCm s\u0131navlar tamamland\u0131ysa s\u0131nav d\u00F6nemi biter, karne a\u00E7\u0131l\u0131r
      ...(shouldOpenReportCard ? {
        isExamPeriod: false,
        pendingReportCard: true,
        schoolGrades: calculateSchoolReport(stats, gameState),
      } : {}),
    });
  }, [gameState, stats, updateGameState]);

  // S\u0131nav d\u00F6nemini manuel bitir (t\u00FCm s\u0131navlar tamamland\u0131\u011F\u0131nda ExamPeriodModal'dan \u00E7a\u011Fr\u0131l\u0131r)
  const completeExamPeriod = useCallback(() => {
    const completedExams = gameState.examsTakenThisYear || [];
    const allExamsTaken = ALL_EXAM_SUBJECTS.every(subject => completedExams.includes(subject));
    updateGameState({
      isExamPeriod: false,
      pendingReportCard: true,
      ...(allExamsTaken ? { examsTakenThisYear: [] } : {}),
      schoolGrades: calculateSchoolReport(stats, gameState),
    });
  }, [gameState, stats, updateGameState]);

  // Paket 10: Undo — restore pre-choice snapshot
  const undoLastChoice = useCallback(() => {
    if (!isFeatureEnabled('UNDO_MECHANIC')) return false;
    const snapshot = gameState.undoSnapshot;
    if (!snapshot) return false;

    const restoredState = snapshot.gameState;
    setStats(snapshot.stats);
    updateGameState({
      ...restoredState,
      undoSnapshot: undefined,
      undosUsedThisAge: (gameState.undosUsedThisAge ?? 0) + 1,
    });
    return true;
  }, [gameState, setStats, updateGameState]);

  // Schedule re-engagement notifications after each turn so the countdown resets
  useEffect(() => {
    if (!gameState.totalTurns || gameState.totalTurns < 1) return;

    void scheduleReengagement(24);

    // If player has a meaningful NPC relationship, add a 48h NPC reminder
    const activeNPC = gameState.npcs?.find(npc => npc.relationship >= 40);
    if (activeNPC) {
      void scheduleNPCReminder(activeNPC.name, 48);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.totalTurns]);

  return {
    currentEvent: gameState.currentEvent,
    selectNewEvent,
    handleEventChoice,
    continueAfterResult,
    getCrisisRecoveryPreview,
    applyCrisisRecovery,
    rerollChoice,
    resolveChoice,
    resolveEventText,
    advanceTurn,
    markExamTaken,
    completeExamPeriod,
    undoLastChoice,
  };
};
