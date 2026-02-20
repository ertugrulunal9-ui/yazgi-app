import { StatEngine } from './StatEngine';
import { TriggerManager } from './TriggerManager';
import { resolveOutcome } from './ConditionalOutcomeResolver';
import { rollFate, rollFateForced, applyFateToStatChanges } from './FateEngine';
import {
  applyMomentumSignal,
  HIGH_MOMENTUM_THRESHOLD,
  MOMENTUM_TENDENCY_LABELS,
  normalizePersonalityState,
  resolveMomentumSignal,
} from './PersonalityMomentumEngine';
import {
  Choice,
  EventContext,
  FateRollResult,
  FateState,
  GameState,
  GameStateUpdate,
  LogEntry,
  NPC,
  PersonalityMomentumSignal,
  PersonalityState,
  PersonalityTendency,
  ScheduledEvent,
  SchoolGrades,
  Stats,
} from '../types';
import { applySkillUpdates, checkTraitFormation, getMaxEnergy } from '../utils/gameUtils';
import { calculateEndingErrorDebt } from '../utils/endingResolver';
import { calculateOutcomeScore, updateAdaptivePacingStreak } from '../utils/eventSelection';

export interface ChoiceContext {
  choice: Choice;
  choiceIndex?: number;
  gameState: GameState;
  stats: Stats;
  forceGoodFate?: boolean;
}

export interface TurnResult {
  eventId: string;
  choice: Choice;
  choiceIndexForAnalytics: number;
  newStats: Stats;
  gameStateUpdates: GameStateUpdate;
  appliedChanges: Partial<Stats>;
  newTraits: string[];
  fateRoll?: FateRollResult;
  momentumFeedback?: MomentumFeedback;
}

export interface MomentumFeedback {
  tendency: PersonalityTendency;
  tendencyLabel: string;
  multiplier: number;
  multiplierDelta: number;
  streak: number;
  streakBroken: boolean;
  unlockedNow: boolean;
  bonusPercent: number;
  feedbackText: string;
}

const MOMENTUM_TENDENCIES: PersonalityTendency[] = ['HELPFUL', 'PRAGMATIC', 'AGGRESSIVE'];

const isTendencySignal = (
  signal: PersonalityMomentumSignal | null
): signal is PersonalityTendency => (
  signal === 'HELPFUL' || signal === 'PRAGMATIC' || signal === 'AGGRESSIVE'
);

const roundTo2 = (value: number): number => Math.round(value * 100) / 100;

const buildMomentumFeedback = (
  previousState: Partial<PersonalityState> | undefined,
  nextState: PersonalityState,
  signal: PersonalityMomentumSignal | null
): MomentumFeedback | undefined => {
  const previous = normalizePersonalityState(previousState);
  const next = normalizePersonalityState(nextState);

  if (isTendencySignal(signal)) {
    const prevEntry = previous[signal];
    const nextEntry = next[signal];
    const multiplierDelta = roundTo2(nextEntry.multiplier - prevEntry.multiplier);
    const bonusPercent = Math.max(0, Math.round((nextEntry.multiplier - 1) * 100));

    return {
      tendency: signal,
      tendencyLabel: MOMENTUM_TENDENCY_LABELS[signal],
      multiplier: nextEntry.multiplier,
      multiplierDelta,
      streak: nextEntry.streak,
      streakBroken: false,
      unlockedNow: prevEntry.multiplier < HIGH_MOMENTUM_THRESHOLD
        && nextEntry.multiplier >= HIGH_MOMENTUM_THRESHOLD,
      bonusPercent,
      feedbackText: bonusPercent > 0
        ? `+%${bonusPercent} Momentum Bonusu!`
        : `${MOMENTUM_TENDENCY_LABELS[signal]} ritmi gucleniyor!`,
    };
  }

  for (const tendency of MOMENTUM_TENDENCIES) {
    const prevEntry = previous[tendency];
    const nextEntry = next[tendency];
    if (prevEntry.streak > nextEntry.streak && prevEntry.streak >= 3) {
      return {
        tendency,
        tendencyLabel: MOMENTUM_TENDENCY_LABELS[tendency],
        multiplier: nextEntry.multiplier,
        multiplierDelta: roundTo2(nextEntry.multiplier - prevEntry.multiplier),
        streak: nextEntry.streak,
        streakBroken: true,
        unlockedNow: false,
        bonusPercent: Math.max(0, Math.round((nextEntry.multiplier - 1) * 100)),
        feedbackText: `${MOMENTUM_TENDENCY_LABELS[tendency]} ivmesi kirildi!`,
      };
    }
  }

  return undefined;
};

export class TurnMediator {
  processEventChoice(context: ChoiceContext): TurnResult {
    const { choice, choiceIndex, gameState, stats, forceGoodFate } = context;

    const eventId = gameState.currentEvent?.id || '';
    const choiceKey = choice.id ?? (typeof choiceIndex === 'number' ? String(choiceIndex) : null);
    const choiceIndexForAnalytics = typeof choiceIndex === 'number' ? choiceIndex : 0;

    const newActionCounts = { ...gameState.actionCounts };
    const newEventHistory = [...gameState.eventChoiceHistory];
    if (eventId) {
      newEventHistory.push(eventId);
    }

    // === KADER RULOSU ===
    let fateRollResult: FateRollResult | undefined;
    let updatedFate: FateState | undefined = gameState.fate;
    const personalityCategory = gameState.currentEvent?.personalityCategory;

    if (updatedFate) {
      const fateRoll = forceGoodFate
        ? rollFateForced(updatedFate, personalityCategory)
        : rollFate(updatedFate, personalityCategory);
      fateRollResult = fateRoll.result;
      updatedFate = fateRoll.nextState;
    }

    // === KOŞULLU SONUÇ ÇÖZÜMLEME ===
    const eventContext: EventContext = {
      age: gameState.age,
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
    };
    const resolved = resolveOutcome(choice, eventContext, fateRollResult);

    // Resolve edilen sonucu Choice üzerine birleştir (TriggerManager uyumluluğu)
    const effectiveChoice: Choice = {
      ...choice,
      effect: resolved.statChanges,
      feedback: resolved.feedback,
      ...(resolved.personalityEffects ? { personalityEffects: resolved.personalityEffects } : {}),
      ...(resolved.momentumTag ? { momentumTag: resolved.momentumTag } : {}),
      ...(resolved.stressEffect !== undefined ? { stressEffect: resolved.stressEffect } : {}),
      ...(resolved.skillUpdates ? { skillUpdates: resolved.skillUpdates } : {}),
      ...(resolved.gradeUpdates ? { gradeUpdates: resolved.gradeUpdates } : {}),
    };

    // Memory override from conditional outcome
    if (resolved.source === 'conditional' && resolved.memoryEmotion) {
      effectiveChoice.memory = {
        emotion: resolved.memoryEmotion,
        weight: resolved.memoryWeight ?? 'MEDIUM',
      };
    }

    // === STAT UYGULAMASI (fate modifikasyonlu) ===
    let effectToApply = effectiveChoice.effect || {};
    if (fateRollResult) {
      effectToApply = applyFateToStatChanges(effectToApply, fateRollResult.outcome);
    }

    const momentumSignal = resolveMomentumSignal({
      momentumTag: effectiveChoice.momentumTag,
      personalityEffects: effectiveChoice.personalityEffects,
      statEffect: effectToApply,
    });
    const isCrisisEvent = gameState.currentEvent?.personalityCategory === 'BREAKDOWN';
    const momentumResult = applyMomentumSignal(gameState.personalityState, momentumSignal, { isCrisisContext: isCrisisEvent });
    const momentumFeedback = buildMomentumFeedback(
      gameState.personalityState,
      momentumResult.nextState,
      momentumSignal
    );

    let appliedChanges: Partial<Stats> = {};
    let statsAfterChoice = stats;
    const burdenRisk = calculateEndingErrorDebt(gameState, stats).total;
    if (Object.keys(effectToApply).length > 0) {
      const statResult = StatEngine.applyChanges(stats, effectToApply, {
        age: gameState.age,
        family: gameState.family,
        traits: gameState.traits,
        personalityState: momentumResult.nextState,
        burdenRisk,
      });
      statsAfterChoice = statResult.newStats;
      appliedChanges = statResult.appliedChanges;
    }

    const triggerResults = TriggerManager.processChoice({
      gameState,
      stats,
      choice: effectiveChoice,
      eventId,
    });

    const gradeUpdates: Partial<SchoolGrades> = effectiveChoice.gradeUpdates || {};
    const skillUpdates = effectiveChoice.skillUpdates || {};
    const skillResult = Object.keys(skillUpdates).length > 0
      ? applySkillUpdates(gameState.skills, skillUpdates, gameState.traits)
      : { newSkills: gameState.skills, appliedChanges: {} };

    const traitResult = checkTraitFormation(
      null,
      choiceKey,
      gameState,
      statsAfterChoice
    );
    const newTraits = [...gameState.traits, ...traitResult.newTraits];
    const nextMaxEnergy = getMaxEnergy(gameState.age, gameState.family, newTraits);
    const finalStats = statsAfterChoice.energy > nextMaxEnergy
      ? { ...statsAfterChoice, energy: nextMaxEnergy }
      : statsAfterChoice;

    const newMemories = triggerResults.memoryToStore
      ? [...gameState.memories, triggerResults.memoryToStore]
      : gameState.memories;

    const inventoryAdd = choice.inventoryAdd || [];
    const nextInventory = inventoryAdd.length > 0
      ? Array.from(new Set([...(gameState.inventory || []), ...inventoryAdd]))
      : gameState.inventory;

    // Merge futureEvents from choice + conditional outcome scheduleEvent
    const baseFutureEvents = choice.futureEvents || [];
    const conditionalSchedule = resolved.source === 'conditional' && resolved.scheduleEvent
      ? [resolved.scheduleEvent]
      : [];
    const futureEvents = [...baseFutureEvents, ...conditionalSchedule];
    const newScheduledEvents = futureEvents.length > 0
      ? [
        ...(gameState.scheduledEvents || []),
        ...futureEvents.map(config => ({
          id: `scheduled_${eventId}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          eventId: config.eventId,
          triggerAge: config.trigger === 'AGE' ? config.age : undefined,
          remainingTurns: config.trigger === 'TURNS' ? (config.turnsLater ?? 1) : undefined,
          condition: config.condition,
          priority: config.priority ?? 'NORMAL',
          sourceEventId: eventId,
        })),
      ]
      : (gameState.scheduledEvents || []);

    const updatedNPCs = this.updateRelationships(gameState.npcs, choice.npcRelationChange, gameState.turn);

    // Set pendingCliffhanger for cliffhanger events (id starts with "cliff_")
    const pendingCliffhanger = eventId.startsWith('cliff_') && futureEvents.length > 0
      ? {
          type: 'SCHEDULED_EVENT' as const,
          title: typeof gameState.currentEvent?.text === 'function'
            ? 'Merak ediyorum...'
            : (String(gameState.currentEvent?.text || '').slice(0, 60) + '...'),
          description: effectiveChoice.feedback,
        }
      : gameState.pendingCliffhanger;

    const historyEntry: LogEntry = {
      id: `log_${Date.now()}`,
      age: gameState.age,
      message: effectiveChoice.feedback,
      type: (effectToApply?.health ?? 0) > 0 ? 'positive' : 'negative',
      eventId,
    };

    const outcomeScore = calculateOutcomeScore(
      appliedChanges,
      skillResult.appliedChanges,
      gradeUpdates,
      gameState.currentEvent?.difficulty ?? 1
    );
    const nextAdaptivePacingStreak = updateAdaptivePacingStreak(
      gameState.adaptivePacingStreak ?? 0,
      outcomeScore
    );

    return {
      eventId,
      choice,
      choiceIndexForAnalytics,
      newStats: finalStats,
      fateRoll: fateRollResult,
      momentumFeedback,
      gameStateUpdates: {
        phase: 'RESULT',
        ...(effectiveChoice.setSelectedGoal !== undefined
          ? { selectedGoal: effectiveChoice.setSelectedGoal }
          : {}),
        lastResult: {
          feedback: effectiveChoice.feedback,
          changes: appliedChanges,
          skillChanges: skillResult.appliedChanges,
          gradeChanges: gradeUpdates,
          traitProgressUpdates: traitResult.progressUpdates,
          fateRoll: fateRollResult,
        },
        historyLog: [...gameState.historyLog, historyEntry],
        actionCounts: newActionCounts,
        eventChoiceHistory: newEventHistory,
        traits: newTraits,
        traitProgress: traitResult.updatedProgress,
        schoolGrades: { ...gameState.schoolGrades, ...gradeUpdates },
        skills: skillResult.newSkills,
        npcs: updatedNPCs,
        inventory: nextInventory,
        scheduledEvents: newScheduledEvents as ScheduledEvent[],
        maxEnergy: nextMaxEnergy,
        stress: triggerResults.stressUpdate,
        personality: triggerResults.personalityUpdate,
        personalityHistory: [...gameState.personalityHistory, ...triggerResults.personalityShifts],
        personalityState: momentumResult.nextState,
        memories: newMemories,
        adaptivePacingStreak: nextAdaptivePacingStreak,
        fate: updatedFate,
        pendingCliffhanger,
      },
      appliedChanges,
      newTraits: traitResult.newTraits,
    };
  }

  private updateRelationships(npcs: NPC[], relationChange: number | undefined, currentTurn: number): NPC[] {
    if (relationChange === undefined || relationChange === null || npcs.length === 0) {
      return npcs;
    }

    return npcs.map(npc => {
      const newRelationship = Math.max(-100, Math.min(100, npc.relationship + relationChange));

      let newRole = npc.role;
      if (npc.romance >= 70 && newRelationship > 0) {
        newRole = 'PARTNER';
      } else if (npc.romance >= 30 && newRelationship > 0) {
        newRole = 'CRUSH';
      } else if (newRelationship <= -50) {
        newRole = 'ENEMY';
      } else if (newRelationship <= -20) {
        newRole = 'RIVAL';
      } else if (newRelationship >= 75) {
        newRole = 'BEST_FRIEND';
      } else if (newRelationship >= 40) {
        newRole = 'FRIEND';
      } else if (newRelationship >= 0) {
        newRole = 'ACQUAINTANCE';
      }

      return {
        ...npc,
        relationship: newRelationship,
        role: newRole,
        lastInteraction: currentTurn,
      };
    });
  }
}

export default TurnMediator;
