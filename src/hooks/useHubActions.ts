import { useCallback, useRef } from 'react';
import { Alert } from 'react-native';
import { buttonPress, moneyGain, moneyLoss, selectionHaptic } from '../animations';
import { HubActionCommand } from '../commands/ActionCommand';
import { ActionCategory, ExamGameType, SubAction } from '../data/actions';
import { getTraitName } from '../data/traits';
import { GameState, GameStateUpdate, Stats, TraitChangeFeedback } from '../types';
import {
  logGoalActionUsed,
  logHubAction,
  logTraitChanges,
  logTraitFormed,
} from '../utils/analyticsEvents';
import { createTraitShareText, formatShareMessage } from '../utils/shareUtils';
import { isFeatureEnabled } from '../config/featureFlags';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type TranslateFn = (
  key: string,
  params?: Record<string, string | number | boolean>,
  fallback?: string
) => string;

interface UseHubActionsOptions {
  gameState: GameState;
  stats: Stats;
  selectedCategory: ActionCategory | null;
  careerPathActionsEnabled: boolean;
  t: TranslateFn;
  enqueueToast: (message: string, type?: ToastType) => void;
  setStats: (stats: Stats | ((prev: Stats) => Stats)) => void;
  updateGameState: (updates: GameStateUpdate) => void;
  claimEnergyRecoveryAd: () => Promise<void>;
  promptExamPrepAndStartExam: (examType: ExamGameType) => void;
  promptShoppingDiscount: (
    action: SubAction,
    executeAction: (actionToRun: SubAction) => void
  ) => void;
  meetNewNPC: () => { success: boolean; npc?: { name: string } };
  onCloseBottomSheet: () => void;
  onTraitProgressUpdates: (traitIds: string[]) => void;
  buildTraitToastMessage: (traitChanges: TraitChangeFeedback[]) => string | null;
  triggerMilestoneShare: (message: string) => Promise<void>;
}

interface UseHubActionsResult {
  executeHubAction: (action: SubAction) => void;
  handleActionSelect: (action: SubAction) => void;
}

export const useHubActions = ({
  gameState,
  stats,
  selectedCategory,
  careerPathActionsEnabled,
  t,
  enqueueToast,
  setStats,
  updateGameState,
  claimEnergyRecoveryAd,
  promptExamPrepAndStartExam,
  promptShoppingDiscount,
  meetNewNPC,
  onCloseBottomSheet,
  onTraitProgressUpdates,
  buildTraitToastMessage,
  triggerMilestoneShare,
}: UseHubActionsOptions): UseHubActionsResult => {
  const hubActionCommandRef = useRef(new HubActionCommand());

  const executeHubAction = useCallback((action: SubAction) => {
    const result = hubActionCommandRef.current.execute({
      action,
      currentStats: stats,
      gameState,
    });

    if (result.status === 'blocked') {
      const isHardResourceBlock = result.errorType === 'NOT_ENOUGH_ENERGY' || result.errorType === 'NOT_ENOUGH_MONEY';
      enqueueToast(
        result.feedbackMessage,
        isHardResourceBlock ? 'error' : 'warning'
      );
      if (result.errorType === 'NOT_ENOUGH_ENERGY') {
        Alert.alert(
          t('dialogs.outOfEnergy.title', undefined, 'Enerjin bitti'),
          t('dialogs.outOfEnergy.description', undefined, 'Bir reklam izleyerek +25 enerji kazanmak ister misin?'),
          [
            { text: t('buttons.decline', undefined, 'Vazgec'), style: 'cancel' },
            {
              text: t('buttons.watchAd', undefined, 'Reklam Izle'),
              onPress: () => {
                void claimEnergyRecoveryAd();
              },
            },
          ]
        );
      }
      return;
    }

    if (result.status === 'open_exam') {
      if (result.opensExamGame) {
        promptExamPrepAndStartExam(result.opensExamGame);
      }
      onCloseBottomSheet();
      return;
    }

    if (result.newStats !== stats) {
      const moneyDelta = (result.newStats.money ?? stats.money) - stats.money;
      if (moneyDelta > 0) {
        moneyGain();
      } else if (moneyDelta < 0) {
        moneyLoss();
      }
      setStats(result.newStats);
    }

    updateGameState(result.gameStateUpdates);

    if (result.traitProgressUpdates.length > 0) {
      onTraitProgressUpdates(result.traitProgressUpdates);
    }

    void logHubAction(action.id, result.adjustedEnergyCost, gameState.age, result.totalSkillGain, {
      turn: gameState.turn,
      totalTurns: gameState.totalTurns || 0,
      currentEnergy: stats.energy,
      maxEnergy: gameState.maxEnergy,
    });
    if (
      careerPathActionsEnabled
      && selectedCategory?.requiredGoal
      && selectedCategory.requiredGoal === gameState.selectedGoal
    ) {
      void logGoalActionUsed({
        actionId: action.id,
        categoryId: selectedCategory.id,
        selectedGoal: gameState.selectedGoal,
        age: gameState.age,
        turn: gameState.turn,
      });
    }
    if (result.newTraits.length > 0) {
      result.newTraits.forEach(traitId => {
        void logTraitFormed(traitId, gameState.age);
        const milestone = createTraitShareText(getTraitName(traitId));
        void triggerMilestoneShare(formatShareMessage(milestone));
      });
    }
    if (result.traitChanges && result.traitChanges.length > 0) {
      const traitToast = buildTraitToastMessage(result.traitChanges);
      if (traitToast) {
        const hasWarningSignal = result.traitChanges.some(
          change => change.changeType === 'GAINED' && !!change.guidance
        );
        enqueueToast(traitToast, hasWarningSignal ? 'warning' : 'info');
      }
      void logTraitChanges(result.traitChanges, {
        source: 'hub_action',
        sourceId: action.id,
        age: gameState.age,
        turn: gameState.turn,
      });
    }

    enqueueToast(result.feedbackMessage, 'success');

    if (action.id === 'social_meet_new') {
      const socialResult = meetNewNPC();
      if (socialResult.success && socialResult.npc) {
        enqueueToast(
          t('messages.metNPC', { name: socialResult.npc.name }, '{name} ile tanistin!'),
          'success'
        );
      }
    }

    onCloseBottomSheet();
  }, [
    buildTraitToastMessage,
    careerPathActionsEnabled,
    claimEnergyRecoveryAd,
    enqueueToast,
    gameState,
    meetNewNPC,
    onCloseBottomSheet,
    onTraitProgressUpdates,
    promptExamPrepAndStartExam,
    selectedCategory,
    setStats,
    stats,
    t,
    triggerMilestoneShare,
    updateGameState,
  ]);

  const handleActionSelect = useCallback((action: SubAction) => {
    buttonPress();
    selectionHaptic();

    const isShoppingAction = action.id.startsWith('shopping_');
    const shoppingDiscountEnabled = isFeatureEnabled('AD_SHOPPING_DISCOUNT');

    if (!isShoppingAction || !shoppingDiscountEnabled) {
      executeHubAction(action);
      return;
    }

    promptShoppingDiscount(action, executeHubAction);
  }, [executeHubAction, promptShoppingDiscount]);

  return {
    executeHubAction,
    handleActionSelect,
  };
};
