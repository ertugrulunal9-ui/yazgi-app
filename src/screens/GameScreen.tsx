import React, { useMemo, useCallback, useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../context/GameContext';
import { useUI } from '../context/UIContext';
import { useStats } from '../hooks/useStats';
import { useEvents } from '../hooks/useEvents';
import { useNPCs } from '../hooks/useNPCs';
import { useExamHandler } from '../hooks/useExamHandler';
import { useFloatingTexts, useGameActions } from '../hooks/useGameSelectors';
import { AppTab, Stats } from '../types';
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
import { ACTION_CATEGORIES, ActionCategory, SubAction, ExamGameType } from '../data/actions';
import { FloatingText } from '../components/FloatingText';
import { SkillTree } from '../components/SkillTree';
import { SocialScreen } from '../components/SocialScreen';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { CharacterScreen } from './CharacterScreen';
import { AchievementList } from '../components/AchievementList';
import { AchievementToast } from '../components/AchievementToast';
import { RewardedAdButton } from '../components/RewardedAdButton';
import ShopModal from '../components/ShopModal';
import { useAchievements } from '../hooks/useAchievements';
import { logAchievementUnlocked, logHubAction, logTraitFormed } from '../utils/analyticsEvents';
import { HubActionCommand } from '../commands/ActionCommand';
import { TabContent } from '../components/ui';
import { calculateEndingErrorDebt, calculateSelectedGoalStatProgress } from '../utils/endingResolver';
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

interface GameScreenProps {
  onPhaseChange: (tab: AppTab) => void;
  currentTab: AppTab;
}

const hubActionCommand = new HubActionCommand();
const GameScreenComponent: React.FC<GameScreenProps> = ({ onPhaseChange, currentTab }) => {
  const { theme, metrics, t } = useUI();
  const { gameState, playerName } = useGame();
  const { updateGameState, updateStats, setStats } = useGameActions();
  const { floatingTexts, removeFloatingText } = useFloatingTexts();
  const { stats } = useStats();
  const { advanceTurn, markExamTaken, completeExamPeriod, selectNewEvent } = useEvents();
  const { interactWithNPC, meetNewNPC } = useNPCs();
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
  const [shopOpen, setShopOpen] = useState(false);
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

  const monetizationTheme = useMemo(() => ({
    appBg: theme.appBg,
    surfaceBase: theme.surfaceBase,
    surfaceRaised: theme.surfaceRaised,
    textPrimary: theme.textPrimary,
    textSecondary: theme.textSecondary,
    border: theme.border,
    accentEvent: theme.accentEvent,
  }), [theme.appBg, theme.surfaceBase, theme.surfaceRaised, theme.textPrimary, theme.textSecondary, theme.border, theme.accentEvent]);

  const handleRewardClaimed = useCallback((reward: { type: 'energy' | 'intelligence' | 'money'; amount: number }) => {
    if (reward.type === 'energy') {
      const clampedEnergy = Math.min(gameState.maxEnergy, stats.energy + reward.amount);
      const delta = Math.max(0, clampedEnergy - stats.energy);
      if (delta > 0) {
        updateStats({ energy: delta });
        enqueueToast(`+${delta} enerji kazandin`, 'success');
      } else {
        enqueueToast('Enerjin zaten dolu', 'info');
      }
      return;
    }

    if (reward.type === 'intelligence') {
      updateStats({ intelligence: reward.amount });
      enqueueToast(`+${reward.amount} zeka kazandin`, 'success');
      return;
    }

    updateStats({ money: reward.amount });
    enqueueToast(`+${reward.amount} para kazandin`, 'success');
  }, [enqueueToast, gameState.maxEnergy, stats.energy, updateStats]);

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
      enqueueToast(
        `${gradeEmoji} S\u0131nav Bitti!\n\n` +
        `Do\u011Fru: ${result.correctAnswers}/${result.totalQuestions} (%${accuracy})\n` +
        `Not Bonusu: +${result.gradeBonus}\n` +
        `Puan: ${result.finalScore}`,
        accuracy >= 50 ? 'success' : 'warning'
      );
    },
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
  const riskPercent = useMemo(
    () => calculateEndingErrorDebt(gameState, stats).total,
    [gameState, stats]
  );

  // Calculate available categories based on age
  const availableCategories = useMemo(() => {
    return ACTION_CATEGORIES.filter(category => {
      if (category.minAge && gameState.age < category.minAge) return false;
      if (category.maxAge !== undefined && gameState.age > category.maxAge) return false;
      return true;
    });
  }, [gameState.age]);

  const handleCategoryPress = useCallback((category: ActionCategory) => {
    selectionHaptic();
    setSelectedCategory(category);
    setBottomSheetVisible(true);
  }, []);

  const handleCloseBottomSheet = useCallback(() => {
    setBottomSheetVisible(false);
    setSelectedCategory(null);
  }, []);

  const handleActionSelect = useCallback((action: SubAction) => {
    buttonPress();
    selectionHaptic();

    const result = hubActionCommand.execute({
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
      return;
    }

    if (result.status === 'open_exam') {
      if (result.opensExamGame) {
        openExamGame(result.opensExamGame);
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
    if (result.newTraits.length > 0) {
      result.newTraits.forEach(traitId => {
        void logTraitFormed(traitId, gameState.age);
      });
    }

    enqueueToast(result.feedbackMessage, 'success');

    if (action.id === 'social_meet_new') {
      const socialResult = meetNewNPC();
      if (socialResult.success && socialResult.npc) {
        enqueueToast(`${socialResult.npc.name} ile tanistin!`, 'success');
      }
    }

    handleCloseBottomSheet();
  }, [gameState, stats, updateGameState, handleCloseBottomSheet, meetNewNPC, openExamGame, setStats, enqueueToast]);

  // Handle report card close
  const handleReportCardClose = useCallback(() => {
    updateGameState({ pendingReportCard: false });
    selectNewEvent();
  }, [updateGameState, selectNewEvent]);

  // Handle exam period - s\u0131nav d\u00F6neminden s\u0131nava girme
  const handleExamPeriodExam = useCallback((examType: ExamGameType) => {
    openExamGame(examType);
  }, [openExamGame]);

  // Handle exam period close
  const handleExamPeriodClose = useCallback(() => {
    completeExamPeriod();
  }, [completeExamPeriod]);

  const renderHubContent = useCallback(() => {
    return (
      <FadeInUpView>
        <View style={{ marginBottom: 12 }}>
          <TouchableOpacity
            onPress={() => setShopOpen(true)}
            style={{
              backgroundColor: theme.surfaceRaised,
              borderWidth: 1,
              borderColor: theme.border,
              borderRadius: 12,
              paddingHorizontal: 14,
              paddingVertical: 12,
              marginBottom: 10,
            }}
            accessibilityRole="button"
            accessibilityLabel="Premium magaza"
            accessibilityHint="Oyun ici premium urunleri goruntuler"
          >
            <Text style={{ color: theme.textPrimary, fontWeight: '700', fontSize: 14 }}>
              Premium Magaza
            </Text>
            <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 2 }}>
              Reklamsiz deneyim, premium slotlar ve guclendiriciler
            </Text>
          </TouchableOpacity>

          <RewardedAdButton
            onRewardClaimed={handleRewardClaimed}
            currentEnergy={stats.energy}
            theme={monetizationTheme}
          />
        </View>

        <ActionGrid
          categories={availableCategories}
          onCategoryPress={handleCategoryPress}
        />
      </FadeInUpView>
    );
  }, [availableCategories, handleCategoryPress, handleRewardClaimed, monetizationTheme, stats.energy, theme.border, theme.surfaceRaised, theme.textPrimary, theme.textSecondary]);

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
    turnAdvance();
    try {
      advanceTurn();
    } catch (error) {
      console.error("Tur ilerliyor: HATA - advanceTurn s\u0131ras\u0131nda bir sorun olu\u015Ftu:", error);
    }
  }, [advanceTurn]);

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
              innerThought={gameState.innerThought}
              innerThoughtType={gameState.innerThoughtType}
              stats={stats}
              maxEnergy={gameState.maxEnergy}
              selectedGoal={gameState.selectedGoal ?? null}
              dreamProgress={dreamProgress}
              riskPercent={riskPercent}
              theme={theme}
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
                      const updates: Partial<Stats> = {};
                      if (result.cost.energy > 0) {
                        updates.energy = -result.cost.energy;
                      }
                      if (result.cost.money > 0) {
                        updates.money = -result.cost.money;
                      }
                      if (Object.keys(updates).length > 0) {
                        updateStats(updates);
                      }
                      void logHubAction(`social_${actionType}`, result.cost.energy, gameState.age, 0, {
                        turn: gameState.turn,
                        totalTurns: gameState.totalTurns || 0,
                        currentEnergy: stats.energy,
                        maxEnergy: gameState.maxEnergy,
                      });
                    }
                    return result;
                  }}
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
                accessibilityHint="Siradaki tura gecer"
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
        inventory={gameState.inventory || []}
        familyWealth={gameState.family?.wealth}
      />

      <ShopModal
        isOpen={shopOpen}
        onClose={() => setShopOpen(false)}
        placement="hub"
        theme={monetizationTheme}
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
              onCancel={handleExamCancel}
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
    </View>
  );
};

export const GameScreen: React.FC<GameScreenProps> = React.memo(GameScreenComponent);
GameScreen.displayName = 'GameScreen';
