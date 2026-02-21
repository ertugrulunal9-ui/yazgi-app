import { useCallback, useRef } from 'react';
import { useGame } from '../context/GameContext';
import { Choice, EventContext, GameEvent, ExamSubject, ALL_EXAM_SUBJECTS, GameState, Stats } from '../types';
import { earnToken, getEarnedTokenCount, spendToken } from '../systems/FateEngine';
import { ageTransitionHaptic } from '../animations/HapticFeedback';
import { EVENTS, FALLBACK_EVENT } from '../data/events';
import { selectCrisisEvent } from '../data/crisisEvents';
import {
  shouldAgeUp,
  shouldGenerateReportCard,
  getMaxEnergy,
  getRestedEnergy
} from '../utils/gameUtils';
import { analyzeGoalMismatch, calculateEndingErrorDebt, resolveEnding } from '../utils/endingResolver';
import { calculateSchoolReport } from '../utils/schoolLogic';
import { TurnMediator, TurnResult } from '../systems/TurnMediator';
import { getDueScheduledEvents, isForcedScheduledEvent, pickScheduledEvent, tickScheduledEvents } from '../utils/scheduledEvents';
import {
  handleEventChoice as logEventChoice,
  logBurdenTrigger,
  logGameEnding,
  logGoalAlignmentScore,
  logMilestoneReached,
  logTraitFormed,
  logTurnProgress
} from '../utils/analyticsEvents';
import { calculateGoalAlignmentScore, selectEventWithAdaptivePacing, getRecencyWindowSize } from '../utils/eventSelection';
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
import { getEligibleEventsWithAgeCache } from '../utils/eventEligibilityCache';
import {
  buildInitialLifeGoalEvent,
  buildPivotLifeGoalEvent,
  mapEndingGoalToLifeGoal,
  shouldTriggerInitialLifeGoalEvent,
  shouldTriggerPivotLifeGoalEvent,
} from '../utils/lifeGoalSystem';
import { getGoalChainStage } from '../data/goalChainEvents';

const getEventById = (eventId: string): GameEvent | undefined =>
  EVENTS.find(evt => evt.id === eventId);

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

export const useEvents = () => {
  const { gameState, stats, advanceTurnInContext, updateGameState, setStats } = useGame();
  const turnMediatorRef = useRef(new TurnMediator());
  const eligibilityCache = useRef<{ age: number; eligible: GameEvent[] }>({ age: -1, eligible: [] });

  const getCachedEligibleEvents = useCallback((
    context: EventContext,
  ): GameEvent[] => {
    eligibilityCache.current = getEligibleEventsWithAgeCache(
      eligibilityCache.current,
      EVENTS,
      context.age
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
    currentStats: Stats = stats
  ): number => calculateEndingErrorDebt(state, currentStats).total, [gameState, stats]);

  const logSelectedEventAnalytics = useCallback((
    event: GameEvent,
    age: number,
    turn: number
  ) => {
    const selectedGoal = gameState.selectedGoal ?? null;
    const alignmentScore = calculateGoalAlignmentScore(event, selectedGoal);
    void logGoalAlignmentScore({
      eventId: event.id,
      selectedGoal,
      alignmentScore,
      age,
      turn,
    });

    const stage = getGoalChainStage(event.id);
    if (stage && selectedGoal) {
      void logMilestoneReached({
        arcId: 'arc_goal_path_chain',
        stage,
        selectedGoal,
        age,
        turn,
      });
    }
  }, [gameState.selectedGoal]);

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

    return buildMemoryAwareEventText(baseText, ctx.memories, {
      eventId: evt.id,
      personalityCategory: evt.personalityCategory,
      currentAge: ctx.age,
      currentTurn: ctx.gameState?.turn ?? 0,
    });
  }, [buildEventContext]);

  const resolveChoice = useCallback((choice: Choice | ((ctx: EventContext) => Choice)): Choice => {
    if (typeof choice === 'function') {
      try {
        const ctx = buildEventContext();
        return choice(ctx);
      } catch (err) {
        console.error('Error resolving dynamic choice:', err);
        // Return a safe fallback if execution fails
        return { text: "Devam Et", effect: {}, feedback: "Bir hata olu\u015Ftu ama devam ediyorsun." };
      }
    }
    return choice;
  }, [buildEventContext]);

  const selectNewEvent = useCallback(() => {
    const ctx = buildEventContext();
    const scheduledEvents = gameState.scheduledEvents || [];
    const dueScheduled = getDueScheduledEvents(scheduledEvents, gameState.age);
    const allSeenEvents = getEventChoiceSet(gameState);
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
    const arcSelection = selectStoryArcEvent({
      arcs: STORY_ARCS,
      activeArcs: currentActiveArcs,
      events: cachedEligibleEvents,
      context: ctx,
      recentEventIds: gameState.recentEvents,
      allSeenEvents,
    });
    const randomEvent = selectEventWithAdaptivePacing(
      cachedEligibleEvents,
      ctx,
      gameState.recentEvents,
      allSeenEvents,
      {
        fallbackEvent: FALLBACK_EVENT,
        adaptivePacingStreak: gameState.adaptivePacingStreak,
        eventFrequency: gameState.eventFrequency,
        currentTurn: gameState.turn,
        selectedGoal: gameState.selectedGoal ?? null,
      }
    );
    const evt = arcSelection.event ?? randomEvent;
    const nextActiveArcs = arcSelection.event
      ? arcSelection.activeArcs
      : syncActiveArcsWithSelectedEvent(currentActiveArcs, STORY_ARCS, evt.id, ctx);

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
      activeArcs: nextActiveArcs,
      eventFrequency: updatedFrequency,
      lastBurdenRisk: burdenRisk,
    });
  }, [buildEventContext, gameState, getBurdenRisk, getCachedEligibleEvents, logSelectedEventAnalytics, stats, updateGameState]);

  const handleEventChoice = useCallback((choice: Choice | ((ctx: EventContext) => Choice), choiceIndex?: number): TurnResult => {
    const resolved = resolveChoice(choice);

    const turnResult = turnMediatorRef.current.processEventChoice({
      choice: resolved,
      choiceIndex,
      gameState,
      stats,
    });

    if (turnResult.newStats !== stats) {
      setStats(turnResult.newStats);
    }

    updateGameState(turnResult.gameStateUpdates);

    if (turnResult.eventId) {
      const eventName = typeof gameState.currentEvent?.text === 'string'
        ? gameState.currentEvent.text
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
  }, [gameState, stats, updateGameState, resolveChoice, setStats]);

  const advanceTurn = useCallback(() => {
    const newTurn = gameState.turn + 1;
    const newTotalTurns = (gameState.totalTurns || 0) + 1;
    let newAge = gameState.age;
    const didAgeUp = shouldAgeUp(gameState.age, newTurn);
    if (didAgeUp) {
      newAge = gameState.age + 1;
      ageTransitionHaptic();
    }
    const moneyAfterAllowance = stats.money;
    const stressAfterRecovery = naturalStressRecovery(gameState.stress, gameState.personality);
    const currentActiveArcs = gameState.activeArcs || [];
    const burdenRisk = getBurdenRisk();
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

    const scheduledTick = tickScheduledEvents(gameState.scheduledEvents || [], newAge);
    let dueScheduledEvents = [...scheduledTick.due];
    const pendingScheduledEvents = [...scheduledTick.pending];

    let nextFamilyEvolution = gameState.familyEvolution || { ...DEFAULT_FAMILY_EVOLUTION_STATE };
    if (didAgeUp) {
      const evolutionUpdate = updateFamilyEvolutionOnAgeUp({
        previousState: nextFamilyEvolution,
        family: gameState.family,
        familyRelation: stats.familyRelation,
        age: newAge,
      });
      nextFamilyEvolution = evolutionUpdate.nextState;
      if (evolutionUpdate.scheduledEvents.length > 0) {
        dueScheduledEvents = [...dueScheduledEvents, ...evolutionUpdate.scheduledEvents];
      }
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
          newGrades = calculateSchoolReport(stats, gameState);
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
        newGrades = calculateSchoolReport(stats, gameState);
        pendingReportCard = true;
      }
    }

    // S\u0131navlar\u0131 s\u0131f\u0131rla (sadece karne g\u00F6sterilecekse)
    if (shouldResetExamsAfterReportCard) {
      examsTakenThisYear = [];
    }

    const familyThought = getFamilyThought({
      family: gameState.family,
      familyRelation: stats.familyRelation,
      age: newAge,
      turn: newTurn,
      evolution: nextFamilyEvolution,
    });
    const strategicResult = getStrategicMonologue({
      burdenRisk,
      age: newAge,
      selectedGoal: gameState.selectedGoal ?? null,
      goalMismatch: analyzeGoalMismatch(gameState, stats),
      traitProgress: gameState.traitProgress,
      personalityState: gameState.personalityState,
      turn: newTurn,
      pendingCliffhanger: gameState.pendingCliffhanger,
    });
    const composed = composeInnerThought(familyThought, strategicResult, gameState.innerThought);
    const nextInnerThought = composed.text;
    const nextInnerThoughtType = composed.type;
    const newMaxEnergy = getMaxEnergy(newAge, gameState.family, gameState.traits);
    const newEnergy = getRestedEnergy(newMaxEnergy);
    const buildRemainingScheduledEvents = (selectedEventId?: string) => [
      ...pendingScheduledEvents,
      ...dueScheduledEvents
        .filter(evt => evt.id !== selectedEventId)
        .map(evt => ({ ...evt, remainingTurns: evt.remainingTurns ?? 0 })),
    ];

    if (newAge >= 18) {
      const endingResolution = resolveEnding({
        gameState,
        stats,
        achievements: gameState.unlockedAchievements,
      });
      const careerResult = endingResolution.result;
      void logGameEnding({
        age: newAge,
        stats: {
          health: stats.health,
          intelligence: stats.intelligence,
          charisma: stats.charisma,
          discipline: stats.discipline,
          money: stats.money,
          energy: stats.energy,
        },
        playtimeMinutes: Math.max(0, Math.round(newTotalTurns * 5)),
        endingType: endingResolution.id,
      });
      advanceTurnInContext({
        newStats: didAgeUp ? { money: moneyAfterAllowance } : {},
        newGameState: {
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
              ...stats,
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
          void logTurnProgress(newAge, {
            health: stats.health,
            intelligence: stats.intelligence,
            charisma: stats.charisma,
            discipline: stats.discipline,
            money: moneyAfterAllowance,
            energy: newEnergy,
          }, {
            turn: newTurn,
            totalTurns: newTotalTurns,
            maxEnergy: newMaxEnergy,
            energySpent: Math.max(0, gameState.maxEnergy - stats.energy),
          });
          logSelectedEventAnalytics(forcedEvent, newAge, newTurn);
          advanceTurnInContext({
            newStats: didAgeUp ? { energy: newEnergy, money: moneyAfterAllowance } : { energy: newEnergy },
            newGameState: {
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
          ...stats,
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
      void logTurnProgress(newAge, {
        health: stats.health,
        intelligence: stats.intelligence,
        charisma: stats.charisma,
        discipline: stats.discipline,
        money: moneyAfterAllowance,
        energy: newEnergy,
      }, {
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
        newStats: didAgeUp ? { energy: newEnergy, money: moneyAfterAllowance } : { energy: newEnergy },
        newGameState: {
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
        }
      });
      return;
    }

    const forcedGoalEvent = pickGoalMilestoneEvent(gameState, stats, newAge);
    if (forcedGoalEvent) {
      const goalEventContext: EventContext = {
        ...buildEventContext(),
        age: newAge,
        stress: stressAfterRecovery,
        npcs: updatedNPCs,
        stats: {
          ...stats,
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
      void logTurnProgress(newAge, {
        health: stats.health,
        intelligence: stats.intelligence,
        charisma: stats.charisma,
        discipline: stats.discipline,
        money: moneyAfterAllowance,
        energy: newEnergy,
      }, {
        turn: newTurn,
        totalTurns: newTotalTurns,
        maxEnergy: newMaxEnergy,
        energySpent: Math.max(0, gameState.maxEnergy - stats.energy),
      });
      logSelectedEventAnalytics(forcedGoalEvent, newAge, newTurn);
      advanceTurnInContext({
        newStats: didAgeUp ? { energy: newEnergy, money: moneyAfterAllowance } : { energy: newEnergy },
        newGameState: {
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
        }
      });
      return;
    }

    void logTurnProgress(newAge, {
      health: stats.health,
      intelligence: stats.intelligence,
      charisma: stats.charisma,
      discipline: stats.discipline,
      money: moneyAfterAllowance,
      energy: newEnergy,
    }, {
      turn: newTurn,
      totalTurns: newTotalTurns,
      maxEnergy: newMaxEnergy,
      energySpent: Math.max(0, gameState.maxEnergy - stats.energy),
    });

    // S\u0131nav d\u00F6nemindeyse event y\u00FCkleme - s\u0131nav ekran\u0131 g\u00F6sterilecek
    if (isExamPeriod) {
      advanceTurnInContext({
        newStats: didAgeUp ? { energy: newEnergy, money: moneyAfterAllowance } : { energy: newEnergy },
        newGameState: {
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
            ...stats,
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
        newStats: didAgeUp ? { energy: newEnergy, money: moneyAfterAllowance } : { energy: newEnergy },
        newGameState: {
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
        ...stats,
        energy: newEnergy,
        money: moneyAfterAllowance,
      },
    };
    const allSeenEvents = getEventChoiceSet(gameState);
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
        newStats: didAgeUp ? { energy: newEnergy, money: moneyAfterAllowance } : { energy: newEnergy },
        newGameState: {
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
        }
      });
      return;
    }

    const cachedEligibleEvents = getCachedEligibleEvents(ctx);
    const arcSelection = selectStoryArcEvent({
      arcs: STORY_ARCS,
      activeArcs: currentActiveArcs,
      events: cachedEligibleEvents,
      context: ctx,
      recentEventIds: gameState.recentEvents,
      allSeenEvents,
    });
    const randomEvent = selectEventWithAdaptivePacing(
      cachedEligibleEvents,
      ctx,
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
    const evt = arcSelection.event ?? randomEvent;
    const nextActiveArcs = arcSelection.event
      ? arcSelection.activeArcs
      : syncActiveArcsWithSelectedEvent(currentActiveArcs, STORY_ARCS, evt.id, ctx);

    const advWindowSize = getRecencyWindowSize(newAge);
    const advFrequency = {
      ...gameState.eventFrequency,
      [evt.id]: {
        count: ((gameState.eventFrequency ?? {})[evt.id]?.count ?? 0) + 1,
        lastSeenTurn: newTurn,
      },
    };
    logSelectedEventAnalytics(evt, newAge, newTurn);
    advanceTurnInContext({
      newStats: didAgeUp ? { energy: newEnergy, money: moneyAfterAllowance } : { energy: newEnergy },
      newGameState: {
        age: newAge,
        turn: newTurn,
        totalTurns: newTotalTurns,
        phase: 'EVENT',
        currentEvent: evt,
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
      }
    });
  }, [advanceTurnInContext, buildEventContext, gameState, getBurdenRisk, getCachedEligibleEvents, logSelectedEventAnalytics, stats]);

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
    });

    if (turnResult.newStats !== stats) {
      setStats(turnResult.newStats);
    }
    updateGameState(turnResult.gameStateUpdates);
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

  return {
    currentEvent: gameState.currentEvent,
    selectNewEvent,
    handleEventChoice,
    rerollChoice,
    resolveChoice,
    resolveEventText,
    advanceTurn,
    markExamTaken,
    completeExamPeriod,
  };
};
