import { useCallback, useState } from 'react';
import { Stats } from '../types';
import { logRewardedAdRequested, logRewardedAdResult } from '../utils/analyticsEvents';
import { getRemainingRewardedAds, showContextualRewardedAd } from '../services/monetization';

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

interface UseAdRewardsResult {
  examPrepBoostApplied: number;
  clearExamPrepBoost: () => void;
  claimEnergyRecoveryAd: () => Promise<void>;
  claimExamPrepBoostAd: () => Promise<number>;
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

    const adResult = await showContextualRewardedAd('energy_depleted');
    const remainingAfter = getRemainingRewardedAds();

    if (!adResult.success) {
      enqueueToast(adResult.error || t('messages.adNotShown', undefined, 'Reklam gosterilemedi'), 'error');
      void logRewardedAdResult({
        placement: 'energy_depleted',
        rewardType: 'energy',
        success: false,
        remainingAfter,
        errorMessage: adResult.error,
      });
      return;
    }

    const rewardAmount = adResult.amount || 25;
    const clampedEnergy = Math.min(maxEnergy, stats.energy + rewardAmount);
    const delta = Math.max(0, clampedEnergy - stats.energy);

    if (delta > 0) {
      updateStats({ energy: delta });
      enqueueToast(t('messages.energyGained', { amount: delta }, '+{amount} enerji kazandin'), 'success');
    } else {
      enqueueToast(t('messages.energyFull', undefined, 'Enerjin zaten dolu'), 'info');
    }

    void logRewardedAdResult({
      placement: 'energy_depleted',
      rewardType: 'energy',
      success: true,
      amount: delta,
      remainingAfter,
    });
  }, [enqueueToast, maxEnergy, stats.energy, t, updateStats]);

  const claimExamPrepBoostAd = useCallback(async (): Promise<number> => {
    const remainingBefore = getRemainingRewardedAds();
    void logRewardedAdRequested({
      placement: 'exam_prep',
      rewardType: 'intelligence',
      remainingBefore,
    });

    const adResult = await showContextualRewardedAd('exam_prep');
    const remainingAfter = getRemainingRewardedAds();

    if (!adResult.success) {
      enqueueToast(adResult.error || t('messages.adNotShown', undefined, 'Reklam gosterilemedi'), 'error');
      void logRewardedAdResult({
        placement: 'exam_prep',
        rewardType: 'intelligence',
        success: false,
        remainingAfter,
        errorMessage: adResult.error,
      });
      return 0;
    }

    const rewardAmount = adResult.amount || 15;
    const appliedBoost = Math.max(0, Math.min(100, stats.intelligence + rewardAmount) - stats.intelligence);

    if (appliedBoost > 0) {
      updateStats({ intelligence: appliedBoost });
      setExamPrepBoostApplied(appliedBoost);
      enqueueToast(
        t('messages.examFocusActive', { boost: appliedBoost }, 'Sinav odagi aktif: +{boost} zeka'),
        'success'
      );
    } else {
      setExamPrepBoostApplied(0);
      enqueueToast(
        t('messages.focusBonusLimitReached', undefined, 'Zeka zaten maksimum, odak bonusu sinirda kaldi'),
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
      enqueueToast(adResult.error || t('messages.adNotShown', undefined, 'Reklam gosterilemedi'), 'error');
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
