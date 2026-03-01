import { useCallback } from 'react';
import { getTraitName } from '../data/traits';
import { GameState, GameStateUpdate, NPC, Skills, Stats, TraitChangeFeedback } from '../types';
import {
  checkTraitFormation,
  getMaxEnergy,
  resolveTraitChanges,
} from '../utils/gameUtils';
import { buildTraitChangeFeedback } from '../utils/traitFeedback';
import {
  logHubAction,
  logTraitChanges,
  logTraitFormed,
} from '../utils/analyticsEvents';
import { createTraitShareText, formatShareMessage } from '../utils/shareUtils';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type SocialActionType = 'CHAT' | 'HANGOUT' | 'GIFT' | 'STUDY' | 'FLIRT' | 'HELP' | 'COMPETE' | 'GOSSIP';

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
  const handleSocialInteract = useCallback((
    npcId: string,
    actionType: SocialActionType
  ): SocialInteractionResult => {
    const result = interactWithNPC(
      npcId,
      actionType,
      gameState.personality,
      stats.energy,
      stats.money,
      gameState.skills
    );
    if (result.success && result.cost) {
      const socialActionId = `social_${String(actionType).toLowerCase()}`;
      const energyCost = Math.max(0, result.cost.energy);
      const moneyCost = Math.max(0, result.cost.money);
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
      if (Object.keys(updates).length > 0) {
        updateStats(updates);
      }
      updateGameState({
        traits: traitResolution.traits,
        traitProgress: nextTraitProgress,
        maxEnergy: nextMaxEnergy,
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
