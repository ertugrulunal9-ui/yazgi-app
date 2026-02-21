import { Achievement, UnlockedAchievement, Stats, GameState, Skills, SchoolGrades, AchievementProgress } from '../types';
import { ACHIEVEMENTS } from './achievementDefinitions';
import { analyticsService } from '../services/analytics';
import { devLog } from '../utils/devLogger';

const STORAGE_KEY = '@yazgi/achievements/v1';
const hasAsyncStorage = typeof localStorage === 'undefined';

let asyncStorageModule: any = null;

const getAsyncStorage = async () => {
  if (asyncStorageModule) return asyncStorageModule;
  if (!hasAsyncStorage) return null;
  try {
    const mod = await import('@react-native-async-storage/async-storage');
    asyncStorageModule = (mod as any).default ?? mod;
    return asyncStorageModule;
  } catch {
    return null;
  }
};

// Storage helpers
export const loadAchievements = async (): Promise<UnlockedAchievement[]> => {
  try {
    if (typeof localStorage !== 'undefined') {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    const AsyncStorage = await getAsyncStorage();
    if (AsyncStorage) {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    }

    return [];
  } catch (error) {
    console.error('Failed to load achievements:', error);
    return [];
  }
};

export const saveAchievements = async (achievements: UnlockedAchievement[]): Promise<void> => {
  try {
    const data = JSON.stringify(achievements);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, data);
      return;
    }

    const AsyncStorage = await getAsyncStorage();
    if (AsyncStorage) {
      await AsyncStorage.setItem(STORAGE_KEY, data);
    }
  } catch (error) {
    console.error('Failed to save achievements:', error);
  }
};

// Check if achievement is unlocked
export const isAchievementUnlocked = (achievementId: string, unlockedAchievements: UnlockedAchievement[]): boolean => {
  return unlockedAchievements.some(a => a.achievementId === achievementId);
};

// Unlock achievement (non-blocking, returns reward)
export const unlockAchievement = async (
  achievement: Achievement,
  gameState: GameState,
  unlockedAchievements: UnlockedAchievement[],
  showFloatingText?: (text: string, x: number, y: number, color: string, options?: any) => void
): Promise<{ unlocked: UnlockedAchievement; reward: Achievement['reward'] } | null> => {
  // Already unlocked
  if (isAchievementUnlocked(achievement.id, unlockedAchievements)) {
    return null;
  }

  const unlocked: UnlockedAchievement = {
    achievementId: achievement.id,
    unlockedAt: gameState.age,
    timestamp: new Date().toISOString(),
  };

  const newAchievements = [...unlockedAchievements, unlocked];
  await saveAchievements(newAchievements);

  // Analytics
  analyticsService.logCustomEvent('achievement_unlocked', {
    achievement_id: achievement.id,
    achievement_name: achievement.name,
    rarity: achievement.rarity,
    category: achievement.category,
    age: gameState.age,
  });

  devLog.log(`🏆 Achievement Unlocked: ${achievement.name}`);

  // Floating Text Feedback
  if (showFloatingText) {
    showFloatingText(
      `🏆 ${achievement.name}`,
      100 + Math.random() * 100, // Center-ish
      100, // Top area
      '#fbbf24', // Gold
      { animationType: 'bounce', duration: 3000 }
    );
  }

  return { unlocked, reward: achievement.reward };
};

// Check single achievement
export const checkAchievement = (
  achievement: Achievement,
  stats: Stats,
  gameState: GameState,
  skills: Skills,
  grades: SchoolGrades
): boolean | AchievementProgress => {
  try {
    return achievement.check(stats, gameState, skills, grades);
  } catch (error) {
    console.error(`Achievement check failed: ${achievement.id}`, error);
    return false;
  }
};

// Batch check all achievements (performance optimized)
export const checkAllAchievements = async (
  stats: Stats,
  gameState: GameState,
  skills: Skills,
  grades: SchoolGrades,
  unlockedAchievements: UnlockedAchievement[],
  showFloatingText?: (text: string, x: number, y: number, color: string, options?: any) => void
): Promise<UnlockedAchievement[]> => {
  const newlyUnlocked: UnlockedAchievement[] = [];
  const currentUnlocked = [...unlockedAchievements];

  for (const achievement of ACHIEVEMENTS) {
    // Skip already unlocked
    if (isAchievementUnlocked(achievement.id, currentUnlocked)) {
      continue;
    }

    const result = checkAchievement(achievement, stats, gameState, skills, grades);

    // Boolean result (unlocked)
    if (result === true) {
      const unlock = await unlockAchievement(achievement, gameState, currentUnlocked, showFloatingText);
      if (unlock) {
        newlyUnlocked.push(unlock.unlocked);
        currentUnlocked.push(unlock.unlocked);
      }
    }
  }

  return newlyUnlocked;
};

// Get progress for achievement (0-100%)
export const getAchievementProgress = (
  achievement: Achievement,
  stats: Stats,
  gameState: GameState,
  skills: Skills,
  grades: SchoolGrades
): number => {
  const result = checkAchievement(achievement, stats, gameState, skills, grades);

  if (typeof result === 'boolean') {
    return result ? 100 : 0;
  }

  if (result && typeof result === 'object' && 'current' in result && 'target' in result) {
    return Math.min(100, (result.current / result.target) * 100);
  }

  return 0;
};

// Apply achievement reward to stats
export const applyAchievementReward = (
  stats: Stats,
  reward: Achievement['reward']
): Stats => {
  if (!reward) return stats;

  const newStats = { ...stats };

  if (reward.money) {
    newStats.money += reward.money;
  }

  if (reward.stats) {
    Object.keys(reward.stats).forEach(key => {
      const statKey = key as keyof Stats;
      const value = reward.stats![statKey];
      if (typeof value === 'number') {
        newStats[statKey] = (newStats[statKey] as number) + value;
        // Clamp stats
        if (statKey !== 'money') {
          newStats[statKey] = Math.min(100, Math.max(0, newStats[statKey] as number));
        }
      }
    });
  }

  return newStats;
};

// Get achievement stats (for UI)
export const getAchievementStats = (unlockedAchievements: UnlockedAchievement[]) => {
  const total = ACHIEVEMENTS.length;
  const unlocked = unlockedAchievements.length;
  const percentage = Math.round((unlocked / total) * 100);

  const byRarity = {
    COMMON: 0,
    RARE: 0,
    EPIC: 0,
    LEGENDARY: 0,
  };

  unlockedAchievements.forEach(ua => {
    const achievement = ACHIEVEMENTS.find(a => a.id === ua.achievementId);
    if (achievement) {
      byRarity[achievement.rarity]++;
    }
  });

  return {
    total,
    unlocked,
    percentage,
    byRarity,
  };
};

// Share achievement (social media)
export const shareAchievement = (achievement: Achievement): string => {
  const text = `🏆 Yazgı'da "${achievement.name}" başarısını açtım! ${achievement.icon}`;
  const hashtags = ['Yazgı', 'Achievement', 'LifeSimulator'];

  // Twitter share URL
  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&hashtags=${hashtags.join(',')}`;

  return twitterUrl;
};

// Reset achievements (for testing)
export const resetAchievements = async (): Promise<void> => {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }

    const AsyncStorage = await getAsyncStorage();
    if (AsyncStorage) {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }

    devLog.log('✅ Achievements reset');
  } catch (error) {
    console.error('Failed to reset achievements:', error);
  }
};
