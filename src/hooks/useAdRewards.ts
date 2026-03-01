import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { SubAction } from '../data/actions';
import { getTraitName } from '../data/traits';
import { GameStateUpdate, SchoolGrades, Stats, TraitProgressData } from '../types';
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
  turn: number;
  traitProgress?: Record<string, TraitProgressData>;
  schoolGrades: SchoolGrades;
  enqueueToast: (message: string, type?: ToastType) => void;
  updateStats: (updates: Partial<Stats>) => void;
  updateGameState: (updates: GameStateUpdate) => void;
  updateRelationship: (npcId: string, delta: number) => void;
}

interface UseAdRewardsResult {
  examPrepBoostApplied: number;
  clearExamPrepBoost: () => void;
  claimEnergyRecoveryAd: () => Promise<void>;
  claimExamPrepBoostAd: () => Promise<number>;
  claimTraitBoostAd: () => Promise<void>;
  offerRelationshipBoostAd: (npcId: string, npcName: string) => Promise<void>;
  claimReportPreviewAd: () => Promise<void>;
  promptShoppingDiscount: (
    action: SubAction,
    executeAction: (action: SubAction) => void
  ) => void;
}

export const useAdRewards = ({
  t,
  stats,
  maxEnergy,
  turn,
  traitProgress,
  schoolGrades,
  enqueueToast,
  updateStats,
  updateGameState,
  updateRelationship,
}: UseAdRewardsOptions): UseAdRewardsResult => {
  const [examPrepBoostApplied, setExamPrepBoostApplied] = useState(0);
  const [shoppingDiscountPending, setShoppingDiscountPending] = useState(false);

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

  const claimTraitBoostAd = useCallback(async () => {
    const remainingBefore = getRemainingRewardedAds();
    void logRewardedAdRequested({
      placement: 'trait_boost',
      rewardType: 'utility',
      remainingBefore,
    });

    const adResult = await showContextualRewardedAd('trait_boost');
    const remainingAfter = getRemainingRewardedAds();

    if (!adResult.success) {
      enqueueToast(adResult.error || t('messages.adNotShown', undefined, 'Reklam gosterilemedi'), 'error');
      void logRewardedAdResult({
        placement: 'trait_boost',
        rewardType: 'utility',
        success: false,
        remainingAfter,
        errorMessage: adResult.error,
      });
      return;
    }

    const entries = Object.entries(traitProgress || {});
    if (entries.length === 0) {
      enqueueToast(
        t('app.ads.traitBoostNoTarget', undefined, 'Su an desteklenecek bir trait ilerlemesi yok'),
        'info'
      );
      void logRewardedAdResult({
        placement: 'trait_boost',
        rewardType: 'utility',
        success: true,
        amount: 0,
        remainingAfter,
      });
      return;
    }

    const unlockedEntries = entries.filter(([, progress]) => !progress.isLocked);
    const candidatePool = unlockedEntries.length > 0 ? unlockedEntries : entries;
    const sorted = [...candidatePool].sort((a, b) => {
      const ratioA = a[1].required > 0 ? a[1].points / a[1].required : 0;
      const ratioB = b[1].required > 0 ? b[1].points / b[1].required : 0;
      if (ratioA !== ratioB) return ratioB - ratioA;
      return b[1].points - a[1].points;
    });

    const [traitId, current] = sorted[0];
    const rawBoost = Math.max(1, adResult.amount || 1);
    const nextPoints = Math.min(current.required, current.points + rawBoost);
    const appliedBoost = Math.max(0, nextPoints - current.points);
    const nextTraitProgress = {
      ...(traitProgress || {}),
      [traitId]: {
        ...current,
        points: nextPoints,
        lastProgressTurn: turn,
      },
    };

    updateGameState({ traitProgress: nextTraitProgress });

    enqueueToast(
      t(
        'app.ads.traitBoostApplied',
        { trait: getTraitName(traitId), amount: appliedBoost },
        '{trait} ilerlemesi +{amount}'
      ),
      appliedBoost > 0 ? 'success' : 'info'
    );

    void logRewardedAdResult({
      placement: 'trait_boost',
      rewardType: 'utility',
      success: true,
      amount: appliedBoost,
      remainingAfter,
    });
  }, [enqueueToast, t, traitProgress, turn, updateGameState]);

  const offerRelationshipBoostAd = useCallback(async (npcId: string, npcName: string) => {
    const remainingBefore = getRemainingRewardedAds();
    void logRewardedAdRequested({
      placement: 'relationship_boost',
      rewardType: 'utility',
      remainingBefore,
    });

    const adResult = await showContextualRewardedAd('relationship_boost');
    const remainingAfter = getRemainingRewardedAds();

    if (!adResult.success) {
      enqueueToast(adResult.error || t('messages.adNotShown', undefined, 'Reklam gosterilemedi'), 'error');
      void logRewardedAdResult({
        placement: 'relationship_boost',
        rewardType: 'utility',
        success: false,
        remainingAfter,
        errorMessage: adResult.error,
      });
      return;
    }

    const relationDelta = Math.max(1, adResult.amount || 5);
    updateRelationship(npcId, relationDelta);
    enqueueToast(
      t(
        'app.ads.relationshipBoostApplied',
        { npcName, amount: relationDelta },
        '{npcName} ile iliski +{amount}'
      ),
      'success'
    );

    void logRewardedAdResult({
      placement: 'relationship_boost',
      rewardType: 'utility',
      success: true,
      amount: relationDelta,
      remainingAfter,
    });
  }, [enqueueToast, t, updateRelationship]);

  const claimReportPreviewAd = useCallback(async () => {
    const remainingBefore = getRemainingRewardedAds();
    void logRewardedAdRequested({
      placement: 'report_preview',
      rewardType: 'utility',
      remainingBefore,
    });

    const adResult = await showContextualRewardedAd('report_preview');
    const remainingAfter = getRemainingRewardedAds();

    if (!adResult.success) {
      enqueueToast(adResult.error || t('messages.adNotShown', undefined, 'Reklam gosterilemedi'), 'error');
      void logRewardedAdResult({
        placement: 'report_preview',
        rewardType: 'utility',
        success: false,
        remainingAfter,
        errorMessage: adResult.error,
      });
      return;
    }

    const gradeEntries = Object.entries(schoolGrades).filter(
      ([, value]) => typeof value === 'number'
    ) as Array<[string, number]>;

    if (gradeEntries.length === 0) {
      enqueueToast(t('app.ads.reportPreviewUnavailable', undefined, 'Tahmin icin yeterli veri yok'), 'info');
      void logRewardedAdResult({
        placement: 'report_preview',
        rewardType: 'utility',
        success: true,
        amount: 0,
        remainingAfter,
      });
      return;
    }

    const predictedGrades = gradeEntries.map(([subject, currentGrade]) => {
      const projected = Math.max(
        0,
        Math.min(
          100,
          Math.round(currentGrade * 0.65 + stats.intelligence * 0.22 + stats.discipline * 0.13)
        )
      );
      return { subject, projected };
    });

    const avg =
      predictedGrades.reduce((sum, item) => sum + item.projected, 0) / predictedGrades.length;
    const sortedByScore = [...predictedGrades].sort((a, b) => b.projected - a.projected);
    const best = sortedByScore[0];
    const weakest = sortedByScore[sortedByScore.length - 1];
    const bestLabel = t(`labels.grades.${best.subject}`, undefined, best.subject);
    const weakestLabel = t(`labels.grades.${weakest.subject}`, undefined, weakest.subject);

    Alert.alert(
      t('app.ads.reportPreviewTitle', undefined, 'Not Tahmini'),
      t(
        'app.ads.reportPreviewBody',
        {
          average: Math.round(avg),
          bestSubject: bestLabel,
          bestScore: best.projected,
          weakestSubject: weakestLabel,
          weakestScore: weakest.projected,
        },
        'Tahmini ortalama: {average}\nEn guclu ders: {bestSubject} ({bestScore})\nEn riskli ders: {weakestSubject} ({weakestScore})'
      )
    );

    void logRewardedAdResult({
      placement: 'report_preview',
      rewardType: 'utility',
      success: true,
      amount: Math.round(avg),
      remainingAfter,
    });
  }, [enqueueToast, schoolGrades, stats.discipline, stats.intelligence, t]);

  const buildDiscountedShoppingAction = useCallback((action: SubAction): SubAction => {
    const discountMultiplier = 0.8;
    const toDiscountedCost = (value: number): number =>
      Math.max(0, Math.round(value * discountMultiplier));

    const discountedPriceByWealth = action.priceByWealth
      ? {
          POOR: typeof action.priceByWealth.POOR === 'number'
            ? toDiscountedCost(action.priceByWealth.POOR)
            : action.priceByWealth.POOR,
          MIDDLE: typeof action.priceByWealth.MIDDLE === 'number'
            ? toDiscountedCost(action.priceByWealth.MIDDLE)
            : action.priceByWealth.MIDDLE,
          RICH: typeof action.priceByWealth.RICH === 'number'
            ? toDiscountedCost(action.priceByWealth.RICH)
            : action.priceByWealth.RICH,
        }
      : undefined;

    const discountedEffect = action.effect
      ? {
          ...action.effect,
          ...(typeof action.effect.money === 'number' && action.effect.money < 0
            ? { money: -toDiscountedCost(Math.abs(action.effect.money)) }
            : {}),
        }
      : undefined;

    return {
      ...action,
      ...(discountedPriceByWealth ? { priceByWealth: discountedPriceByWealth } : {}),
      ...(discountedEffect ? { effect: discountedEffect } : {}),
    };
  }, []);

  const promptShoppingDiscount = useCallback((
    action: SubAction,
    executeAction: (actionToRun: SubAction) => void
  ) => {
    if (shoppingDiscountPending) return;

    Alert.alert(
      t('app.ads.shoppingDiscountTitle', undefined, 'Alisveris Indirimi'),
      t('app.ads.shoppingDiscountDescription', undefined, 'Reklam izleyip bu alisveriste %20 indirim almak ister misin?'),
      [
        {
          text: t('buttons.startDirect', undefined, 'Direkt Devam Et'),
          onPress: () => executeAction(action),
        },
        {
          text: t('buttons.watchAd', undefined, 'Reklam Izle'),
          onPress: () => {
            void (async () => {
              setShoppingDiscountPending(true);
              const remainingBefore = getRemainingRewardedAds();
              void logRewardedAdRequested({
                placement: 'shopping_discount',
                rewardType: 'utility',
                remainingBefore,
              });

              try {
                const adResult = await showContextualRewardedAd('shopping_discount');
                const remainingAfter = getRemainingRewardedAds();

                if (!adResult.success) {
                  enqueueToast(
                    adResult.error || t('messages.adNotShown', undefined, 'Reklam gosterilemedi'),
                    'error'
                  );
                  void logRewardedAdResult({
                    placement: 'shopping_discount',
                    rewardType: 'utility',
                    success: false,
                    remainingAfter,
                    errorMessage: adResult.error,
                  });
                  return;
                }

                const discountedAction = buildDiscountedShoppingAction(action);
                void logRewardedAdResult({
                  placement: 'shopping_discount',
                  rewardType: 'utility',
                  success: true,
                  amount: adResult.amount || 20,
                  remainingAfter,
                });
                enqueueToast(
                  t('app.ads.shoppingDiscountApplied', undefined, '%20 indirim uygulandi'),
                  'success'
                );
                executeAction(discountedAction);
              } finally {
                setShoppingDiscountPending(false);
              }
            })();
          },
        },
      ]
    );
  }, [buildDiscountedShoppingAction, enqueueToast, shoppingDiscountPending, t]);

  return {
    examPrepBoostApplied,
    clearExamPrepBoost,
    claimEnergyRecoveryAd,
    claimExamPrepBoostAd,
    claimTraitBoostAd,
    offerRelationshipBoostAd,
    claimReportPreviewAd,
    promptShoppingDiscount,
  };
};
