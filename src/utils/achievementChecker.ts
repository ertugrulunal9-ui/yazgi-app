import { Stats, GameState, Skills, SchoolGrades } from '../types';
import { checkAllAchievements } from '../systems/achievementSystem';

// Track special achievement progress (for complex achievements)
export const trackSpecialProgress = (
  gameState: GameState,
  stats: Stats,
  prevStats?: Stats
): GameState => {
  const newGameState = { ...gameState };
  
  if (!newGameState.achievementProgress) {
    newGameState.achievementProgress = {};
  }

  // Track "survivor" - health dropped below 10
  if (prevStats && prevStats.health < 10 && stats.health >= 50) {
    newGameState.achievementProgress['survivor'] = 1;
  }

  // Track "broke_to_rich" - money hit 0
  if (prevStats && prevStats.money === 0 && stats.money >= 50000) {
    newGameState.achievementProgress['broke_to_rich'] = 1;
  }

  // Track "comeback_kid" - grade recovery
  if (prevStats) {
    const subjects: Array<keyof SchoolGrades> = ['math', 'science', 'language'];
    subjects.forEach(subject => {
      const prevGrade = prevStats ? 0 : 0; // Would need previous grades tracking
      if (gameState.schoolGrades[subject] >= 90) {
        newGameState.achievementProgress['comeback_kid'] = 1;
      }
    });
  }

  // Track "spender" - cumulative spending
  if (prevStats && prevStats.money > stats.money) {
    const spent = prevStats.money - stats.money;
    newGameState.achievementProgress['spender'] = 
      (newGameState.achievementProgress['spender'] || 0) + spent;
  }

  // Track "heartbreaker" - partner changes
  if (prevStats && gameState.npcs.some(n => n.role === 'PARTNER')) {
    newGameState.achievementProgress['heartbreaker'] = 
      (newGameState.achievementProgress['heartbreaker'] || 0) + 1;
  }

  return newGameState;
};

// Auto-check achievements on game state change
export const autoCheckAchievements = async (
  stats: Stats,
  gameState: GameState,
  skills: Skills,
  grades: SchoolGrades,
  onNewUnlock?: (achievementIds: string[]) => void
): Promise<void> => {
  try {
    const unlockedAchievements = gameState.unlockedAchievements || [];
    
    // Non-blocking check
    setTimeout(async () => {
      const newlyUnlocked = await checkAllAchievements(
        stats,
        gameState,
        skills,
        grades,
        unlockedAchievements
      );

      if (newlyUnlocked.length > 0 && onNewUnlock) {
        onNewUnlock(newlyUnlocked.map(a => a.achievementId));
      }
    }, 0);
  } catch (error) {
    console.error('Auto-check achievements failed:', error);
  }
};

// Debounced achievement check (performance optimization)
let checkTimeout: NodeJS.Timeout | null = null;

export const debouncedAchievementCheck = (
  stats: Stats,
  gameState: GameState,
  skills: Skills,
  grades: SchoolGrades,
  onNewUnlock?: (achievementIds: string[]) => void,
  delay: number = 500
): void => {
  if (checkTimeout) {
    clearTimeout(checkTimeout);
  }

  checkTimeout = setTimeout(() => {
    autoCheckAchievements(stats, gameState, skills, grades, onNewUnlock);
  }, delay);
};
