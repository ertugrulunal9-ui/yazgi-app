import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';

import { Alert, View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useUI } from '../context/UIContext';
import { useStats } from '../hooks/useStats';
import { useEvents } from '../hooks/useEvents';
import { useNPCs } from '../hooks/useNPCs';
import { useExamHandler } from '../hooks/useExamHandler';
import { useFloatingTexts, useGameActions } from '../hooks/useGameSelectors';
import { AppTab, Stats, TraitChangeFeedback } from '../types';
import {
  FadeInUpView,
  achievementUnlock,
  buttonPress,
  gradeBad,
  gradeGood,
  healthCritical,
  levelUp,
  moneyGain,
  moneyLoss,
  selectionHaptic,
  turnAdvance,
} from '../animations';
import { MessageToast, Toast } from '../animations/ToastAnimations';
import { TraitProgressChip } from '../components/TraitProgressChip';

import { StatusHeader } from '../components/StatusHeader';
import { ActionGrid } from '../components/ActionGrid';
import { ActionBottomSheet } from '../components/ActionBottomSheet';
import { TabBar } from '../components/TabBar';
import {
  getLocalizedActionCategories,
  filterActionCategoriesForContext,
  ActionCategory,
  SubAction,
  ExamGameType,
} from '../data/actions';
import { FloatingText } from '../components/FloatingText';
import { SkillTree } from '../components/SkillTree';
import { SocialScreen } from '../components/SocialScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CharacterScreen } from './CharacterScreen';
import { AchievementList } from '../components/AchievementList';
import { AchievementToast } from '../components/AchievementToast';
// ShopModal removed — monetization is ad-only
import * as Sharing from 'expo-sharing';
import { createTraitShareText, createAchievementShareText, formatShareMessage } from '../utils/shareUtils';
import { useAchievements } from '../hooks/useAchievements';
import {
  logAchievementUnlocked,
  logGoalActionUsed,
  logHubAction,
  logInterstitialOpportunity,
  logInterstitialResult,
  logRewardedAdRequested,
  logRewardedAdResult,
  logTraitChanges,
  logTraitFormed,
} from '../utils/analyticsEvents';
import { HubActionCommand } from '../commands/ActionCommand';
import { TabContent } from '../components/ui';
import { calculateEndingErrorDebt, calculateSelectedGoalStatProgress } from '../utils/endingResolver';
import {
  calculateVarietyBonus,
  checkTraitFormation,
  getMaxEnergy,
  resolveTraitChanges,
} from '../utils/gameUtils';
import { buildTraitChangeFeedback } from '../utils/traitFeedback';
import { getTraitName } from '../data/traits';
import {
  getRemainingRewardedAds,
  showContextualRewardedAd,
  showInterstitialAdDetailed,
} from '../services/monetization';
import {
  MiniGameContainer,
  MathExamGame,
  TurkishExamGame,
  ScienceExamGame,
  HistoryExamGame,
  GeographyExamGame,
  EnglishExamGame,
  ArtExamGame,
  MusicExamGame
} from '../components/exams';
import ReportCard from '../components/ReportCard';
import { ExamPeriodModal } from '../components/ExamPeriodModal';
import { DaySummaryModal } from '../components/DaySummaryModal';
import { isFeatureEnabled } from '../config/featureFlags';

interface GameScreenProps {
  onPhaseChange: (tab: AppTab) => void;
  currentTab: AppTab;
}

const GameScreenComponent: React.FC<GameScreenProps> = ({ onPhaseChange, currentTab }) => {
  const { theme, metrics, t } = useUI();
  const { gameState, playerName } = useGame();
  const { updateGameState, updateStats, setStats } = useGameActions();
  const hubActionCommandRef = useRef(new HubActionCommand());
  const { floatingTexts, removeFloatingText } = useFloatingTexts();
  const { stats } = useStats();
  const { advanceTurn, markExamTaken, completeExamPeriod, selectNewEvent } = useEvents();
  const { interactWithNPC, meetNewNPC, updateRelationship } = useNPCs();
  const previousAgeRef = useRef(gameState.age);
  const previousReportCardRef = useRef(gameState.pendingReportCard);
  const previousHealthCriticalRef = useRef(stats.health <= 20);

  const {
    unlockedAchievements,
    stats: achievementStats,
    checkAchievements,
    getProgress,
    applyRewardsToStats,
    loading: achievementsLoading,
  } = useAchievements(
    stats,
    gameState,
    gameState.skills,
    gameState.schoolGrades,
    (achievementIds, rewards) => {
      if (achievementIds.length === 0) return;
      const rewarded = applyRewardsToStats(stats, rewards);
      const cappedEnergy = Math.min(gameState.maxEnergy, rewarded.energy);
      setStats({ ...rewarded, energy: cappedEnergy });
      setAchievementToastIds(achievementIds);
      setAchievementToastVisible(true);
      achievementUnlock();
      achievementIds.forEach(id => {
        void logAchievementUnlocked(id);
      });
      const achievementMilestone = createAchievementShareText();
      void triggerMilestoneShare(formatShareMessage(achievementMilestone));
    }
  );

  const [selectedCategory, setSelectedCategory] = useState<ActionCategory | null>(null);
  const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

  // Toast state for instant feedback
  const [toasts, setToasts] = useState<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }[]>([]);
  const [traitChipVisible, setTraitChipVisible] = useState(false);
  const [traitChipTraits, setTraitChipTraits] = useState<string[]>([]);
  const [traitChipKey, setTraitChipKey] = useState(0);
  const [achievementToastIds, setAchievementToastIds] = useState<string[]>([]);
  const [achievementToastVisible, setAchievementToastVisible] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  // shopOpen state removed — IAP disabled
  const [daySummaryVisible, setDaySummaryVisible] = useState(false);
  const [examPrepBoostApplied, setExamPrepBoostApplied] = useState(0);
  const lastTraitBoostPromptKeyRef = useRef<number>(0);
  const [shoppingDiscountPending, setShoppingDiscountPending] = useState(false);
  const unlockedAchievementIds = useMemo(
    () => unlockedAchievements.map(a => a.achievementId),
    [unlockedAchievements]
  );
  const currentAchievementIds = useMemo(
    () => (gameState.unlockedAchievements || []).map(a => a.achievementId),
    [gameState.unlockedAchievements]
  );

  const toastDurationMs = 3000;
  const toastDismissDelayMs = 350;
  const enqueueToast = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'success'
  ) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => {
      const next = [...prev, { id, message, type }];
      const maxToasts = 4;
      return next.length > maxToasts ? next.slice(-maxToasts) : next;
    });
    setTimeout(() => {
      setToasts(prev => prev.filter(item => item.id !== id));
    }, toastDurationMs + toastDismissDelayMs);
  }, [toastDurationMs, toastDismissDelayMs]);
  const buildTraitToastMessage = useCallback((traitChanges: TraitChangeFeedback[]): string | null => {
    if (!traitChanges || traitChanges.length === 0) return null;

    const summary = traitChanges.map(change => change.summary).join(' ');
    const guidance = traitChanges.find(change => !!change.guidance)?.guidance;
    return guidance
      ? `${summary}\n${t('ui.feedbackOverlay.hints', undefined, 'Ipuclari:')} ${guidance}`
      : summary;
  }, [t]);

  const triggerMilestoneShare = useCallback(async (message: string) => {
    try {
      const available = await Sharing.isAvailableAsync();
      if (!available) return;
      // expo-sharing requires a file URI; for text-only sharing, use clipboard fallback
      // For now we just show a toast with the share text — full share integration requires a file
      enqueueToast(message, 'info');
    } catch {
      // Sharing not available — silently ignore
    }
  }, [enqueueToast]);

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
    const clampedEnergy = Math.min(gameState.maxEnergy, stats.energy + rewardAmount);
    const delta = Math.max(0, clampedEnergy - stats.energy);

    if (delta > 0) {
      updateStats({ energy: delta });
      enqueueToast(t('messages.energyGained', { amount: delta }, `+{amount} enerji kazandin`), 'success');
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
  }, [enqueueToast, gameState.maxEnergy, stats.energy, t, updateStats]);

  const clearExamPrepBoost = useCallback(() => {
    if (examPrepBoostApplied <= 0) return;
    updateStats({ intelligence: -examPrepBoostApplied });
    setExamPrepBoostApplied(0);
  }, [examPrepBoostApplied, updateStats]);

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

    const traitProgress = gameState.traitProgress || {};
    const entries = Object.entries(traitProgress);
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
      ...traitProgress,
      [traitId]: {
        ...current,
        points: nextPoints,
        lastProgressTurn: gameState.turn,
      },
    };

    updateGameState({ traitProgress: nextTraitProgress });

    enqueueToast(
      t(
        'app.ads.traitBoostApplied',
        { trait: getTraitName(traitId), amount: appliedBoost },
        `{trait} ilerlemesi +{amount}`
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
  }, [enqueueToast, gameState.traitProgress, gameState.turn, t, updateGameState]);

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
        `{npcName} ile iliski +{amount}`
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

    const gradeEntries = Object.entries(gameState.schoolGrades).filter(
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
        `Tahmini ortalama: {average}\nEn guclu ders: {bestSubject} ({bestScore})\nEn riskli ders: {weakestSubject} ({weakestScore})`
      )
    );

    void logRewardedAdResult({
      placement: 'report_preview',
      rewardType: 'utility',
      success: true,
      amount: Math.round(avg),
      remainingAfter,
    });
  }, [enqueueToast, gameState.schoolGrades, stats.discipline, stats.intelligence, t]);

  useEffect(() => {
    if (!traitChipVisible || traitChipTraits.length === 0) return;
    if (!isFeatureEnabled('AD_TRAIT_BOOST')) return;
    if (lastTraitBoostPromptKeyRef.current === traitChipKey) return;
    lastTraitBoostPromptKeyRef.current = traitChipKey;

    Alert.alert(
      t('app.ads.traitBoostTitle', undefined, 'Trait Takviyesi'),
      t('app.ads.traitBoostDescription', undefined, 'Reklam izleyip +1 trait ilerlemesi almak ister misin?'),
      [
        { text: t('buttons.decline', undefined, 'Vazgec'), style: 'cancel' },
        { text: t('buttons.watchAd', undefined, 'Reklam Izle'), onPress: () => void claimTraitBoostAd() },
      ]
    );
  }, [claimTraitBoostAd, t, traitChipKey, traitChipTraits.length, traitChipVisible]);

  useEffect(() => {
    if (achievementsLoading) return;
    void checkAchievements();
  }, [
    achievementsLoading,
    checkAchievements,
    stats,
    gameState.turn,
    gameState.age,
    gameState.phase,
    gameState.skills,
    gameState.schoolGrades,
  ]);

  useEffect(() => {
    if (achievementsLoading) return;
    const currentSet = new Set(currentAchievementIds);
    const hasDiff = unlockedAchievementIds.length !== currentAchievementIds.length
      || unlockedAchievementIds.some(id => !currentSet.has(id));
    if (hasDiff) {
      updateGameState({ unlockedAchievements });
    }
  }, [achievementsLoading, unlockedAchievementIds, currentAchievementIds, unlockedAchievements, updateGameState]);

  useEffect(() => {
    if (gameState.age > previousAgeRef.current) {
      levelUp();
      void (async () => {
        void logInterstitialOpportunity({ placement: 'age_transition' });
        const interstitial = await showInterstitialAdDetailed();
        void logInterstitialResult({
          placement: 'age_transition',
          shown: interstitial.shown,
          reason: interstitial.reason,
        });
      })();
    }
    previousAgeRef.current = gameState.age;
  }, [gameState.age]);

  useEffect(() => {
    if (gameState.pendingReportCard && !previousReportCardRef.current) {
      const gradeValues = Object.values(gameState.schoolGrades).filter(
        (value): value is number => typeof value === 'number'
      );
      const averageGrade = gradeValues.length > 0
        ? gradeValues.reduce((sum, value) => sum + value, 0) / gradeValues.length
        : 0;

      if (averageGrade >= 70) {
        gradeGood();
      } else {
        gradeBad();
      }
    }

    previousReportCardRef.current = gameState.pendingReportCard;
  }, [gameState.pendingReportCard, gameState.schoolGrades]);

  useEffect(() => {
    const isCritical = stats.health <= 20;
    if (isCritical && !previousHealthCriticalRef.current) {
      healthCritical();
    }
    previousHealthCriticalRef.current = isCritical;
  }, [stats.health]);

  // Exam handler hook
  const {
    examGameVisible,
    currentExamType,
    examDifficulty,
    openExamGame,
    handleExamComplete: examHandlerComplete,
    handleExamCancel,
  } = useExamHandler({
    age: gameState.age,
    intelligence: stats.intelligence,
    schoolGrades: gameState.schoolGrades,
    skills: gameState.skills,
    traitIds: gameState.traits,
    updateSchoolGrades: (grades) => updateGameState({ schoolGrades: grades }),
    updateSkills: (skills) => updateGameState({ skills }),
    updateStats,
    markExamTaken,
    onExamComplete: (result) => {
      // Show result toast
      const accuracy = Math.round((result.correctAnswers / result.totalQuestions) * 100);
      const gradeEmoji = accuracy >= 85 ? '\uD83C\uDFC6' : accuracy >= 70 ? '\uD83C\uDF89' : accuracy >= 50 ? '\u2705' : '\uD83D\uDE30';
      const correctCount = `${result.correctAnswers}/${result.totalQuestions} (%${accuracy})`;
      enqueueToast(
        `${gradeEmoji} ${t('messages.examFinished', undefined, 'Sinav Bitti!')}\n\n` +
        `${t('messages.examCorrect', { count: correctCount }, 'Dogru: {count}')}\n` +
        `${t('messages.examGradeBonus', { bonus: result.gradeBonus }, 'Not Bonusu: +{bonus}')}\n` +
        `${t('messages.examScore', { score: result.finalScore }, 'Puan: {score}')}`,
        accuracy >= 50 ? 'success' : 'warning'
      );
      if (examPrepBoostApplied > 0) {
        clearExamPrepBoost();
        enqueueToast(t('messages.examFocusEnded', undefined, 'Sinav odak takviyesi sona erdi'), 'info');
      }
    },
  });

  const handleExamCancelWithBoostReset = useCallback(() => {
    clearExamPrepBoost();
    handleExamCancel();
  }, [clearExamPrepBoost, handleExamCancel]);

  const cardStyle = useMemo(() => ({
    backgroundColor: theme.surfaceBase,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 20,
    marginBottom: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.1)',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  }), [theme.surfaceBase, theme.border]);

  const isEventActive = gameState.phase === 'EVENT' || gameState.phase === 'RESULT' || gameState.phase === 'GAME_OVER';
  const isInteractionLocked = isEventActive;
  const dreamProgress = useMemo(
    () => calculateSelectedGoalStatProgress(gameState.selectedGoal ?? null, stats),
    [gameState.selectedGoal, stats]
  );
  const riskData = useMemo(
    () => calculateEndingErrorDebt(gameState, stats),
    [gameState, stats]
  );
  const riskPercent = riskData.total;
  const riskReasons = riskData.reasons;
  const careerPathActionsEnabled = isFeatureEnabled('CAREER_PATH_ACTIONS');

  // Calculate available categories based on age
  const availableCategories = useMemo(() => {
    const localizedCategories = getLocalizedActionCategories();
    return filterActionCategoriesForContext(
      localizedCategories,
      gameState.age,
      gameState.selectedGoal ?? null,
      { careerPathActionsEnabled }
    );
  }, [careerPathActionsEnabled, gameState.age, gameState.selectedGoal, t]);
  const daySummaryVarietyBonus = useMemo(
    () => calculateVarietyBonus(gameState.actionHistory || []),
    [gameState.actionHistory]
  );

  const handleCategoryPress = useCallback((category: ActionCategory) => {
    selectionHaptic();
    setSelectedCategory(category);
    setBottomSheetVisible(true);
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setBottomSheetVisible(false);
    setSelectedCategory(null);
  }, []);

  const promptExamPrepAndStartExam = useCallback((examType: ExamGameType) => {
    const startExam = () => {
      clearExamPrepBoost();
      openExamGame(examType);
    };

    Alert.alert(
      t('dialogs.examPrep.title', undefined, 'Sinav Hazirligi'),
      t('dialogs.examPrep.description', undefined, 'Sinav oncesi reklam izleyip gecici +15 zeka odagi almak ister misin?'),
      [
        {
          text: t('buttons.startDirect', undefined, 'Direkt Basla'),
          onPress: startExam,
        },
        {
          text: t('buttons.watchAd', undefined, 'Reklam Izle'),
          onPress: () => {
            void (async () => {
              clearExamPrepBoost();
              await claimExamPrepBoostAd();
              openExamGame(examType);
            })();
          },
        },
      ]
    );
  }, [claimExamPrepBoostAd, clearExamPrepBoost, openExamGame, t]);

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
      handleCloseBottomSheet();
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
      setTraitChipTraits(result.traitProgressUpdates);
      setTraitChipKey(prev => prev + 1);
      setTraitChipVisible(true);
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

    handleCloseBottomSheet();
  }, [
    buildTraitToastMessage,
    careerPathActionsEnabled,
    claimEnergyRecoveryAd,
    enqueueToast,
    gameState,
    handleCloseBottomSheet,
    selectedCategory,
    meetNewNPC,
    logGoalActionUsed,
    promptExamPrepAndStartExam,
    setStats,
    stats,
    t,
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

    if (shoppingDiscountPending) {
      return;
    }

    Alert.alert(
      t('app.ads.shoppingDiscountTitle', undefined, 'Alisveris Indirimi'),
      t('app.ads.shoppingDiscountDescription', undefined, 'Reklam izleyip bu alisveriste %20 indirim almak ister misin?'),
      [
        {
          text: t('buttons.startDirect', undefined, 'Direkt Devam Et'),
          onPress: () => executeHubAction(action),
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
                setShoppingDiscountPending(false);
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
              setShoppingDiscountPending(false);
              executeHubAction(discountedAction);
            })();
          },
        },
      ]
    );
  }, [
    buildDiscountedShoppingAction,
    enqueueToast,
    executeHubAction,
    shoppingDiscountPending,
    t,
  ]);

  // Handle report card close
  const handleReportCardClose = useCallback(() => {
    updateGameState({ pendingReportCard: false });
    selectNewEvent();
  }, [updateGameState, selectNewEvent]);

  // Handle exam period - s\u0131nav d\u00F6neminden s\u0131nava girme
  const handleExamPeriodExam = useCallback((examType: ExamGameType) => {
    promptExamPrepAndStartExam(examType);
  }, [promptExamPrepAndStartExam]);

  // Handle exam period close
  const handleExamPeriodClose = useCallback(() => {
    completeExamPeriod();
  }, [completeExamPeriod]);

  const renderHubContent = useCallback(() => {
    return (
      <FadeInUpView>
        <ActionGrid
          categories={availableCategories}
          onCategoryPress={handleCategoryPress}
        />
      </FadeInUpView>
    );
  }, [availableCategories, handleCategoryPress]);

  // Styles
  const safeAreaStyle = useMemo(() => ({
    flex: 1 as const,
    backgroundColor: theme.appBg,
  }), [theme.appBg]);

  const mainContainerStyle = useMemo(() => ({
    flex: 1,
    flexDirection: 'column' as const,
  }), []);

  const scrollViewStyle = useMemo(() => ({
    flex: 1,
    backgroundColor: theme.appBg,
  }), [theme.appBg]);

  const scrollViewContentStyle = useMemo(() => ({
    paddingHorizontal: metrics.pad,
    paddingVertical: Math.max(12, metrics.pad * 0.75),
    paddingBottom: Math.max(16, metrics.pad),
  }), [metrics.pad]);

  const footerStyle = useMemo(() => ({
    flexShrink: 0,
    backgroundColor: theme.surfaceRaised,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  }), [theme.surfaceRaised, theme.border]);

  const achievementSummary = useMemo(() => ({
    unlocked: achievementStats.unlocked,
    total: achievementStats.total,
    percentage: achievementStats.percentage,
  }), [achievementStats]);

  const endDayButtonContainerStyle = useMemo(() => ({
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
  }), []);

  const endDayButtonStyle = useMemo(() => ({
    backgroundColor: isInteractionLocked ? theme.surfaceBase : theme.accentEvent,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: 1,
    borderColor: isInteractionLocked ? theme.border : theme.accentEvent,
    opacity: isInteractionLocked ? 0.5 : 1,
  }), [isInteractionLocked, theme.surfaceBase, theme.accentEvent, theme.border]);

  const toastOffsetStep = 68;

  const examOverlayStyle = useMemo(() => ({
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    elevation: 9999,
    backgroundColor: 'transparent',
  }), []);

  const isAppTab = (tabId: string): tabId is AppTab => (
    tabId === 'hub' ||
    tabId === 'character' ||
    tabId === 'skilltree' ||
    tabId === 'social' ||
    tabId === 'settings'
  );

  const handleTabPress = useCallback((tabId: string) => {
    if (!isAppTab(tabId)) return;
    onPhaseChange(tabId);
  }, [onPhaseChange]);

  const handleEndDay = useCallback(() => {
    buttonPress();
    selectionHaptic();
    setDaySummaryVisible(true);
  }, []);

  const handleDaySummaryContinue = useCallback(async () => {
    setDaySummaryVisible(false);
    void logInterstitialOpportunity({ placement: 'day_summary' });
    const interstitial = await showInterstitialAdDetailed();
    void logInterstitialResult({
      placement: 'day_summary',
      shown: interstitial.shown,
      reason: interstitial.reason,
    });
    turnAdvance();
    try {
      advanceTurn();
    } catch (error) {
      console.error(t('errors.turnAdvanceError', undefined, 'Tur ilerliyor: HATA - advanceTurn sirasinda bir sorun olustu'), error);
    }
  }, [advanceTurn, t]);

  const activeContentTab = currentTab === 'settings' ? 'hub' : currentTab;
  const relationshipBoostEnabled = isFeatureEnabled('AD_RELATIONSHIP_BOOST');
  const reportPreviewEnabled = isFeatureEnabled('AD_REPORT_PREVIEW');

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={safeAreaStyle}>
        <View style={mainContainerStyle}>
          {/* Mobile Header */}
          <View style={{ flexShrink: 0 }}>
            <StatusHeader
              playerName={playerName}
              age={gameState.age}
              innerThought={gameState.innerThought}
              innerThoughtType={gameState.innerThoughtType}
              stats={stats}
              maxEnergy={gameState.maxEnergy}
              selectedGoal={gameState.selectedGoal ?? null}
              dreamProgress={dreamProgress}
              riskPercent={riskPercent}
              riskReasons={riskReasons}
              theme={theme}
              t={t}
            />
          </View>

          {/* Content */}
          <TabContent activeTab={activeContentTab} keepAlive>
            <TabContent.Screen name="hub">
              <ScrollView
                style={scrollViewStyle}
                contentContainerStyle={scrollViewContentStyle}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                overScrollMode="never"
                bounces={false}
              >
                {renderHubContent()}
              </ScrollView>
            </TabContent.Screen>

            <TabContent.Screen name="character">
              <ScrollView
                style={scrollViewStyle}
                contentContainerStyle={scrollViewContentStyle}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                overScrollMode="never"
                bounces={false}
              >
                <CharacterScreen
                  stats={stats}
                  traits={gameState.traits}
                  traitProgress={gameState.traitProgress || {}}
                  skills={gameState.skills}
                  schoolGrades={gameState.schoolGrades}
                  personalityState={gameState.personalityState}
                  age={gameState.age}
                  maxEnergy={gameState.maxEnergy}
                  family={gameState.family}
                  familyEvolution={gameState.familyEvolution}
                  theme={theme}
                  cardStyle={cardStyle}
                  achievementSummary={achievementSummary}
                  onOpenAchievements={() => setAchievementsOpen(true)}
                />
              </ScrollView>
            </TabContent.Screen>

            <TabContent.Screen name="skilltree">
              <View style={{ flex: 1 }}>
                <SkillTree
                  skills={gameState.skills}
                  talent={gameState.talent}
                  onBack={() => onPhaseChange('hub')}
                  theme={theme}
                  metrics={metrics}
                />
              </View>
            </TabContent.Screen>

            <TabContent.Screen name="social">
              <View style={{ flex: 1 }}>
                <SocialScreen
                  npcs={gameState.npcs}
                  currentEnergy={stats.energy}
                  currentMoney={stats.money}
                  playerAge={gameState.age}
                  playerPersonality={gameState.personality}
                  skills={gameState.skills}
                  onBack={() => onPhaseChange('hub')}
                  onInteract={(npcId, actionType) => {
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
                        setTraitChipTraits(traitResult.progressUpdates);
                        setTraitChipKey(prev => prev + 1);
                        setTraitChipVisible(true);
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
                  }}
                  onOfferRelationshipBoostAd={relationshipBoostEnabled ? offerRelationshipBoostAd : undefined}
                  onMeetNew={() => {
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
                  }}
                  theme={theme}
                />
              </View>
            </TabContent.Screen>
          </TabContent>

          {/* Footer */}
          <View style={footerStyle}>
            {/* End Day Button */}
            <View style={endDayButtonContainerStyle}>
              <TouchableOpacity
                onPress={handleEndDay}
                style={[endDayButtonStyle, { pointerEvents: isInteractionLocked ? 'none' : 'auto' }]}
                accessibilityRole="button"
                accessibilityLabel={t('game.endDay', undefined, 'Gunu Bitir')}
                accessibilityHint={t('game.endDayHint', undefined, 'Siradaki tura gecer')}
              >
                <Text style={{
                  color: isInteractionLocked ? theme.textSecondary : '#ffffff',
                  fontSize: 16,
                  fontWeight: '700',
                }}>
                  {t('game.endDay', undefined, 'Gunu Bitir')}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Bar */}
            <TabBar
              currentTab={currentTab}
              onTabPress={handleTabPress}
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Action Bottom Sheet */}
      <ActionBottomSheet
        visible={bottomSheetVisible}
        category={selectedCategory}
        onClose={handleCloseBottomSheet}
        onSelectAction={handleActionSelect}
        theme={theme}
        currentAge={gameState.age}
        currentEnergy={stats.energy}
        currentMoney={stats.money}
        skills={gameState.skills}
        actionHistory={gameState.actionHistory || []}
        inventory={gameState.inventory || []}
        familyWealth={gameState.family?.wealth}
      />

      {/* Toasts */}
      {toasts.map((toast, index) => (
        <MessageToast
          key={toast.id}
          visible
          message={toast.message}
          type={toast.type}
          style={{ top: 60 + index * toastOffsetStep }}
          onClose={() => setToasts(prev => prev.filter(item => item.id !== toast.id))}
        />
      ))}

      <Toast
        key={traitChipKey}
        visible={traitChipVisible}
        position="bottom"
        animationType="popIn"
        duration={2200}
        onClose={() => setTraitChipVisible(false)}
      >
        <TraitProgressChip traits={traitChipTraits} theme={theme} />
      </Toast>

      {achievementToastVisible && achievementToastIds.length > 0 && (
        <AchievementToast
          achievementIds={achievementToastIds}
          onClose={() => setAchievementToastVisible(false)}
        />
      )}

      {achievementsOpen && (
        <AchievementList
          unlockedAchievementIds={unlockedAchievementIds}
          getProgress={getProgress}
          onClose={() => setAchievementsOpen(false)}
          theme={{
            appBg: theme.appBg,
            surfaceBase: theme.surfaceBase,
            surfaceRaised: theme.surfaceRaised,
            textPrimary: theme.textPrimary,
            textSecondary: theme.textSecondary,
            border: theme.border,
            accentEvent: theme.accentEvent,
          }}
        />
      )}

      {/* Exam Game Overlay */}
      {examGameVisible && currentExamType && (
        <View style={examOverlayStyle}>
          <ErrorBoundary>
            <MiniGameContainer
              type={currentExamType}
              difficulty={examDifficulty}
              age={gameState.age}
              onComplete={examHandlerComplete}
              onCancel={handleExamCancelWithBoostReset}
            >
              {(() => {
                switch (currentExamType) {
                  case 'MATH': return <MathExamGame />;
                  case 'TURKISH': return <TurkishExamGame />;
                  case 'SCIENCE': return <ScienceExamGame />;
                  case 'HISTORY': return <HistoryExamGame />;
                  case 'GEOGRAPHY': return <GeographyExamGame />;
                  case 'ENGLISH': return <EnglishExamGame />;
                  case 'ART': return <ArtExamGame />;
                  case 'MUSIC': return <MusicExamGame />;
                  default: return null;
                }
              })()}
            </MiniGameContainer>
          </ErrorBoundary>
        </View>
      )}

      {/* Report Card Modal */}
      {gameState.family && (
        <ReportCard
          visible={gameState.pendingReportCard}
          grades={gameState.schoolGrades}
          family={gameState.family}
          age={gameState.age}
          onClose={handleReportCardClose}
        />
      )}

      {/* FloatingText Overlay */}
      <FloatingText
        texts={floatingTexts}
        onTextComplete={removeFloatingText}
      />

      {/* Exam Period Modal */}
      <ExamPeriodModal
        visible={(gameState.isExamPeriod || false) && !examGameVisible}
        examsTaken={gameState.examsTakenThisYear || []}
        onTakeExam={handleExamPeriodExam}
        reportPreviewEnabled={reportPreviewEnabled}
        onWatchReportPreviewAd={reportPreviewEnabled ? () => void claimReportPreviewAd() : undefined}
        onClose={handleExamPeriodClose}
      />

      {/* Day Summary Modal */}
      <DaySummaryModal
        visible={daySummaryVisible}
        age={gameState.age}
        turn={gameState.turn}
        dailyDecisionCount={gameState.dailyDecisionCount ?? 0}
        varietyBonus={daySummaryVarietyBonus}
        energy={stats.energy}
        maxEnergy={gameState.maxEnergy}
        stats={stats}
        theme={theme}
        onContinue={handleDaySummaryContinue}
      />
    </View>
  );
};

export const GameScreen: React.FC<GameScreenProps> = React.memo(GameScreenComponent);
GameScreen.displayName = 'GameScreen';
