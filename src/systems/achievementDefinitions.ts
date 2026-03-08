import { Achievement, Stats, GameState, Skills, SchoolGrades } from '../types';
import { tRuntime } from '../i18n/strings';
import {
  hasBalancedOnboardingRoutine,
  isInOnboardingWindow,
  meetsCohortGuidanceObjective,
} from '../utils/onboardingGuidance';

const ONBOARDING_CHAIN_IDS = {
  step1: 'onboarding_chain_first_choice',
  step2: 'onboarding_chain_cohort_path',
  step3: 'onboarding_chain_routine_builder',
} as const;

const hasUnlockedAchievement = (gameState: GameState, achievementId: string): boolean => {
  return (gameState.unlockedAchievements || []).some(entry => entry.achievementId === achievementId);
};

const removeMonetaryReward = (achievement: Achievement): Achievement => {
  if (!achievement.reward) {
    return achievement;
  }

  const { money: _removedMoney, ...remainingReward } = achievement.reward;
  const hasRemainingReward = remainingReward.stats || remainingReward.item;

  return {
    ...achievement,
    reward: hasRemainingReward ? remainingReward : undefined,
  };
};

// 50+ Production-Ready Achievements
const BASE_ACHIEVEMENTS: Achievement[] = [
  // === ONBOARDING CHAIN (FIRST 3 SESSIONS) ===
  {
    id: ONBOARDING_CHAIN_IDS.step1,
    name: '',
    description: '',
    category: 'EVENTS',
    rarity: 'COMMON',
    icon: '🧭',
    isSecret: false,
    reward: { money: 400 },
    check: (_stats: Stats, gameState: GameState) => {
      if (!isInOnboardingWindow(gameState)) return false;
      return (gameState.eventChoiceHistory || []).length >= 1;
    }
  },
  {
    id: ONBOARDING_CHAIN_IDS.step2,
    name: '',
    description: '',
    category: 'EVENTS',
    rarity: 'RARE',
    icon: '🧩',
    isSecret: false,
    reward: { money: 900, stats: { discipline: 2 } },
    check: (_stats: Stats, gameState: GameState) => {
      if (!isInOnboardingWindow(gameState)) return false;
      if (!hasUnlockedAchievement(gameState, ONBOARDING_CHAIN_IDS.step1)) return false;
      return meetsCohortGuidanceObjective(gameState);
    }
  },
  {
    id: ONBOARDING_CHAIN_IDS.step3,
    name: '',
    description: '',
    category: 'EVENTS',
    rarity: 'EPIC',
    icon: '🎯',
    isSecret: false,
    reward: { money: 2000, stats: { energy: 10, intelligence: 2 } },
    check: (_stats: Stats, gameState: GameState) => {
      if (!isInOnboardingWindow(gameState)) return false;
      if (!hasUnlockedAchievement(gameState, ONBOARDING_CHAIN_IDS.step2)) return false;
      return hasBalancedOnboardingRoutine(gameState);
    }
  },

  // === STATS CATEGORY (15) ===
  {
    id: 'genius',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'EPIC',
    icon: '🧠',
    isSecret: false,
    reward: { money: 5000 },
    check: (stats: Stats, _gameState: GameState) => stats.intelligence >= 90
  },
  {
    id: 'super_genius',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'LEGENDARY',
    icon: '🎓',
    isSecret: false,
    reward: { money: 10000, stats: { intelligence: 5 } },
    check: (stats: Stats) => stats.intelligence >= 100
  },
  {
    id: 'healthy',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'RARE',
    icon: '💪',
    isSecret: false,
    reward: { money: 3000 },
    check: (stats: Stats, _gameState: GameState) => stats.health >= 90
  },
  {
    id: 'athlete',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'EPIC',
    icon: '🏆',
    isSecret: false,
    reward: { money: 7000 },
    check: (stats: Stats) => stats.health >= 100
  },
  {
    id: 'charming',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'RARE',
    icon: '✨',
    isSecret: false,
    reward: { money: 4000 },
    check: (stats: Stats) => stats.charisma >= 90
  },
  {
    id: 'superstar',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'EPIC',
    icon: '🌟',
    isSecret: false,
    reward: { money: 8000 },
    check: (stats: Stats) => stats.charisma >= 100
  },
  {
    id: 'disciplined',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'RARE',
    icon: '⚡',
    isSecret: false,
    reward: { money: 3500 },
    check: (stats: Stats) => stats.discipline >= 90
  },
  {
    id: 'iron_will',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'EPIC',
    icon: '🛡️',
    isSecret: false,
    reward: { money: 6000 },
    check: (stats: Stats) => stats.discipline >= 100
  },
  {
    id: 'balanced',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'EPIC',
    icon: '⚖️',
    isSecret: false,
    reward: { money: 10000 },
    check: (stats: Stats) => {
      return stats.health >= 70 && stats.intelligence >= 70 &&
             stats.charisma >= 70 && stats.discipline >= 70;
    }
  },
  {
    id: 'perfectionist',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'LEGENDARY',
    icon: '💎',
    isSecret: false,
    reward: { money: 50000 },
    check: (stats: Stats) => {
      return stats.health >= 90 && stats.intelligence >= 90 &&
             stats.charisma >= 90 && stats.discipline >= 90;
    }
  },
  {
    id: 'early_start',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'RARE',
    icon: '🌟',
    isSecret: false,
    reward: { money: 2000 },
    check: (stats: Stats, _gameState: GameState) => {
      return stats.health >= 50 && stats.intelligence >= 50 &&
             stats.charisma >= 50 && stats.discipline >= 50;
    }
  },
  {
    id: 'energetic',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'COMMON',
    icon: '⚡',
    isSecret: false,
    reward: { money: 500 },
    check: (stats: Stats) => stats.energy >= 80
  },
  {
    id: 'family_man',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'RARE',
    icon: '👨‍👩‍👧',
    isSecret: false,
    reward: { money: 5000 },
    check: (stats: Stats) => stats.familyRelation >= 90
  },
  {
    id: 'survivor',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'RARE',
    icon: '🩹',
    isSecret: true,
    reward: { stats: { health: 20 } },
    check: (stats: Stats, gameState: GameState) => {
      return stats.health >= 50 && gameState.achievementProgress?.['survivor'] === 1;
    }
  },
  {
    id: 'broke_to_rich',
    name: '',
    description: '',
    category: 'MONEY',
    rarity: 'EPIC',
    icon: '📈',
    isSecret: true,
    reward: { money: 20000 },
    check: (stats: Stats, gameState: GameState) => {
      return stats.money >= 50000 && gameState.achievementProgress?.['broke_to_rich'] === 1;
    }
  },
  {
    id: 'early_bloomer',
    name: '',
    description: '',
    category: 'STATS',
    rarity: 'RARE',
    icon: '🌱',
    isSecret: false,
    reward: { money: 5000 },
    check: (stats: Stats, gameState: GameState) => {
      return gameState.age < 10 && (
        stats.health >= 80 || stats.intelligence >= 80 || 
        stats.charisma >= 80 || stats.discipline >= 80
      );
    }
  },

  // === MONEY CATEGORY (8) ===
  {
    id: 'first_income',
    name: '',
    description: '',
    category: 'MONEY',
    rarity: 'COMMON',
    icon: '💵',
    isSecret: false,
    reward: { money: 100 },
    check: (stats: Stats) => stats.money > 0
  },
  {
    id: 'thousandaire',
    name: '',
    description: '',
    category: 'MONEY',
    rarity: 'COMMON',
    icon: '💰',
    isSecret: false,
    reward: { money: 500 },
    check: (stats: Stats) => stats.money >= 1000
  },
  {
    id: 'ten_thousandaire',
    name: '',
    description: '',
    category: 'MONEY',
    rarity: 'RARE',
    icon: '💸',
    isSecret: false,
    reward: { money: 2000 },
    check: (stats: Stats) => stats.money >= 10000
  },
  {
    id: 'rich',
    name: '',
    description: '',
    category: 'MONEY',
    rarity: 'EPIC',
    icon: '🤑',
    isSecret: false,
    reward: { money: 10000 },
    check: (stats: Stats) => stats.money >= 50000
  },
  {
    id: 'millionaire',
    name: '',
    description: '',
    category: 'MONEY',
    rarity: 'LEGENDARY',
    icon: '💎',
    isSecret: false,
    reward: { money: 100000 },
    check: (stats: Stats) => stats.money >= 1000000
  },
  {
    id: 'young_entrepreneur',
    name: '',
    description: '',
    category: 'MONEY',
    rarity: 'EPIC',
    icon: '👨‍💼',
    isSecret: false,
    reward: { money: 15000 },
    check: (stats: Stats, gameState: GameState) => gameState.age < 14 && stats.money >= 10000
  },
  {
    id: 'spender',
    name: '',
    description: '',
    category: 'MONEY',
    rarity: 'RARE',
    icon: '💳',
    isSecret: true,
    reward: { money: 5000 },
    check: (_stats: Stats, gameState: GameState) => (gameState.achievementProgress?.['spender'] || 0) >= 100000
  },
  {
    id: 'investor',
    name: '',
    description: '',
    category: 'MONEY',
    rarity: 'RARE',
    icon: '📊',
    isSecret: true,
    reward: { money: 10000 },
    check: (stats: Stats, gameState: GameState) => gameState.inventory.length > 0 && stats.money >= 30000
  },
  {
    id: 'saver',
    name: '',
    description: '',
    category: 'MONEY',
    rarity: 'RARE',
    icon: '💰',
    isSecret: false,
    reward: { money: 3000 },
    check: (stats: Stats, _gameState: GameState) => stats.money >= 20000
  },
  
  // === SKILLS CATEGORY (8) ===
  {
    id: 'coder',
    name: '',
    description: '',
    category: 'SKILLS',
    rarity: 'COMMON',
    icon: '💻',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.coding >= 50
  },
  {
    id: 'code_master',
    name: '',
    description: '',
    category: 'SKILLS',
    rarity: 'EPIC',
    icon: '🖥️',
    isSecret: false,
    reward: { money: 10000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.coding >= 80
  },
  {
    id: 'musician',
    name: '',
    description: '',
    category: 'SKILLS',
    rarity: 'COMMON',
    icon: '🎵',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.music >= 50
  },
  {
    id: 'virtuoso',
    name: '',
    description: '',
    category: 'SKILLS',
    rarity: 'EPIC',
    icon: '🎼',
    isSecret: false,
    reward: { money: 10000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.music >= 80
  },
  {
    id: 'sportsman',
    name: '',
    description: '',
    category: 'SKILLS',
    rarity: 'COMMON',
    icon: '⚽',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.sports >= 50
  },
  {
    id: 'pro_athlete',
    name: '',
    description: '',
    category: 'SKILLS',
    rarity: 'EPIC',
    icon: '🥇',
    isSecret: false,
    reward: { money: 10000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.sports >= 80
  },
  {
    id: 'designer',
    name: '',
    description: '',
    category: 'SKILLS',
    rarity: 'COMMON',
    icon: '🎨',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.design >= 50
  },
  {
    id: 'renaissance',
    name: '',
    description: '',
    category: 'SKILLS',
    rarity: 'LEGENDARY',
    icon: '🎭',
    isSecret: false,
    reward: { money: 30000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => {
      return skills.coding >= 60 && skills.music >= 60 &&
             skills.sports >= 60 && skills.design >= 60;
    }
  },
  {
    id: 'skill_master',
    name: '',
    description: '',
    category: 'SKILLS',
    rarity: 'EPIC',
    icon: '🎯',
    isSecret: false,
    reward: { money: 8000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => {
      return skills.coding >= 90 || skills.music >= 90 ||
             skills.sports >= 90 || skills.design >= 90;
    }
  },
  
  // === SCHOOL CATEGORY (8) ===
  {
    id: 'straight_a',
    name: '',
    description: '',
    category: 'SCHOOL',
    rarity: 'EPIC',
    icon: '📚',
    isSecret: false,
    reward: { money: 5000, stats: { intelligence: 10 } },
    check: (_stats: Stats, _gameState: GameState, _skills: Skills, grades: SchoolGrades) => {
      return grades.math >= 90 && grades.science >= 90 && grades.language >= 90;
    }
  },
  {
    id: 'math_genius',
    name: '',
    description: '',
    category: 'SCHOOL',
    rarity: 'RARE',
    icon: '🔢',
    isSecret: false,
    reward: { money: 3000 },
    check: (_stats: Stats, _gameState: GameState, _skills: Skills, grades: SchoolGrades) => grades.math >= 95
  },
  {
    id: 'scientist',
    name: '',
    description: '',
    category: 'SCHOOL',
    rarity: 'RARE',
    icon: '🔬',
    isSecret: false,
    reward: { money: 3000 },
    check: (_stats: Stats, _gameState: GameState, _skills: Skills, grades: SchoolGrades) => grades.science >= 95
  },
  {
    id: 'wordsmith',
    name: '',
    description: '',
    category: 'SCHOOL',
    rarity: 'RARE',
    icon: '📖',
    isSecret: false,
    reward: { money: 3000 },
    check: (_stats: Stats, _gameState: GameState, _skills: Skills, grades: SchoolGrades) => grades.language >= 95
  },
  {
    id: 'perfect_student',
    name: '',
    description: '',
    category: 'SCHOOL',
    rarity: 'LEGENDARY',
    icon: '🏆',
    isSecret: false,
    reward: { money: 20000, stats: { intelligence: 20 } },
    check: (_stats: Stats, _gameState: GameState, _skills: Skills, grades: SchoolGrades) => {
      return grades.math === 100 && grades.science === 100 && grades.language === 100;
    }
  },
  {
    id: 'comeback_kid',
    name: '',
    description: '',
    category: 'SCHOOL',
    rarity: 'RARE',
    icon: '📈',
    isSecret: true,
    reward: { money: 5000 },
    check: (_stats: Stats, gameState: GameState) => (gameState.achievementProgress?.['comeback_kid'] || 0) >= 1
  },
  {
    id: 'studious',
    name: '',
    description: '',
    category: 'SCHOOL',
    rarity: 'COMMON',
    icon: '✏️',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, gameState: GameState) => (gameState.actionCounts['study_math'] || 0) +
                                   (gameState.actionCounts['study_science'] || 0) +
                                   (gameState.actionCounts['study_language'] || 0) >= 50
  },
  {
    id: 'scholar',
    name: '',
    description: '',
    category: 'SCHOOL',
    rarity: 'RARE',
    icon: '🎓',
    isSecret: false,
    reward: { money: 5000 },
    check: (_stats: Stats, gameState: GameState) => (gameState.actionCounts['study_math'] || 0) +
                                   (gameState.actionCounts['study_science'] || 0) +
                                   (gameState.actionCounts['study_language'] || 0) >= 100
  },
  {
    id: 'grade_improver',
    name: '',
    description: '',
    category: 'SCHOOL',
    rarity: 'RARE',
    icon: '📈',
    isSecret: true,
    reward: { money: 4000 },
    check: (_stats: Stats, gameState: GameState) => (gameState.achievementProgress?.['grade_improver'] || 0) >= 1
  },
  
  // === EVENTS CATEGORY (6) ===
  {
    id: 'event_10',
    name: '',
    description: '',
    category: 'EVENTS',
    rarity: 'COMMON',
    icon: '📜',
    isSecret: false,
    reward: { money: 1000 },
    check: (_stats: Stats, gameState: GameState) => gameState.recentEvents.length >= 10
  },
  {
    id: 'event_50',
    name: '',
    description: '',
    category: 'EVENTS',
    rarity: 'RARE',
    icon: '📋',
    isSecret: false,
    reward: { money: 5000 },
    check: (_stats: Stats, gameState: GameState) => gameState.recentEvents.length >= 50
  },
  {
    id: 'event_100',
    name: '',
    description: '',
    category: 'EVENTS',
    rarity: 'EPIC',
    icon: '📚',
    isSecret: false,
    reward: { money: 15000 },
    check: (_stats: Stats, gameState: GameState) => gameState.recentEvents.length >= 100
  },
  {
    id: 'adventurer',
    name: '',
    description: '',
    category: 'EVENTS',
    rarity: 'RARE',
    icon: '🗺️',
    isSecret: false,
    reward: { money: 3000 },
    check: (_stats: Stats, gameState: GameState) => {
      const uniqueEvents = new Set(gameState.recentEvents);
      return uniqueEvents.size >= 10;
    }
  },
  {
    id: 'memory_keeper',
    name: '',
    description: '',
    category: 'EVENTS',
    rarity: 'RARE',
    icon: '💭',
    isSecret: false,
    reward: { money: 4000 },
    check: (_stats: Stats, gameState: GameState) => gameState.memories.length >= 20
  },
  {
    id: 'nostalgia',
    name: '',
    description: '',
    category: 'EVENTS',
    rarity: 'EPIC',
    icon: '🎞️',
    isSecret: false,
    reward: { money: 10000 },
    check: (_stats: Stats, gameState: GameState) => gameState.memories.length >= 50
  },

  // === SOCIAL CATEGORY (5) ===
  {
    id: 'friendly',
    name: '',
    description: '',
    category: 'SOCIAL',
    rarity: 'COMMON',
    icon: '👥',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, gameState: GameState) => gameState.npcs.filter(n => n.role === 'FRIEND' || n.role === 'BEST_FRIEND').length >= 3
  },
  {
    id: 'popular',
    name: '',
    description: '',
    category: 'SOCIAL',
    rarity: 'RARE',
    icon: '⭐',
    isSecret: false,
    reward: { money: 5000, stats: { charisma: 10 } },
    check: (_stats: Stats, gameState: GameState) => gameState.npcs.filter(n => n.role === 'FRIEND' || n.role === 'BEST_FRIEND').length >= 5
  },
  {
    id: 'lover',
    name: '',
    description: '',
    category: 'SOCIAL',
    rarity: 'RARE',
    icon: '❤️',
    isSecret: false,
    reward: { money: 3000 },
    check: (_stats: Stats, gameState: GameState) => gameState.npcs.some(n => n.role === 'PARTNER')
  },
  {
    id: 'social_butterfly',
    name: '',
    description: '',
    category: 'SOCIAL',
    rarity: 'EPIC',
    icon: '🦋',
    isSecret: false,
    reward: { money: 8000 },
    check: (_stats: Stats, gameState: GameState) => gameState.npcs.length >= 10
  },
  {
    id: 'heartbreaker',
    name: '',
    description: '',
    category: 'SOCIAL',
    rarity: 'RARE',
    icon: '💔',
    isSecret: true,
    reward: { money: 5000 },
    check: (_stats: Stats, gameState: GameState) => (gameState.achievementProgress?.['heartbreaker'] || 0) >= 3
  },

  // === SURVIVAL CATEGORY (5) ===
  {
    id: 'first_year',
    name: '',
    description: '',
    category: 'SURVIVAL',
    rarity: 'COMMON',
    icon: '🎂',
    isSecret: false,
    reward: { money: 100 },
    check: (_stats: Stats, gameState: GameState) => gameState.age >= 1
  },
  {
    id: 'teenager',
    name: '',
    description: '',
    category: 'SURVIVAL',
    rarity: 'COMMON',
    icon: '🧒',
    isSecret: false,
    reward: { money: 1000 },
    check: (_stats: Stats, gameState: GameState) => gameState.age >= 13
  },
  {
    id: 'almost_adult',
    name: '',
    description: '',
    category: 'SURVIVAL',
    rarity: 'RARE',
    icon: '🎓',
    isSecret: false,
    reward: { money: 5000 },
    check: (_stats: Stats, gameState: GameState) => gameState.age >= 18
  },
  {
    id: 'workaholic',
    name: '',
    description: '',
    category: 'SURVIVAL',
    rarity: 'RARE',
    icon: '💼',
    isSecret: false,
    reward: { money: 10000 },
    check: (_stats: Stats, gameState: GameState) => (gameState.actionCounts['work'] || 0) >= 50
  },
  {
    id: 'hoarder',
    name: '',
    description: '',
    category: 'SURVIVAL',
    rarity: 'RARE',
    icon: '📦',
    isSecret: false,
    reward: { money: 3000 },
    check: (_stats: Stats, gameState: GameState) => gameState.inventory.length >= 10
  },

  // === SECRET ACHIEVEMENTS (5) ===
  {
    id: 'lucky_seven',
    name: '',
    description: '',
    category: 'SECRET',
    rarity: 'LEGENDARY',
    icon: '🍀',
    isSecret: true,
    reward: { money: 77777 },
    check: (stats: Stats, gameState: GameState) => {
      // Unlock at exactly age 7 with 777 money
      return gameState.age === 7 && stats.money === 777;
    }
  },
  {
    id: 'night_owl',
    name: '',
    description: '',
    category: 'SECRET',
    rarity: 'RARE',
    icon: '🦉',
    isSecret: true,
    reward: { money: 5000 },
    check: (stats: Stats, gameState: GameState) => {
      // Enerji 10 altında 20+ action
      return stats.energy < 10 && gameState.totalTurns >= 20;
    }
  },
  {
    id: 'rebel',
    name: '',
    description: '',
    category: 'SECRET',
    rarity: 'EPIC',
    icon: '😈',
    isSecret: true,
    reward: { money: 10000 },
    check: (stats: Stats, _gameState: GameState) => {
      // Aile ilişkisi 20 altında ama para 20k+
      return stats.familyRelation < 20 && stats.money >= 20000;
    }
  },
  {
    id: 'minimalist',
    name: '',
    description: '',
    category: 'SECRET',
    rarity: 'RARE',
    icon: '🎯',
    isSecret: true,
    reward: { stats: { discipline: 20 } },
    check: (_stats: Stats, gameState: GameState) => {
      // 15 yaşına ulaş hiç eşya almadan
      return gameState.age >= 15 && gameState.inventory.length === 0;
    }
  },
  {
    id: 'speed_runner',
    name: '',
    description: '',
    category: 'SECRET',
    rarity: 'LEGENDARY',
    icon: '⚡',
    isSecret: true,
    reward: { money: 50000 },
    check: (_stats: Stats, gameState: GameState) => {
      // 18 yaşına 200 turn'den az ile ulaş
      return gameState.age >= 18 && gameState.totalTurns < 200;
    }
  },
];

export const ACHIEVEMENTS: Achievement[] = BASE_ACHIEVEMENTS.map(removeMonetaryReward);

export const getAchievementName = (achievementId: string, fallback?: string): string => {
  return tRuntime(`achievementData.${achievementId}.name`, undefined, fallback || achievementId);
};

export const getAchievementDescription = (achievementId: string, fallback?: string): string => {
  return tRuntime(`achievementData.${achievementId}.description`, undefined, fallback || '');
};

const localizeAchievement = (achievement: Achievement): Achievement => {
  return {
    ...achievement,
    name: '',
    description: '',
  };
};

export const getLocalizedAchievements = (): Achievement[] => {
  return ACHIEVEMENTS.map(localizeAchievement);
};

// Helper: Get achievement by ID
export const getAchievement = (id: string): Achievement | undefined => {
  const achievement = ACHIEVEMENTS.find(a => a.id === id);
  return achievement ? localizeAchievement(achievement) : undefined;
};

// Helper: Get achievements by category
export const getAchievementsByCategory = (category: string): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category).map(localizeAchievement);
};

// Helper: Get achievements by rarity
export const getAchievementsByRarity = (rarity: string): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity).map(localizeAchievement);
};
