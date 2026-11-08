import { useCallback, useEffect, useRef, useState } from 'react';
import { useGame } from '../context/GameContext';
import { Stats } from '../types';
import { logRewardedAdRequested, logRewardedAdResult } from '../utils/analyticsEvents';
import { getAdErrorMessage } from '../utils/adErrorMessage';
import {
  getRemainingRewardedAds,
  REWARDED_AD_CANCELLED_ERROR,
  showContextualRewardedAd,
} from '../services/monetization';

type ToastType = 'success' | 'error' | 'info' | 'warning';
type TranslateFn = (
  key: string,
  params?: Record<string, string | number | boolean>,
  fallback?: string
) => string;

interface UseAdRewardsOptions {
  t: TranslateFn;
  stats: Stats;
  maxEnergy: number;
  enqueueToast: (message: string, type?: ToastType) => void;
  updateStats: (updates: Partial<Stats>) => void;
}

interface ClaimAdOptions {
  /** Ek koşul: false dönerse reklam açılmaz (tur/faz denetimine ek olarak). */
  shouldShow?: () => boolean;
}

// Ana ekran dışı fazlar: oyuncu bunlara geçtiyse enerji reklamı artık "aynı yerde" değildir.
const LEFT_HUB_PHASES = new Set(['EVENT', 'RESULT', 'GAME_OVER']);

/** claimExamPrepBoostAd: reklam gösterilmedi (oyuncu ayrıldı ya da iptal); çağıran sınavı açmamalı. */
export const EXAM_PREP_AD_SKIPPED = -1;

interface UseAdRewardsResult {
  examPrepBoostApplied: number;
  clearExamPrepBoost: () => void;
  claimEnergyRecoveryAd: () => Promise<void>;
  /** Takviye miktarı; reklam gösterilmediyse (ayrıldı/iptal) EXAM_PREP_AD_SKIPPED. */
  claimExamPrepBoostAd: (options?: ClaimAdOptions) => Promise<number>;
  claimUndoAd: () => Promise<boolean>;
}

export const useAdRewards = ({
  t,
  stats,
  maxEnergy,
  enqueueToast,
  updateStats,
}: UseAdRewardsOptions): UseAdRewardsResult => {
  const [examPrepBoostApplied, setExamPrepBoostApplied] = useState(0);

  // Reklam yüklenirken (en fazla 15 sn) oyuncu ilerlerse reklam açılmasın ve hak düşmesin.
  // GameScreen'e yeni prop eklememek için güncel tur/faz bağlamdan okunup ref'te tutulur.
  const { gameState } = useGame();
  const placeRef = useRef({ turn: gameState.turn, phase: gameState.phase });
  placeRef.current = { turn: gameState.turn, phase: gameState.phase };
  // GameScreen kapanınca (Yeni Hayat -> ana menü) render durur ve ref donar; bağlı mı bilgisi ayrı tutulur.
  const isMountedRef = useRef(true);
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const clearExamPrepBoost = useCallback(() => {
    if (examPrepBoostApplied <= 0) return;
    updateStats({ intelligence: -examPrepBoostApplied });
    setExamPrepBoostApplied(0);
  }, [examPrepBoostApplied, updateStats]);

  const claimEnergyRecoveryAd = useCallback(async () => {
    const remainingBefore = getRemainingRewardedAds();
    void logRewardedAdRequested({
      placement: 'energy_depleted',
      rewardType: 'energy',
      remainingBefore,
    });

    const requestedTurn = placeRef.current.turn;
    const isStillOnSameScreen = () =>
      isMountedRef.current &&
      placeRef.current.turn === requestedTurn && !LEFT_HUB_PHASES.has(placeRef.current.phase);

    const adResult = await showContextualRewardedAd('energy_depleted', {
      shouldShow: isStillOnSameScreen,
    });
    const remainingAfter = getRemainingRewardedAds();

    if (!adResult.success) {
      // Oyuncu ilerlediği için reklam gösterilmediyse iptal gibi sessiz kal (hata tostu yok).
      // Arka plana geçiş iptali de oyuncu eylemi değil: hata tostu yok.
      const leftScreen = !isStillOnSameScreen() || adResult.error === REWARDED_AD_CANCELLED_ERROR;
      if (!leftScreen) enqueueToast(getAdErrorMessage(adResult.error), 'error');
      void logRewardedAdResult({
        placement: 'energy_depleted',
        rewardType: 'energy',
        success: false,
        remainingAfter,
        errorMessage: leftScreen ? 'Energy ad skipped: player moved on' : adResult.error,
      });
      return;
    }

    const rewardAmount = adResult.amount || 25;
    const clampedEnergy = Math.min(maxEnergy, stats.energy + rewardAmount);
    const delta = Math.max(0, clampedEnergy - stats.energy);

    if (delta > 0) {
      updateStats({ energy: delta });
      enqueueToast(t('messages.energyGained', { amount: delta }), 'success');
    } else {
      enqueueToast(t('messages.energyFull'), 'info');
    }

    void logRewardedAdResult({
      placement: 'energy_depleted',
      rewardType: 'energy',
      success: true,
      amount: delta,
      remainingAfter,
    });
  }, [enqueueToast, maxEnergy, stats.energy, t, updateStats]);

  const claimExamPrepBoostAd = useCallback(async (options?: ClaimAdOptions): Promise<number> => {
    const remainingBefore = getRemainingRewardedAds();
    void logRewardedAdRequested({
      placement: 'exam_prep',
      rewardType: 'intelligence',
      remainingBefore,
    });

    const requestedTurn = placeRef.current.turn;
    const isStillOnSameTurn = () =>
      isMountedRef.current &&
      placeRef.current.turn === requestedTurn && (options?.shouldShow?.() ?? true);

    const adResult = await showContextualRewardedAd('exam_prep', {
      shouldShow: isStillOnSameTurn,
    });
    const remainingAfter = getRemainingRewardedAds();

    if (!adResult.success) {
      const leftScreen = !isStillOnSameTurn() || adResult.error === REWARDED_AD_CANCELLED_ERROR;
      if (!leftScreen) enqueueToast(getAdErrorMessage(adResult.error), 'error');
      void logRewardedAdResult({
        placement: 'exam_prep',
        rewardType: 'intelligence',
        success: false,
        remainingAfter,
        errorMessage: leftScreen ? 'Exam prep ad skipped: player moved on' : adResult.error,
      });
      return leftScreen ? EXAM_PREP_AD_SKIPPED : 0;
    }

    const rewardAmount = adResult.amount || 15;
    const appliedBoost = Math.max(0, Math.min(100, stats.intelligence + rewardAmount) - stats.intelligence);

    if (appliedBoost > 0) {
      updateStats({ intelligence: appliedBoost });
      setExamPrepBoostApplied(appliedBoost);
      enqueueToast(
        t('messages.examFocusActive', { boost: appliedBoost }),
        'success'
      );
    } else {
      setExamPrepBoostApplied(0);
      enqueueToast(
        t('messages.focusBonusLimitReached'),
        'info'
      );
    }

    void logRewardedAdResult({
      placement: 'exam_prep',
      rewardType: 'intelligence',
      success: true,
      amount: appliedBoost,
      remainingAfter,
    });

    return appliedBoost;
  }, [enqueueToast, stats.intelligence, t, updateStats]);

  const claimUndoAd = useCallback(async (): Promise<boolean> => {
    const remainingBefore = getRemainingRewardedAds();
    void logRewardedAdRequested({
      placement: 'undo_choice',
      rewardType: 'utility',
      remainingBefore,
    });

    const adResult = await showContextualRewardedAd('undo_choice');
    const remainingAfter = getRemainingRewardedAds();

    if (!adResult.success) {
      enqueueToast(getAdErrorMessage(adResult.error), 'error');
      void logRewardedAdResult({
        placement: 'undo_choice',
        rewardType: 'utility',
        success: false,
        remainingAfter,
        errorMessage: adResult.error,
      });
      return false;
    }

    void logRewardedAdResult({
      placement: 'undo_choice',
      rewardType: 'utility',
      success: true,
      amount: 1,
      remainingAfter,
    });
    return true;
  }, [enqueueToast, t]);

  return {
    examPrepBoostApplied,
    clearExamPrepBoost,
    claimEnergyRecoveryAd,
    claimExamPrepBoostAd,
    claimUndoAd,
  };
};
