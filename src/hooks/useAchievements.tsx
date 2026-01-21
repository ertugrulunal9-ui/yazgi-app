import { useState, useEffect, useCallback } from 'react';
import { UnlockedAchievement, Stats, GameState, Skills, SchoolGrades } from '../types';
import { 
  loadAchievements, 
  checkAllAchievements, 
  applyAchievementReward,
  getAchievementStats,
} from '../systems/achievementSystem';
import { ACHIEVEMENTS, getAchievement } from '../systems/achievementDefinitions';

interface UseAchievementsReturn {
  unlockedAchievements: UnlockedAchievement[];
  stats: ReturnType<typeof getAchievementStats>;
  checkAchievements: () => Promise<string[]>;
  isUnlocked: (achievementId: string) => boolean;
  getProgress: (achievementId: string) => number;
  loading: boolean;
}

export const useAchievements = (
  stats: Stats,
  gameState: GameState,
  skills: Skills,
  grades: SchoolGrades,
  onUnlock?: (achievementIds: string[], rewards: any[]) => void
): UseAchievementsReturn => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<UnlockedAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  // Load unlocked achievements on mount
  useEffect(() => {
    const load = async () => {
      const loaded = await loadAchievements();
      setUnlockedAchievements(loaded);
      setLoading(false);
    };
    load();
  }, []);

  // Check all achievements
  const checkAchievements = useCallback(async (): Promise<string[]> => {
    const newlyUnlocked = await checkAllAchievements(
      stats,
      gameState,
      skills,
      grades,
      unlockedAchievements
    );

    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);
      
      // Extract rewards
      const rewards = newlyUnlocked.map(ua => {
        const achievement = getAchievement(ua.achievementId);
        return achievement?.reward;
      }).filter(Boolean);

      if (onUnlock) {
        onUnlock(newlyUnlocked.map(a => a.achievementId), rewards);
      }

      return newlyUnlocked.map(a => a.achievementId);
    }

    return [];
  }, [stats, gameState, skills, grades, unlockedAchievements, onUnlock]);

  // Check if achievement is unlocked
  const isUnlocked = useCallback((achievementId: string): boolean => {
    return unlockedAchievements.some(a => a.achievementId === achievementId);
  }, [unlockedAchievements]);

  // Get achievement progress (0-100)
  const getProgress = useCallback((achievementId: string): number => {
    if (isUnlocked(achievementId)) return 100;

    const achievement = getAchievement(achievementId);
    if (!achievement) return 0;

    const result = achievement.check(stats, gameState, skills, grades);
    
    if (typeof result === 'boolean') {
      return result ? 100 : 0;
    }
    
    if (result && typeof result === 'object' && 'current' in result && 'target' in result) {
      return Math.min(100, Math.round((result.current / result.target) * 100));
    }
    
    return 0;
  }, [stats, gameState, skills, grades, isUnlocked]);

  const achievementStats = getAchievementStats(unlockedAchievements);

  return {
    unlockedAchievements,
    stats: achievementStats,
    checkAchievements,
    isUnlocked,
    getProgress,
    loading,
  };
};
