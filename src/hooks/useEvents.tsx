import { useCallback, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { Choice, EventContext, GameEvent, LogEntry, Stats } from '../types';
import { EVENTS, FALLBACK_EVENT, HOSPITAL_EVENT } from '../data/events';
import {
  checkTraitFormation,
  shouldAgeUp,
  calculateEnergyCost,
  shouldGenerateReportCard,
  updateStats as updateStatsWithCaps,
  getStatCap,
  calculateCareerResult
} from '../utils/gameUtils';
import { calculateSchoolReport } from '../utils/schoolLogic';

const selectEvent = (context: EventContext, recentEventIds: string[]): GameEvent => {
  const candidateEvents = EVENTS.filter(evt => {
    if (evt.minAge > context.age || evt.maxAge < context.age) return false;
    if (evt.reqStats) {
      for (const [key, value] of Object.entries(evt.reqStats)) {
        if (context.stats[key as keyof typeof context.stats] < value) return false;
      }
    }
    if (evt.reqTraits && !evt.reqTraits.every(t => context.traits?.includes(t))) return false;
    if (evt.reqNoItem && evt.reqNoItem.some(itemId => context.inventory?.includes(itemId))) return false;
    if (!evt.isRepeatable && recentEventIds.includes(evt.id)) return false;
    return true;
  });

  if (candidateEvents.length === 0) return FALLBACK_EVENT;

  const weighted = candidateEvents.map(e => ({
    event: e,
    weight: (e.rarity === 'RARE' ? 5 : e.rarity === 'UNCOMMON' ? 25 : 70),
  }));

  const totalWeight = weighted.reduce((acc, w) => acc + w.weight, 0);
  let rand = Math.random() * totalWeight;

  for (const { event, weight } of weighted) {
    rand -= weight;
    if (rand <= 0) return event;
  }

  return FALLBACK_EVENT;
};

export const useEvents = () => {
  const { gameState, stats, playerName, setGameState, updateGameState, updateStats } = useGame();

  const buildEventContext = useCallback((): EventContext => ({
    age: gameState.age,
    stats,
    gameState,
    traits: gameState.traits,
    family: gameState.family,
    npcs: gameState.npcs,
    inventory: gameState.inventory,
    memories: gameState.memories,
  }), [gameState, stats]);

  const resolveEventText = useCallback((evt: GameEvent): string => {
    const ctx = buildEventContext();
    return typeof evt.text === 'function' ? evt.text(ctx) : evt.text;
  }, [buildEventContext]);

  const resolveChoice = useCallback((choice: Choice | ((ctx: EventContext) => Choice)): Choice => {
    const ctx = buildEventContext();
    return typeof choice === 'function' ? choice(ctx) : choice;
  }, [buildEventContext]);

  const selectNewEvent = useCallback(() => {
    const ctx = buildEventContext();
    const evt = selectEvent(ctx, gameState.recentEvents);
    updateGameState({
      currentEvent: evt,
      phase: 'EVENT',
      recentEvents: [...gameState.recentEvents, evt.id].slice(-6),
    });
  }, [gameState.recentEvents, buildEventContext, updateGameState]);

  const handleEventChoice = useCallback((choice: Choice | ((ctx: EventContext) => Choice), choiceIndex?: number) => {
    const resolved = resolveChoice(choice);
    const eventId = gameState.currentEvent?.id || '';

    const newActionCounts = { ...gameState.actionCounts };
    const newEventHistory = [...gameState.eventChoiceHistory];
    if (eventId) newEventHistory.push(eventId);

    // İSTATİSTİK GÜNCELLEMELERİ (KRİTİK)
    // Event seçiminde stat güncellemeleri
    let statChanges: Partial<Stats> = resolved.effect || {};
    
    // Grade ve skill güncellemeleri
    let gradeUpdates = resolved.gradeUpdates || {};
    let skillUpdates = resolved.skillUpdates || {};
    
    // Stat güncellemelerini uygula (caps ile birlikte)
    if (Object.keys(statChanges).length > 0) {
      statChanges = updateStatsWithCaps(
        stats,
        statChanges,
        gameState.age,
        gameState.family,
        gameState.traits
      );
    }

    // Check trait formation with proper signature
    const traitResult = checkTraitFormation(
      null, // actionId
      eventId, // choiceId
      gameState,
      stats
    );
    const newTraits = [...gameState.traits, ...traitResult.newTraits];

    const historyEntry: LogEntry = {
      id: `log_${Date.now()}`,
      age: gameState.age,
      message: resolved.feedback,
      type: resolved.effect?.health > 0 ? 'positive' : 'negative',
      eventId,
    };

    updateGameState({
      phase: 'RESULT',
      lastResult: {
        feedback: resolved.feedback,
        changes: statChanges,
      },
      historyLog: [...gameState.historyLog, historyEntry],
      actionCounts: newActionCounts,
      eventChoiceHistory: newEventHistory,
      traits: newTraits,
      traitProgress: traitResult.updatedProgress,
      schoolGrades: { ...gameState.schoolGrades, ...gradeUpdates },
      skills: { ...gameState.skills, ...skillUpdates },
    });
  }, [gameState, stats, updateGameState, resolveChoice]);

  const advanceTurn = useCallback(() => {
    const newTurn = gameState.turn + 1;
    
    // YAŞLANMA ALGORİTMASI (KRİTİK)
    // GDD Şartı: 0-7 yaş: Her 2 tur, 7-18 yaş: Her 5 tur
    let newAge = gameState.age;
    if (shouldAgeUp(gameState.age, newTurn)) {
      newAge = gameState.age + 1;
    }
    
    // OKUL SİSTEMİ (YÜKSEK)
    // GDD Şartı: Her 5 tur (7-18 yaş) rapor kartı
    let pendingReportCard = gameState.pendingReportCard;
    if (shouldGenerateReportCard(newAge, newTurn)) {
      const newGrades = calculateSchoolReport(stats, gameState);
      pendingReportCard = true;
      updateGameState({
        schoolGrades: newGrades,
        pendingReportCard,
      });
    }
    
    // OYUN SONU (Age 18) (KRİTİK)
    // GDD Şartı: Age 18'de oyun bitmeli ve kariyer sonucu gösterilmeli
    if (newAge >= 18) {
      const careerResult = calculateCareerResult(gameState, stats);
      updateGameState({
        phase: 'GAME_OVER',
        age: newAge,
        turn: newTurn,
        lastResult: {
          feedback: careerResult.description,
          changes: {},
        },
      });
      return;
    }
    
    // Reset energy for new turn
    const newEnergy = gameState.maxEnergy;
    updateStats({ energy: newEnergy });
    
    // Update game state for new turn
    updateGameState({
      age: newAge,
      turn: newTurn,
      phase: 'HUB',
      currentEvent: null,
      lastResult: null,
    });
    
    // Select a new event for this turn
    selectNewEvent();
  }, [gameState.age, gameState.turn, gameState.maxEnergy, gameState.pendingReportCard, updateGameState, updateStats, selectNewEvent, stats]);

  return {
    currentEvent: gameState.currentEvent,
    selectNewEvent,
    handleEventChoice,
    resolveChoice,
    resolveEventText,
    buildEventContext,
    advanceTurn,
  };
};
