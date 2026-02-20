import {
  CareerResult,
  GameState,
  LifeGoal,
  SchoolGrades,
  Skills,
  Stats,
  UnlockedAchievement,
} from '../types';
import { BURDEN_CONSTANTS } from '../constants/gameConstants';

export type EndingGoal = 'ACADEMIC' | 'CREATIVE' | 'ATHLETIC' | 'SOCIAL' | 'ENTERPRISE' | 'BALANCED';

export interface EndingCatalogEntry {
  id: string;
  title: string;
  icon: string;
  goal: EndingGoal | 'MYSTERY';
  tier: CareerResult['type'] | 'MISMATCH' | 'SECRET';
}

const GOAL_ENDING_CATALOG: {
  goal: EndingGoal;
  prefix: string;
  label: string;
  icon: string;
}[] = [
  { goal: 'ACADEMIC', prefix: 'academic', label: 'Akademik Yol', icon: '\u{1F393}' },
  { goal: 'CREATIVE', prefix: 'creative', label: 'Yaratici Yol', icon: '\u{1F3A8}' },
  { goal: 'ATHLETIC', prefix: 'athletic', label: 'Atletik Yol', icon: '\u{1F3C3}' },
  { goal: 'SOCIAL', prefix: 'social', label: 'Sosyal Yol', icon: '\u{1F91D}' },
  { goal: 'ENTERPRISE', prefix: 'enterprise', label: 'Girisim Yolu', icon: '\u{1F4BC}' },
  { goal: 'BALANCED', prefix: 'balanced', label: 'Dengeli Yol', icon: '\u2696\uFE0F' },
];

const TIER_ENDING_CATALOG: { tier: CareerResult['type']; label: string }[] = [
  { tier: 'FAILURE', label: 'Zor Son' },
  { tier: 'NORMAL', label: 'Dengeli Son' },
  { tier: 'SUCCESS', label: 'Basari Sonu' },
  { tier: 'LEGENDARY', label: 'Efsane Son' },
];

const generatedTierEndings: EndingCatalogEntry[] = GOAL_ENDING_CATALOG.flatMap(
  ({ goal, prefix, label, icon }) => (
    TIER_ENDING_CATALOG.map(({ tier, label: tierLabel }) => ({
      id: `${prefix}_${tier.toLowerCase()}`,
      title: `${label} - ${tierLabel}`,
      icon,
      goal,
      tier,
    }))
  )
);

const generatedMismatchEndings: EndingCatalogEntry[] = GOAL_ENDING_CATALOG.map(
  ({ goal, prefix, label, icon }) => ({
    id: `${prefix}_mismatch_failure`,
    title: `${label} - Rota Sapmasi`,
    icon,
    goal,
    tier: 'MISMATCH',
  })
);

const SECRET_ENDING_CATALOG: EndingCatalogEntry[] = [
  {
    id: 'secret_family_legacy',
    title: 'Aile Mirasini Geri Kazan',
    icon: '\u{1F3DB}\uFE0F',
    goal: 'MYSTERY',
    tier: 'SECRET',
  },
  {
    id: 'secret_true_balance',
    title: 'Gercek Denge Ustasi',
    icon: '\u{1F31F}',
    goal: 'MYSTERY',
    tier: 'SECRET',
  },
  {
    id: 'secret_fate_breaker',
    title: 'Kader Kirici',
    icon: '\u2694\uFE0F',
    goal: 'MYSTERY',
    tier: 'SECRET',
  },
  {
    id: 'secret_love_and_glory',
    title: 'Ask ve Zafer',
    icon: '\u{1F497}',
    goal: 'MYSTERY',
    tier: 'SECRET',
  },
  {
    id: 'secret_silent_legend',
    title: 'Sessiz Efsane',
    icon: '\u{1F52E}',
    goal: 'MYSTERY',
    tier: 'SECRET',
  },
];

const ENDING_CATALOG = [
  ...generatedTierEndings,
  ...generatedMismatchEndings,
  ...SECRET_ENDING_CATALOG,
];

export const ENDING_ID_LOOKUP: Record<string, EndingCatalogEntry> = ENDING_CATALOG.reduce(
  (acc, entry) => {
    acc[entry.id] = entry;
    return acc;
  },
  {} as Record<string, EndingCatalogEntry>
);

export const ENDING_ID_LIST: string[] = ENDING_CATALOG.map(entry => entry.id);
export const TOTAL_ENDING_COUNT = ENDING_ID_LIST.length;

export interface EndingErrorDebt {
  health: number;
  discipline: number;
  social: number;
  academic: number;
  financial: number;
  stress: number;
  total: number;
  reasons: string[];
}

export type EndingErrorDebtInput = Partial<Omit<EndingErrorDebt, 'total' | 'reasons'>> & {
  total?: number;
  reasons?: string[];
};

export interface ResolveEndingParams {
  gameState: GameState;
  stats: Stats;
  achievements?: string[] | UnlockedAchievement[];
  errorDebt?: EndingErrorDebtInput;
}

export interface EndingResolution {
  id: string;
  goal: EndingGoal;
  goalLabel: string;
  selectedGoal: LifeGoal | null;
  selectedGoalLabel: string;
  inferredGoal: EndingGoal;
  inferredGoalLabel: string;
  mismatchFailure: boolean;
  compatibilityScore: number;
  score: number;
  tier: CareerResult['type'];
  errorDebt: EndingErrorDebt;
  achievementFlavor: string[];
  result: CareerResult;
}

export interface GoalMismatchAnalysis {
  selectedGoal: EndingGoal | null;
  selectedScore: number;
  dominantGoal: EndingGoal;
  dominantScore: number;
  gap: number;
  isMismatch: boolean;
}

interface GoalProfile {
  label: string;
  statWeights: Partial<Record<keyof Stats, number>>;
  skillKeys: (keyof Skills)[];
  gradeKeys: (keyof SchoolGrades)[];
  actionPrefixes: string[];
}

interface CareerPick {
  result: CareerResult;
  domainFit: number;
}

const DEFAULT_PERSONALITY = {
  openness: 50,
  courage: 50,
  empathy: 50,
  patience: 50,
  conformity: 50,
};

const DEFAULT_STRESS = {
  current: 0,
  threshold: 70,
  turnsSinceBreakdown: 0,
  sources: [],
};

const DEFAULT_SKILLS: Skills = {
  coding: 0,
  music: 0,
  sports: 0,
  design: 0,
  athletics: 0,
  logic: 0,
  reading: 0,
  teamwork: 0,
  art: 0,
  writing: 0,
  work_ethic: 0,
  business: 0,
};

const DEFAULT_GRADES: SchoolGrades = {
  math: 50,
  science: 50,
  language: 50,
  turkish: 50,
  history: 50,
  geography: 50,
  art: 50,
  music: 50,
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

const average = (values: number[]): number => {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
};

const normalizeMoney = (money: number): number => {
  const safe = Math.max(0, money);
  return clamp((Math.log10(safe + 1) / 5) * 100, 0, 100);
};

const getNormalizedStat = (stats: Stats, key: keyof Stats): number => {
  if (key === 'money') return normalizeMoney(stats.money);
  return clamp(stats[key], 0, 100);
};

const weightedStatScore = (
  stats: Stats,
  weights: Partial<Record<keyof Stats, number>>
): number => {
  let weighted = 0;
  let weightTotal = 0;
  (Object.keys(weights) as (keyof Stats)[]).forEach((key) => {
    const w = weights[key] || 0;
    if (w <= 0) return;
    weighted += getNormalizedStat(stats, key) * w;
    weightTotal += w;
  });
  if (weightTotal === 0) return 0;
  return weighted / weightTotal;
};

const actionPrefixDensity = (gameState: GameState, prefixes: string[]): number => {
  const history = gameState.actionHistory || [];
  if (history.length === 0) return 0;

  const matches = history.filter(entry =>
    prefixes.some(prefix => entry.actionId.startsWith(prefix))
  ).length;

  return clamp((matches / history.length) * 100, 0, 100);
};

const skillScore = (skills: Skills, keys: (keyof Skills)[]): number => {
  if (keys.length === 0) return 0;
  return average(keys.map(key => clamp(skills[key] || 0, 0, 100)));
};

const gradeScore = (grades: SchoolGrades, keys: (keyof SchoolGrades)[]): number => {
  if (keys.length === 0) return 0;
  return average(keys.map(key => clamp(grades[key] || 0, 0, 100)));
};

const GOAL_PROFILES: Record<EndingGoal, GoalProfile> = {
  ACADEMIC: {
    label: 'Akademik Hedef',
    statWeights: { intelligence: 0.45, discipline: 0.35, health: 0.1, familyRelation: 0.1 },
    skillKeys: ['logic', 'reading', 'writing', 'coding'],
    gradeKeys: ['math', 'science', 'language', 'history', 'geography'],
    actionPrefixes: ['study_'],
  },
  CREATIVE: {
    label: 'Yaratici Hedef',
    statWeights: { intelligence: 0.25, charisma: 0.35, discipline: 0.2, health: 0.1, familyRelation: 0.1 },
    skillKeys: ['music', 'art', 'design', 'writing'],
    gradeKeys: ['art', 'music', 'language'],
    actionPrefixes: ['arts_', 'study_art', 'study_music', 'computer_design'],
  },
  ATHLETIC: {
    label: 'Atletik Hedef',
    statWeights: { health: 0.45, discipline: 0.25, energy: 0.2, charisma: 0.1 },
    skillKeys: ['sports', 'athletics', 'teamwork'],
    gradeKeys: [],
    actionPrefixes: ['sports_'],
  },
  SOCIAL: {
    label: 'Sosyal Hedef',
    statWeights: { charisma: 0.45, familyRelation: 0.3, health: 0.1, intelligence: 0.15 },
    skillKeys: ['teamwork', 'reading', 'music'],
    gradeKeys: ['language'],
    actionPrefixes: ['social_', 'family_', 'explore_playground'],
  },
  ENTERPRISE: {
    label: 'Girisim Hedefi',
    statWeights: { money: 0.35, intelligence: 0.25, discipline: 0.2, charisma: 0.2 },
    skillKeys: ['business', 'coding', 'work_ethic', 'design'],
    gradeKeys: ['math', 'language'],
    actionPrefixes: ['work_', 'computer_code', 'work_freelance', 'work_sell', 'shopping_'],
  },
  BALANCED: {
    label: 'Dengeli Hedef',
    statWeights: {
      health: 0.2,
      intelligence: 0.2,
      charisma: 0.2,
      discipline: 0.2,
      familyRelation: 0.2,
    },
    skillKeys: ['coding', 'music', 'sports', 'design', 'reading', 'teamwork'],
    gradeKeys: ['math', 'science', 'language', 'history', 'geography', 'art', 'music'],
    actionPrefixes: ['study_', 'sports_', 'arts_', 'work_'],
  },
};

const ACTION_DEBT_RISK_PREFIXES = ['study_', 'sports_', 'work_', 'computer_', 'arts_'];
const ACTION_DEBT_RECOVERY_PREFIXES = ['baby_sleep', 'baby_eat', 'family_'];

const calculateActionDerivedDebt = (
  gameState: GameState,
  multiplier: number
): number => {
  const history = gameState.actionHistory || [];
  if (history.length === 0) return 0;

  const recent = history.slice(-BURDEN_CONSTANTS.ACTION_PRESSURE_WINDOW);
  let pressure = 0;

  for (const action of recent) {
    const actionId = action.actionId;
    const isRiskAction = ACTION_DEBT_RISK_PREFIXES.some(prefix => actionId.startsWith(prefix));
    const isRecoveryAction = ACTION_DEBT_RECOVERY_PREFIXES.some(prefix => actionId.startsWith(prefix));

    if (isRiskAction) {
      pressure += actionId.startsWith('work_') ? 1.25 : 1;
    }
    if (isRecoveryAction) {
      pressure -= 0.75;
    }
  }

  const normalizedPressure = clamp((pressure / Math.max(1, recent.length)) * 100, 0, 100);
  const rawDebt = Math.max(0, (normalizedPressure - 24) * 0.85);
  return clamp(rawDebt * multiplier, 0, 55);
};

const LIFE_GOAL_TO_ENDING_GOAL: Record<LifeGoal, EndingGoal> = {
  ACADEMIC: 'ACADEMIC',
  ATHLETIC: 'ATHLETIC',
  CREATIVE: 'CREATIVE',
  WEALTH: 'ENTERPRISE',
  SOCIAL: 'SOCIAL',
};

interface GoalFitBreakdown {
  statFit: number;
  skillsFit: number;
  gradesFit: number;
  actionFit: number;
  score: number;
}

const getSelectedEndingGoal = (selectedGoal?: LifeGoal | null): EndingGoal | null => {
  if (!selectedGoal) return null;
  return LIFE_GOAL_TO_ENDING_GOAL[selectedGoal] ?? null;
};

const calculateGoalFitBreakdown = (
  gameState: GameState,
  stats: Stats,
  goal: EndingGoal
): GoalFitBreakdown => {
  const grades = { ...DEFAULT_GRADES, ...(gameState.schoolGrades || {}) };
  const skills = { ...DEFAULT_SKILLS, ...(gameState.skills || {}) };

  const profile = GOAL_PROFILES[goal];
  const statFit = weightedStatScore(stats, profile.statWeights);
  const skillsFit = skillScore(skills, profile.skillKeys);
  const gradesFit = gradeScore(grades, profile.gradeKeys);
  const actionFit = actionPrefixDensity(gameState, profile.actionPrefixes);
  const intentScore = (statFit * 0.5) + (skillsFit * 0.2) + (gradesFit * 0.2) + (actionFit * 0.1);

  return {
    statFit: clamp(statFit, 0, 100),
    skillsFit: clamp(skillsFit, 0, 100),
    gradesFit: clamp(gradesFit, 0, 100),
    actionFit: clamp(actionFit, 0, 100),
    score: clamp(intentScore, 0, 100),
  };
};

export const calculateSelectedGoalStatProgress = (
  selectedGoal: LifeGoal | null | undefined,
  stats: Stats
): number => {
  const goal = getSelectedEndingGoal(selectedGoal);
  if (!goal) return 0;
  const score = weightedStatScore(stats, GOAL_PROFILES[goal].statWeights);
  return round1(clamp(score, 0, 100));
};

const detectDominantGoal = (gameState: GameState, stats: Stats): { goal: EndingGoal; score: number } => {
  let dominantGoal: EndingGoal = 'BALANCED';
  let bestScore = -1;

  (Object.keys(GOAL_PROFILES) as EndingGoal[]).forEach((goal) => {
    const fit = calculateGoalFitBreakdown(gameState, stats, goal);
    const intentScore = fit.score;

    if (intentScore > bestScore) {
      bestScore = intentScore;
      dominantGoal = goal;
    }
  });

  return { goal: dominantGoal, score: clamp(bestScore, 0, 100) };
};

export const analyzeGoalMismatch = (gameState: GameState, stats: Stats): GoalMismatchAnalysis => {
  const dominant = detectDominantGoal(gameState, stats);
  const selectedGoal = getSelectedEndingGoal(gameState.selectedGoal);
  const selectedScore = selectedGoal
    ? calculateGoalFitBreakdown(gameState, stats, selectedGoal).score
    : dominant.score;
  const gap = Math.max(0, dominant.score - selectedScore);
  const isMismatch = Boolean(
    selectedGoal
    && dominant.goal !== selectedGoal
    && selectedScore <= 58
    && gap >= 16
  );

  return {
    selectedGoal,
    selectedScore: round1(selectedScore),
    dominantGoal: dominant.goal,
    dominantScore: round1(dominant.score),
    gap: round1(gap),
    isMismatch,
  };
};

export interface WhatIfResult {
  goal: EndingGoal;
  label: string;
  score: number;
  isSelected: boolean;
  isDominant: boolean;
}

export const calculateAllGoalScores = (
  gameState: GameState,
  stats: Stats
): WhatIfResult[] => {
  const selectedEndingGoal = getSelectedEndingGoal(gameState.selectedGoal);
  const dominant = detectDominantGoal(gameState, stats);

  return (Object.keys(GOAL_PROFILES) as EndingGoal[])
    .map((goal) => ({
      goal,
      label: GOAL_PROFILES[goal].label,
      score: round1(calculateGoalFitBreakdown(gameState, stats, goal).score),
      isSelected: goal === selectedEndingGoal,
      isDominant: goal === dominant.goal,
    }))
    .sort((a, b) => b.score - a.score);
};

const calculateBaseErrorDebt = (
  gameState: GameState,
  stats: Stats,
  runtimeMode: boolean
): EndingErrorDebt => {
  const grades = { ...DEFAULT_GRADES, ...(gameState.schoolGrades || {}) };
  const reasons: string[] = [];

  const healthDebt = Math.max(0, 45 - stats.health);
  if (healthDebt > 0) reasons.push('Saglik dengesi zayif');

  const disciplineDebt = Math.max(0, 45 - stats.discipline);
  if (disciplineDebt > 0) reasons.push('Disiplin acigi var');

  const socialDebt = Math.max(0, 40 - stats.familyRelation);
  if (socialDebt > 0) reasons.push('Sosyal destek dusuk');

  const avgGrades = average([
    grades.math || 0,
    grades.science || 0,
    grades.language || 0,
    grades.history || 0,
    grades.geography || 0,
    grades.art || 0,
    grades.music || 0,
  ]);
  const academicDebt = Math.max(0, 55 - avgGrades);
  if (academicDebt > 0) reasons.push('Akademik temel zayif');

  const moneyDebt = Math.max(0, 25 - normalizeMoney(stats.money)) * 0.4;
  if (moneyDebt > 6) reasons.push('Finansal tampon kucuk');

  const stress = gameState.stress || DEFAULT_STRESS;
  const stressRatio = stress.threshold > 0
    ? stress.current / stress.threshold
    : 0;
  const stressDebtBase = Math.max(0, (stressRatio - 0.85) * 40);
  const actionDebt = runtimeMode
    ? calculateActionDerivedDebt(gameState, BURDEN_CONSTANTS.ACTION_DEBT_MULTIPLIER)
    : 0;
  const stressDebt = stressDebtBase + actionDebt;
  if (stressDebtBase > 0) reasons.push('Stres seviyesi yuksek');
  if (actionDebt > 4) reasons.push('Asiri tempo hata borcunu buyuttu');

  const total =
    (healthDebt * 0.9) +
    (disciplineDebt * 0.85) +
    (socialDebt * 0.75) +
    (academicDebt * 0.7) +
    (moneyDebt) +
    (stressDebt);

  return {
    health: round1(healthDebt),
    discipline: round1(disciplineDebt),
    social: round1(socialDebt),
    academic: round1(academicDebt),
    financial: round1(moneyDebt),
    stress: round1(stressDebt),
    total: round1(clamp(total, 0, 100)),
    reasons,
  };
};

const round1 = (value: number): number => Math.round(value * 10) / 10;

const mergeErrorDebt = (
  base: EndingErrorDebt,
  override?: EndingErrorDebtInput
): EndingErrorDebt => {
  if (!override) return base;

  const merged: EndingErrorDebt = {
    ...base,
    ...override,
    reasons: override.reasons ? [...override.reasons] : base.reasons,
    total: base.total,
  };

  if (typeof override.total === 'number') {
    merged.total = clamp(override.total, 0, 100);
    return merged;
  }

  const recomputed =
    (merged.health * 0.9) +
    (merged.discipline * 0.85) +
    (merged.social * 0.75) +
    (merged.academic * 0.7) +
    (merged.financial) +
    (merged.stress);

  merged.total = round1(clamp(recomputed, 0, 100));
  return merged;
};

const toAchievementIds = (
  achievements: string[] | UnlockedAchievement[] | undefined,
  gameState: GameState
): string[] => {
  if (!achievements) {
    return (gameState.unlockedAchievements || []).map(item => item.achievementId);
  }
  if (achievements.length === 0) return [];
  if (typeof achievements[0] === 'string') return achievements as string[];
  return (achievements as UnlockedAchievement[]).map(item => item.achievementId);
};

const hasAchievement = (ids: Set<string>, id: string): boolean => ids.has(id);

const achievementBonusForGoal = (goal: EndingGoal, achievementIds: Set<string>): number => {
  let bonus = 0;

  if (hasAchievement(achievementIds, 'perfectionist')) bonus += 8;
  if (hasAchievement(achievementIds, 'balanced')) bonus += 6;
  if (hasAchievement(achievementIds, 'survivor')) bonus += 2;

  if (goal === 'ACADEMIC') {
    if (hasAchievement(achievementIds, 'genius')) bonus += 4;
    if (hasAchievement(achievementIds, 'super_genius')) bonus += 6;
    if (hasAchievement(achievementIds, 'straight_a')) bonus += 4;
    if (hasAchievement(achievementIds, 'scholar')) bonus += 3;
  }

  if (goal === 'CREATIVE') {
    if (hasAchievement(achievementIds, 'virtuoso')) bonus += 6;
    if (hasAchievement(achievementIds, 'musician')) bonus += 3;
    if (hasAchievement(achievementIds, 'designer')) bonus += 3;
  }

  if (goal === 'ATHLETIC') {
    if (hasAchievement(achievementIds, 'pro_athlete')) bonus += 6;
    if (hasAchievement(achievementIds, 'athlete')) bonus += 4;
    if (hasAchievement(achievementIds, 'sportsman')) bonus += 3;
  }

  if (goal === 'SOCIAL') {
    if (hasAchievement(achievementIds, 'popular')) bonus += 5;
    if (hasAchievement(achievementIds, 'friendly')) bonus += 3;
    if (hasAchievement(achievementIds, 'lover')) bonus += 4;
    if (hasAchievement(achievementIds, 'social_butterfly')) bonus += 4;
  }

  if (goal === 'ENTERPRISE') {
    if (hasAchievement(achievementIds, 'rich')) bonus += 5;
    if (hasAchievement(achievementIds, 'millionaire')) bonus += 8;
    if (hasAchievement(achievementIds, 'investor')) bonus += 4;
    if (hasAchievement(achievementIds, 'young_entrepreneur')) bonus += 5;
    if (hasAchievement(achievementIds, 'broke_to_rich')) bonus += 6;
  }

  return bonus;
};

const flavorByAchievements = (
  baseResult: CareerResult,
  achievementIds: Set<string>,
  stats: Stats
): string[] => {
  const lines: string[] = [];
  const hasRichAchievement = hasAchievement(achievementIds, 'rich') || hasAchievement(achievementIds, 'millionaire');
  const hasSocialAnchor = hasAchievement(achievementIds, 'friendly')
    || hasAchievement(achievementIds, 'popular')
    || hasAchievement(achievementIds, 'lover');

  if (hasRichAchievement && hasAchievement(achievementIds, 'saver')) {
    lines.push('Paran var ama paylasim yerine biriktirmeyi seciyorsun; cevren seni mesafeli buluyor.');
  } else if (hasRichAchievement && !hasSocialAnchor && stats.familyRelation < 50) {
    lines.push('Paran var ama etrafinda gercekten guvendigin insanlar cok az.');
  }

  if (hasAchievement(achievementIds, 'heartbreaker')) {
    lines.push('Iliskilerde biraktigin kirik izler bugune kadar tasindi.');
  }

  if (hasAchievement(achievementIds, 'rebel')) {
    lines.push('Kurallara direnen tavrin hayatina hem hiz hem bedel getirdi.');
  }

  if (baseResult.type === 'FAILURE' && (hasAchievement(achievementIds, 'studious') || hasAchievement(achievementIds, 'scholar'))) {
    lines.push('Disiplinli gecmisin, bir sonraki denemede oyunu cevirmen icin guclu bir temel sunuyor.');
  }

  if ((baseResult.type === 'SUCCESS' || baseResult.type === 'LEGENDARY') && hasAchievement(achievementIds, 'perfectionist')) {
    lines.push('Mukemmeliyetci rutinin bu sonucu bir tesaduf olmaktan cikardi.');
  }

  return lines;
};

const calculateTier = (score: number, errorDebt: EndingErrorDebt): CareerResult['type'] => {
  if (errorDebt.total >= 82) return 'FAILURE';
  if (score >= 82) return 'LEGENDARY';
  if (score >= 58) return 'SUCCESS';
  if (score >= 40) return 'NORMAL';
  return 'FAILURE';
};

const buildFailureResult = (): CareerResult => ({
  title: 'Mezuna Kaldin / Issiz',
  description: 'Sinav sonucun bekledigin gibi gelmedi.',
  emoji: '\u{1F480}',
  type: 'FAILURE',
  familyReaction: 'Evde derin bir sessizlik var.',
});

const buildMismatchFailureResult = (
  selectedGoalLabel: string,
  inferredGoalLabel: string
): CareerResult => ({
  title: 'Hedef Uyumsuzlugu',
  description: `${selectedGoalLabel} hedefini sectin ama gelisim cizgin ${inferredGoalLabel} yonune kaydi. Son virajda hedefinle profilin ortusmedi.`,
  emoji: '\u{26A0}\u{FE0F}',
  type: 'FAILURE',
  familyReaction: 'Ailen, daha erken rota duzeltmesi yapman gerektigini dusunuyor.',
});

const buildCareerByGoal = (
  goal: EndingGoal,
  gameState: GameState,
  stats: Stats
): CareerPick => {
  const grades = { ...DEFAULT_GRADES, ...(gameState.schoolGrades || {}) };
  const skills = { ...DEFAULT_SKILLS, ...(gameState.skills || {}) };
  const personality = { ...DEFAULT_PERSONALITY, ...(gameState.personality || {}) };
  const traits = gameState.traits || [];
  const artGrade = grades.art || 0;
  const musicGrade = grades.music || 0;

  // High-signal stat combinations keep strong legacy compatibility.
  if (skills.sports > 90) {
    return {
      domainFit: average([skills.sports, stats.health, stats.discipline]),
      result: {
        title: 'Milli Sporcu',
        description: 'Yillar suren antrenmanlarinin karsiligini aldin. Olimpiyatlara hazirlaniyorsun!',
        emoji: '\u{1F947}',
        type: 'LEGENDARY',
        familyReaction: 'Ailen kupalarini gururla sergiliyor.',
      },
    };
  }

  if (skills.music > 85 && musicGrade >= 70) {
    return {
      domainFit: average([skills.music, musicGrade, stats.charisma]),
      result: {
        title: 'Rockstar / Virtuoz',
        description: 'Konservatuari dereceyle bitirdin. Albumlerin yok satiyor.',
        emoji: '\u{1F3B8}',
        type: 'LEGENDARY',
        familyReaction: 'Ailen her konserinde en onde.',
        influences: [`Muzik notun (${musicGrade}) konservatuar yolunu guclendirdi.`],
      },
    };
  }

  if (grades.math > 80 && grades.science > 80 && stats.discipline > 60 && personality.patience >= 40) {
    return {
      domainFit: average([grades.math, grades.science, stats.discipline, stats.intelligence]),
      result: {
        title: 'Tip Fakultesi',
        description: 'Ulkenin prestijli tip fakultelerinden birini kazandin.',
        emoji: '\u{1FA7A}',
        type: 'SUCCESS',
        familyReaction: 'Ailen herkese doktor olacagini anlatiyor.',
      },
    };
  }

  if (grades.math > 70 && skills.coding > 70) {
    return {
      domainFit: average([grades.math, skills.coding, stats.intelligence]),
      result: {
        title: 'Yazilim Muhendisligi',
        description: 'Kodlama yetenegin seni teknoloji dunyasina tasidi.',
        emoji: '\u{1F4BB}',
        type: 'SUCCESS',
        familyReaction: 'Ailen bilgisayar basindaki emeginin karsiligini aldigini soyluyor.',
      },
    };
  }

  if (grades.language > 80 && stats.intelligence > 70) {
    return {
      domainFit: average([grades.language, stats.intelligence, stats.discipline]),
      result: {
        title: 'Hukuk Fakultesi',
        description: 'Keskin zekan ve hitabetinle hukuk yoluna girdin.',
        emoji: '\u{2696}\u{FE0F}',
        type: 'SUCCESS',
        familyReaction: 'Ailen hukuktaki gelecegine guveniyor.',
      },
    };
  }

  if (stats.money > 2000) {
    return {
      domainFit: average([normalizeMoney(stats.money), stats.intelligence, stats.discipline]),
      result: {
        title: 'Ozel Uni - Isletme',
        description: 'Notlarin parlak olmasa da finansal gucunle iyi bir baslangic yaptin.',
        emoji: '\u{1F393}',
        type: 'NORMAL',
        familyReaction: 'Ailen: Diploma diplomadir diyor.',
      },
    };
  }

  if (goal === 'ATHLETIC') {
    if (skills.sports > 90) {
      return {
        domainFit: average([skills.sports, stats.health, stats.discipline]),
        result: {
          title: 'Milli Sporcu',
          description: 'Yillar suren antrenmanlarinin karsiligini aldin. Olimpiyatlara hazirlaniyorsun!',
          emoji: '\u{1F947}',
          type: 'LEGENDARY',
          familyReaction: 'Ailen kupalarini gururla sergiliyor.',
        },
      };
    }
    if (personality.courage >= 75 && traits.includes('BRAVE') && skills.sports > 60) {
      return {
        domainFit: average([skills.sports, stats.health, personality.courage]),
        result: {
          title: 'Kurtarma Pilotu',
          description: 'Cesaretin ve fiziksel gucun seni havacilik yoluna tasidi.',
          emoji: '\u{2708}\u{FE0F}',
          type: 'SUCCESS',
          familyReaction: 'Ailen cesaretinle hep ovundu.',
        },
      };
    }
  }

  if (goal === 'CREATIVE') {
    if (skills.music > 85 && musicGrade >= 70) {
      return {
        domainFit: average([skills.music, musicGrade, stats.charisma]),
        result: {
          title: 'Rockstar / Virtuoz',
          description: 'Konservatuari dereceyle bitirdin. Albumlerin yok satiyor.',
          emoji: '\u{1F3B8}',
          type: 'LEGENDARY',
          familyReaction: 'Ailen her konserinde en onde.',
          influences: [`Muzik notun (${musicGrade}) konservatuar yolunu guclendirdi.`],
        },
      };
    }
    if (skills.music > 85) {
      return {
        domainFit: average([skills.music, stats.charisma, stats.discipline]),
        result: {
          title: 'Sahne Muzisyeni',
          description: 'Sahnede parladin; akademik muzik notlarin konservatuar seviyesine cikamadi.',
          emoji: '\u{1F3A4}',
          type: 'SUCCESS',
          familyReaction: 'Ailen sahnede kendini bulmana seviniyor.',
          influences: [`Muzik notun (${musicGrade}) akademik yolu sinirladi.`],
        },
      };
    }
    if (skills.art > 85 && artGrade >= 70) {
      return {
        domainFit: average([skills.art, artGrade, stats.charisma]),
        result: {
          title: 'Sanatci',
          description: 'Sergilerin kapali gise. Eserlerin koleksiyonerler tarafindan kapisiliyor.',
          emoji: '\u{1F3A8}',
          type: 'LEGENDARY',
          familyReaction: 'Ailen eserlerini duvarlarina asiyor.',
          influences: [`Gorsel sanatlar notun (${artGrade}) sergi kapilarini acti.`],
        },
      };
    }
    if (skills.art > 85) {
      return {
        domainFit: average([skills.art, stats.intelligence, stats.charisma]),
        result: {
          title: 'Atolye Sanatcisi',
          description: 'Uretim disiplininle kendi stilini kurdun; bagimsiz atolyelerde adin duyuluyor.',
          emoji: '\u{1F3AD}',
          type: 'SUCCESS',
          familyReaction: 'Ailen atolyene destek oluyor.',
          influences: [`Gorsel sanatlar notun (${artGrade}) akademik destegi zayiflatti.`],
        },
      };
    }
    if (skills.writing > 85) {
      return {
        domainFit: average([skills.writing, stats.intelligence, stats.discipline]),
        result: {
          title: 'Unlu Yazar',
          description: 'Kitaplarin cok satanlar listesinde. Imza gunlerinde uzun kuyruklar var.',
          emoji: '\u{270D}\u{FE0F}',
          type: 'LEGENDARY',
          familyReaction: 'Ailen raflarda adini gormekten gururlu.',
        },
      };
    }
    if (personality.openness >= 60 && traits.includes('CREATIVE') && skills.art > 60) {
      return {
        domainFit: average([personality.openness, skills.art, stats.charisma]),
        result: {
          title: 'Dijital Sanatci',
          description: 'Yaraticiligin dijital dunyada karsilik buldu; projelerinle fark yaratiyorsun.',
          emoji: '\u{1F3A8}',
          type: 'SUCCESS',
          familyReaction: 'Ailen eserlerini sosyal medyada paylasiyor.',
        },
      };
    }
  }

  if (goal === 'SOCIAL') {
    if (stats.charisma >= 80 || traits.includes('SOCIAL_BUTTERFLY')) {
      return {
        domainFit: average([stats.charisma, stats.familyRelation, gameState.socialReputation ?? 50]),
        result: {
          title: 'Medya Ikonu',
          description: 'Insanlarla kurdugun baglar seni gorunur bir figure donusturdu.',
          emoji: '\u{1F31F}',
          type: 'SUCCESS',
          familyReaction: 'Ailen herkesin seni tanimasindan gurur duyuyor.',
        },
      };
    }
    if (personality.empathy >= 70 && personality.patience >= 60 && stats.intelligence > 60) {
      return {
        domainFit: average([personality.empathy, personality.patience, stats.intelligence]),
        result: {
          title: 'Psikolog',
          description: 'Insanlari anlama yetenegin seni psikoloji yoluna tasidi.',
          emoji: '\u{1F9E0}',
          type: 'SUCCESS',
          familyReaction: 'Ailen: Her zaman insanlari anlardi diyor.',
        },
      };
    }
  }

  if (goal === 'ENTERPRISE') {
    if (skills.business > 75 && stats.money > 1500) {
      return {
        domainFit: average([skills.business, normalizeMoney(stats.money), stats.charisma]),
        result: {
          title: 'Girisimci',
          description: 'Ticari zekanla kendi isini kurdun. Fikirlerin para ediyor.',
          emoji: '\u{1F4C8}',
          type: 'SUCCESS',
          familyReaction: 'Ailen isini merakla takip ediyor.',
        },
      };
    }
    if (stats.money > 2000) {
      return {
        domainFit: average([normalizeMoney(stats.money), stats.intelligence, stats.discipline]),
        result: {
          title: 'Ozel Uni - Isletme',
          description: 'Notlarin parlak olmasa da finansal gucunle iyi bir baslangic yaptin.',
          emoji: '\u{1F393}',
          type: 'NORMAL',
          familyReaction: 'Ailen: Diploma diplomadir diyor.',
        },
      };
    }
  }

  if (goal === 'ACADEMIC') {
    if (grades.math > 80 && grades.science > 80 && stats.discipline > 60 && personality.patience >= 40) {
      return {
        domainFit: average([grades.math, grades.science, stats.discipline, stats.intelligence]),
        result: {
          title: 'Tip Fakultesi',
          description: 'Ulkenin prestijli tip fakultelerinden birini kazandin.',
          emoji: '\u{1FA7A}',
          type: 'SUCCESS',
          familyReaction: 'Ailen herkese doktor olacagini anlatiyor.',
        },
      };
    }
    if (grades.language > 80 && stats.intelligence > 70) {
      return {
        domainFit: average([grades.language, stats.intelligence, stats.discipline]),
        result: {
          title: 'Hukuk Fakultesi',
          description: 'Keskin zekan ve hitabetinle hukuk yoluna girdin.',
          emoji: '\u{2696}\u{FE0F}',
          type: 'SUCCESS',
          familyReaction: 'Ailen hukuktaki gelecegine guveniyor.',
        },
      };
    }
    if (grades.math > 70 && skills.coding > 70) {
      return {
        domainFit: average([grades.math, skills.coding, stats.intelligence]),
        result: {
          title: 'Yazilim Muhendisligi',
          description: 'Kodlama yetenegin seni teknoloji dunyasina tasidi.',
          emoji: '\u{1F4BB}',
          type: 'SUCCESS',
          familyReaction: 'Ailen bilgisayar basindaki emeginin karsiligini aldigini soyluyor.',
        },
      };
    }
    if (skills.logic > 75 && grades.math > 75) {
      return {
        domainFit: average([skills.logic, grades.math, stats.intelligence]),
        result: {
          title: 'Muhendislik',
          description: 'Analitik dusuncen seni muhendislik yoluna tasidi.',
          emoji: '\u{1F9E0}',
          type: 'SUCCESS',
          familyReaction: 'Ailen sayilarla olan bagini hep konusuyordu.',
        },
      };
    }
  }

  if (personality.conformity >= 70 && traits.includes('DISCIPLINED') && stats.discipline > 70) {
    return {
      domainFit: average([personality.conformity, stats.discipline, stats.health]),
      result: {
        title: 'Subay',
        description: 'Disiplinin ve duzene saygin seni askerlik yoluna yoneltti.',
        emoji: '\u{1F396}\u{FE0F}',
        type: 'SUCCESS',
        familyReaction: 'Ailen: Kurallara hep saygiliydi diyor.',
      },
    };
  }

  if (stats.intelligence > 50 && stats.discipline > 50) {
    return {
      domainFit: average([stats.intelligence, stats.discipline, stats.charisma]),
      result: {
        title: 'Iktisat / Kamu Yonetimi',
        description: 'Dengeli bir profil ile universite yolunu acik tuttun.',
        emoji: '\u{1F4DA}',
        type: 'NORMAL',
        familyReaction: 'Ailen en azindan iyi bir temel kurdugunu dusunuyor.',
      },
    };
  }

  return {
    domainFit: average([stats.intelligence, stats.discipline, stats.health]),
    result: buildFailureResult(),
  };
};

const withFlavor = (
  base: CareerResult,
  goalLabel: string,
  compatibilityScore: number,
  errorDebt: EndingErrorDebt,
  achievementFlavor: string[],
  tier: CareerResult['type'],
  mismatchNote?: string
): CareerResult => {
  const descriptionParts = [base.description, ...achievementFlavor].filter(Boolean);
  const mergedInfluences = [
    ...(base.influences || []),
    `Hedef: ${goalLabel}`,
    `Hedef uyumu: %${Math.round(compatibilityScore)}`,
    `Hata borcu: ${Math.round(errorDebt.total)}`,
  ];
  if (mismatchNote) {
    mergedInfluences.push(mismatchNote);
  }

  return {
    ...base,
    type: tier,
    description: descriptionParts.join(' '),
    influences: mergedInfluences,
  };
};

export const calculateEndingErrorDebt = (
  gameState: GameState,
  stats: Stats,
  override?: EndingErrorDebtInput,
  mode: 'runtime' | 'ending' = 'runtime'
): EndingErrorDebt => {
  const base = calculateBaseErrorDebt(gameState, stats, mode === 'runtime');
  return mergeErrorDebt(base, override);
};

export const resolveEnding = ({
  gameState,
  stats,
  achievements,
  errorDebt,
}: ResolveEndingParams): EndingResolution => {
  const mismatchAnalysis = analyzeGoalMismatch(gameState, stats);
  const goal = mismatchAnalysis.selectedGoal ?? mismatchAnalysis.dominantGoal;
  const goalProfile = GOAL_PROFILES[goal];
  const inferredGoalProfile = GOAL_PROFILES[mismatchAnalysis.dominantGoal];
  const selectedGoalLabel = mismatchAnalysis.selectedGoal
    ? GOAL_PROFILES[mismatchAnalysis.selectedGoal].label
    : 'Hedef Secilmedi (Otomatik Rota)';
  const compatibilityScore = calculateGoalFitBreakdown(gameState, stats, goal).score;
  const basePick = buildCareerByGoal(goal, gameState, stats);
  const resolvedDebt = calculateEndingErrorDebt(gameState, stats, errorDebt, 'ending');
  const achievementIdList = toAchievementIds(achievements, gameState);
  const achievementSet = new Set(achievementIdList);

  const achievementBonus = achievementBonusForGoal(goal, achievementSet);
  const rawScore = (compatibilityScore * 0.65) + (basePick.domainFit * 0.35);
  const debtPenalty = resolvedDebt.total * 0.65;
  const mismatchPenalty = mismatchAnalysis.isMismatch ? 22 : 0;
  const finalScore = clamp(rawScore + achievementBonus - debtPenalty - mismatchPenalty, 0, 100);

  let tier = calculateTier(finalScore, resolvedDebt);
  if (!mismatchAnalysis.isMismatch && resolvedDebt.total < 82) {
    if (basePick.result.type === 'LEGENDARY' && resolvedDebt.total < 65) {
      tier = 'LEGENDARY';
    }
    if (basePick.result.type === 'SUCCESS' && (tier === 'NORMAL' || tier === 'FAILURE') && finalScore >= 42) {
      tier = 'SUCCESS';
    }
    if (basePick.result.type === 'NORMAL' && tier === 'FAILURE' && finalScore >= 35) {
      tier = 'NORMAL';
    }
  }
  if (basePick.result.type === 'NORMAL' && tier === 'LEGENDARY') {
    tier = 'SUCCESS';
  }

  if (mismatchAnalysis.isMismatch) {
    tier = 'FAILURE';
  }

  const mismatchNote = mismatchAnalysis.isMismatch
    ? `Uyumsuzluk: Gelisim cizgin ${inferredGoalProfile.label} ile daha yuksek uyum yakaladi.`
    : undefined;

  const baseResult = mismatchAnalysis.isMismatch
    ? buildMismatchFailureResult(goalProfile.label, inferredGoalProfile.label)
    : (tier === 'FAILURE' ? buildFailureResult() : basePick.result);
  const achievementFlavor = flavorByAchievements(baseResult, achievementSet, stats);
  const finalResult = withFlavor(
    baseResult,
    goalProfile.label,
    compatibilityScore,
    resolvedDebt,
    achievementFlavor,
    tier,
    mismatchNote
  );

  return {
    id: mismatchAnalysis.isMismatch
      ? `${goal.toLowerCase()}_mismatch_failure`
      : `${goal.toLowerCase()}_${tier.toLowerCase()}`,
    goal,
    goalLabel: goalProfile.label,
    selectedGoal: gameState.selectedGoal ?? null,
    selectedGoalLabel,
    inferredGoal: mismatchAnalysis.dominantGoal,
    inferredGoalLabel: inferredGoalProfile.label,
    mismatchFailure: mismatchAnalysis.isMismatch,
    compatibilityScore: round1(compatibilityScore),
    score: round1(finalScore),
    tier,
    errorDebt: resolvedDebt,
    achievementFlavor,
    result: finalResult,
  };
};
