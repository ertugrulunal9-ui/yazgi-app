import { FamilyWealth, LifeGoal, PersonalityEffect, PersonalityMomentumSignal, Skills, Stats } from '../types';
import { AppLocale, t as translate, tRuntime } from '../i18n/strings';
import { CONSUMABLE_CONFIG } from '../config/gameBalance';
import { isFeatureEnabled, type FeatureFlag } from '../config/featureFlags';

export type ExamGameType = 'MATH' | 'TURKISH' | 'HISTORY' | 'SCIENCE' | 'GEOGRAPHY' | 'ENGLISH' | 'ART' | 'MUSIC';

export interface SubAction {
  id: string;
  text: string;
  icon: string;
  energyCost: number;
  minAge?: number;
  effect: Partial<Stats>;
  personalityEffects?: PersonalityEffect[];
  momentumTag?: PersonalityMomentumSignal;
  stressEffect?: number;
  feedback: string;
  skillUpdates?: Partial<Skills>;
  gradeUpdates?: Record<string, number>;
  opensExamGame?: ExamGameType;
  requiredItemIds?: string[];
  earlyUnlockByItem?: {
    itemId: string;
    minAge: number;
  };
  purchaseItemId?: string;
  priceByWealth?: Partial<Record<FamilyWealth, number>>;
  requiredFeatureFlag?: FeatureFlag;
  accessibilityHint?: string;
}

export interface ActionCategory {
  id: string;
  title: string;
  icon: string;
  color: string;
  bgColor: string;
  minAge?: number;
  maxAge?: number;
  requiredGoal?: LifeGoal;
  subActions: SubAction[];
}

export const getActionEffectiveMinAge = (action: SubAction, ownedItems: string[] = []): number | undefined => {
  const baseMinAge = action.minAge;
  const earlyUnlock = action.earlyUnlockByItem;

  if (!earlyUnlock || !ownedItems.includes(earlyUnlock.itemId)) {
    return baseMinAge;
  }

  if (baseMinAge === undefined) {
    return earlyUnlock.minAge;
  }

  return Math.min(baseMinAge, earlyUnlock.minAge);
};

export const resolveActionEffectForFamily = (
  action: SubAction,
  wealth: FamilyWealth | null | undefined
): Partial<Stats> => {
  const resolvedEffect: Partial<Stats> = { ...(action.effect || {}) };

  if (wealth && action.priceByWealth && typeof action.priceByWealth[wealth] === 'number') {
    resolvedEffect.money = -Math.abs(action.priceByWealth[wealth] as number);
  }

  return resolvedEffect;
};

const buildConsumablePrices = (base: number): Partial<Record<FamilyWealth, number>> => ({
  POOR: Math.round(base * 1.3),
  MIDDLE: base,
  RICH: Math.round(base * 0.8),
});

export const ACTION_CATEGORIES: ActionCategory[] = [
  {
    id: 'baby',
    title: '',
    icon: '👶',
    color: '#f472b6',
    bgColor: 'rgba(244, 114, 182, 0.15)',
    maxAge: 2,
    subActions: [
      {
        id: 'baby_eat',
        text: '',
        icon: '🍼',
        energyCost: 0,
        effect: { health: 3, energy: 20 },
        feedback: '',
      },
      {
        id: 'baby_sleep',
        text: '',
        icon: '😴',
        energyCost: 0,
        effect: { health: 5, energy: 40 },
        feedback: '',
      },
      {
        id: 'baby_play',
        text: '',
        icon: '🧸',
        energyCost: 10,
        effect: { intelligence: 1, energy: -10, charisma: 1 },
        feedback: '',
      },
      {
        id: 'baby_crawl',
        text: '',
        icon: '👣',
        energyCost: 15,
        effect: { health: 2, energy: -15, discipline: 1 },
        feedback: '',
        skillUpdates: { athletics: 1 },
      },
      {
        id: 'baby_family',
        text: '',
        icon: '👨‍👩‍👧',
        energyCost: 5,
        effect: { energy: -5, familyRelation: 10, charisma: 1 },
        feedback: '',
      },
    ],
  },
  {
    id: 'explore',
    title: '',
    icon: '🔎',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    minAge: 3,
    maxAge: 6,
    subActions: [
      {
        id: 'explore_playground',
        text: '',
        icon: '🛝',
        energyCost: 12,
        minAge: 3,
        effect: { health: 3, energy: -12, charisma: 1 },
        personalityEffects: [
          { axis: 'courage', change: 2 },
          { axis: 'openness', change: 2 },
        ],
        feedback: '',
        skillUpdates: { athletics: 2, teamwork: 1 },
      },
      {
        id: 'explore_nature',
        text: '',
        icon: '🌿',
        energyCost: 10,
        minAge: 3,
        effect: { intelligence: 2, health: 2, energy: -10 },
        personalityEffects: [
          { axis: 'openness', change: 3 },
          { axis: 'patience', change: 1 },
        ],
        feedback: '',
        skillUpdates: { reading: 1 },
      },
      {
        id: 'explore_imagination',
        text: '',
        icon: '🧠',
        energyCost: 11,
        minAge: 4,
        effect: { intelligence: 3, charisma: 2, energy: -11 },
        personalityEffects: [
          { axis: 'openness', change: 2 },
          { axis: 'courage', change: 1 },
        ],
        feedback: '',
        skillUpdates: { writing: 2 },
      },
      {
        id: 'explore_home_adventure',
        text: '',
        icon: '🏠',
        energyCost: 9,
        minAge: 3,
        effect: { discipline: 1, familyRelation: 2, energy: -9 },
        personalityEffects: [
          { axis: 'courage', change: 1 },
          { axis: 'patience', change: 2 },
        ],
        feedback: '',
        skillUpdates: { teamwork: 1 },
      },
    ],
  },
  {
    id: 'family',
    title: '',
    icon: '👨‍👩‍👧',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    minAge: 3,
    maxAge: 6,
    subActions: [
      {
        id: 'family_time',
        text: '',
        icon: '👪',
        energyCost: 6,
        minAge: 3,
        effect: { familyRelation: 8, charisma: 1, energy: -6 },
        personalityEffects: [
          { axis: 'empathy', change: 2 },
          { axis: 'patience', change: 1 },
        ],
        feedback: '',
      },
      {
        id: 'family_story',
        text: '',
        icon: '📖',
        energyCost: 6,
        minAge: 3,
        effect: { intelligence: 2, familyRelation: 6, energy: -6 },
        personalityEffects: [
          { axis: 'empathy', change: 2 },
          { axis: 'openness', change: 1 },
        ],
        feedback: '',
        skillUpdates: { reading: 2 },
      },
      {
        id: 'family_help_housework',
        text: '',
        icon: '🧹',
        energyCost: 10,
        minAge: 4,
        effect: { discipline: 3, familyRelation: 5, money: 10, energy: -10 },
        personalityEffects: [
          { axis: 'empathy', change: 1 },
          { axis: 'conformity', change: 2 },
        ],
        feedback: '',
      },
    ],
  },
  {
    id: 'study',
    title: '',
    icon: '📚',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    minAge: 6,
    subActions: [
      {
        id: 'study_math',
        text: '',
        icon: '🔢',
        energyCost: 18,
        minAge: 7,
        effect: { intelligence: 5, energy: -18 },
        feedback: '',
        gradeUpdates: { math: 8 },
        skillUpdates: { logic: 3 },
      },
      {
        id: 'study_math_exam',
        text: '',
        icon: '🎯',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: '',
        opensExamGame: 'MATH',
      },
      {
        id: 'study_turkish',
        text: '',
        icon: '📝',
        energyCost: 15,
        minAge: 6,
        effect: { intelligence: 4, energy: -15, charisma: 1 },
        feedback: '',
        gradeUpdates: { language: 6 },
      },
      {
        id: 'study_turkish_exam',
        text: '',
        icon: '✍️',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: '',
        opensExamGame: 'TURKISH',
      },
      {
        id: 'study_science',
        text: '',
        icon: '🔬',
        energyCost: 18,
        minAge: 7,
        effect: { intelligence: 5, energy: -18 },
        feedback: '',
        gradeUpdates: { science: 8 },
      },
      {
        id: 'study_science_exam',
        text: '',
        icon: '🧪',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: '',
        opensExamGame: 'SCIENCE',
      },
      {
        id: 'study_geography',
        text: '',
        icon: '🗺️',
        energyCost: 15,
        minAge: 8,
        effect: { intelligence: 4, energy: -15 },
        feedback: '',
        gradeUpdates: { geography: 6 },
      },
      {
        id: 'study_geography_exam',
        text: '',
        icon: '🌍',
        energyCost: 25,
        minAge: 9,
        effect: { intelligence: 2, energy: -25 },
        feedback: '',
        opensExamGame: 'GEOGRAPHY',
      },
      {
        id: 'study_english',
        text: '',
        icon: '🇬🇧',
        energyCost: 16,
        minAge: 7,
        effect: { intelligence: 4, energy: -16, charisma: 1 },
        feedback: '',
        gradeUpdates: { language: 7 },
      },
      {
        id: 'study_english_exam',
        text: '',
        icon: '🔤',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: '',
        opensExamGame: 'ENGLISH',
      },
      {
        id: 'study_history',
        text: '',
        icon: '📜',
        energyCost: 15,
        minAge: 8,
        effect: { intelligence: 4, energy: -15 },
        feedback: '',
        gradeUpdates: { history: 6 },
      },
      {
        id: 'study_history_exam',
        text: '',
        icon: '🏛️',
        energyCost: 25,
        minAge: 9,
        effect: { intelligence: 2, energy: -25 },
        feedback: '',
        opensExamGame: 'HISTORY',
      },
      {
        id: 'study_art',
        text: '',
        icon: '🎨',
        energyCost: 12,
        minAge: 7,
        effect: { intelligence: 2, charisma: 2, energy: -12 },
        feedback: '',
        gradeUpdates: { art: 6 },
      },
      {
        id: 'study_art_exam',
        text: '',
        icon: '🖼️',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: '',
        opensExamGame: 'ART',
      },
      {
        id: 'study_music',
        text: '',
        icon: '🎵',
        energyCost: 12,
        minAge: 7,
        effect: { intelligence: 2, charisma: 2, energy: -12 },
        feedback: '',
        gradeUpdates: { music: 6 },
      },
      {
        id: 'study_music_exam',
        text: '',
        icon: '🎼',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: '',
        opensExamGame: 'MUSIC',
      },
      {
        id: 'study_book',
        text: '',
        icon: '📖',
        energyCost: 15,
        minAge: 4,
        effect: { intelligence: 3, energy: -15 },
        feedback: '',
        skillUpdates: { reading: 2 },
      },
      {
        id: 'study_homework',
        text: '',
        icon: '✏️',
        energyCost: 12,
        minAge: 6,
        effect: { intelligence: 4, energy: -12, discipline: 3 },
        feedback: '',
        gradeUpdates: { math: 3, science: 3, language: 3 },
      },
    ],
  },
  {
    id: 'sports',
    title: '',
    icon: '⚽',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    subActions: [
      {
        id: 'sports_run',
        text: '',
        icon: '🏃',
        energyCost: 20,
        minAge: 3,
        effect: { health: 5, energy: -20, discipline: 2 },
        feedback: '',
        skillUpdates: { athletics: 3 },
      },
      {
        id: 'sports_football',
        text: '',
        icon: '⚽',
        energyCost: 25,
        minAge: 5,
        earlyUnlockByItem: {
          itemId: 'item_football',
          minAge: 4,
        },
        effect: { health: 6, energy: -25, charisma: 2 },
        feedback: '',
        skillUpdates: { athletics: 4, teamwork: 2 },
      },
      {
        id: 'sports_swim',
        text: '',
        icon: '🏊',
        energyCost: 22,
        minAge: 6,
        effect: { health: 7, energy: -22, discipline: 3 },
        feedback: '',
        skillUpdates: { athletics: 4 },
      },
      {
        id: 'sports_gym',
        text: '',
        icon: '🏋️',
        energyCost: 30,
        minAge: 12,
        effect: { health: 8, energy: -30, discipline: 4 },
        feedback: '',
        skillUpdates: { athletics: 5 },
      },
      {
        id: 'sports_bicycle',
        text: '',
        icon: '🚲',
        energyCost: 16,
        minAge: 6,
        requiredItemIds: ['item_bicycle'],
        effect: { health: 4, energy: -16 },
        personalityEffects: [{ axis: 'courage', change: 2 }],
        feedback: '',
        skillUpdates: { athletics: 3 },
      },
    ],
  },
  {
    id: 'arts',
    title: '',
    icon: '🎨',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    subActions: [
      {
        id: 'arts_draw',
        text: '',
        icon: '🖌️',
        energyCost: 15,
        minAge: 3,
        effect: { intelligence: 2, energy: -15, charisma: 2 },
        feedback: '',
        skillUpdates: { art: 4 },
      },
      {
        id: 'arts_music',
        text: '',
        icon: '🎵',
        energyCost: 5,
        minAge: 3,
        effect: { energy: -5, charisma: 1 },
        feedback: '',
        skillUpdates: { music: 1 },
      },
      {
        id: 'arts_instrument',
        text: '',
        icon: '🎸',
        energyCost: 18,
        minAge: 7,
        requiredItemIds: ['item_instrument'],
        effect: { intelligence: 3, energy: -18, charisma: 3, discipline: 2 },
        feedback: '',
        skillUpdates: { music: 5 },
      },
      {
        id: 'arts_write',
        text: '',
        icon: '✍️',
        energyCost: 12,
        minAge: 8,
        effect: { intelligence: 4, energy: -12, charisma: 2 },
        feedback: '',
        skillUpdates: { writing: 4 },
      },
    ],
  },
  {
    id: 'computer',
    title: '',
    icon: '💻',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    minAge: 7,
    subActions: [
      {
        id: 'computer_browse',
        text: '',
        icon: '🌐',
        energyCost: 8,
        effect: { energy: -8, intelligence: 1 },
        feedback: '',
      },
      {
        id: 'computer_code',
        text: '',
        icon: '👨‍💻',
        energyCost: 20,
        minAge: 8,
        requiredItemIds: ['item_computer'],
        effect: { intelligence: 6, energy: -20, discipline: 3 },
        feedback: '',
        skillUpdates: { coding: 6 },
      },
      {
        id: 'computer_design',
        text: '',
        icon: '🎨',
        energyCost: 15,
        minAge: 8,
        requiredItemIds: ['item_computer'],
        effect: { intelligence: 4, energy: -15, charisma: 2 },
        feedback: '',
        skillUpdates: { design: 5, art: 2 },
      },
      {
        id: 'computer_game',
        text: '',
        icon: '🎮',
        energyCost: 10,
        effect: { energy: -10 },
        feedback: '',
      },
    ],
  },
  {
    id: 'work',
    title: '',
    icon: '💼',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    minAge: 6,
    subActions: [
      {
        id: 'ask_allowance',
        text: '',
        icon: '🫴',
        energyCost: 5,
        minAge: 6,
        effect: {},
        feedback: '',
      },
      {
        id: 'work_chores',
        text: '',
        icon: '🧹',
        energyCost: 15,
        effect: { energy: -15, money: 14, familyRelation: 5, discipline: 2 },
        feedback: '',
      },
      {
        id: 'work_parttime',
        text: '',
        icon: '🍔',
        energyCost: 30,
        minAge: 14,
        effect: { energy: -30, money: 70, discipline: 4 },
        feedback: '',
        skillUpdates: { work_ethic: 3 },
      },
      {
        id: 'work_freelance',
        text: '',
        icon: '💰',
        energyCost: 25,
        minAge: 13,
        effect: { energy: -25, money: 95, intelligence: 3 },
        feedback: '',
        skillUpdates: { coding: 2, design: 2 },
      },
      {
        id: 'work_sell',
        text: '',
        icon: '🏪',
        energyCost: 12,
        minAge: 10,
        effect: { energy: -12, money: 35, charisma: 2 },
        feedback: '',
        skillUpdates: { business: 3 },
      },
      {
        id: 'job_lemonade',
        text: '',
        icon: '🍋',
        energyCost: 15,
        minAge: 8,
        effect: { energy: -15, money: 15, charisma: 1 },
        feedback: '',
        skillUpdates: { business: 1 },
        requiredFeatureFlag: 'ECONOMY_DEPTH',
      },
      {
        id: 'job_dog_walking',
        text: '',
        icon: '🐕',
        energyCost: 10,
        minAge: 10,
        effect: { energy: -10, money: 20, health: 1 },
        feedback: '',
        requiredFeatureFlag: 'ECONOMY_DEPTH',
      },
      {
        id: 'job_market_cashier',
        text: '',
        icon: '🛒',
        energyCost: 25,
        minAge: 13,
        effect: { energy: -25, money: 40, discipline: 2 },
        feedback: '',
        skillUpdates: { work_ethic: 2 },
        requiredFeatureFlag: 'ECONOMY_DEPTH',
      },
      {
        id: 'job_tutoring',
        text: '',
        icon: '📚',
        energyCost: 20,
        minAge: 14,
        effect: { energy: -20, money: 50, intelligence: 2 },
        feedback: '',
        skillUpdates: { teamwork: 1 },
        requiredFeatureFlag: 'ECONOMY_DEPTH',
      },
      {
        id: 'job_internship',
        text: '',
        icon: '🏢',
        energyCost: 30,
        minAge: 16,
        effect: { energy: -30, money: 80, discipline: 3, intelligence: 1 },
        feedback: '',
        skillUpdates: { work_ethic: 3 },
        requiredFeatureFlag: 'ECONOMY_DEPTH',
      },
    ],
  },
  {
    id: 'goal_academic',
    title: '',
    icon: 'goal_academic',
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.15)',
    minAge: 12,
    requiredGoal: 'ACADEMIC',
    subActions: [
      {
        id: 'goal_academic_research_project',
        text: '',
        icon: 'research',
        energyCost: 24,
        minAge: 12,
        effect: { intelligence: 6, discipline: 3, energy: -24 },
        feedback: '',
        skillUpdates: { logic: 3, reading: 2 },
      },
      {
        id: 'goal_academic_science_competition',
        text: '',
        icon: 'science_comp',
        energyCost: 26,
        minAge: 12,
        effect: { intelligence: 7, discipline: 2, charisma: 1, energy: -26 },
        feedback: '',
        gradeUpdates: { science: 6, math: 4 },
      },
      {
        id: 'goal_academic_olympiad_drill',
        text: '',
        icon: 'olympiad',
        energyCost: 30,
        minAge: 13,
        effect: { intelligence: 8, discipline: 4, health: -1, energy: -30 },
        feedback: '',
        skillUpdates: { logic: 4, work_ethic: 2 },
      },
    ],
  },
  {
    id: 'goal_athletic',
    title: '',
    icon: 'goal_athletic',
    color: '#16a34a',
    bgColor: 'rgba(22, 163, 74, 0.15)',
    minAge: 12,
    requiredGoal: 'ATHLETIC',
    subActions: [
      {
        id: 'goal_athletic_training_camp',
        text: '',
        icon: 'camp',
        energyCost: 27,
        minAge: 12,
        effect: { health: 7, discipline: 3, energy: -27 },
        feedback: '',
        skillUpdates: { athletics: 4, teamwork: 2 },
      },
      {
        id: 'goal_athletic_tournament_round',
        text: '',
        icon: 'tournament',
        energyCost: 29,
        minAge: 12,
        effect: { health: 6, charisma: 2, discipline: 2, energy: -29 },
        feedback: '',
        skillUpdates: { athletics: 5, work_ethic: 1 },
      },
      {
        id: 'goal_athletic_captain_track',
        text: '',
        icon: 'captain',
        energyCost: 25,
        minAge: 13,
        effect: { charisma: 3, discipline: 3, familyRelation: 1, energy: -25 },
        feedback: '',
        skillUpdates: { teamwork: 4, athletics: 2 },
      },
    ],
  },
  {
    id: 'goal_creative',
    title: '',
    icon: 'goal_creative',
    color: '#db2777',
    bgColor: 'rgba(219, 39, 119, 0.15)',
    minAge: 12,
    requiredGoal: 'CREATIVE',
    subActions: [
      {
        id: 'goal_creative_exhibition_prep',
        text: '',
        icon: 'exhibition',
        energyCost: 21,
        minAge: 12,
        effect: { charisma: 5, intelligence: 2, energy: -21 },
        feedback: '',
        skillUpdates: { art: 4, design: 2 },
      },
      {
        id: 'goal_creative_band_rehearsal',
        text: '',
        icon: 'band',
        energyCost: 22,
        minAge: 12,
        effect: { charisma: 4, discipline: 2, energy: -22 },
        feedback: '',
        skillUpdates: { music: 4, teamwork: 2 },
      },
      {
        id: 'goal_creative_portfolio_review',
        text: '',
        icon: 'portfolio',
        energyCost: 24,
        minAge: 13,
        effect: { intelligence: 3, charisma: 4, discipline: 2, energy: -24 },
        feedback: '',
        skillUpdates: { design: 3, writing: 2 },
      },
    ],
  },
  {
    id: 'goal_wealth',
    title: '',
    icon: 'goal_wealth',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.15)',
    minAge: 13,
    requiredGoal: 'WEALTH',
    subActions: [
      {
        id: 'goal_wealth_market_watch',
        text: '',
        icon: 'market',
        energyCost: 18,
        minAge: 13,
        effect: { intelligence: 3, discipline: 2, money: 35, energy: -18 },
        feedback: '',
        skillUpdates: { business: 3, logic: 1 },
      },
      {
        id: 'goal_wealth_business_pitch',
        text: '',
        icon: 'pitch',
        energyCost: 23,
        minAge: 13,
        effect: { charisma: 3, intelligence: 2, money: 55, energy: -23 },
        feedback: '',
        skillUpdates: { business: 4, work_ethic: 1 },
      },
      {
        id: 'goal_wealth_network_round',
        text: '',
        icon: 'network',
        energyCost: 20,
        minAge: 14,
        effect: { charisma: 4, familyRelation: 1, money: 45, energy: -20 },
        feedback: '',
        skillUpdates: { business: 3, teamwork: 2 },
      },
    ],
  },
  {
    id: 'goal_social',
    title: '',
    icon: 'goal_social',
    color: '#0891b2',
    bgColor: 'rgba(8, 145, 178, 0.15)',
    minAge: 12,
    requiredGoal: 'SOCIAL',
    subActions: [
      {
        id: 'goal_social_council_session',
        text: '',
        icon: 'council',
        energyCost: 19,
        minAge: 12,
        effect: { charisma: 4, familyRelation: 2, energy: -19 },
        feedback: '',
        skillUpdates: { teamwork: 3, writing: 1 },
      },
      {
        id: 'goal_social_volunteer_shift',
        text: '',
        icon: 'volunteer',
        energyCost: 21,
        minAge: 12,
        effect: { familyRelation: 4, charisma: 3, discipline: 1, energy: -21 },
        feedback: '',
        skillUpdates: { teamwork: 3, work_ethic: 1 },
      },
      {
        id: 'goal_social_peer_mentoring',
        text: '',
        icon: 'mentor',
        energyCost: 22,
        minAge: 13,
        effect: { charisma: 4, intelligence: 2, familyRelation: 2, energy: -22 },
        feedback: '',
        skillUpdates: { reading: 2, teamwork: 2 },
      },
    ],
  },
  {
    id: 'shopping',
    title: '',
    icon: '🛒',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    minAge: 4,
    subActions: [
      {
        id: 'shopping_art_set',
        text: '',
        icon: '🎨',
        energyCost: 4,
        minAge: 4,
        purchaseItemId: 'item_art_set',
        priceByWealth: { POOR: 72, MIDDLE: 55, RICH: 44 },
        effect: { energy: -4, money: -55 },
        feedback: '',
      },
      {
        id: 'shopping_story_book',
        text: '',
        icon: '📚',
        energyCost: 4,
        minAge: 4,
        purchaseItemId: 'item_story_book',
        priceByWealth: { POOR: 92, MIDDLE: 70, RICH: 56 },
        effect: { energy: -4, money: -70 },
        feedback: '',
      },
      {
        id: 'shopping_football',
        text: '',
        icon: '⚽',
        energyCost: 5,
        minAge: 4,
        purchaseItemId: 'item_football',
        priceByWealth: { POOR: 120, MIDDLE: 90, RICH: 72 },
        effect: { energy: -5, money: -90 },
        feedback: '',
      },
      {
        id: 'shopping_bicycle',
        text: '',
        icon: '🚲',
        energyCost: 8,
        minAge: 6,
        purchaseItemId: 'item_bicycle',
        priceByWealth: { POOR: 280, MIDDLE: 210, RICH: 168 },
        effect: { energy: -8, money: -210 },
        feedback: '',
      },
      {
        id: 'shopping_computer',
        text: '',
        icon: '💻',
        energyCost: 12,
        minAge: 8,
        purchaseItemId: 'item_computer',
        priceByWealth: { POOR: 640, MIDDLE: 480, RICH: 384 },
        effect: { energy: -12, money: -480 },
        feedback: '',
      },
      {
        id: 'shopping_instrument',
        text: '',
        icon: '🎸',
        energyCost: 8,
        minAge: 7,
        purchaseItemId: 'item_instrument',
        priceByWealth: { POOR: 520, MIDDLE: 390, RICH: 312 },
        effect: { energy: -8, money: -390 },
        feedback: '',
      },
      {
        id: 'shopping_sports_gear',
        text: '',
        icon: '🏋️',
        energyCost: 7,
        minAge: 8,
        purchaseItemId: 'item_sports_gear',
        priceByWealth: { POOR: 320, MIDDLE: 240, RICH: 192 },
        effect: { energy: -7, money: -240 },
        feedback: '',
      },
      {
        id: 'shopping_healthy_meal',
        text: '',
        icon: '🥗',
        energyCost: 2,
        minAge: 6,
        priceByWealth: { POOR: 95, MIDDLE: 75, RICH: 60 },
        effect: { energy: 8, health: 2, money: -75 },
        feedback: '',
      },
      {
        id: 'shopping_private_notes',
        text: '',
        icon: '📝',
        energyCost: 4,
        minAge: 8,
        priceByWealth: { POOR: 150, MIDDLE: 120, RICH: 96 },
        effect: { energy: -4, intelligence: 3, discipline: 2, money: -120 },
        feedback: '',
      },
      {
        id: 'shopping_family_gift',
        text: '',
        icon: '🎁',
        energyCost: 3,
        minAge: 7,
        priceByWealth: { POOR: 130, MIDDLE: 100, RICH: 80 },
        effect: { energy: -3, familyRelation: 9, charisma: 1, money: -100 },
        feedback: '',
      },
      {
        id: 'shopping_skill_course',
        text: '',
        icon: '🎓',
        energyCost: 6,
        minAge: 10,
        priceByWealth: { POOR: 210, MIDDLE: 165, RICH: 132 },
        effect: { energy: -6, intelligence: 4, discipline: 3, money: -165 },
        feedback: '',
        skillUpdates: { logic: 2, work_ethic: 1 },
      },
      {
        id: 'shopping_energy_drink',
        text: '',
        icon: 'drink',
        energyCost: 1,
        minAge: 10,
        purchaseItemId: 'item_energy_drink',
        priceByWealth: buildConsumablePrices(CONSUMABLE_CONFIG.energyDrink.base),
        effect: { money: -CONSUMABLE_CONFIG.energyDrink.base },
        feedback: '',
        requiredFeatureFlag: 'CONSUMABLE_ITEMS',
      },
      {
        id: 'shopping_tutor_session',
        text: '',
        icon: 'tutor',
        energyCost: 2,
        minAge: 12,
        purchaseItemId: 'item_tutor_session',
        priceByWealth: buildConsumablePrices(CONSUMABLE_CONFIG.tutorSession.base),
        effect: { money: -CONSUMABLE_CONFIG.tutorSession.base },
        feedback: '',
        requiredFeatureFlag: 'CONSUMABLE_ITEMS',
      },
      {
        id: 'shopping_gym_pass',
        text: '',
        icon: 'gym',
        energyCost: 3,
        minAge: 12,
        purchaseItemId: 'item_gym_pass',
        priceByWealth: buildConsumablePrices(CONSUMABLE_CONFIG.gymPass.base),
        effect: { money: -CONSUMABLE_CONFIG.gymPass.base },
        feedback: '',
        requiredFeatureFlag: 'CONSUMABLE_ITEMS',
      },
      {
        id: 'shopping_fashion_outfit',
        text: '',
        icon: 'style',
        energyCost: 3,
        minAge: 13,
        purchaseItemId: 'item_fashion_outfit',
        priceByWealth: buildConsumablePrices(CONSUMABLE_CONFIG.fashionOutfit.base),
        effect: { money: -CONSUMABLE_CONFIG.fashionOutfit.base },
        feedback: '',
        requiredFeatureFlag: 'CONSUMABLE_ITEMS',
      },
      {
        id: 'shopping_investment',
        text: '',
        icon: 'invest',
        energyCost: 4,
        minAge: 14,
        purchaseItemId: 'item_investment',
        priceByWealth: buildConsumablePrices(CONSUMABLE_CONFIG.investment.base),
        effect: { money: -CONSUMABLE_CONFIG.investment.base },
        feedback: '',
        requiredFeatureFlag: 'CONSUMABLE_ITEMS',
      },
    ],
  },
];

export const getActionCategoryTitle = (
  categoryId: string,
  fallback?: string,
  locale?: AppLocale
): string => {
  const key = `actions.categories.${categoryId}`;
  return locale
    ? translate(locale, key, undefined, fallback ?? categoryId)
    : tRuntime(key, undefined, fallback ?? categoryId);
};

export const getSubActionText = (
  actionId: string,
  fallback?: string,
  locale?: AppLocale
): string => {
  const key = `actions.${actionId}.text`;
  return locale
    ? translate(locale, key, undefined, fallback ?? actionId)
    : tRuntime(key, undefined, fallback ?? actionId);
};

export const getSubActionFeedback = (
  actionId: string,
  fallback?: string,
  locale?: AppLocale
): string => {
  const key = `actions.${actionId}.feedback`;
  return locale
    ? translate(locale, key, undefined, fallback ?? '')
    : tRuntime(key, undefined, fallback ?? '');
};

const localizeSubAction = (action: SubAction, locale?: AppLocale): SubAction => {
  return {
    ...action,
    text: getSubActionText(action.id, action.text, locale),
    feedback: getSubActionFeedback(action.id, action.feedback, locale),
  };
};

export const localizeActionCategory = (
  category: ActionCategory,
  locale?: AppLocale
): ActionCategory => {
  const availableSubActions = category.subActions
    .filter(action => !action.requiredFeatureFlag || isFeatureEnabled(action.requiredFeatureFlag))
    .map(action => localizeSubAction(action, locale));

  return {
    ...category,
    title: getActionCategoryTitle(category.id, category.title, locale),
    subActions: availableSubActions,
  };
};

export const getLocalizedActionCategories = (locale?: AppLocale): ActionCategory[] => {
  return ACTION_CATEGORIES.map(category => localizeActionCategory(category, locale));
};

interface ActionCategoryFilterOptions {
  careerPathActionsEnabled?: boolean;
}

export const filterActionCategoriesForContext = (
  categories: ActionCategory[],
  age: number,
  selectedGoal: LifeGoal | null | undefined,
  options: ActionCategoryFilterOptions = {}
): ActionCategory[] => {
  const careerPathActionsEnabled = options.careerPathActionsEnabled ?? false;

  return categories.filter(category => {
    if (category.minAge && age < category.minAge) return false;
    if (category.maxAge !== undefined && age > category.maxAge) return false;

    if (category.requiredGoal) {
      if (!careerPathActionsEnabled) return false;
      if (!selectedGoal) return false;
      if (category.requiredGoal !== selectedGoal) return false;
    }

    return category.subActions.length > 0;
  });
};
