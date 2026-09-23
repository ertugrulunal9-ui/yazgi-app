/**
 * Performans Optimizasyonu: Selector Hooks
 *
 * Bu hook'lar GameContext'ten sadece ihtiyaç duyulan state parçalarını seçer.
 * Bu sayede gereksiz re-render'lar önlenir.
 *
 * Kullanım:
 * ❌ const { gameState, stats } = useGame(); // Her state değişiminde re-render
 * ✅ const { age, turn } = useGameProgress(); // Sadece age/turn değişince re-render
 */

import { useContext, useMemo } from 'react';
import { GameContext } from '../context/GameContext';
import { useMetaProgression } from '../context/MetaProgressionContext';
import { useUI } from '../context/UIContext';
import {
  SchoolGrades,
  Skills,
  GamePhase,
  CharacterInfo,
  Family,
  GameState,
  MomentumVisibility,
  Stats,
} from '../types';
import { getAcademicState, getCharacterState, getEventState, getProgressState, getSocialState } from '../utils/gameStateAdapter';
import { getLegacyBonusBreakdown } from '../utils/metaProgression';
import { getMomentumVisibilityFromPersonalityState } from '../utils/momentumVisibility';
import { getStressRecoveryRate } from '../utils/personalitySystem';

export const getMomentumVisibility = (state: GameState): MomentumVisibility => {
  return getMomentumVisibilityFromPersonalityState(state.personalityState);
};

// =================================================================
// TEMEL SELECTOR HOOKS
// =================================================================

/**
 * Sadece player stats değiştiğinde re-render
 * Kullanım: StatBar, Dashboard, vb.
 */
export const usePlayerStats = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('usePlayerStats must be used within GameProvider');
  const stats = context.gameState.stats ?? context.stats;

  return useMemo(() => ({
    stats,
    updateStats: context.updateStats,
    setStats: context.setStats,
  }), [stats, context.updateStats, context.setStats]);
};

/**
 * Header için 7 stati 4 anlamli sutuna indirger.
 */
export const usePillarStats = (overrideStats?: Stats) => {
  const context = useContext(GameContext);
  const stats = overrideStats ?? context?.gameState.stats ?? context?.stats;
  if (!stats) {
    throw new Error('usePillarStats must be used within GameProvider when overrideStats is not provided');
  }

  return useMemo(() => ({
    beden: Math.round((stats.health + stats.energy) / 2),
    zihin: Math.round((stats.intelligence + stats.discipline) / 2),
    ruh: Math.round((stats.charisma + stats.familyRelation) / 2),
    servet: stats.money,
    raw: stats,
  }), [stats]);
};

/**
 * Stress bilgisini HUD icin normalize eder.
 */
export const useStress = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useStress must be used within GameProvider');

  return useMemo(() => {
    const stress = context.gameState.stress ?? { current: 0, threshold: 70 };
    const threshold = stress.threshold > 0 ? stress.threshold : 70;
    const personality = context.gameState.personality;
    const latestSource = stress.sources?.[0];
    const recoveryPerTurn = getStressRecoveryRate(stress, personality);

    return {
      current: stress.current,
      threshold,
      ratio: stress.current / threshold,
      latestSource,
      recoveryPerTurn,
    };
  }, [context.gameState.personality, context.gameState.stress]);
};

/**
 * Legacy bonuslarini New Game UI'i icin ozetler.
 */
export const useLegacyBonuses = () => {
  const { metaProgression } = useMetaProgression();

  return useMemo(() => {
    const bonus = getLegacyBonusBreakdown(metaProgression);
    const visible = bonus.level > 0;

    return {
      visible,
      level: bonus.level,
      health: bonus.statBonus,
      intelligence: bonus.statBonus,
      charisma: bonus.statBonus,
      discipline: bonus.statBonus,
      familyRelation: bonus.relationBonus,
      money: bonus.moneyBonus,
    };
  }, [metaProgression]);
};

/**
 * Sadece oyun ilerlemesi değiştiğinde re-render
 * Kullanım: Header, ProgressBar, vb.
 */
export const useGameProgress = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameProgress must be used within GameProvider');
  const progress = getProgressState(context.gameState);

  return useMemo(() => ({
    age: progress.age,
    turn: progress.turn,
    phase: progress.phase,
    totalTurns: progress.totalTurns,
  }), [
    progress,
  ]);
};

/**
 * Sadece mevcut phase değiştiğinde re-render
 * Kullanım: Screen routing, phase-based rendering
 */
export const useGamePhase = (): GamePhase => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGamePhase must be used within GameProvider');

  return getProgressState(context.gameState).phase;
};

/**
 * Sadece NPC listesi değiştiğinde re-render
 * Kullanım: SocialScreen, NPCList
 */
export const useNPCList = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useNPCList must be used within GameProvider');
  const social = getSocialState(context.gameState);

  return useMemo(() => ({
    npcs: social.npcs,
    selectedNpcId: social.selectedNpcId,
    socialGroups: social.socialGroups,
    socialReputation: social.socialReputation,
  }), [
    social,
  ]);
};

/**
 * Sadece okul notları değiştiğinde re-render
 * Kullanım: ReportCard, SchoolStats
 */
export const useSchoolGrades = (): SchoolGrades => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useSchoolGrades must be used within GameProvider');
  const academic = getAcademicState(context.gameState);

  return useMemo(() => academic.schoolGrades, [academic]);
};

/**
 * Sadece skills değiştiğinde re-render
 * Kullanım: SkillTree, SkillBar
 */
export const useSkills = (): Skills => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useSkills must be used within GameProvider');
  const academic = getAcademicState(context.gameState);

  return useMemo(() => academic.skills, [academic]);
};

/**
 * Sadece kişilik değiştiğinde re-render
 * Kullanım: PersonalityPanel, CharacterScreen
 */
export const usePersonality = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('usePersonality must be used within GameProvider');
  const character = getCharacterState(context.gameState);

  return useMemo(() => ({
    personality: character.personality,
    stress: character.stress,
    personalityHistory: character.personalityHistory,
    personalityState: character.personalityState,
  }), [
    character,
  ]);
};

/**
 * Momentum durumunu oyuncuya okunabilir seviyede sunar (sayisal deger gizli kalir)
 */
export const useMomentumVisibility = (): MomentumVisibility => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useMomentumVisibility must be used within GameProvider');

  return useMemo(
    () => getMomentumVisibilityFromPersonalityState(context.gameState.personalityState),
    [context.gameState.personalityState]
  );
};

/**
 * Sadece traits değiştiğinde re-render
 * Kullanım: TraitList, CharacterInfo
 */
export const useTraits = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useTraits must be used within GameProvider');
  const character = getCharacterState(context.gameState);

  return useMemo(() => ({
    traits: character.traits,
    traitProgress: character.traitProgress,
  }), [character]);
};

/**
 * Sadece envanter değiştiğinde re-render
 * Kullanım: Inventory
 */
export const useInventory = (): string[] => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useInventory must be used within GameProvider');

  return useMemo(() => context.gameState.inventory, [context.gameState.inventory]);
};

/**
 * Sadece achievements değiştiğinde re-render
 * Kullanım: AchievementList, AchievementToast
 */
export const useAchievementsState = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useAchievementsState must be used within GameProvider');

  return useMemo(() => ({
    unlockedAchievements: context.gameState.unlockedAchievements,
    achievementProgress: context.gameState.achievementProgress,
  }), [context.gameState.unlockedAchievements, context.gameState.achievementProgress]);
};

/**
 * Sadece aile bilgisi değiştiğinde re-render
 * Kullanım: FamilyInfo, CharacterScreen
 */
export const useFamily = (): Family | null => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useFamily must be used within GameProvider');

  return useMemo(() => context.gameState.family, [context.gameState.family]);
};

/**
 * Sadece karakter bilgisi değiştiğinde re-render
 * Kullanım: CharacterScreen, Header
 */
export const useCharacterInfo = (): CharacterInfo | null => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useCharacterInfo must be used within GameProvider');
  const character = getCharacterState(context.gameState);

  return useMemo(() => character.characterInfo, [character]);
};

/**
 * Sadece event değiştiğinde re-render
 * Kullanım: EventScreen
 */
export const useCurrentEvent = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useCurrentEvent must be used within GameProvider');
  const events = getEventState(context.gameState);

  return useMemo(() => ({
    currentEvent: events.currentEvent,
    lastResult: events.lastResult,
  }), [events]);
};

/**
 * Sadece sınav durumu değiştiğinde re-render
 * Kullanım: ExamModal, GameScreen
 */
export const useExamState = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useExamState must be used within GameProvider');
  const academic = getAcademicState(context.gameState);

  return useMemo(() => ({
    examsTakenThisYear: academic.examsTakenThisYear,
    isExamPeriod: academic.isExamPeriod,
    pendingReportCard: context.gameState.pendingReportCard,
  }), [
    academic,
    context.gameState.pendingReportCard,
  ]);
};

// =================================================================
// KOMBİNE SELECTOR HOOKS (Yaygın kullanım kalıpları için)
// =================================================================

/**
 * Dashboard için gerekli tüm veriler
 */
export const useDashboardData = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useDashboardData must be used within GameProvider');
  const progress = getProgressState(context.gameState);
  const character = getCharacterState(context.gameState);
  const stats = context.gameState.stats ?? context.stats;

  return useMemo(() => ({
    stats,
    age: progress.age,
    turn: progress.turn,
    phase: progress.phase,
    traits: character.traits,
    maxEnergy: context.gameState.maxEnergy,
  }), [
    stats,
    progress,
    character,
    context.gameState.maxEnergy,
  ]);
};

/**
 * Karakter ekranı için gerekli tüm veriler
 */
export const useCharacterScreenData = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useCharacterScreenData must be used within GameProvider');
  const character = getCharacterState(context.gameState);
  const academic = getAcademicState(context.gameState);
  const progress = getProgressState(context.gameState);
  const stats = context.gameState.stats ?? context.stats;

  return useMemo(() => ({
    characterInfo: character.characterInfo,
    stats,
    traits: character.traits,
    personality: character.personality,
    skills: academic.skills,
    schoolGrades: academic.schoolGrades,
    age: progress.age,
  }), [
    character,
    stats,
    academic,
    progress,
  ]);
};

/**
 * Floating text yönetimi (transient UI state — UIContext'ten gelir)
 */
export const useFloatingTexts = () => {
  const { floatingTexts, showFloatingText, removeFloatingText } = useUI();
  return useMemo(() => ({
    floatingTexts,
    showFloatingText,
    removeFloatingText,
  }), [floatingTexts, showFloatingText, removeFloatingText]);
};

// =================================================================
// UTILITY HOOKS
// =================================================================

/**
 * Oyun state güncelleme fonksiyonları
 * Bu hook state değişikliklerinde re-render tetiklemez
 */
export const useGameActions = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGameActions must be used within GameProvider');

  // Sadece fonksiyonları döndür - bunlar stable referanslar
  return useMemo(() => ({
    setGameState: context.setGameState,
    updateGameState: context.updateGameState,
    setStats: context.setStats,
    updateStats: context.updateStats,
    advanceTurnInContext: context.advanceTurnInContext,
    startNewGame: context.startNewGame,
    resetGame: context.resetGame,
  }), [
    context.setGameState,
    context.updateGameState,
    context.setStats,
    context.updateStats,
    context.advanceTurnInContext,
    context.startNewGame,
    context.resetGame,
  ]);
};

/**
 * Oyuncu ismi
 */
export const usePlayerName = (): string => {
  const context = useContext(GameContext);
  if (!context) throw new Error('usePlayerName must be used within GameProvider');

  return context.playerName;
};

/**
 * Loading durumu
 */
export const useIsLoading = (): boolean => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useIsLoading must be used within GameProvider');

  return context.isLoading;
};
