import { useCallback, useEffect, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { useUI } from '../context/UIContext';
import { ALL_EXAM_SUBJECTS } from '../types';
import type { Choice, EventContext, GameEvent, ExamSubject, Stats } from '../types';
import { spendToken } from '../systems/FateEngine';
import { useEventHelpers } from './useEventHelpers';
import { TurnMediator } from '../systems/TurnMediator';
import type { TurnResult } from '../systems/TurnMediator';
import { buildMemoryAwareEventText } from '../utils/memoryLogic';
import { isFeatureEnabled } from '../config/featureFlags';
import { calculateSchoolReport } from '../utils/schoolLogic';
import { tRuntime } from '../i18n/strings';
import {
  handleEventChoice as logEventChoice,
  logTraitFormed,
} from '../utils/analyticsEvents';
import {
  buildEventFrequency,
  buildForcedRecoveryEvent,
  buildRecentEvents,
  CRISIS_RECOVERY_RATIO,
  RECOVERABLE_STAT_KEYS,
} from './useEvents/shared';
import { runSelectNewEvent } from './useEvents/selectNewEventFlow';
import { runAdvanceTurn } from './useEvents/advanceTurnFlow';
import { isPremium as isPremiumUser } from '../services/subscriptionManager';
import { scheduleReengagement, scheduleNPCReminder } from '../services/notificationService';

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
        return {
          text: tRuntime('events.fallback.continueChoice'),
          effect: {},
          feedback: tRuntime(
            'events.fallback.continueFeedback',
            undefined,
            'Bir hata olustu ama devam ediyorsun.',
          ),
        };
      }
    }
    return localizeChoiceContent(choice);
  }, [buildEventContext, localizeChoiceContent]);

  const selectNewEvent = useCallback(() => {
    runSelectNewEvent({
      gameState,
      stats,
      updateGameState,
      buildEventContext,
      buildScheduledConditionContext,
      getBurdenRisk,
      getCachedEligibleEvents,
      logSelectedEventAnalytics,
    });
  }, [
    buildEventContext,
    buildScheduledConditionContext,
    gameState,
    getBurdenRisk,
    getCachedEligibleEvents,
    logSelectedEventAnalytics,
    stats,
    updateGameState,
  ]);

  const handleEventChoice = useCallback((choice: Choice | ((ctx: EventContext) => Choice), choiceIndex?: number): TurnResult => {
    const resolved = resolveChoice(choice);

    const undoSnapshotUpdate: {
      undoSnapshot?: {
        gameState: typeof gameState;
        stats: Stats;
      };
    } = {};
    const unlimitedUndo = isPremiumUser();
    if (isFeatureEnabled('UNDO_MECHANIC') && (unlimitedUndo || (gameState.undosUsedThisAge ?? 0) < 1)) {
      Object.assign(undoSnapshotUpdate, {
        undoSnapshot: { gameState: { ...gameState }, stats: { ...stats } },
      });
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
        },
      );
    }

    if (turnResult.newTraits.length > 0) {
      turnResult.newTraits.forEach(traitId => {
        void logTraitFormed(traitId, gameState.age);
      });
    }

    return turnResult;
  }, [gameState, resolveChoice, resolveEventText, setStats, stats, updateGameState]);

  const continueAfterResult = useCallback(() => {
    const shouldInjectRecoveryEvent = gameState.lastResult?.shouldForceRecovery === true;
    if (shouldInjectRecoveryEvent) {
      const recoveryEvent = buildForcedRecoveryEvent();
      updateGameState({
        phase: 'EVENT',
        currentEvent: recoveryEvent,
        lastResult: null,
        recentEvents: buildRecentEvents(gameState.recentEvents, recoveryEvent.id, gameState.age),
        eventFrequency: buildEventFrequency(gameState.eventFrequency, recoveryEvent.id, gameState.turn),
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
    runAdvanceTurn({
      gameState,
      stats,
      advanceTurnInContext,
      showFloatingText,
      buildEventContext,
      buildScheduledConditionContext,
      getBurdenRisk,
      getCachedEligibleEvents,
      logSelectedEventAnalytics,
    });
  }, [
    advanceTurnInContext,
    buildEventContext,
    buildScheduledConditionContext,
    gameState,
    getBurdenRisk,
    getCachedEligibleEvents,
    logSelectedEventAnalytics,
    showFloatingText,
    stats,
  ]);

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
  }, [gameState, setStats, stats, updateGameState]);

  const markExamTaken = useCallback((subject: ExamSubject) => {
    const currentExams = gameState.examsTakenThisYear || [];
    if (currentExams.includes(subject)) return;

    const newExamsTaken = [...currentExams, subject];
    const allExamsTaken = ALL_EXAM_SUBJECTS.every(item => newExamsTaken.includes(item));
    const shouldOpenReportCard = allExamsTaken && gameState.isExamPeriod;

    updateGameState({
      examsTakenThisYear: shouldOpenReportCard ? [] : newExamsTaken,
      ...(shouldOpenReportCard ? {
        isExamPeriod: false,
        pendingReportCard: true,
        schoolGrades: calculateSchoolReport(stats, gameState),
      } : {}),
    });
  }, [gameState, stats, updateGameState]);

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

  useEffect(() => {
    if (!gameState.totalTurns || gameState.totalTurns < 1) return;

    void scheduleReengagement(24);

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
