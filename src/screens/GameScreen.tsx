import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';

import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useUI } from '../context/UIContext';
import { useStats } from '../hooks/useStats';
import { useEvents } from '../hooks/useEvents';
import { useNPCs } from '../hooks/useNPCs';
import { useAdRewards } from '../hooks/useAdRewards';
import { useHubActions } from '../hooks/useHubActions';
import { useSocialInteractions } from '../hooks/useSocialInteractions';
import { useExamFlow } from '../hooks/useExamFlow';
import { useModalOrchestration } from '../hooks/useModalOrchestration';
import { useFloatingTexts, useGameActions } from '../hooks/useGameSelectors';
import type { AppTab, TraitChangeFeedback } from '../types';
import {
  FadeInUpView,
  achievementUnlock,
  healthCritical,
  levelUp,
  selectionHaptic,
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
} from '../data/actions';
import type { ActionCategory } from '../data/actions';
import { FloatingText } from '../components/FloatingText';
import { SkillTree } from '../components/SkillTree';
import { SocialScreen } from '../components/SocialScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CharacterScreen } from './CharacterScreen';
import { AchievementList } from '../components/AchievementList';
import { AchievementToast } from '../components/AchievementToast';
// ShopModal removed — monetization is ad-only
import * as Sharing from 'expo-sharing';
import { useAchievements } from '../hooks/useAchievements';
import {
  logInterstitialOpportunity,
  logInterstitialResult,
} from '../utils/analyticsEvents';
import { TabContent } from '../components/ui';
import { calculateEndingErrorDebt, calculateSelectedGoalStatProgress } from '../utils/endingResolver';
import {
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
import { AgeMilestoneModal } from '../components/AgeMilestoneModal';
import { ChapterTransitionModal } from '../components/ChapterTransitionModal';
import { SessionRecapModal } from '../components/SessionRecapModal';
import { GoalTracker } from '../components/GoalTracker';
import { isFeatureEnabled } from '../config/featureFlags';
import type { AgeMilestoneSummary, ChapterSummary } from '../types/game';
import { getCurrentChapter, getLocalizedChapterName } from '../utils/gameUtils';
import { CHAPTERS } from '../config/gameBalance';

interface GameScreenProps {
  onPhaseChange: (tab: AppTab) => void;
  currentTab: AppTab;
}

const GameScreenComponent: React.FC<GameScreenProps> = ({ onPhaseChange, currentTab }) => {
  const { theme, metrics, locale, t } = useUI();
  const { gameState, playerName } = useGame();
  const { updateGameState, updateStats, setStats } = useGameActions();
  const { floatingTexts, removeFloatingText } = useFloatingTexts();
  const { stats } = useStats();
  const { advanceTurn, markExamTaken, completeExamPeriod, selectNewEvent } = useEvents();
  const {
    interactWithNPC,
    meetNewNPC,
    leaveGroup,
    getPlayerGroups,
  } = useNPCs();
  const previousAgeRef = useRef(gameState.age);
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
    }
  );

  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
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
  const [currentMilestoneToShow, setCurrentMilestoneToShow] = useState<AgeMilestoneSummary | null>(null);
  const shownMilestoneAgesRef = useRef<Set<number>>(new Set());
  const [currentChapterToShow, setCurrentChapterToShow] = useState<ChapterSummary | null>(null);
  const shownChaptersRef = useRef<Set<number>>(new Set());
  const [sessionRecapVisible, setSessionRecapVisible] = useState(false);
  const sessionRecapShownRef = useRef(false);
  // shopOpen state removed — IAP disabled
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
  const showTraitProgressChip = useCallback((traitIds: string[]) => {
    if (!traitIds || traitIds.length === 0) return;
    setTraitChipTraits(traitIds);
    setTraitChipKey(prev => prev + 1);
    setTraitChipVisible(true);
  }, []);

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

  const {
    examPrepBoostApplied,
    clearExamPrepBoost,
    claimEnergyRecoveryAd,
    claimExamPrepBoostAd,
    claimUndoAd, // Used by Paket 10 undo mechanic
  } = useAdRewards({
    t,
    stats,
    maxEnergy: gameState.maxEnergy,
    enqueueToast,
    updateStats,
  });
  void claimUndoAd; // Paket 10 — will be wired to undo mechanic

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
    const isCritical = stats.health <= 20;
    if (isCritical && !previousHealthCriticalRef.current) {
      healthCritical();
    }
    previousHealthCriticalRef.current = isCritical;
  }, [stats.health]);

  // Faz 1C: Auto-save toast — tur ilerledikten sonra "Kaydedildi" bildirimi
  const previousTotalTurnsRef = useRef(gameState.totalTurns ?? 0);
  useEffect(() => {
    const current = gameState.totalTurns ?? 0;
    if (current > previousTotalTurnsRef.current) {
      previousTotalTurnsRef.current = current;
      enqueueToast(t('ui.autosave.saved', undefined, 'Kaydedildi'), 'info');
    }
  }, [gameState.totalTurns, enqueueToast, t]);

  useEffect(() => {
    if (!isFeatureEnabled('MILESTONE_SUMMARY')) return;
    const summaries = gameState.ageMilestoneSummaries;
    if (!summaries?.length) return;

    const lastSummary = summaries[summaries.length - 1];
    if (!shownMilestoneAgesRef.current.has(lastSummary.age)) {
      setCurrentMilestoneToShow(lastSummary);
    }
  }, [gameState.ageMilestoneSummaries]);

  const handleMilestoneClose = useCallback(() => {
    if (currentMilestoneToShow) {
      shownMilestoneAgesRef.current.add(currentMilestoneToShow.age);
    }
    setCurrentMilestoneToShow(null);
  }, [currentMilestoneToShow]);

  useEffect(() => {
    if (!isFeatureEnabled('CHAPTER_SYSTEM')) return;
    const summaries = gameState.chapterSummaries;
    if (!summaries?.length) return;

    const lastSummary = summaries[summaries.length - 1];
    if (!shownChaptersRef.current.has(lastSummary.chapterId)) {
      setCurrentChapterToShow(lastSummary);
    }
  }, [gameState.chapterSummaries]);

  const handleChapterClose = useCallback(() => {
    if (currentChapterToShow) {
      shownChaptersRef.current.add(currentChapterToShow.chapterId);
    }
    setCurrentChapterToShow(null);
  }, [currentChapterToShow]);

  // Session Recap — Faz 1B: mount'ta son oturum 5+ dakika önceyse göster
  useEffect(() => {
    if (sessionRecapShownRef.current) return;
    const last = gameState.lastSessionEndedAt;
    if (!last) return;
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - last >= fiveMinutes) {
      sessionRecapShownRef.current = true;
      setSessionRecapVisible(true);
    }
  // Yalnızca mount'ta tetiklenmeli
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const {
    examGameVisible,
    currentExamType,
    examDifficulty,
    handleExamComplete: examHandlerComplete,
    handleExamCancelWithBoostReset,
    promptExamPrepAndStartExam,
    handleReportCardClose,
    handleExamPeriodExam,
    handleExamPeriodClose,
  } = useExamFlow({
    age: gameState.age,
    intelligence: stats.intelligence,
    schoolGrades: gameState.schoolGrades,
    skills: gameState.skills,
    traitIds: gameState.traits,
    markExamTaken,
    updateGameState,
    updateStats,
    completeExamPeriod,
    selectNewEvent,
    enqueueToast,
    t,
    examPrepBoostApplied,
    clearExamPrepBoost,
    claimExamPrepBoostAd,
  });

  const {
    daySummaryVisible,
    daySummaryVarietyBonus,
    handleEndDay,
    handleDaySummaryContinue,
  } = useModalOrchestration({
    pendingReportCard: gameState.pendingReportCard,
    schoolGrades: gameState.schoolGrades,
    actionHistory: gameState.actionHistory || [],
    advanceTurn,
    t,
  });

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
    const localizedCategories = getLocalizedActionCategories(locale);
    return filterActionCategoriesForContext(
      localizedCategories,
      gameState.age,
      gameState.selectedGoal ?? null,
      { careerPathActionsEnabled }
    );
  }, [careerPathActionsEnabled, gameState.age, gameState.selectedGoal, locale]);

  const selectedCategory = useMemo(
    () => availableCategories.find(category => category.id === selectedCategoryId) ?? null,
    [availableCategories, selectedCategoryId]
  );

  const handleCategoryPress = useCallback((category: ActionCategory) => {
    selectionHaptic();
    setSelectedCategoryId(category.id);
    setBottomSheetVisible(true);
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setBottomSheetVisible(false);
    setSelectedCategoryId(null);
  }, []);

  useEffect(() => {
    if (bottomSheetVisible && !selectedCategory) {
      setBottomSheetVisible(false);
      setSelectedCategoryId(null);
    }
  }, [bottomSheetVisible, selectedCategory]);

  const { handleActionSelect } = useHubActions({
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
    meetNewNPC,
    onCloseBottomSheet: handleCloseBottomSheet,
    onTraitProgressUpdates: showTraitProgressChip,
    buildTraitToastMessage,
    triggerMilestoneShare,
  });

  const {
    handleSocialInteract,
    handleMeetNewNPC,
  } = useSocialInteractions({
    gameState,
    stats,
    interactWithNPC,
    meetNewNPC,
    updateStats,
    updateGameState,
    onTraitProgressUpdates: showTraitProgressChip,
    buildTraitToastMessage,
    enqueueToast,
    triggerMilestoneShare,
  });

  const renderHubContent = useCallback(() => {
    return (
      <FadeInUpView>
        {isFeatureEnabled('MICRO_GOALS') && (
          <GoalTracker
            microGoals={gameState.microGoals ?? []}
            seasonGoal={gameState.seasonGoal ?? null}
            theme={theme}
          />
        )}
        <ActionGrid
          categories={availableCategories}
          onCategoryPress={handleCategoryPress}
        />
      </FadeInUpView>
    );
  }, [availableCategories, gameState.microGoals, gameState.seasonGoal, handleCategoryPress, theme]);

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
  const currentChapter = useMemo(() => getCurrentChapter(gameState.age), [gameState.age]);
  const currentChapterName = useMemo(
    () => getLocalizedChapterName(currentChapter.id, locale),
    [currentChapter.id, locale]
  );
  const nextChapter = useMemo(
    () => currentChapterToShow
      ? CHAPTERS.find(chapter => chapter.id === currentChapterToShow.chapterId + 1)
      : undefined,
    [currentChapterToShow]
  );

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

  const activeContentTab = currentTab === 'settings' ? 'hub' : currentTab;

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={safeAreaStyle}>
        <View style={mainContainerStyle}>
          {/* Mobile Header */}
          <View style={{ flexShrink: 0 }}>
            <StatusHeader
              playerName={playerName}
              age={gameState.age}
              chapter={currentChapter.id}
              chapterName={currentChapterName}
              chapterEmoji={currentChapter.emoji}
              avatar={gameState.avatar}
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
                  statSnapshots={gameState.statSnapshots}
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
                  onInteract={handleSocialInteract}
                  onMeetNew={handleMeetNewNPC}
                  getPlayerGroups={getPlayerGroups}
                  onLeaveGroup={leaveGroup}
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

      {isFeatureEnabled('MILESTONE_SUMMARY') && currentMilestoneToShow && (
        <AgeMilestoneModal
          visible
          milestone={currentMilestoneToShow}
          onClose={handleMilestoneClose}
        />
      )}

      {isFeatureEnabled('CHAPTER_SYSTEM') && currentChapterToShow && (
        <ChapterTransitionModal
          visible
          summary={currentChapterToShow}
          nextChapterId={nextChapter?.id}
          nextChapterEmoji={nextChapter?.emoji}
          onClose={handleChapterClose}
        />
      )}

      <SessionRecapModal
        visible={sessionRecapVisible}
        gameState={gameState}
        stats={stats}
        playerName={playerName}
        onClose={() => setSessionRecapVisible(false)}
      />
    </View>
  );
};

export const GameScreen: React.FC<GameScreenProps> = React.memo(GameScreenComponent);
GameScreen.displayName = 'GameScreen';
