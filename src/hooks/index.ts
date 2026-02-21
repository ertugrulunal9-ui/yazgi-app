/**
 * Hooks Barrel Export
 *
 * Tüm hook'ların tek noktadan import edilmesini sağlar.
 *
 * Kullanım:
 * import { useGameProgress, usePlayerStats, useNPCList } from '../hooks';
 */

// Core Game Context Hook
export { useGame } from '../context/GameContext';

// Selector Hooks (Performans Optimizasyonu)
export {
  // Temel selectors
  usePlayerStats,
  usePillarStats,
  useStress,
  useLegacyBonuses,
  useGameProgress,
  useGamePhase,
  useNPCList,
  useSchoolGrades,
  useSkills,
  usePersonality as usePersonalitySelector,
  useMomentumVisibility,
  useTraits,
  useInventory,
  useAchievementsState,
  useFamily,
  useCharacterInfo,
  useCurrentEvent,
  useExamState,

  // Kombine selectors
  useDashboardData,
  useCharacterScreenData,
  useFloatingTexts,

  // Utility hooks
  useGameActions,
  usePlayerName,
  useIsLoading,
} from './useGameSelectors';

// Domain Hooks
export { useStats } from './useStats';
export { useAchievements } from './useAchievements';
export { useEvents } from './useEvents';
export { useNPCs } from './useNPCs';
export { useExamHandler } from './useExamHandler';
export { useAudio } from './useAudio';
export { usePersonality } from './usePersonality';
