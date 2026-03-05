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
  FateOutcome,
  FateRollResult,
  FateState,
  GameState,
  GameStateUpdate,
  LogEntry,
  NPC,
  PersonalityMomentumSignal,
  PersonalityState,
  PersonalityTendency,
  SocialGroup,
  ScheduledEvent,
  SchoolGrades,
  Stats,
  TraitChangeFeedback,
} from '../types';
import { applySkillUpdates, checkTraitFormation, getMaxEnergy, resolveTraitChanges } from '../utils/gameUtils';
import { calculateEndingErrorDebt } from '../utils/endingResolver';
import { calculateOutcomeScore, updateAdaptivePacingStreak } from '../utils/eventSelection';
import { buildTraitChangeFeedback } from '../utils/traitFeedback';
import { PACING_CONSTANTS } from '../constants/gameConstants';
import { tRuntime } from '../i18n/strings';

export interface ChoiceContext {
  choice: Choice;
  choiceIndex?: number;
  gameState: GameState;
  stats: Stats;
  forceGoodFate?: boolean;
  previousFateOutcome?: FateOutcome;
}

export interface TurnResult {
  eventId: string;
  choice: Choice;
  choiceIndexForAnalytics: number;
  newStats: Stats;
  gameStateUpdates: GameStateUpdate;
  appliedChanges: Partial<Stats>;
  newTraits: string[];
  removedTraits: string[];
  traitChanges: TraitChangeFeedback[];
  fateRoll?: FateRollResult;
  momentumFeedback?: MomentumFeedback;
  /**
   * True when energy hit 0 but the player had fewer than
   * PACING_CONSTANTS.MIN_DECISIONS_PER_DAY decisions this day.
   * The caller should inject a recovery event instead of advancing the day.
   */
  shouldForceRecovery: boolean;
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

interface SocialGroupActionResult {
  socialGroups: SocialGroup[];
  npcs: NPC[];
}

const MOMENTUM_TENDENCIES: PersonalityTendency[] = ['HELPFUL', 'PRAGMATIC', 'AGGRESSIVE'];
const MOMENTUM_FLAVOR_STREAK_THRESHOLD = 10;
const MOMENTUM_FLAVOR_REPEAT_INTERVAL = 5;

const MOMENTUM_FLAVOR_TEXTS: Record<PersonalityTendency, string> = {
  HELPFUL: 'Yardimsever ruhun gucleniyor!',
  PRAGMATIC: 'Pragmatik ruhun gucleniyor!',
  AGGRESSIVE: 'Agresif ruhun gucleniyor!',
};

const FATE_OUTCOME_LABELS: Record<FateOutcome, string> = {
  CURSED: 'Lanetli',
  UNLUCKY: 'Sanssiz',
  NEUTRAL: 'Notr',
  FORTUNATE: 'Sansli',
  BLESSED: 'Kutsanmis',
};

const FATE_OUTCOME_STRENGTH: Record<FateOutcome, number> = {
  CURSED: 0,
  UNLUCKY: 1,
  NEUTRAL: 2,
  FORTUNATE: 3,
  BLESSED: 4,
};

const getMomentumTendencyLabel = (tendency: PersonalityTendency): string => (
  tRuntime(
    `feedback.momentum.tendencies.${tendency}`,
    undefined,
    MOMENTUM_TENDENCY_LABELS[tendency]
  )
);

const getMomentumFlavorText = (tendency: PersonalityTendency): string => (
  tRuntime(
    `feedback.momentum.flavor.${tendency}`,
    undefined,
    MOMENTUM_FLAVOR_TEXTS[tendency]
  )
);

const getFateOutcomeLabel = (outcome: FateOutcome): string => (
  tRuntime(`feedback.fateLabels.${outcome}`, undefined, FATE_OUTCOME_LABELS[outcome])
);

const isTendencySignal = (
  signal: PersonalityMomentumSignal | null
): signal is PersonalityTendency => (
  signal === 'HELPFUL' || signal === 'PRAGMATIC' || signal === 'AGGRESSIVE'
);

const roundTo2 = (value: number): number => Math.round(value * 100) / 100;
const clampGrade = (value: number): number => Math.max(0, Math.min(100, value));

const applyGradeUpdates = (
  currentGrades: SchoolGrades,
  gradeUpdates: Partial<SchoolGrades>
): SchoolGrades => {
  const nextGrades: SchoolGrades = { ...currentGrades };

  (Object.keys(gradeUpdates) as Array<keyof SchoolGrades>).forEach((subject) => {
    const delta = gradeUpdates[subject];
    if (typeof delta !== 'number' || Number.isNaN(delta)) return;
    const currentValue = typeof nextGrades[subject] === 'number' ? nextGrades[subject] : 0;
    nextGrades[subject] = clampGrade(currentValue + delta);
  });

  return nextGrades;
};

const shouldShowMomentumFlavorFeedback = (
  previousStreak: number,
  nextStreak: number
): boolean => {
  if (nextStreak < MOMENTUM_FLAVOR_STREAK_THRESHOLD) return false;
  if (previousStreak < MOMENTUM_FLAVOR_STREAK_THRESHOLD) return true;
  return nextStreak % MOMENTUM_FLAVOR_REPEAT_INTERVAL === 0;
};

const buildForcedFateFeedback = (
  previousOutcome: FateOutcome | undefined,
  nextOutcome: FateOutcome
): string => {
  const nextLabel = getFateOutcomeLabel(nextOutcome);
  if (!previousOutcome) {
    return tRuntime(
      'feedback.fateTokenUsed',
      { outcome: nextLabel },
      `Token kullandin: yeni kaderin ${nextLabel}.`
    );
  }

  const previousLabel = getFateOutcomeLabel(previousOutcome);
  if (previousOutcome === nextOutcome) {
    return tRuntime(
      'feedback.fateTokenFixed',
      { outcome: nextLabel },
      `Token kullandin: kader sonucun ${nextLabel} olarak sabitlendi.`
    );
  }

  const previousStrength = FATE_OUTCOME_STRENGTH[previousOutcome];
  const nextStrength = FATE_OUTCOME_STRENGTH[nextOutcome];

  if (nextStrength > previousStrength) {
    return tRuntime(
      'feedback.fateTokenImproved',
      { from: previousLabel, to: nextLabel },
      `Token sayesinde sansin dondu: ${previousLabel} -> ${nextLabel}`
    );
  }

  return tRuntime(
    'feedback.fateTokenChanged',
    { from: previousLabel, to: nextLabel },
    `Token etkisi: ${previousLabel} -> ${nextLabel}`
  );
};

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
    const tendencyLabel = getMomentumTendencyLabel(signal);
    const multiplierDelta = roundTo2(nextEntry.multiplier - prevEntry.multiplier);
    const bonusPercent = Math.max(0, Math.round((nextEntry.multiplier - 1) * 100));
    const shouldShowFlavor = shouldShowMomentumFlavorFeedback(prevEntry.streak, nextEntry.streak);
    const feedbackText = shouldShowFlavor
      ? `${getMomentumFlavorText(signal)} ${tRuntime(
        'feedback.momentum.highMomentum',
        { percent: bonusPercent },
        '+{percent}% Momentum Bonusu!'
      )}`
      : (bonusPercent > 0
        ? tRuntime(
          'feedback.momentum.highMomentum',
          { percent: bonusPercent },
          '+{percent}% Momentum Bonusu!'
        )
        : tRuntime(
          'feedback.momentum.strengthening',
          { tendency: tendencyLabel },
          `${tendencyLabel} ritmi gucleniyor!`
        ));

    return {
      tendency: signal,
      tendencyLabel,
      multiplier: nextEntry.multiplier,
      multiplierDelta,
      streak: nextEntry.streak,
      streakBroken: false,
      unlockedNow: prevEntry.multiplier < HIGH_MOMENTUM_THRESHOLD
        && nextEntry.multiplier >= HIGH_MOMENTUM_THRESHOLD,
      bonusPercent,
      feedbackText,
    };
  }

  for (const tendency of MOMENTUM_TENDENCIES) {
    const prevEntry = previous[tendency];
    const nextEntry = next[tendency];
    if (prevEntry.streak > nextEntry.streak && prevEntry.streak >= 3) {
      const tendencyLabel = getMomentumTendencyLabel(tendency);
      return {
        tendency,
        tendencyLabel,
        multiplier: nextEntry.multiplier,
        multiplierDelta: roundTo2(nextEntry.multiplier - prevEntry.multiplier),
        streak: nextEntry.streak,
        streakBroken: true,
        unlockedNow: false,
        bonusPercent: Math.max(0, Math.round((nextEntry.multiplier - 1) * 100)),
        feedbackText: tRuntime(
          'feedback.momentum.streakBroken',
          { tendency: tendencyLabel },
          `${tendencyLabel} ritmi kirildi!`
        ),
      };
    }
  }

  return undefined;
};

export class TurnMediator {
  processEventChoice(context: ChoiceContext): TurnResult {
    const { choice, choiceIndex, gameState, stats, forceGoodFate, previousFateOutcome } = context;

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
    const forcedFateFeedback = forceGoodFate && fateRollResult
      ? buildForcedFateFeedback(previousFateOutcome, fateRollResult.outcome)
      : undefined;

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
    let statNarrativeFeedback: string[] = [];
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
      statNarrativeFeedback = StatEngine.getStatChangeNarrativeFeedback(statResult.details);
    }

    const triggerResults = TriggerManager.processChoice({
      gameState,
      stats,
      choice: effectiveChoice,
      eventId,
    });

    const gradeUpdates: Partial<SchoolGrades> = effectiveChoice.gradeUpdates || {};
    const nextSchoolGrades = applyGradeUpdates(gameState.schoolGrades, gradeUpdates);
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
    const grantedTraits = effectiveChoice.grantTraits || [];
    // Scar protection: filter out traits shielded by active scars
    const activeScars = gameState.scars ?? [];
    const scarProtectedTraits = new Set(activeScars.flatMap(s => s.traitProtection ?? []));
    const filteredRemovedTraits = traitResult.removedTraits.filter(t => !scarProtectedTraits.has(t));
    const traitResolution = resolveTraitChanges({
      currentTraits: gameState.traits,
      gainedTraits: [...traitResult.newTraits, ...grantedTraits],
      removedTraits: filteredRemovedTraits,
    });
    // Accumulate scars granted by this choice
    const newScars = choice.grantScars
      ? [
          ...activeScars,
          ...choice.grantScars
            .filter(s => !activeScars.some(existing => existing.id === s.id))
            .map(s => ({ ...s, sourceAge: gameState.age })),
        ]
      : activeScars;
    const nextTraitProgress = { ...traitResult.updatedProgress };
    [...traitResolution.gainedTraits, ...traitResolution.removedTraits].forEach(traitId => {
      if (nextTraitProgress[traitId]) {
        delete nextTraitProgress[traitId];
      }
    });
    const nextMaxEnergy = getMaxEnergy(gameState.age, gameState.family, traitResolution.traits);
    const finalStats = statsAfterChoice.energy > nextMaxEnergy
      ? { ...statsAfterChoice, energy: nextMaxEnergy }
      : statsAfterChoice;
    const traitChanges = buildTraitChangeFeedback(
      traitResolution.gainedTraits,
      traitResolution.removedTraits
    );

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
    const socialGroupResult = this.applySocialGroupAction(
      choice.socialGroupAction,
      gameState.socialGroups || [],
      updatedNPCs,
      gameState.age,
      gameState.turn
    );
    const nextPurchasedItems = (
      choice.tags?.includes('shopping') && choice.itemId
    )
      ? Array.from(new Set([...(gameState.purchasedItems || []), choice.itemId]))
      : (gameState.purchasedItems || []);

    const continuationEventId = futureEvents[0]?.eventId ?? gameState.currentEvent?.continuationEventId;
    const generatedPendingCliffhanger = eventId.startsWith('cliff_') && futureEvents.length > 0
      ? {
          type: 'SCHEDULED_EVENT' as const,
          title: typeof gameState.currentEvent?.text === 'function'
            ? 'Merak ediyorum...'
            : (String(gameState.currentEvent?.text || '').slice(0, 60) + '...'),
          description: effectiveChoice.feedback,
          continuationEventId,
          sourceEventId: eventId,
        }
      : undefined;

    // Clear previous cliffhanger only after its continuation event is shown and resolved.
    const shouldClearPendingCliffhanger = (
      !!gameState.pendingCliffhanger?.continuationEventId
      && gameState.pendingCliffhanger.continuationEventId === eventId
    );

    const pendingCliffhanger = generatedPendingCliffhanger
      ?? (shouldClearPendingCliffhanger ? undefined : gameState.pendingCliffhanger);

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

    const nextDecisionCount = (gameState.dailyDecisionCount ?? 0) + 1;
    // Day ends when energy hits 0. If the player hasn't reached the minimum
    // decision count yet, flag it so the caller can inject a recovery event.
    const energyDepleted = finalStats.energy <= 0;
    const shouldForceRecovery =
      energyDepleted && nextDecisionCount < PACING_CONSTANTS.MIN_DECISIONS_PER_DAY;
    // Reset the counter on actual day end (energy gone and minimum satisfied).
    const nextDailyDecisionCount = energyDepleted && !shouldForceRecovery
      ? 0
      : nextDecisionCount;
    const resultNarrativeFeedback = [
      ...statNarrativeFeedback,
      ...(forcedFateFeedback ? [forcedFateFeedback] : []),
    ];

    return {
      eventId,
      choice,
      choiceIndexForAnalytics,
      newStats: finalStats,
      fateRoll: fateRollResult,
      momentumFeedback,
      shouldForceRecovery,
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
          traitChanges,
          fateRoll: fateRollResult,
          ...(resultNarrativeFeedback.length > 0 ? { statNarrativeFeedback: resultNarrativeFeedback } : {}),
        },
        dailyDecisionCount: nextDailyDecisionCount,
        historyLog: [...gameState.historyLog, historyEntry],
        actionCounts: newActionCounts,
        eventChoiceHistory: newEventHistory,
        traits: traitResolution.traits,
        traitProgress: nextTraitProgress,
        schoolGrades: nextSchoolGrades,
        skills: skillResult.newSkills,
        npcs: socialGroupResult.npcs,
        socialGroups: socialGroupResult.socialGroups,
        socialReputation: Math.max(
          0,
          Math.min(100, (gameState.socialReputation ?? 50) + (choice.socialReputationChange ?? 0))
        ),
        inventory: nextInventory,
        purchasedItems: nextPurchasedItems,
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
        scars: newScars,
        // Paket 6: kalıcı bayraklar
        ...(choice.setPermanentFlags ? {
          permanentFlags: {
            ...(gameState.permanentFlags ?? {}),
            ...choice.setPermanentFlags,
          },
        } : {}),
      },
      appliedChanges,
      newTraits: traitResolution.gainedTraits,
      removedTraits: traitResolution.removedTraits,
      traitChanges,
    };
  }

  private applySocialGroupAction(
    action: Choice['socialGroupAction'] | undefined,
    socialGroups: SocialGroup[],
    npcs: NPC[],
    currentAge: number,
    currentTurn: number
  ): SocialGroupActionResult {
    if (!action) {
      return { socialGroups, npcs };
    }

    if (action.type === 'CREATE') {
      const desiredType = action.groupType ?? 'FRIEND_GROUP';
      const alreadyInType = socialGroups.some(group => group.isPlayerMember && group.type === desiredType);
      if (alreadyInType) {
        return { socialGroups, npcs };
      }

      const rolePool: string[] = action.memberRoles && action.memberRoles.length > 0
        ? action.memberRoles
        : ['BEST_FRIEND', 'FRIEND'];
      const members = npcs
        .filter(npc => rolePool.includes(npc.role))
        .slice(0, 4);

      if (members.length === 0) {
        return { socialGroups, npcs };
      }

      const newGroup: SocialGroup = {
        id: `group_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        name: action.groupName || 'Yeni Grup',
        members: members.map(npc => npc.id),
        leaderId: members[0]?.id ?? null,
        type: desiredType,
        reputation: 50,
        isPlayerMember: true,
        formedAtAge: currentAge,
        formedAtTurn: currentTurn,
      };

      const nextNpcs = npcs.map(npc => (
        newGroup.members.includes(npc.id)
          ? { ...npc, isInPlayerGroup: true, groupId: newGroup.id }
          : npc
      ));

      return {
        socialGroups: [...socialGroups, newGroup],
        npcs: nextNpcs,
      };
    }

    if (action.type === 'JOIN') {
      const targetGroup = socialGroups.find(group => (
        !group.isPlayerMember &&
        (!action.groupType || group.type === action.groupType)
      ));

      if (!targetGroup) {
        return { socialGroups, npcs };
      }

      const nextSocialGroups = socialGroups.map(group => (
        group.id === targetGroup.id
          ? { ...group, isPlayerMember: true }
          : group
      ));

      const nextNpcs = npcs.map(npc => (
        targetGroup.members.includes(npc.id)
          ? { ...npc, isInPlayerGroup: true, groupId: targetGroup.id }
          : npc
      ));

      return {
        socialGroups: nextSocialGroups,
        npcs: nextNpcs,
      };
    }

    if (action.type === 'LEAVE') {
      const groupIdsToLeave = socialGroups
        .filter(group => group.isPlayerMember && (!action.groupType || group.type === action.groupType))
        .map(group => group.id);

      if (groupIdsToLeave.length === 0) {
        return { socialGroups, npcs };
      }

      const nextSocialGroups = socialGroups.map(group => (
        groupIdsToLeave.includes(group.id)
          ? { ...group, isPlayerMember: false }
          : group
      ));

      const nextNpcs = npcs.map(npc => (
        npc.groupId && groupIdsToLeave.includes(npc.groupId)
          ? { ...npc, isInPlayerGroup: false, groupId: undefined }
          : npc
      ));

      return {
        socialGroups: nextSocialGroups,
        npcs: nextNpcs,
      };
    }

    if (action.type === 'REPUTATION') {
      const delta = action.reputationDelta ?? 0;
      if (delta === 0) {
        return { socialGroups, npcs };
      }

      const nextSocialGroups = socialGroups.map(group => {
        const matchesType = !action.groupType || group.type === action.groupType;
        if (!group.isPlayerMember || !matchesType) return group;
        return {
          ...group,
          reputation: Math.max(0, Math.min(100, group.reputation + delta)),
        };
      });

      return {
        socialGroups: nextSocialGroups,
        npcs,
      };
    }

    return { socialGroups, npcs };
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
