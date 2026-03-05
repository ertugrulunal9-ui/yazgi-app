import { FamilyWealth, LifeGoal, PersonalityEffect, PersonalityMomentumSignal, Skills, Stats } from '../types';
import { tRuntime } from '../i18n/strings';
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
    title: 'Bebek',
    icon: '👶',
    color: '#f472b6',
    bgColor: 'rgba(244, 114, 182, 0.15)',
    maxAge: 2,
    subActions: [
      {
        id: 'baby_eat',
        text: 'Mama Ye',
        icon: '🍼',
        energyCost: 0,
        effect: { health: 3, energy: 20 },
        feedback: 'Mamanı yedin ve enerjin doldu.',
      },
      {
        id: 'baby_sleep',
        text: 'Uyku',
        icon: '😴',
        energyCost: 0,
        effect: { health: 5, energy: 40 },
        feedback: 'Güzel bir uyku çektin.',
      },
      {
        id: 'baby_play',
        text: 'Oyuncakla Oyna',
        icon: '🧸',
        energyCost: 10,
        effect: { intelligence: 1, energy: -10, charisma: 1 },
        feedback: 'Oyuncaklarınla eğlendin.',
      },
      {
        id: 'baby_crawl',
        text: 'Emekleme Dene',
        icon: '👣',
        energyCost: 15,
        effect: { health: 2, energy: -15, discipline: 1 },
        feedback: 'Emeklemeye çalıştın, vücudun güçleniyor.',
        skillUpdates: { athletics: 1 },
      },
      {
        id: 'baby_family',
        text: 'Aileyle Vakit Geçir',
        icon: '👨‍👩‍👧',
        energyCost: 5,
        effect: { energy: -5, familyRelation: 10, charisma: 1 },
        feedback: 'Ailenle güzel vakit geçirdin.',
      },
    ],
  },
  {
    id: 'explore',
    title: 'Keşif',
    icon: '🔎',
    color: '#14b8a6',
    bgColor: 'rgba(20, 184, 166, 0.15)',
    minAge: 3,
    maxAge: 6,
    subActions: [
      {
        id: 'explore_playground',
        text: 'Parkta Oyna',
        icon: '🛝',
        energyCost: 12,
        minAge: 3,
        effect: { health: 3, energy: -12, charisma: 1 },
        personalityEffects: [
          { axis: 'courage', change: 2 },
          { axis: 'openness', change: 2 },
        ],
        feedback: 'Parkta oynadın, hem cesaretin hem sosyalliğin arttı.',
        skillUpdates: { athletics: 2, teamwork: 1 },
      },
      {
        id: 'explore_nature',
        text: 'Doğa Keşfine Çık',
        icon: '🌿',
        energyCost: 10,
        minAge: 3,
        effect: { intelligence: 2, health: 2, energy: -10 },
        personalityEffects: [
          { axis: 'openness', change: 3 },
          { axis: 'patience', change: 1 },
        ],
        feedback: 'Doğada yeni şeyler keşfettin.',
        skillUpdates: { reading: 1 },
      },
      {
        id: 'explore_imagination',
        text: 'Hayal Oyunu Kur',
        icon: '🧠',
        energyCost: 11,
        minAge: 4,
        effect: { intelligence: 3, charisma: 2, energy: -11 },
        personalityEffects: [
          { axis: 'openness', change: 2 },
          { axis: 'courage', change: 1 },
        ],
        feedback: 'Hayal gücünle yeni bir dünya kurdun.',
        skillUpdates: { writing: 2 },
      },
      {
        id: 'explore_home_adventure',
        text: 'Evde Macera Oyunu',
        icon: '🏠',
        energyCost: 9,
        minAge: 3,
        effect: { discipline: 1, familyRelation: 2, energy: -9 },
        personalityEffects: [
          { axis: 'courage', change: 1 },
          { axis: 'patience', change: 2 },
        ],
        feedback: 'Evde keyifli bir macera oyunu oynadın.',
        skillUpdates: { teamwork: 1 },
      },
    ],
  },
  {
    id: 'family',
    title: 'Aile Zamanı',
    icon: '👨‍👩‍👧',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.15)',
    minAge: 3,
    maxAge: 6,
    subActions: [
      {
        id: 'family_time',
        text: 'Aileyle Oyun Oyna',
        icon: '👪',
        energyCost: 6,
        minAge: 3,
        effect: { familyRelation: 8, charisma: 1, energy: -6 },
        personalityEffects: [
          { axis: 'empathy', change: 2 },
          { axis: 'patience', change: 1 },
        ],
        feedback: 'Ailenle eğlenceli vakit geçirdin.',
      },
      {
        id: 'family_story',
        text: 'Masal Saati',
        icon: '📖',
        energyCost: 6,
        minAge: 3,
        effect: { intelligence: 2, familyRelation: 6, energy: -6 },
        personalityEffects: [
          { axis: 'empathy', change: 2 },
          { axis: 'openness', change: 1 },
        ],
        feedback: 'Ailenle masal okuyup yeni şeyler öğrendin.',
        skillUpdates: { reading: 2 },
      },
      {
        id: 'family_help_housework',
        text: 'Ev İşlerine Yardım Et',
        icon: '🧹',
        energyCost: 10,
        minAge: 4,
        effect: { discipline: 3, familyRelation: 5, money: 10, energy: -10 },
        personalityEffects: [
          { axis: 'empathy', change: 1 },
          { axis: 'conformity', change: 2 },
        ],
        feedback: 'Ev işlerine yardım ettin, sorumluluk kazandın.',
      },
    ],
  },
  {
    id: 'study',
    title: 'Okul',
    icon: '📚',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.15)',
    minAge: 6,
    subActions: [
      {
        id: 'study_math',
        text: 'Matematik Çalış',
        icon: '🔢',
        energyCost: 18,
        minAge: 7,
        effect: { intelligence: 5, energy: -18 },
        feedback: 'Matematik problemleri çözdün.',
        gradeUpdates: { math: 8 },
        skillUpdates: { logic: 3 },
      },
      {
        id: 'study_math_exam',
        text: 'Matematik Sınavı',
        icon: '🎯',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: 'Matematik sınavına girdin!',
        opensExamGame: 'MATH',
      },
      {
        id: 'study_turkish',
        text: 'Türkçe Çalış',
        icon: '📝',
        energyCost: 15,
        minAge: 6,
        effect: { intelligence: 4, energy: -15, charisma: 1 },
        feedback: 'Türkçe çalıştın, kelime dağarcığın genişledi.',
        gradeUpdates: { language: 6 },
      },
      {
        id: 'study_turkish_exam',
        text: 'Türkçe Sınavı',
        icon: '✍️',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: 'Türkçe sınavına girdin!',
        opensExamGame: 'TURKISH',
      },
      {
        id: 'study_science',
        text: 'Fen Çalış',
        icon: '🔬',
        energyCost: 18,
        minAge: 7,
        effect: { intelligence: 5, energy: -18 },
        feedback: 'Fen bilgisi çalıştın.',
        gradeUpdates: { science: 8 },
      },
      {
        id: 'study_science_exam',
        text: 'Fen Sınavı',
        icon: '🧪',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: 'Fen bilgisi sınavına girdin!',
        opensExamGame: 'SCIENCE',
      },
      {
        id: 'study_geography',
        text: 'Coğrafya Çalış',
        icon: '🗺️',
        energyCost: 15,
        minAge: 8,
        effect: { intelligence: 4, energy: -15 },
        feedback: 'Coğrafya çalıştın, dünyayı tanıdın.',
        gradeUpdates: { geography: 6 },
      },
      {
        id: 'study_geography_exam',
        text: 'Coğrafya Sınavı',
        icon: '🌍',
        energyCost: 25,
        minAge: 9,
        effect: { intelligence: 2, energy: -25 },
        feedback: 'Coğrafya sınavına girdin!',
        opensExamGame: 'GEOGRAPHY',
      },
      {
        id: 'study_english',
        text: 'İngilizce Çalış',
        icon: '🇬🇧',
        energyCost: 16,
        minAge: 7,
        effect: { intelligence: 4, energy: -16, charisma: 1 },
        feedback: 'İngilizce çalıştın, kelime dağarcığın genişledi.',
        gradeUpdates: { language: 7 },
      },
      {
        id: 'study_english_exam',
        text: 'İngilizce Sınavı',
        icon: '🔤',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: 'İngilizce sınavına girdin!',
        opensExamGame: 'ENGLISH',
      },
      {
        id: 'study_history',
        text: 'Tarih Çalış',
        icon: '📜',
        energyCost: 15,
        minAge: 8,
        effect: { intelligence: 4, energy: -15 },
        feedback: 'Tarih çalıştın, geçmişi öğrendin.',
        gradeUpdates: { history: 6 },
      },
      {
        id: 'study_history_exam',
        text: 'Tarih Sınavı',
        icon: '🏛️',
        energyCost: 25,
        minAge: 9,
        effect: { intelligence: 2, energy: -25 },
        feedback: 'Tarih sınavına girdin!',
        opensExamGame: 'HISTORY',
      },
      {
        id: 'study_art',
        text: 'Görsel Sanatlar Çalış',
        icon: '🎨',
        energyCost: 12,
        minAge: 7,
        effect: { intelligence: 2, charisma: 2, energy: -12 },
        feedback: 'Görsel sanatlar çalıştın.',
        gradeUpdates: { art: 6 },
      },
      {
        id: 'study_art_exam',
        text: 'Görsel Sanatlar Sınavı',
        icon: '🖼️',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: 'Görsel sanatlar sınavına girdin!',
        opensExamGame: 'ART',
      },
      {
        id: 'study_music',
        text: 'Müzik Çalış',
        icon: '🎵',
        energyCost: 12,
        minAge: 7,
        effect: { intelligence: 2, charisma: 2, energy: -12 },
        feedback: 'Müzik çalıştın.',
        gradeUpdates: { music: 6 },
      },
      {
        id: 'study_music_exam',
        text: 'Müzik Sınavı',
        icon: '🎼',
        energyCost: 25,
        minAge: 7,
        effect: { intelligence: 2, energy: -25 },
        feedback: 'Müzik sınavına girdin!',
        opensExamGame: 'MUSIC',
      },
      {
        id: 'study_book',
        text: 'Kitap Oku',
        icon: '📖',
        energyCost: 15,
        minAge: 4,
        effect: { intelligence: 3, energy: -15 },
        feedback: 'Kitap okudun ve bilgin arttı.',
        skillUpdates: { reading: 2 },
      },
      {
        id: 'study_homework',
        text: 'Ödev Yap',
        icon: '✏️',
        energyCost: 12,
        minAge: 6,
        effect: { intelligence: 4, energy: -12, discipline: 3 },
        feedback: 'Ödevlerini tamamladın.',
        gradeUpdates: { math: 3, science: 3, language: 3 },
      },
    ],
  },
  {
    id: 'sports',
    title: 'Spor',
    icon: '⚽',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.15)',
    subActions: [
      {
        id: 'sports_run',
        text: 'Koşu Yap',
        icon: '🏃',
        energyCost: 20,
        minAge: 3,
        effect: { health: 5, energy: -20, discipline: 2 },
        feedback: 'Koşu yaptın ve sağlığın arttı.',
        skillUpdates: { athletics: 3 },
      },
      {
        id: 'sports_football',
        text: 'Futbol Oyna',
        icon: '⚽',
        energyCost: 25,
        minAge: 5,
        earlyUnlockByItem: {
          itemId: 'item_football',
          minAge: 4,
        },
        effect: { health: 6, energy: -25, charisma: 2 },
        feedback: 'Arkadaşlarınla futbol oynadın.',
        skillUpdates: { athletics: 4, teamwork: 2 },
      },
      {
        id: 'sports_swim',
        text: 'Yüzme',
        icon: '🏊',
        energyCost: 22,
        minAge: 6,
        effect: { health: 7, energy: -22, discipline: 3 },
        feedback: 'Yüzme yaptın.',
        skillUpdates: { athletics: 4 },
      },
      {
        id: 'sports_gym',
        text: 'Spor Salonu',
        icon: '🏋️',
        energyCost: 30,
        minAge: 12,
        effect: { health: 8, energy: -30, discipline: 4 },
        feedback: 'Spor salonunda çalıştın.',
        skillUpdates: { athletics: 5 },
      },
      {
        id: 'sports_bicycle',
        text: 'Bisiklet Sür',
        icon: '🚲',
        energyCost: 16,
        minAge: 6,
        requiredItemIds: ['item_bicycle'],
        effect: { health: 4, energy: -16 },
        personalityEffects: [{ axis: 'courage', change: 2 }],
        feedback: 'Bisiklete bindin, kondisyonun ve cesaretin arttı.',
        skillUpdates: { athletics: 3 },
      },
    ],
  },
  {
    id: 'arts',
    title: 'Sanat',
    icon: '🎨',
    color: '#ec4899',
    bgColor: 'rgba(236, 72, 153, 0.15)',
    subActions: [
      {
        id: 'arts_draw',
        text: 'Resim Çiz',
        icon: '🖌️',
        energyCost: 15,
        minAge: 3,
        effect: { intelligence: 2, energy: -15, charisma: 2 },
        feedback: 'Resim çizdin ve yaratıcılığın arttı.',
        skillUpdates: { art: 4 },
      },
      {
        id: 'arts_music',
        text: 'Müzik Dinle',
        icon: '🎵',
        energyCost: 5,
        minAge: 3,
        effect: { energy: -5, charisma: 1 },
        feedback: 'Müzik dinledin ve rahatladın.',
        skillUpdates: { music: 1 },
      },
      {
        id: 'arts_instrument',
        text: 'Enstrüman Çal',
        icon: '🎸',
        energyCost: 18,
        minAge: 7,
        requiredItemIds: ['item_instrument'],
        effect: { intelligence: 3, energy: -18, charisma: 3, discipline: 2 },
        feedback: 'Enstrüman çaldın.',
        skillUpdates: { music: 5 },
      },
      {
        id: 'arts_write',
        text: 'Yaratıcı Yazarlık',
        icon: '✍️',
        energyCost: 12,
        minAge: 8,
        effect: { intelligence: 4, energy: -12, charisma: 2 },
        feedback: 'Yaratıcı bir hikaye yazdın.',
        skillUpdates: { writing: 4 },
      },
    ],
  },
  {
    id: 'computer',
    title: 'Bilgisayar',
    icon: '💻',
    color: '#8b5cf6',
    bgColor: 'rgba(139, 92, 246, 0.15)',
    minAge: 7,
    subActions: [
      {
        id: 'computer_browse',
        text: 'İnternet Gezin',
        icon: '🌐',
        energyCost: 8,
        effect: { energy: -8, intelligence: 1 },
        feedback: 'İnternette zaman geçirdin.',
      },
      {
        id: 'computer_code',
        text: 'Kod Yaz',
        icon: '👨‍💻',
        energyCost: 20,
        minAge: 8,
        requiredItemIds: ['item_computer'],
        effect: { intelligence: 6, energy: -20, discipline: 3 },
        feedback: 'Kod yazdın ve programlama becerilerin gelişti.',
        skillUpdates: { coding: 6 },
      },
      {
        id: 'computer_design',
        text: 'Grafik Tasarım',
        icon: '🎨',
        energyCost: 15,
        minAge: 8,
        requiredItemIds: ['item_computer'],
        effect: { intelligence: 4, energy: -15, charisma: 2 },
        feedback: 'Grafik tasarım çalışması yaptın.',
        skillUpdates: { design: 5, art: 2 },
      },
      {
        id: 'computer_game',
        text: 'Oyun Oyna',
        icon: '🎮',
        energyCost: 10,
        effect: { energy: -10 },
        feedback: 'Bilgisayar oyunu oynadın.',
      },
    ],
  },
  {
    id: 'work',
    title: 'İş & Para',
    icon: '💼',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.15)',
    minAge: 6,
    subActions: [
      {
        id: 'ask_allowance',
        text: 'Harçlık İste',
        icon: '🫴',
        energyCost: 5,
        minAge: 6,
        effect: {},
        feedback: 'Ailenden harçlık istedin.',
      },
      {
        id: 'work_chores',
        text: 'Ev İşleri',
        icon: '🧹',
        energyCost: 15,
        effect: { energy: -15, money: 14, familyRelation: 5, discipline: 2 },
        feedback: 'Ev işlerine yardım ettin ve harçlık aldın.',
      },
      {
        id: 'work_parttime',
        text: 'Part-Time İş',
        icon: '🍔',
        energyCost: 30,
        minAge: 14,
        effect: { energy: -30, money: 70, discipline: 4 },
        feedback: 'Part-time işte çalıştın ve para kazandın.',
        skillUpdates: { work_ethic: 3 },
      },
      {
        id: 'work_freelance',
        text: 'Freelance İş',
        icon: '💰',
        energyCost: 25,
        minAge: 13,
        effect: { energy: -25, money: 95, intelligence: 3 },
        feedback: 'Freelance iş yaptın.',
        skillUpdates: { coding: 2, design: 2 },
      },
      {
        id: 'work_sell',
        text: 'Bir Şeyler Sat',
        icon: '🏪',
        energyCost: 12,
        minAge: 10,
        effect: { energy: -12, money: 35, charisma: 2 },
        feedback: 'Bir şeyler satıp para kazandın.',
        skillUpdates: { business: 3 },
      },
      {
        id: 'job_lemonade',
        text: 'Limonata Sat',
        icon: '🍋',
        energyCost: 15,
        minAge: 8,
        effect: { energy: -15, money: 15, charisma: 1 },
        feedback: 'Mahallede limonata sattın, ufak bir gelir elde ettin.',
        skillUpdates: { business: 1 },
        requiredFeatureFlag: 'ECONOMY_DEPTH',
      },
      {
        id: 'job_dog_walking',
        text: 'Komşunun Köpeğini Gezdirme',
        icon: '🐕',
        energyCost: 10,
        minAge: 10,
        effect: { energy: -10, money: 20, health: 1 },
        feedback: 'Komşunun köpeğini gezdirdin, hem hareket ettin hem para kazandın.',
        requiredFeatureFlag: 'ECONOMY_DEPTH',
      },
      {
        id: 'job_market_cashier',
        text: 'Market Kasiyerliği',
        icon: '🛒',
        energyCost: 25,
        minAge: 13,
        effect: { energy: -25, money: 40, discipline: 2 },
        feedback: 'Markette kasiyer olarak çalıştın, disiplinli bir iş deneyimi.',
        skillUpdates: { work_ethic: 2 },
        requiredFeatureFlag: 'ECONOMY_DEPTH',
      },
      {
        id: 'job_tutoring',
        text: 'Özel Ders Ver',
        icon: '📚',
        energyCost: 20,
        minAge: 14,
        effect: { energy: -20, money: 50, intelligence: 2 },
        feedback: 'Küçük öğrencilere ders verdin, hem öğrettin hem kazandın.',
        skillUpdates: { teamwork: 1 },
        requiredFeatureFlag: 'ECONOMY_DEPTH',
      },
      {
        id: 'job_internship',
        text: 'Staj Yap',
        icon: '🏢',
        energyCost: 30,
        minAge: 16,
        effect: { energy: -30, money: 80, discipline: 3, intelligence: 1 },
        feedback: 'Stajda gerçek iş hayatını deneyimledin. Çok şey öğrendin.',
        skillUpdates: { work_ethic: 3 },
        requiredFeatureFlag: 'ECONOMY_DEPTH',
      },
    ],
  },
  {
    id: 'goal_academic',
    title: 'Akademik Yol',
    icon: 'goal_academic',
    color: '#2563eb',
    bgColor: 'rgba(37, 99, 235, 0.15)',
    minAge: 12,
    requiredGoal: 'ACADEMIC',
    subActions: [
      {
        id: 'goal_academic_research_project',
        text: 'Arastirma Projesi',
        icon: 'research',
        energyCost: 24,
        minAge: 12,
        effect: { intelligence: 6, discipline: 3, energy: -24 },
        feedback: 'Arastirma planini derinlestirdin ve metodunu guclendirdin.',
        skillUpdates: { logic: 3, reading: 2 },
      },
      {
        id: 'goal_academic_science_competition',
        text: 'Bilim Yarismasi Hazirligi',
        icon: 'science_comp',
        energyCost: 26,
        minAge: 12,
        effect: { intelligence: 7, discipline: 2, charisma: 1, energy: -26 },
        feedback: 'Yarisma icin prototipini gelistirdin.',
        gradeUpdates: { science: 6, math: 4 },
      },
      {
        id: 'goal_academic_olympiad_drill',
        text: 'Akademik Olimpiyat Kampi',
        icon: 'olympiad',
        energyCost: 30,
        minAge: 13,
        effect: { intelligence: 8, discipline: 4, health: -1, energy: -30 },
        feedback: 'Zor sorularla sinirlarini zorladin.',
        skillUpdates: { logic: 4, work_ethic: 2 },
      },
    ],
  },
  {
    id: 'goal_athletic',
    title: 'Atletik Yol',
    icon: 'goal_athletic',
    color: '#16a34a',
    bgColor: 'rgba(22, 163, 74, 0.15)',
    minAge: 12,
    requiredGoal: 'ATHLETIC',
    subActions: [
      {
        id: 'goal_athletic_training_camp',
        text: 'Antrenman Kampi',
        icon: 'camp',
        energyCost: 27,
        minAge: 12,
        effect: { health: 7, discipline: 3, energy: -27 },
        feedback: 'Kamp temposu kondisyonunu belirgin sekilde yukseltti.',
        skillUpdates: { athletics: 4, teamwork: 2 },
      },
      {
        id: 'goal_athletic_tournament_round',
        text: 'Turnuva Elemeleri',
        icon: 'tournament',
        energyCost: 29,
        minAge: 12,
        effect: { health: 6, charisma: 2, discipline: 2, energy: -29 },
        feedback: 'Rakiplerine karsi dayanikliligini test ettin.',
        skillUpdates: { athletics: 5, work_ethic: 1 },
      },
      {
        id: 'goal_athletic_captain_track',
        text: 'Kaptanlik Hazirligi',
        icon: 'captain',
        energyCost: 25,
        minAge: 13,
        effect: { charisma: 3, discipline: 3, familyRelation: 1, energy: -25 },
        feedback: 'Takimi yonetme sorumlulugunu ustlendin.',
        skillUpdates: { teamwork: 4, athletics: 2 },
      },
    ],
  },
  {
    id: 'goal_creative',
    title: 'Yaratici Yol',
    icon: 'goal_creative',
    color: '#db2777',
    bgColor: 'rgba(219, 39, 119, 0.15)',
    minAge: 12,
    requiredGoal: 'CREATIVE',
    subActions: [
      {
        id: 'goal_creative_exhibition_prep',
        text: 'Sergi Hazirligi',
        icon: 'exhibition',
        energyCost: 21,
        minAge: 12,
        effect: { charisma: 5, intelligence: 2, energy: -21 },
        feedback: 'Portfolyonu sergi standardina tasidn.',
        skillUpdates: { art: 4, design: 2 },
      },
      {
        id: 'goal_creative_band_rehearsal',
        text: 'Band Provasi',
        icon: 'band',
        energyCost: 22,
        minAge: 12,
        effect: { charisma: 4, discipline: 2, energy: -22 },
        feedback: 'Sahne uyumunu ve ritmini gelistirdin.',
        skillUpdates: { music: 4, teamwork: 2 },
      },
      {
        id: 'goal_creative_portfolio_review',
        text: 'Portfolyo Revizyonu',
        icon: 'portfolio',
        energyCost: 24,
        minAge: 13,
        effect: { intelligence: 3, charisma: 4, discipline: 2, energy: -24 },
        feedback: 'Secili islerini mentor geri bildirimiyle guncelledin.',
        skillUpdates: { design: 3, writing: 2 },
      },
    ],
  },
  {
    id: 'goal_wealth',
    title: 'Finansal Yol',
    icon: 'goal_wealth',
    color: '#d97706',
    bgColor: 'rgba(217, 119, 6, 0.15)',
    minAge: 13,
    requiredGoal: 'WEALTH',
    subActions: [
      {
        id: 'goal_wealth_market_watch',
        text: 'Pazar Takibi',
        icon: 'market',
        energyCost: 18,
        minAge: 13,
        effect: { intelligence: 3, discipline: 2, money: 35, energy: -18 },
        feedback: 'Firsat pencerelerini okuyup dogru alana odaklandin.',
        skillUpdates: { business: 3, logic: 1 },
      },
      {
        id: 'goal_wealth_business_pitch',
        text: 'Is Plani Sunumu',
        icon: 'pitch',
        energyCost: 23,
        minAge: 13,
        effect: { charisma: 3, intelligence: 2, money: 55, energy: -23 },
        feedback: 'Fikrini netlestirip guven veren bir sunum yaptin.',
        skillUpdates: { business: 4, work_ethic: 1 },
      },
      {
        id: 'goal_wealth_network_round',
        text: 'Networking Turu',
        icon: 'network',
        energyCost: 20,
        minAge: 14,
        effect: { charisma: 4, familyRelation: 1, money: 45, energy: -20 },
        feedback: 'Yeni baglantilarla gelir kapilarini genislettin.',
        skillUpdates: { business: 3, teamwork: 2 },
      },
    ],
  },
  {
    id: 'goal_social',
    title: 'Toplumsal Yol',
    icon: 'goal_social',
    color: '#0891b2',
    bgColor: 'rgba(8, 145, 178, 0.15)',
    minAge: 12,
    requiredGoal: 'SOCIAL',
    subActions: [
      {
        id: 'goal_social_council_session',
        text: 'Ogrenci Konseyi',
        icon: 'council',
        energyCost: 19,
        minAge: 12,
        effect: { charisma: 4, familyRelation: 2, energy: -19 },
        feedback: 'Grup kararlarini adil sekilde yonettin.',
        skillUpdates: { teamwork: 3, writing: 1 },
      },
      {
        id: 'goal_social_volunteer_shift',
        text: 'Gonulluluk Calismasi',
        icon: 'volunteer',
        energyCost: 21,
        minAge: 12,
        effect: { familyRelation: 4, charisma: 3, discipline: 1, energy: -21 },
        feedback: 'Topluluk yararina sahada aktif rol aldin.',
        skillUpdates: { teamwork: 3, work_ethic: 1 },
      },
      {
        id: 'goal_social_peer_mentoring',
        text: 'Akran Mentorlugu',
        icon: 'mentor',
        energyCost: 22,
        minAge: 13,
        effect: { charisma: 4, intelligence: 2, familyRelation: 2, energy: -22 },
        feedback: 'Daha kucuklere rehberlik ederek guven kazandin.',
        skillUpdates: { reading: 2, teamwork: 2 },
      },
    ],
  },
  {
    id: 'shopping',
    title: 'Alışveriş',
    icon: '🛒',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.15)',
    minAge: 4,
    subActions: [
      {
        id: 'shopping_art_set',
        text: 'Boyama Seti Al',
        icon: '🎨',
        energyCost: 4,
        minAge: 4,
        purchaseItemId: 'item_art_set',
        priceByWealth: { POOR: 72, MIDDLE: 55, RICH: 44 },
        effect: { energy: -4, money: -55 },
        feedback: 'Boyama seti aldın. Resim çalışmaların artık daha verimli.',
      },
      {
        id: 'shopping_story_book',
        text: 'Hikaye Kitabı Al',
        icon: '📚',
        energyCost: 4,
        minAge: 4,
        purchaseItemId: 'item_story_book',
        priceByWealth: { POOR: 92, MIDDLE: 70, RICH: 56 },
        effect: { energy: -4, money: -70 },
        feedback: 'Yeni bir hikaye kitabı aldın.',
      },
      {
        id: 'shopping_football',
        text: 'Futbol Topu Al',
        icon: '⚽',
        energyCost: 5,
        minAge: 4,
        purchaseItemId: 'item_football',
        priceByWealth: { POOR: 120, MIDDLE: 90, RICH: 72 },
        effect: { energy: -5, money: -90 },
        feedback: 'Futbol topu aldın. Futbola daha erken başlayabilirsin.',
      },
      {
        id: 'shopping_bicycle',
        text: 'Bisiklet Al',
        icon: '🚲',
        energyCost: 8,
        minAge: 6,
        purchaseItemId: 'item_bicycle',
        priceByWealth: { POOR: 280, MIDDLE: 210, RICH: 168 },
        effect: { energy: -8, money: -210 },
        feedback: 'Bisiklet aldın. Artık bisiklet sürüş aksiyonu açıldı.',
      },
      {
        id: 'shopping_computer',
        text: 'Bilgisayar Al',
        icon: '💻',
        energyCost: 12,
        minAge: 8,
        purchaseItemId: 'item_computer',
        priceByWealth: { POOR: 640, MIDDLE: 480, RICH: 384 },
        effect: { energy: -12, money: -480 },
        feedback: 'Bilgisayar aldın. Kodlama aksiyonları açıldı.',
      },
      {
        id: 'shopping_instrument',
        text: 'Enstrüman Al',
        icon: '🎸',
        energyCost: 8,
        minAge: 7,
        purchaseItemId: 'item_instrument',
        priceByWealth: { POOR: 520, MIDDLE: 390, RICH: 312 },
        effect: { energy: -8, money: -390 },
        feedback: 'Enstrüman aldın. Artık enstrüman çalabilirsin.',
      },
      {
        id: 'shopping_sports_gear',
        text: 'Spor Malzemesi Al',
        icon: '🏋️',
        energyCost: 7,
        minAge: 8,
        purchaseItemId: 'item_sports_gear',
        priceByWealth: { POOR: 320, MIDDLE: 240, RICH: 192 },
        effect: { energy: -7, money: -240 },
        feedback: 'Spor malzemeleri aldın. Spor aksiyonlarında bonus kazandın.',
      },
      {
        id: 'shopping_healthy_meal',
        text: 'Saglikli Ogun Al',
        icon: '🥗',
        energyCost: 2,
        minAge: 6,
        priceByWealth: { POOR: 95, MIDDLE: 75, RICH: 60 },
        effect: { energy: 8, health: 2, money: -75 },
        feedback: 'Saglikli bir ogun aldın. Kendini daha iyi hissediyorsun.',
      },
      {
        id: 'shopping_private_notes',
        text: 'Ders Notu Paketi',
        icon: '📝',
        energyCost: 4,
        minAge: 8,
        priceByWealth: { POOR: 150, MIDDLE: 120, RICH: 96 },
        effect: { energy: -4, intelligence: 3, discipline: 2, money: -120 },
        feedback: 'Kaynak notlar aldın, derslerinde ilerleme hızlandı.',
      },
      {
        id: 'shopping_family_gift',
        text: 'Aileye Hediye Al',
        icon: '🎁',
        energyCost: 3,
        minAge: 7,
        priceByWealth: { POOR: 130, MIDDLE: 100, RICH: 80 },
        effect: { energy: -3, familyRelation: 9, charisma: 1, money: -100 },
        feedback: 'Ailene hediye aldın. Evdeki hava yumuşadı.',
      },
      {
        id: 'shopping_skill_course',
        text: 'Mini Kurs Satin Al',
        icon: '🎓',
        energyCost: 6,
        minAge: 10,
        priceByWealth: { POOR: 210, MIDDLE: 165, RICH: 132 },
        effect: { energy: -6, intelligence: 4, discipline: 3, money: -165 },
        feedback: 'Kısa bir kursa katıldın. Bilgini ve odagını gelistirdin.',
        skillUpdates: { logic: 2, work_ethic: 1 },
      },
      {
        id: 'shopping_energy_drink',
        text: 'Enerji Icecegi Al',
        icon: 'drink',
        energyCost: 1,
        minAge: 10,
        purchaseItemId: 'item_energy_drink',
        priceByWealth: buildConsumablePrices(CONSUMABLE_CONFIG.energyDrink.base),
        effect: { money: -CONSUMABLE_CONFIG.energyDrink.base },
        feedback: 'Enerji icecegi aldin. Aninda enerji takviyesi hazir.',
        requiredFeatureFlag: 'CONSUMABLE_ITEMS',
      },
      {
        id: 'shopping_tutor_session',
        text: 'Ozel Ders Al',
        icon: 'tutor',
        energyCost: 2,
        minAge: 12,
        purchaseItemId: 'item_tutor_session',
        priceByWealth: buildConsumablePrices(CONSUMABLE_CONFIG.tutorSession.base),
        effect: { money: -CONSUMABLE_CONFIG.tutorSession.base },
        feedback: 'Ozel ders aldin. Rastgele bir derste notun artacak.',
        requiredFeatureFlag: 'CONSUMABLE_ITEMS',
      },
      {
        id: 'shopping_gym_pass',
        text: 'Spor Salonu Paketi',
        icon: 'gym',
        energyCost: 3,
        minAge: 12,
        purchaseItemId: 'item_gym_pass',
        priceByWealth: buildConsumablePrices(CONSUMABLE_CONFIG.gymPass.base),
        effect: { money: -CONSUMABLE_CONFIG.gymPass.base },
        feedback: `${CONSUMABLE_CONFIG.gymPass.duration} tur boyunca saglik buff'i aktif olacak.`,
        requiredFeatureFlag: 'CONSUMABLE_ITEMS',
      },
      {
        id: 'shopping_fashion_outfit',
        text: 'Tarz Kombin Al',
        icon: 'style',
        energyCost: 3,
        minAge: 13,
        purchaseItemId: 'item_fashion_outfit',
        priceByWealth: buildConsumablePrices(CONSUMABLE_CONFIG.fashionOutfit.base),
        effect: { money: -CONSUMABLE_CONFIG.fashionOutfit.base },
        feedback: `${CONSUMABLE_CONFIG.fashionOutfit.duration} tur boyunca karizma buff'i aktif olacak.`,
        requiredFeatureFlag: 'CONSUMABLE_ITEMS',
      },
      {
        id: 'shopping_investment',
        text: 'Mini Yatirim Yap',
        icon: 'invest',
        energyCost: 4,
        minAge: 14,
        purchaseItemId: 'item_investment',
        priceByWealth: buildConsumablePrices(CONSUMABLE_CONFIG.investment.base),
        effect: { money: -CONSUMABLE_CONFIG.investment.base },
        feedback: `${CONSUMABLE_CONFIG.investment.duration} tur sonra getirisi hesabina yatacak.`,
        requiredFeatureFlag: 'CONSUMABLE_ITEMS',
      },
    ],
  },
];

export const getActionCategoryTitle = (categoryId: string, fallback?: string): string => {
  return tRuntime(`actions.categories.${categoryId}`, undefined, fallback ?? categoryId);
};

export const getSubActionText = (actionId: string, fallback?: string): string => {
  return tRuntime(`actions.${actionId}.text`, undefined, fallback ?? actionId);
};

export const getSubActionFeedback = (actionId: string, fallback?: string): string => {
  return tRuntime(`actions.${actionId}.feedback`, undefined, fallback ?? '');
};

const localizeSubAction = (action: SubAction): SubAction => {
  return {
    ...action,
    text: getSubActionText(action.id, action.text),
    feedback: getSubActionFeedback(action.id, action.feedback),
  };
};

export const localizeActionCategory = (category: ActionCategory): ActionCategory => {
  const availableSubActions = category.subActions
    .filter(action => !action.requiredFeatureFlag || isFeatureEnabled(action.requiredFeatureFlag))
    .map(localizeSubAction);

  return {
    ...category,
    title: getActionCategoryTitle(category.id, category.title),
    subActions: availableSubActions,
  };
};

export const getLocalizedActionCategories = (): ActionCategory[] => {
  return ACTION_CATEGORIES.map(localizeActionCategory);
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
