import { useCallback } from 'react';
import { getTraitName } from '../data/traits';
import {
  GameState,
  GameStateUpdate,
  NPC,
  Personality,
  Skills,
  Stats,
  TraitChangeFeedback,
} from '../types';
import {
  checkTraitFormation,
  getMaxEnergy,
  resolveTraitChanges,
} from '../utils/gameUtils';
import { buildTraitChangeFeedback } from '../utils/traitFeedback';
import { resolveInteractionOutcome } from '../utils/npcInteractionOutcomes';
import { isFeatureEnabled } from '../config/featureFlags';
import { updateStress } from '../utils/personalitySystem';
import {
  logHubAction,
  logTraitChanges,
  logTraitFormed,
} from '../utils/analyticsEvents';
import { createTraitShareText, formatShareMessage } from '../utils/shareUtils';
import { tRuntime } from '../i18n/strings';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type SocialActionType = 'CHAT' | 'HANGOUT' | 'GIFT' | 'STUDY' | 'FLIRT' | 'HELP' | 'COMPETE' | 'GOSSIP';

const SOCIAL_STRESS_RELIEF_BY_ACTION: Record<SocialActionType, number> = {
  CHAT: -7,
  HANGOUT: -10,
  GIFT: -6,
  STUDY: -5,
  FLIRT: -6,
  HELP: -8,
  COMPETE: -4,
  GOSSIP: -4,
};

export const calculateSocialStressEffect = (
  actionType: SocialActionType,
  outcomeStressEffect: number = 0
): number => {
  const baseStressRelief = SOCIAL_STRESS_RELIEF_BY_ACTION[actionType] ?? -5;
  return Math.min(-2, baseStressRelief + outcomeStressEffect);
};

interface SocialInteractionResult {
  success: boolean;
  message: string;
  cost?: { energy: number; money: number };
}

interface UseSocialInteractionsOptions {
  gameState: GameState;
  stats: Stats;
  interactWithNPC: (
    npcId: string,
    actionType: SocialActionType,
    playerPersonality: { openness: number; empathy: number; courage: number; conformity: number },
    currentEnergy?: number,
    currentMoney?: number,
    skills?: Skills
  ) => SocialInteractionResult;
  meetNewNPC: () => { success: boolean; npc?: NPC };
  updateStats: (updates: Partial<Stats>) => void;
  updateGameState: (updates: GameStateUpdate) => void;
  onTraitProgressUpdates: (traitIds: string[]) => void;
  buildTraitToastMessage: (traitChanges: TraitChangeFeedback[]) => string | null;
  enqueueToast: (message: string, type?: ToastType) => void;
  triggerMilestoneShare: (message: string) => Promise<void>;
}

interface UseSocialInteractionsResult {
  handleSocialInteract: (
    npcId: string,
    actionType: SocialActionType
  ) => SocialInteractionResult;
  handleMeetNewNPC: () => { success: boolean; npc?: NPC };
}

export const useSocialInteractions = ({
  gameState,
  stats,
  interactWithNPC,
  meetNewNPC,
  updateStats,
  updateGameState,
  onTraitProgressUpdates,
  buildTraitToastMessage,
  enqueueToast,
  triggerMilestoneShare,
}: UseSocialInteractionsOptions): UseSocialInteractionsResult => {
  const clampAxis = (value: number): number => Math.max(0, Math.min(100, value));

  const handleSocialInteract = useCallback((
    npcId: string,
    actionType: SocialActionType
  ): SocialInteractionResult => {
    const npc = gameState.npcs.find(item => item.id === npcId);
    const baseResult = interactWithNPC(
      npcId,
      actionType,
      gameState.personality,
      stats.energy,
      stats.money,
      gameState.skills
    );
    let result = baseResult;

    if (baseResult.success && npc && isFeatureEnabled('NPC_RICH_FEEDBACK')) {
      const outcome = resolveInteractionOutcome(actionType, npc.personality);
      const localizedFeedback = tRuntime(outcome.feedbackKey, undefined, baseResult.message);
      result = {
        ...baseResult,
        message: localizedFeedback,
      };
    }

    if (result.success && result.cost) {
      const socialActionId = `social_${String(actionType).toLowerCase()}`;
      const energyCost = Math.max(0, result.cost.energy);
      const moneyCost = Math.max(0, result.cost.money);
      const richFeedbackEnabled = Boolean(npc && isFeatureEnabled('NPC_RICH_FEEDBACK'));
      const interactionOutcome = richFeedbackEnabled && npc
        ? resolveInteractionOutcome(actionType, npc.personality)
        : null;
      const statsAfterInteraction: Stats = {
        ...stats,
        energy: Math.max(0, stats.energy - energyCost),
        money: Math.max(0, stats.money - moneyCost),
      };
      const traitResult = checkTraitFormation(
        socialActionId,
        null,
        gameState,
        statsAfterInteraction
      );
      const traitResolution = resolveTraitChanges({
        currentTraits: gameState.traits,
        gainedTraits: traitResult.newTraits,
        removedTraits: traitResult.removedTraits,
      });
      const traitChanges = buildTraitChangeFeedback(
        traitResolution.gainedTraits,
        traitResolution.removedTraits
      );
      const nextTraitProgress = { ...traitResult.updatedProgress };
      [...traitResolution.gainedTraits, ...traitResolution.removedTraits].forEach(traitId => {
        if (nextTraitProgress[traitId]) {
          delete nextTraitProgress[traitId];
        }
      });
      const nextMaxEnergy = getMaxEnergy(gameState.age, gameState.family, traitResolution.traits);
      const cappedEnergy = Math.min(statsAfterInteraction.energy, nextMaxEnergy);
      const updates: Partial<Stats> = {};
      const energyDelta = cappedEnergy - stats.energy;
      if (energyDelta !== 0) {
        updates.energy = energyDelta;
      }
      if (moneyCost > 0) {
        updates.money = -moneyCost;
      }
      if (interactionOutcome?.statEffects) {
        for (const [key, value] of Object.entries(interactionOutcome.statEffects)) {
          if (typeof value !== 'number' || value === 0) continue;
          updates[key as keyof Stats] = (updates[key as keyof Stats] ?? 0) + value;
        }
      }
      if (Object.keys(updates).length > 0) {
        updateStats(updates);
      }

      let nextPersonality: Personality | undefined;
      if (interactionOutcome?.personalityEffect) {
        const axis = interactionOutcome.personalityEffect.axis as keyof Personality;
        if (axis in gameState.personality) {
          nextPersonality = {
            ...gameState.personality,
            [axis]: clampAxis(
              (gameState.personality[axis] ?? 50) + interactionOutcome.personalityEffect.delta
            ),
          };
        }
      }

      const outcomeStressEffect = interactionOutcome?.stressEffect ?? 0;
      const combinedStressEffect = calculateSocialStressEffect(actionType, outcomeStressEffect);
      const nextStress = updateStress(
        gameState.stress,
        combinedStressEffect,
        `Social: ${actionType}`,
        gameState.turn
      );

      updateGameState({
        traits: traitResolution.traits,
        traitProgress: nextTraitProgress,
        maxEnergy: nextMaxEnergy,
        ...(nextPersonality ? { personality: nextPersonality } : {}),
        stress: nextStress,
      });
      if (traitResult.progressUpdates.length > 0) {
        onTraitProgressUpdates(traitResult.progressUpdates);
      }
      if (traitResolution.gainedTraits.length > 0) {
        traitResolution.gainedTraits.forEach(traitId => {
          void logTraitFormed(traitId, gameState.age);
          const milestone = createTraitShareText(getTraitName(traitId));
          void triggerMilestoneShare(formatShareMessage(milestone));
        });
      }
      if (traitChanges.length > 0) {
        const traitToast = buildTraitToastMessage(traitChanges);
        if (traitToast) {
          const hasWarningSignal = traitChanges.some(
            change => change.changeType === 'GAINED' && !!change.guidance
          );
          enqueueToast(traitToast, hasWarningSignal ? 'warning' : 'info');
        }
        void logTraitChanges(traitChanges, {
          source: 'social_action',
          sourceId: socialActionId,
          age: gameState.age,
          turn: gameState.turn,
        });
      }
      void logHubAction(socialActionId, energyCost, gameState.age, 0, {
        turn: gameState.turn,
        totalTurns: gameState.totalTurns || 0,
        currentEnergy: stats.energy,
        maxEnergy: gameState.maxEnergy,
      });
    }
    return result;
  }, [
    buildTraitToastMessage,
    enqueueToast,
    gameState,
    interactWithNPC,
    onTraitProgressUpdates,
    stats,
    triggerMilestoneShare,
    updateGameState,
    updateStats,
  ]);

  const handleMeetNewNPC = useCallback(() => {
    const meetEnergyCost = 12;
    if (stats.energy < meetEnergyCost) {
      return { success: false };
    }

    const result = meetNewNPC();
    if (result.success) {
      updateStats({ energy: -meetEnergyCost });
      void logHubAction('social_meet_new', meetEnergyCost, gameState.age, 0, {
        turn: gameState.turn,
        totalTurns: gameState.totalTurns || 0,
        currentEnergy: stats.energy,
        maxEnergy: gameState.maxEnergy,
      });
    }
    return result;
  }, [gameState.age, gameState.maxEnergy, gameState.totalTurns, gameState.turn, meetNewNPC, stats.energy, updateStats]);

  return {
    handleSocialInteract,
    handleMeetNewNPC,
  };
};
