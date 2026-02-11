import { useState, useEffect, useCallback, useRef } from 'react';
import { UnlockedAchievement, Stats, GameState, Skills, SchoolGrades } from '../types';
import { 
  loadAchievements, 
  checkAllAchievements, 
  applyAchievementReward,
  getAchievementStats,
  resetAchievements,
  saveAchievements,
} from '../systems/achievementSystem';
import { ACHIEVEMENTS, getAchievement } from '../systems/achievementDefinitions';

interface UseAchievementsReturn {
  unlockedAchievements: UnlockedAchievement[];
  stats: ReturnType<typeof getAchievementStats>;
  checkAchievements: () => Promise<string[]>;
  isUnlocked: (achievementId: string) => boolean;
  getProgress: (achievementId: string) => number;
  applyRewardsToStats: (currentStats: Stats, rewards: any[]) => Stats;
  totalAchievements: number;
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
  const unlockedAchievementsRef = useRef<UnlockedAchievement[]>([]);
  const statsRef = useRef(stats);
  const gameStateRef = useRef(gameState);
  const skillsRef = useRef(skills);
  const gradesRef = useRef(grades);
  const onUnlockRef = useRef(onUnlock);

  const savedList = gameState.unlockedAchievements || [];
  const isFreshGame = gameState.turn <= 1 && gameState.age <= 1 && savedList.length === 0;

  useEffect(() => {
    unlockedAchievementsRef.current = unlockedAchievements;
  }, [unlockedAchievements]);

  useEffect(() => {
    statsRef.current = stats;
    gameStateRef.current = gameState;
    skillsRef.current = skills;
    gradesRef.current = grades;
    onUnlockRef.current = onUnlock;
  }, [stats, gameState, skills, grades, onUnlock]);

  // Load/sync unlocked achievements (prefer save data, reset on fresh game)
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        if (savedList.length > 0) {
          if (!cancelled) {
            setUnlockedAchievements(savedList);
            setLoading(false);
          }
          void saveAchievements(savedList);
          return;
        }

        if (isFreshGame) {
          await resetAchievements();
          if (!cancelled) {
            setUnlockedAchievements([]);
            setLoading(false);
          }
          return;
        }

        const loaded = await loadAchievements();
        if (!cancelled) {
          setUnlockedAchievements(loaded);
          setLoading(false);
        }
      } catch (error) {
        console.error('Achievement load failed:', error);
        if (!cancelled) {
          setUnlockedAchievements([]);
          setLoading(false);
        }
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [isFreshGame, savedList]);

  // Check all achievements
  const checkAchievements = useCallback(async (): Promise<string[]> => {
    const currentUnlocked = unlockedAchievementsRef.current;
    const newlyUnlocked = await checkAllAchievements(
      statsRef.current,
      gameStateRef.current,
      skillsRef.current,
      gradesRef.current,
      currentUnlocked
    );

    if (newlyUnlocked.length > 0) {
      setUnlockedAchievements(prev => [...prev, ...newlyUnlocked]);
      
      // Extract rewards
      const rewards = newlyUnlocked.map(ua => {
        const achievement = getAchievement(ua.achievementId);
        return achievement?.reward;
      }).filter(Boolean);

      if (onUnlockRef.current) {
        onUnlockRef.current(newlyUnlocked.map(a => a.achievementId), rewards);
      }

      return newlyUnlocked.map(a => a.achievementId);
    }

    return [];
  }, []);

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

  // Apply rewards to stats
  const applyRewardsToStats = useCallback((currentStats: Stats, rewards: any[]): Stats => {
    let newStats = { ...currentStats };
    rewards.forEach(reward => {
      if (reward) {
        newStats = applyAchievementReward(newStats, reward);
      }
    });
    return newStats;
  }, []);

  const achievementStats = getAchievementStats(unlockedAchievements);
  const totalAchievements = ACHIEVEMENTS.length;

  return {
    unlockedAchievements,
    stats: achievementStats,
    checkAchievements,
    isUnlocked,
    getProgress,
    applyRewardsToStats,
    totalAchievements,
    loading,
  };
};
