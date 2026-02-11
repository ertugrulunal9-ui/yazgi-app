import { Achievement, Stats, GameState, Skills, SchoolGrades } from '../types';
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

// 50+ Production-Ready Achievements
export const ACHIEVEMENTS: Achievement[] = [
  // === ONBOARDING CHAIN (FIRST 3 SESSIONS) ===
  {
    id: ONBOARDING_CHAIN_IDS.step1,
    name: 'Ilk Karar',
    description: 'Ilk 3 oturumda ilk event kararini ver',
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
    name: 'Kendine Uygun Yol',
    description: 'Cohort hedefindeki ilk aksiyonu tamamla',
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
    name: 'Rutin Kurucu',
    description: 'Ilk 3 oturumda dengeli bir rutin olustur',
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
    name: 'Dahi',
    description: 'Zeka 90\'a ulaş',
    category: 'STATS',
    rarity: 'EPIC',
    icon: '🧠',
    isSecret: false,
    reward: { money: 5000 },
    check: (stats: Stats, _gameState: GameState) => stats.intelligence >= 90
  },
  {
    id: 'super_genius',
    name: 'Süper Dahi',
    description: 'Zeka 100\'e ulaş',
    category: 'STATS',
    rarity: 'LEGENDARY',
    icon: '🎓',
    isSecret: false,
    reward: { money: 10000, stats: { intelligence: 5 } },
    check: (stats: Stats) => stats.intelligence >= 100
  },
  {
    id: 'healthy',
    name: 'Sağlıklı Yaşam',
    description: 'Sağlık 90\'a ulaş',
    category: 'STATS',
    rarity: 'RARE',
    icon: '💪',
    isSecret: false,
    reward: { money: 3000 },
    check: (stats: Stats, _gameState: GameState) => stats.health >= 90
  },
  {
    id: 'athlete',
    name: 'Atlet',
    description: 'Sağlık 100\'e ulaş',
    category: 'STATS',
    rarity: 'EPIC',
    icon: '🏆',
    isSecret: false,
    reward: { money: 7000 },
    check: (stats: Stats) => stats.health >= 100
  },
  {
    id: 'charming',
    name: 'Karizmatik',
    description: 'Karizma 90\'a ulaş',
    category: 'STATS',
    rarity: 'RARE',
    icon: '✨',
    isSecret: false,
    reward: { money: 4000 },
    check: (stats: Stats) => stats.charisma >= 90
  },
  {
    id: 'superstar',
    name: 'Süperstar',
    description: 'Karizma 100\'e ulaş',
    category: 'STATS',
    rarity: 'EPIC',
    icon: '🌟',
    isSecret: false,
    reward: { money: 8000 },
    check: (stats: Stats) => stats.charisma >= 100
  },
  {
    id: 'disciplined',
    name: 'Disiplinli',
    description: 'Disiplin 90\'a ulaş',
    category: 'STATS',
    rarity: 'RARE',
    icon: '⚡',
    isSecret: false,
    reward: { money: 3500 },
    check: (stats: Stats) => stats.discipline >= 90
  },
  {
    id: 'iron_will',
    name: 'Demir İrade',
    description: 'Disiplin 100\'e ulaş',
    category: 'STATS',
    rarity: 'EPIC',
    icon: '🛡️',
    isSecret: false,
    reward: { money: 6000 },
    check: (stats: Stats) => stats.discipline >= 100
  },
  {
    id: 'balanced',
    name: 'Dengeli',
    description: 'Tüm statlar 70+',
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
    name: 'Mükemmeliyetçi',
    description: 'Tüm statlar 90+',
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
    name: 'Erken Başlangıç',
    description: 'Tüm statlar 50+ ile başla',
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
    name: 'Enerjik',
    description: 'Enerji 80+ ile bir yaşa başla',
    category: 'STATS',
    rarity: 'COMMON',
    icon: '⚡',
    isSecret: false,
    reward: { money: 500 },
    check: (stats: Stats) => stats.energy >= 80
  },
  {
    id: 'family_man',
    name: 'Aile Bağları',
    description: 'Aile ilişkisi 90+',
    category: 'STATS',
    rarity: 'RARE',
    icon: '👨‍👩‍👧',
    isSecret: false,
    reward: { money: 5000 },
    check: (stats: Stats) => stats.familyRelation >= 90
  },
  {
    id: 'survivor',
    name: 'Hayatta Kalma',
    description: 'Sağlık 10\'un altına düşüp toparlan',
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
    name: 'Fakir\'den Zengine',
    description: 'Para 0\'a düşüp 50k\'ya çık',
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
    name: 'Erken Gelişim',
    description: '10 yaşından önce herhangi bir stat 80+',
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
    name: 'İlk Gelir',
    description: 'İlk kez para kazan',
    category: 'MONEY',
    rarity: 'COMMON',
    icon: '💵',
    isSecret: false,
    reward: { money: 100 },
    check: (stats: Stats) => stats.money > 0
  },
  {
    id: 'thousandaire',
    name: 'Binlik',
    description: '1,000₺ biriktir',
    category: 'MONEY',
    rarity: 'COMMON',
    icon: '💰',
    isSecret: false,
    reward: { money: 500 },
    check: (stats: Stats) => stats.money >= 1000
  },
  {
    id: 'ten_thousandaire',
    name: 'On Binlik',
    description: '10,000₺ biriktir',
    category: 'MONEY',
    rarity: 'RARE',
    icon: '💸',
    isSecret: false,
    reward: { money: 2000 },
    check: (stats: Stats) => stats.money >= 10000
  },
  {
    id: 'rich',
    name: 'Zengin',
    description: '50,000₺ biriktir',
    category: 'MONEY',
    rarity: 'EPIC',
    icon: '🤑',
    isSecret: false,
    reward: { money: 10000 },
    check: (stats: Stats) => stats.money >= 50000
  },
  {
    id: 'millionaire',
    name: 'Milyoner',
    description: '1,000,000₺ biriktir',
    category: 'MONEY',
    rarity: 'LEGENDARY',
    icon: '💎',
    isSecret: false,
    reward: { money: 100000 },
    check: (stats: Stats) => stats.money >= 1000000
  },
  {
    id: 'young_entrepreneur',
    name: 'Genç Girişimci',
    description: '14 yaşından önce 10k+ biriktir',
    category: 'MONEY',
    rarity: 'EPIC',
    icon: '👨‍💼',
    isSecret: false,
    reward: { money: 15000 },
    check: (stats: Stats, gameState: GameState) => gameState.age < 14 && stats.money >= 10000
  },
  {
    id: 'spender',
    name: 'Savurgan',
    description: 'Toplam 100k+ harca',
    category: 'MONEY',
    rarity: 'RARE',
    icon: '💳',
    isSecret: true,
    reward: { money: 5000 },
    check: (_stats: Stats, gameState: GameState) => (gameState.achievementProgress?.['spender'] || 0) >= 100000
  },
  {
    id: 'investor',
    name: 'Yatırımcı',
    description: 'Para 30k+ olduğunda eşya al',
    category: 'MONEY',
    rarity: 'RARE',
    icon: '📊',
    isSecret: true,
    reward: { money: 10000 },
    check: (stats: Stats, gameState: GameState) => gameState.inventory.length > 0 && stats.money >= 30000
  },
  {
    id: 'saver',
    name: 'Biriktirici',
    description: 'Para 20k+ biriktir',
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
    name: 'Kodlayıcı',
    description: 'Kodlama 50+',
    category: 'SKILLS',
    rarity: 'COMMON',
    icon: '💻',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.coding >= 50
  },
  {
    id: 'code_master',
    name: 'Kod Ustası',
    description: 'Kodlama 80+',
    category: 'SKILLS',
    rarity: 'EPIC',
    icon: '🖥️',
    isSecret: false,
    reward: { money: 10000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.coding >= 80
  },
  {
    id: 'musician',
    name: 'Müzisyen',
    description: 'Müzik 50+',
    category: 'SKILLS',
    rarity: 'COMMON',
    icon: '🎵',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.music >= 50
  },
  {
    id: 'virtuoso',
    name: 'Virtüöz',
    description: 'Müzik 80+',
    category: 'SKILLS',
    rarity: 'EPIC',
    icon: '🎼',
    isSecret: false,
    reward: { money: 10000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.music >= 80
  },
  {
    id: 'sportsman',
    name: 'Sporcu',
    description: 'Spor 50+',
    category: 'SKILLS',
    rarity: 'COMMON',
    icon: '⚽',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.sports >= 50
  },
  {
    id: 'pro_athlete',
    name: 'Profesyonel Atlet',
    description: 'Spor 80+',
    category: 'SKILLS',
    rarity: 'EPIC',
    icon: '🥇',
    isSecret: false,
    reward: { money: 10000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.sports >= 80
  },
  {
    id: 'designer',
    name: 'Tasarımcı',
    description: 'Tasarım 50+',
    category: 'SKILLS',
    rarity: 'COMMON',
    icon: '🎨',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, _gameState: GameState, skills: Skills) => skills.design >= 50
  },
  {
    id: 'renaissance',
    name: 'Rönesans İnsanı',
    description: 'Tüm yetenekler 60+',
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
    name: 'Yetenek Ustası',
    description: 'Bir yetenek 90+',
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
    name: 'Pür A',
    description: 'Tüm notlar 90+',
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
    name: 'Matematik Dehası',
    description: 'Matematik 95+',
    category: 'SCHOOL',
    rarity: 'RARE',
    icon: '🔢',
    isSecret: false,
    reward: { money: 3000 },
    check: (_stats: Stats, _gameState: GameState, _skills: Skills, grades: SchoolGrades) => grades.math >= 95
  },
  {
    id: 'scientist',
    name: 'Bilim İnsanı',
    description: 'Fen 95+',
    category: 'SCHOOL',
    rarity: 'RARE',
    icon: '🔬',
    isSecret: false,
    reward: { money: 3000 },
    check: (_stats: Stats, _gameState: GameState, _skills: Skills, grades: SchoolGrades) => grades.science >= 95
  },
  {
    id: 'wordsmith',
    name: 'Edebiyatçı',
    description: 'Dil 95+',
    category: 'SCHOOL',
    rarity: 'RARE',
    icon: '📖',
    isSecret: false,
    reward: { money: 3000 },
    check: (_stats: Stats, _gameState: GameState, _skills: Skills, grades: SchoolGrades) => grades.language >= 95
  },
  {
    id: 'perfect_student',
    name: 'Mükemmel Öğrenci',
    description: 'Tüm notlar 100',
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
    name: 'Dönüş Yapan',
    description: 'Bir derste 40\'tan 90\'a çık',
    category: 'SCHOOL',
    rarity: 'RARE',
    icon: '📈',
    isSecret: true,
    reward: { money: 5000 },
    check: (_stats: Stats, gameState: GameState) => (gameState.achievementProgress?.['comeback_kid'] || 0) >= 1
  },
  {
    id: 'studious',
    name: 'Çalışkan',
    description: '50+ kez ders çalış',
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
    name: 'Bilgin',
    description: '100+ kez ders çalış',
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
    name: 'Not İyileştirici',
    description: 'Bir derste 30\'tan 80\'a çık',
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
    name: 'Hikaye Başlıyor',
    description: '10 olay tamamla',
    category: 'EVENTS',
    rarity: 'COMMON',
    icon: '📜',
    isSecret: false,
    reward: { money: 1000 },
    check: (_stats: Stats, gameState: GameState) => gameState.recentEvents.length >= 10
  },
  {
    id: 'event_50',
    name: 'Tecrübeli',
    description: '50 olay tamamla',
    category: 'EVENTS',
    rarity: 'RARE',
    icon: '📋',
    isSecret: false,
    reward: { money: 5000 },
    check: (_stats: Stats, gameState: GameState) => gameState.recentEvents.length >= 50
  },
  {
    id: 'event_100',
    name: 'Hikaye Ustası',
    description: '100 olay tamamla',
    category: 'EVENTS',
    rarity: 'EPIC',
    icon: '📚',
    isSecret: false,
    reward: { money: 15000 },
    check: (_stats: Stats, gameState: GameState) => gameState.recentEvents.length >= 100
  },
  {
    id: 'adventurer',
    name: 'Maceracı',
    description: '10 farklı olay türü yaşa',
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
    name: 'Anı Koleksiyoncusu',
    description: '20+ anı biriktir',
    category: 'EVENTS',
    rarity: 'RARE',
    icon: '💭',
    isSecret: false,
    reward: { money: 4000 },
    check: (_stats: Stats, gameState: GameState) => gameState.memories.length >= 20
  },
  {
    id: 'nostalgia',
    name: 'Nostalji',
    description: '50+ anı biriktir',
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
    name: 'Arkadaş Canlısı',
    description: '3+ arkadaş edin',
    category: 'SOCIAL',
    rarity: 'COMMON',
    icon: '👥',
    isSecret: false,
    reward: { money: 2000 },
    check: (_stats: Stats, gameState: GameState) => gameState.npcs.filter(n => n.role === 'FRIEND' || n.role === 'BEST_FRIEND').length >= 3
  },
  {
    id: 'popular',
    name: 'Popüler',
    description: '5+ arkadaş edin',
    category: 'SOCIAL',
    rarity: 'RARE',
    icon: '⭐',
    isSecret: false,
    reward: { money: 5000, stats: { charisma: 10 } },
    check: (_stats: Stats, gameState: GameState) => gameState.npcs.filter(n => n.role === 'FRIEND' || n.role === 'BEST_FRIEND').length >= 5
  },
  {
    id: 'lover',
    name: 'Aşık',
    description: 'Bir partner edin',
    category: 'SOCIAL',
    rarity: 'RARE',
    icon: '❤️',
    isSecret: false,
    reward: { money: 3000 },
    check: (_stats: Stats, gameState: GameState) => gameState.npcs.some(n => n.role === 'PARTNER')
  },
  {
    id: 'social_butterfly',
    name: 'Sosyal Kelebek',
    description: '10+ NPC ile tanış',
    category: 'SOCIAL',
    rarity: 'EPIC',
    icon: '🦋',
    isSecret: false,
    reward: { money: 8000 },
    check: (_stats: Stats, gameState: GameState) => gameState.npcs.length >= 10
  },
  {
    id: 'heartbreaker',
    name: 'Kalp Kırıcı',
    description: '3+ kişiyle romantik ilişki yaşa',
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
    name: 'İlk Yıl',
    description: '1 yaşına ulaş',
    category: 'SURVIVAL',
    rarity: 'COMMON',
    icon: '🎂',
    isSecret: false,
    reward: { money: 100 },
    check: (_stats: Stats, gameState: GameState) => gameState.age >= 1
  },
  {
    id: 'teenager',
    name: 'Ergen',
    description: '13 yaşına ulaş',
    category: 'SURVIVAL',
    rarity: 'COMMON',
    icon: '🧒',
    isSecret: false,
    reward: { money: 1000 },
    check: (_stats: Stats, gameState: GameState) => gameState.age >= 13
  },
  {
    id: 'almost_adult',
    name: 'Neredeyse Yetişkin',
    description: '18 yaşına ulaş',
    category: 'SURVIVAL',
    rarity: 'RARE',
    icon: '🎓',
    isSecret: false,
    reward: { money: 5000 },
    check: (_stats: Stats, gameState: GameState) => gameState.age >= 18
  },
  {
    id: 'workaholic',
    name: 'İşkolik',
    description: '50+ kez çalış',
    category: 'SURVIVAL',
    rarity: 'RARE',
    icon: '💼',
    isSecret: false,
    reward: { money: 10000 },
    check: (_stats: Stats, gameState: GameState) => (gameState.actionCounts['work'] || 0) >= 50
  },
  {
    id: 'hoarder',
    name: 'Biriktirici',
    description: '10+ eşya topla',
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
    name: '???',
    description: '???',
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
    name: '???',
    description: '???',
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
    name: '???',
    description: '???',
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
    name: '???',
    description: '???',
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
    name: '???',
    description: '???',
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

// Helper: Get achievement by ID
export const getAchievement = (id: string): Achievement | undefined => {
  return ACHIEVEMENTS.find(a => a.id === id);
};

// Helper: Get achievements by category
export const getAchievementsByCategory = (category: string): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.category === category);
};

// Helper: Get achievements by rarity
export const getAchievementsByRarity = (rarity: string): Achievement[] => {
  return ACHIEVEMENTS.filter(a => a.rarity === rarity);
};
