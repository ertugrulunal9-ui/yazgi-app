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
import { tRuntime } from '../i18n/strings';

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
  labelKey: string;
  fallbackLabel: string;
  icon: string;
}[] = [
  {
    goal: 'ACADEMIC',
    prefix: 'academic',
    labelKey: 'endings.catalog.goals.ACADEMIC',
    fallbackLabel: 'Akademik Yol',
    icon: '\u{1F393}',
  },
  {
    goal: 'CREATIVE',
    prefix: 'creative',
    labelKey: 'endings.catalog.goals.CREATIVE',
    fallbackLabel: 'Yaratici Yol',
    icon: '\u{1F3A8}',
  },
  {
    goal: 'ATHLETIC',
    prefix: 'athletic',
    labelKey: 'endings.catalog.goals.ATHLETIC',
    fallbackLabel: 'Atletik Yol',
    icon: '\u{1F3C3}',
  },
  {
    goal: 'SOCIAL',
    prefix: 'social',
    labelKey: 'endings.catalog.goals.SOCIAL',
    fallbackLabel: 'Sosyal Yol',
    icon: '\u{1F91D}',
  },
  {
    goal: 'ENTERPRISE',
    prefix: 'enterprise',
    labelKey: 'endings.catalog.goals.ENTERPRISE',
    fallbackLabel: 'Girisim Yolu',
    icon: '\u{1F4BC}',
  },
  {
    goal: 'BALANCED',
    prefix: 'balanced',
    labelKey: 'endings.catalog.goals.BALANCED',
    fallbackLabel: 'Dengeli Yol',
    icon: '\u2696\uFE0F',
  },
];

const TIER_ENDING_CATALOG: {
  tier: CareerResult['type'];
  labelKey: string;
  fallbackLabel: string;
}[] = [
  { tier: 'FAILURE', labelKey: 'endings.catalog.tiers.FAILURE', fallbackLabel: 'Zor Son' },
  { tier: 'NORMAL', labelKey: 'endings.catalog.tiers.NORMAL', fallbackLabel: 'Dengeli Son' },
  { tier: 'SUCCESS', labelKey: 'endings.catalog.tiers.SUCCESS', fallbackLabel: 'Basari Sonu' },
  { tier: 'LEGENDARY', labelKey: 'endings.catalog.tiers.LEGENDARY', fallbackLabel: 'Efsane Son' },
];

const createLocalizedCatalogEntry = ({
  titleResolver,
  ...entry
}: Omit<EndingCatalogEntry, 'title'> & { titleResolver: () => string }): EndingCatalogEntry => ({
  ...entry,
  get title() {
    return titleResolver();
  },
});

const generatedTierEndings: EndingCatalogEntry[] = GOAL_ENDING_CATALOG.flatMap(
  ({ goal, prefix, labelKey, fallbackLabel, icon }) => (
    TIER_ENDING_CATALOG.map(({ tier, labelKey: tierLabelKey, fallbackLabel: tierFallbackLabel }) => (
      createLocalizedCatalogEntry({
        id: `${prefix}_${tier.toLowerCase()}`,
        icon,
        goal,
        tier,
        titleResolver: () => {
          const goalLabel = tRuntime(labelKey, undefined, fallbackLabel);
          const tierLabel = tRuntime(tierLabelKey, undefined, tierFallbackLabel);
          return tRuntime(
            'endings.catalog.titleTemplate',
            { goal: goalLabel, tier: tierLabel },
            `${goalLabel} - ${tierLabel}`
          );
        },
      })
    ))
  )
);

const generatedMismatchEndings: EndingCatalogEntry[] = GOAL_ENDING_CATALOG.map(
  ({ goal, prefix, labelKey, fallbackLabel, icon }) => (
    createLocalizedCatalogEntry({
      id: `${prefix}_mismatch_failure`,
      icon,
      goal,
      tier: 'MISMATCH',
      titleResolver: () => {
        const goalLabel = tRuntime(labelKey, undefined, fallbackLabel);
        return tRuntime(
          'endings.catalog.mismatchTitle',
          { goal: goalLabel },
          `${goalLabel} - Beklenmedik Yol`
        );
      },
    })
  )
);

const SECRET_ENDING_CATALOG: EndingCatalogEntry[] = [
  createLocalizedCatalogEntry({
    id: 'secret_family_legacy',
    icon: '\u{1F3DB}\uFE0F',
    goal: 'MYSTERY',
    tier: 'SECRET',
    titleResolver: () => tRuntime(
      'endings.content.careers.secretFamilyLegacy.title',
      undefined,
      'Aile Mirasini Geri Kazan'
    ),
  }),
  createLocalizedCatalogEntry({
    id: 'secret_true_balance',
    icon: '\u{1F31F}',
    goal: 'MYSTERY',
    tier: 'SECRET',
    titleResolver: () => tRuntime(
      'endings.content.careers.secretTrueBalance.title',
      undefined,
      'Gercek Denge Ustasi'
    ),
  }),
  createLocalizedCatalogEntry({
    id: 'secret_fate_breaker',
    icon: '\u2694\uFE0F',
    goal: 'MYSTERY',
    tier: 'SECRET',
    titleResolver: () => tRuntime(
      'endings.content.careers.secretFateBreaker.title',
      undefined,
      'Kader Kirici'
    ),
  }),
  createLocalizedCatalogEntry({
    id: 'secret_love_and_glory',
    icon: '\u{1F497}',
    goal: 'MYSTERY',
    tier: 'SECRET',
    titleResolver: () => tRuntime(
      'endings.content.careers.secretLoveAndGlory.title',
      undefined,
      'Ask ve Zafer'
    ),
  }),
  createLocalizedCatalogEntry({
    id: 'secret_silent_legend',
    icon: '\u{1F52E}',
    goal: 'MYSTERY',
    tier: 'SECRET',
    titleResolver: () => tRuntime(
      'endings.content.careers.secretSilentLegend.title',
      undefined,
      'Sessiz Efsane'
    ),
  }),
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
  labelKey: string;
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
    labelKey: 'endings.goals.ACADEMIC',
    statWeights: { intelligence: 0.45, discipline: 0.35, health: 0.1, familyRelation: 0.1 },
    skillKeys: ['logic', 'reading', 'writing', 'coding'],
    gradeKeys: ['math', 'science', 'language', 'history', 'geography'],
    actionPrefixes: ['study_'],
  },
  CREATIVE: {
    labelKey: 'endings.goals.CREATIVE',
    statWeights: { intelligence: 0.25, charisma: 0.35, discipline: 0.2, health: 0.1, familyRelation: 0.1 },
    skillKeys: ['music', 'art', 'design', 'writing'],
    gradeKeys: ['art', 'music', 'language'],
    actionPrefixes: ['arts_', 'study_art', 'study_music', 'computer_design'],
  },
  ATHLETIC: {
    labelKey: 'endings.goals.ATHLETIC',
    statWeights: { health: 0.45, discipline: 0.25, energy: 0.2, charisma: 0.1 },
    skillKeys: ['sports', 'athletics', 'teamwork'],
    gradeKeys: [],
    actionPrefixes: ['sports_'],
  },
  SOCIAL: {
    labelKey: 'endings.goals.SOCIAL',
    statWeights: { charisma: 0.45, familyRelation: 0.3, health: 0.1, intelligence: 0.15 },
    skillKeys: ['teamwork', 'reading', 'music'],
    gradeKeys: ['language'],
    actionPrefixes: ['social_', 'family_', 'explore_playground'],
  },
  ENTERPRISE: {
    labelKey: 'endings.goals.ENTERPRISE',
    statWeights: { money: 0.35, intelligence: 0.25, discipline: 0.2, charisma: 0.2 },
    skillKeys: ['business', 'coding', 'work_ethic', 'design'],
    gradeKeys: ['math', 'language'],
    actionPrefixes: ['work_', 'computer_code', 'work_freelance', 'work_sell', 'shopping_'],
  },
  BALANCED: {
    labelKey: 'endings.goals.BALANCED',
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

const getGoalLabel = (goal: EndingGoal): string => (
  tRuntime(GOAL_PROFILES[goal].labelKey, undefined, goal)
);

const ACTION_VERSATILITY_BUCKETS: Array<{ id: string; prefixes: string[] }> = [
  { id: 'study', prefixes: ['study_'] },
  { id: 'sports', prefixes: ['sports_'] },
  { id: 'arts', prefixes: ['arts_'] },
  { id: 'work', prefixes: ['work_'] },
  { id: 'social', prefixes: ['social_', 'family_'] },
  { id: 'computer', prefixes: ['computer_'] },
  { id: 'explore', prefixes: ['explore_'] },
];

const getActionCategory = (actionId: string): string => {
  const bucket = ACTION_VERSATILITY_BUCKETS.find(({ prefixes }) => (
    prefixes.some(prefix => actionId.startsWith(prefix))
  ));
  return bucket?.id ?? 'other';
};

const calculateActionVersatility = (gameState: GameState): ActionVersatilityAnalysis => {
  const history = gameState.actionHistory || [];
  if (history.length < 10) {
    return {
      entropy: 1,
      dominantRatio: 0,
      uniqueCategories: 0,
      penalty: 0,
    };
  }

  const categoryCounts: Record<string, number> = {};
  history.forEach(({ actionId }) => {
    const category = getActionCategory(actionId);
    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
  });

  const counts = Object.values(categoryCounts);
  const total = counts.reduce((sum, value) => sum + value, 0);
  if (counts.length === 0 || total <= 0) {
    return {
      entropy: 1,
      dominantRatio: 0,
      uniqueCategories: 0,
      penalty: 0,
    };
  }

  let entropyRaw = 0;
  let dominantRatio = 0;
  counts.forEach((count) => {
    const p = count / total;
    if (p <= 0) return;
    entropyRaw += -(p * Math.log2(p));
    dominantRatio = Math.max(dominantRatio, p);
  });

  const maxEntropy = counts.length > 1 ? Math.log2(counts.length) : 0;
  const normalizedEntropy = maxEntropy > 0 ? clamp(entropyRaw / maxEntropy, 0, 1) : 0;
  const concentrationPenalty = clamp((dominantRatio - 0.56) * 30, 0, 13);
  const entropyPenalty = clamp((0.58 - normalizedEntropy) * 20, 0, 8);
  const penalty = clamp(round1(concentrationPenalty + entropyPenalty), 0, 18);

  return {
    entropy: round1(normalizedEntropy),
    dominantRatio: round1(dominantRatio),
    uniqueCategories: counts.length,
    penalty,
  };
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

interface ActionVersatilityAnalysis {
  entropy: number;
  dominantRatio: number;
  uniqueCategories: number;
  penalty: number;
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
      label: getGoalLabel(goal),
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
  if (healthDebt > 0) reasons.push(tRuntime('endings.errorReasons.healthWeak', undefined, 'Saglik dengesi zayif'));

  const disciplineDebt = Math.max(0, 45 - stats.discipline);
  if (disciplineDebt > 0) reasons.push(tRuntime('endings.errorReasons.disciplineGap', undefined, 'Disiplin acigi var'));

  const socialDebt = Math.max(0, 40 - stats.familyRelation);
  if (socialDebt > 0) reasons.push(tRuntime('endings.errorReasons.socialLow', undefined, 'Sosyal destek dusuk'));

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
  if (academicDebt > 0) reasons.push(tRuntime('endings.errorReasons.academicWeak', undefined, 'Akademik temel zayif'));

  const moneyDebt = Math.max(0, 25 - normalizeMoney(stats.money)) * 0.4;
  if (moneyDebt > 6) reasons.push(tRuntime('endings.errorReasons.financialBuffer', undefined, 'Finansal tampon kucuk'));

  const stress = gameState.stress || DEFAULT_STRESS;
  const stressRatio = stress.threshold > 0
    ? stress.current / stress.threshold
    : 0;
  const stressDebtBase = Math.max(0, (stressRatio - 0.85) * 40);
  const actionDebt = runtimeMode
    ? calculateActionDerivedDebt(gameState, BURDEN_CONSTANTS.ACTION_DEBT_MULTIPLIER)
    : 0;
  const stressDebt = stressDebtBase + actionDebt;
  if (stressDebtBase > 0) reasons.push(tRuntime('endings.errorReasons.stressHigh', undefined, 'Stres seviyesi yuksek'));
  if (actionDebt > 4) reasons.push(tRuntime('endings.errorReasons.overextensionDebt', undefined, 'Asiri tempo hata borcunu buyuttu'));

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

const calculateDifficultyModifier = (
  gameState: GameState,
  stats: Stats,
  errorDebt: EndingErrorDebt
): number => {
  const stress = gameState.stress || DEFAULT_STRESS;
  const stressPressure = stress.threshold > 0
    ? clamp((stress.current / stress.threshold) * 100, 0, 140)
    : 0;
  const healthPressure = clamp((55 - stats.health) * 1.4, 0, 100);
  const socialPressure = clamp((55 - stats.familyRelation) * 1.2, 0, 100);
  const moneyPressure = clamp((45 - normalizeMoney(stats.money)) * 1.6, 0, 100);
  const debtPressure = clamp(errorDebt.total * 1.1, 0, 100);
  const pressureScore = average([
    stressPressure,
    healthPressure,
    socialPressure,
    moneyPressure,
    debtPressure,
  ]);

  return round1(clamp((pressureScore - 42) * 0.12, -4.5, 5.5));
};

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

type TranslationParams = Record<string, string | number | boolean>;

interface CareerContentFallback {
  title: string;
  description: string;
  familyReaction: string;
  influences?: string[];
}

const localizeCareerResult = (
  key: string,
  fallback: CareerContentFallback,
  options: {
    emoji: string;
    type: CareerResult['type'];
    params?: TranslationParams;
  }
): CareerResult => ({
  title: tRuntime(`endings.content.careers.${key}.title`, options.params, fallback.title),
  description: tRuntime(`endings.content.careers.${key}.description`, options.params, fallback.description),
  emoji: options.emoji,
  type: options.type,
  familyReaction: tRuntime(
    `endings.content.careers.${key}.familyReaction`,
    options.params,
    fallback.familyReaction
  ),
  ...(fallback.influences && fallback.influences.length > 0
    ? {
      influences: fallback.influences.map((line, index) => (
        tRuntime(`endings.content.careers.${key}.influences.${index}`, options.params, line)
      )),
    }
    : {}),
});

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
    lines.push(tRuntime(
      'endings.content.flavor.richSaverDistant',
      undefined,
      'Paran var ama paylasim yerine biriktirmeyi seciyorsun; cevren seni mesafeli buluyor.'
    ));
  } else if (hasRichAchievement && !hasSocialAnchor && stats.familyRelation < 50) {
    lines.push(tRuntime(
      'endings.content.flavor.richLonely',
      undefined,
      'Paran var ama etrafinda gercekten guvendigin insanlar cok az.'
    ));
  }

  if (hasAchievement(achievementIds, 'heartbreaker')) {
    lines.push(tRuntime(
      'endings.content.flavor.heartbreaker',
      undefined,
      'Iliskilerde biraktigin kirik izler bugune kadar tasindi.'
    ));
  }

  if (hasAchievement(achievementIds, 'rebel')) {
    lines.push(tRuntime(
      'endings.content.flavor.rebel',
      undefined,
      'Kurallara direnen tavrin hayatina hem hiz hem bedel getirdi.'
    ));
  }

  if (baseResult.type === 'FAILURE' && (hasAchievement(achievementIds, 'studious') || hasAchievement(achievementIds, 'scholar'))) {
    lines.push(tRuntime(
      'endings.content.flavor.failureResilience',
      undefined,
      'Disiplinli gecmisin, bir sonraki denemede oyunu cevirmen icin guclu bir temel sunuyor.'
    ));
  }

  if ((baseResult.type === 'SUCCESS' || baseResult.type === 'LEGENDARY') && hasAchievement(achievementIds, 'perfectionist')) {
    lines.push(tRuntime(
      'endings.content.flavor.perfectionist',
      undefined,
      'Mukemmeliyetci rutinin bu sonucu bir tesaduf olmaktan cikardi.'
    ));
  }

  return lines;
};

const calculateTier = (score: number, errorDebt: EndingErrorDebt): CareerResult['type'] => {
  if (errorDebt.total >= 70) return 'FAILURE';
  if (score >= 82) return 'LEGENDARY';
  if (score >= 58) return 'SUCCESS';
  if (score >= 40) return 'NORMAL';
  return 'FAILURE';
};

const buildFailureResult = (): CareerResult => (
  localizeCareerResult(
    'failureUnemployed',
    {
      title: 'Mezuna Kaldin / Issiz',
      description: 'Sinav sonucun bekledigin gibi gelmedi.',
      familyReaction: 'Evde derin bir sessizlik var.',
    },
    {
      emoji: '\u{1F480}',
      type: 'FAILURE',
    }
  )
);

const buildMismatchFailureResult = (
  selectedGoalLabel: string,
  inferredGoalLabel: string,
  surpriseCareer: CareerResult
): CareerResult => ({
  title: tRuntime(
    'endings.content.mismatch.title',
    undefined,
    'Surpriz Kariyer'
  ),
  description: tRuntime(
    'endings.content.mismatch.description',
    {
      selectedGoal: selectedGoalLabel,
      inferredGoal: inferredGoalLabel,
      career: surpriseCareer.title,
    },
    `${selectedGoalLabel} hedefini secmistin; hayat cizgin ${inferredGoalLabel} yonune acildi. Yeni rotanda ${surpriseCareer.title} yolunu yakaladin.`
  ),
  emoji: '\u{1F9ED}',
  type: surpriseCareer.type,
  familyReaction: tRuntime(
    'endings.content.mismatch.familyReaction',
    undefined,
    'Ailen, rota degisse de dogru ritmi yakaladigini dusunuyor.'
  ),
  influences: [tRuntime(
    'endings.content.mismatch.newRoute',
    { career: surpriseCareer.title },
    `Yeni rota: ${surpriseCareer.title}`
  )],
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
      result: localizeCareerResult(
        'nationalAthlete',
        {
          title: 'Milli Sporcu',
          description: 'Yillar suren antrenmanlarinin karsiligini aldin. Olimpiyatlara hazirlaniyorsun!',
          familyReaction: 'Ailen kupalarini gururla sergiliyor.',
        },
        {
          emoji: '\u{1F947}',
          type: 'LEGENDARY',
        }
      ),
    };
  }

  if (skills.music > 85 && musicGrade >= 70) {
    return {
      domainFit: average([skills.music, musicGrade, stats.charisma]),
      result: localizeCareerResult(
        'rockstarVirtuoso',
        {
          title: 'Rockstar / Virtuoz',
          description: 'Konservatuari dereceyle bitirdin. Albumlerin yok satiyor.',
          familyReaction: 'Ailen her konserinde en onde.',
          influences: ['Muzik notun ({grade}) konservatuar yolunu guclendirdi.'],
        },
        {
          emoji: '\u{1F3B8}',
          type: 'LEGENDARY',
          params: { grade: musicGrade },
        }
      ),
    };
  }

  if (grades.math > 80 && grades.science > 80 && stats.discipline > 60 && personality.patience >= 40) {
    return {
      domainFit: average([grades.math, grades.science, stats.discipline, stats.intelligence]),
      result: localizeCareerResult(
        'medSchool',
        {
          title: 'Tip Fakultesi',
          description: 'Ulkenin prestijli tip fakultelerinden birini kazandin.',
          familyReaction: 'Ailen herkese doktor olacagini anlatiyor.',
        },
        {
          emoji: '\u{1FA7A}',
          type: 'SUCCESS',
        }
      ),
    };
  }

  if (grades.math > 70 && skills.coding > 70) {
    return {
      domainFit: average([grades.math, skills.coding, stats.intelligence]),
      result: localizeCareerResult(
        'softwareEngineering',
        {
          title: 'Yazilim Muhendisligi',
          description: 'Kodlama yetenegin seni teknoloji dunyasina tasidi.',
          familyReaction: 'Ailen bilgisayar basindaki emeginin karsiligini aldigini soyluyor.',
        },
        {
          emoji: '\u{1F4BB}',
          type: 'SUCCESS',
        }
      ),
    };
  }

  if (grades.language > 80 && stats.intelligence > 70) {
    return {
      domainFit: average([grades.language, stats.intelligence, stats.discipline]),
      result: localizeCareerResult(
        'lawSchool',
        {
          title: 'Hukuk Fakultesi',
          description: 'Keskin zekan ve hitabetinle hukuk yoluna girdin.',
          familyReaction: 'Ailen hukuktaki gelecegine guveniyor.',
        },
        {
          emoji: '\u{2696}\u{FE0F}',
          type: 'SUCCESS',
        }
      ),
    };
  }

  if (stats.money > 2000) {
    return {
      domainFit: average([normalizeMoney(stats.money), stats.intelligence, stats.discipline]),
      result: localizeCareerResult(
        'privateUniversityBusiness',
        {
          title: 'Ozel Uni - Isletme',
          description: 'Notlarin parlak olmasa da finansal gucunle iyi bir baslangic yaptin.',
          familyReaction: 'Ailen: Diploma diplomadir diyor.',
        },
        {
          emoji: '\u{1F393}',
          type: 'NORMAL',
        }
      ),
    };
  }

  if (goal === 'ATHLETIC') {
    if (skills.sports > 90) {
      return {
        domainFit: average([skills.sports, stats.health, stats.discipline]),
        result: localizeCareerResult(
          'nationalAthlete',
          {
            title: 'Milli Sporcu',
            description: 'Yillar suren antrenmanlarinin karsiligini aldin. Olimpiyatlara hazirlaniyorsun!',
            familyReaction: 'Ailen kupalarini gururla sergiliyor.',
          },
          {
            emoji: '\u{1F947}',
            type: 'LEGENDARY',
          }
        ),
      };
    }
    if (personality.courage >= 75 && traits.includes('BRAVE') && skills.sports > 60) {
      return {
        domainFit: average([skills.sports, stats.health, personality.courage]),
        result: localizeCareerResult(
          'rescuePilot',
          {
            title: 'Kurtarma Pilotu',
            description: 'Cesaretin ve fiziksel gucun seni havacilik yoluna tasidi.',
            familyReaction: 'Ailen cesaretinle hep ovundu.',
          },
          {
            emoji: '\u{2708}\u{FE0F}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (skills.teamwork > 70 && personality.patience >= 55 && skills.sports > 60) {
      return {
        domainFit: average([skills.teamwork, personality.patience, skills.sports]),
        result: localizeCareerResult(
          'sportsCoach',
          {
            title: 'Spor Egitmeni',
            description: 'Sabrin ve takim ruhu anlayisin seni genc sporculara yol gosteren bir egitmene donusturdu.',
            familyReaction: 'Ailen ogrencilerinin basarisini seninle birlikte kutluyor.',
          },
          {
            emoji: '\u{1F3C5}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (skills.coding > 60 && skills.sports > 50 && stats.discipline > 70) {
      return {
        domainFit: average([skills.coding, skills.sports, stats.discipline]),
        result: localizeCareerResult(
          'esportsPlayer',
          {
            title: 'E-Spor Oyuncusu',
            description: 'Dijital reflekslerin ve disiplinli antrenman rutinin seni profesyonel e-spor sahnesine tasidi.',
            familyReaction: 'Ailen bilgisayar basinda gecirdigin saatlerin sonucunu gormeye basliyor.',
          },
          {
            emoji: '\u{1F3AE}',
            type: 'SUCCESS',
          }
        ),
      };
    }
  }

  if (goal === 'CREATIVE') {
    if (skills.music > 85 && musicGrade >= 70) {
      return {
        domainFit: average([skills.music, musicGrade, stats.charisma]),
        result: localizeCareerResult(
          'rockstarVirtuoso',
          {
            title: 'Rockstar / Virtuoz',
            description: 'Konservatuari dereceyle bitirdin. Albumlerin yok satiyor.',
            familyReaction: 'Ailen her konserinde en onde.',
            influences: ['Muzik notun ({grade}) konservatuar yolunu guclendirdi.'],
          },
          {
            emoji: '\u{1F3B8}',
            type: 'LEGENDARY',
            params: { grade: musicGrade },
          }
        ),
      };
    }
    if (skills.music > 85) {
      return {
        domainFit: average([skills.music, stats.charisma, stats.discipline]),
        result: localizeCareerResult(
          'stageMusician',
          {
            title: 'Sahne Muzisyeni',
            description: 'Sahnede parladin; akademik muzik notlarin konservatuar seviyesine cikamadi.',
            familyReaction: 'Ailen sahnede kendini bulmana seviniyor.',
            influences: ['Muzik notun ({grade}) akademik yolu sinirladi.'],
          },
          {
            emoji: '\u{1F3A4}',
            type: 'SUCCESS',
            params: { grade: musicGrade },
          }
        ),
      };
    }
    if (skills.art > 85 && artGrade >= 70) {
      return {
        domainFit: average([skills.art, artGrade, stats.charisma]),
        result: localizeCareerResult(
          'artist',
          {
            title: 'Sanatci',
            description: 'Sergilerin kapali gise. Eserlerin koleksiyonerler tarafindan kapisiliyor.',
            familyReaction: 'Ailen eserlerini duvarlarina asiyor.',
            influences: ['Gorsel sanatlar notun ({grade}) sergi kapilarini acti.'],
          },
          {
            emoji: '\u{1F3A8}',
            type: 'LEGENDARY',
            params: { grade: artGrade },
          }
        ),
      };
    }
    if (skills.art > 85) {
      return {
        domainFit: average([skills.art, stats.intelligence, stats.charisma]),
        result: localizeCareerResult(
          'atelierArtist',
          {
            title: 'Atolye Sanatcisi',
            description: 'Uretim disiplininle kendi stilini kurdun; bagimsiz atolyelerde adin duyuluyor.',
            familyReaction: 'Ailen atolyene destek oluyor.',
            influences: ['Gorsel sanatlar notun ({grade}) akademik destegi zayiflatti.'],
          },
          {
            emoji: '\u{1F3AD}',
            type: 'SUCCESS',
            params: { grade: artGrade },
          }
        ),
      };
    }
    if (skills.writing > 85) {
      return {
        domainFit: average([skills.writing, stats.intelligence, stats.discipline]),
        result: localizeCareerResult(
          'famousWriter',
          {
            title: 'Unlu Yazar',
            description: 'Kitaplarin cok satanlar listesinde. Imza gunlerinde uzun kuyruklar var.',
            familyReaction: 'Ailen raflarda adini gormekten gururlu.',
          },
          {
            emoji: '\u{270D}\u{FE0F}',
            type: 'LEGENDARY',
          }
        ),
      };
    }
    if (personality.openness >= 60 && traits.includes('CREATIVE') && skills.art > 60) {
      return {
        domainFit: average([personality.openness, skills.art, stats.charisma]),
        result: localizeCareerResult(
          'digitalArtist',
          {
            title: 'Dijital Sanatci',
            description: 'Yaraticiligin dijital dunyada karsilik buldu; projelerinle fark yaratiyorsun.',
            familyReaction: 'Ailen eserlerini sosyal medyada paylasiyor.',
          },
          {
            emoji: '\u{1F3A8}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (stats.charisma > 70 && skills.coding > 50 && personality.openness >= 60) {
      return {
        domainFit: average([stats.charisma, skills.coding, personality.openness]),
        result: localizeCareerResult(
          'contentCreator',
          {
            title: 'Icerik Uretici',
            description: 'Kameranin onunde dogal bir yetenegin var. Dijital platformlarda kendi kitlesini olusturuyorsun.',
            familyReaction: 'Ailen videolarini izleyip gururlaniyor.',
          },
          {
            emoji: '\u{1F4F1}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (skills.art > 70 && skills.design > 70 && stats.charisma > 55) {
      return {
        domainFit: average([skills.art, skills.design, stats.charisma]),
        result: localizeCareerResult(
          'fashionDesigner',
          {
            title: 'Moda Tasarimcisi',
            description: 'Estetik gorusun ve tasarim yetenegin seni moda dunyasina tasidi.',
            familyReaction: 'Ailen koleksiyonlarini merakla takip ediyor.',
          },
          {
            emoji: '\u{1F457}',
            type: 'SUCCESS',
          }
        ),
      };
    }
  }

  if (goal === 'SOCIAL') {
    if (stats.charisma >= 80 || traits.includes('SOCIAL_BUTTERFLY')) {
      return {
        domainFit: average([stats.charisma, stats.familyRelation, gameState.socialReputation ?? 50]),
        result: localizeCareerResult(
          'mediaIcon',
          {
            title: 'Medya Ikonu',
            description: 'Insanlarla kurdugun baglar seni gorunur bir figure donusturdu.',
            familyReaction: 'Ailen herkesin seni tanimasindan gurur duyuyor.',
          },
          {
            emoji: '\u{1F31F}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (personality.empathy >= 70 && personality.patience >= 60 && stats.intelligence > 60) {
      return {
        domainFit: average([personality.empathy, personality.patience, stats.intelligence]),
        result: localizeCareerResult(
          'psychologist',
          {
            title: 'Psikolog',
            description: 'Insanlari anlama yetenegin seni psikoloji yoluna tasidi.',
            familyReaction: 'Ailen: Her zaman insanlari anlardi diyor.',
          },
          {
            emoji: '\u{1F9E0}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (personality.empathy >= 70 && skills.business > 50 && stats.charisma > 60) {
      return {
        domainFit: average([personality.empathy, skills.business, stats.charisma]),
        result: localizeCareerResult(
          'socialEntrepreneur',
          {
            title: 'Sosyal Girisimci',
            description: 'Toplumsal sorunlara cozum uretme tutkunla kendi sosyal girisimini kurdun.',
            familyReaction: 'Ailen hem isine hem ideallerine hayran.',
          },
          {
            emoji: '\u{1F91D}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (personality.patience >= 70 && personality.conformity >= 60 && grades.language > 70) {
      return {
        domainFit: average([personality.patience, personality.conformity, grades.language]),
        result: localizeCareerResult(
          'diplomat',
          {
            title: 'Diplomat',
            description: 'Sabrin, uzlasma yetenegin ve dil becerilerin seni diplomasi yoluna yoneltti.',
            familyReaction: 'Ailen diplomatik yeteneklerinle gurur duyuyor.',
          },
          {
            emoji: '\u{1F3DB}\uFE0F',
            type: 'SUCCESS',
          }
        ),
      };
    }
  }

  if (goal === 'ENTERPRISE') {
    if (skills.business > 75 && stats.money > 1500) {
      return {
        domainFit: average([skills.business, normalizeMoney(stats.money), stats.charisma]),
        result: localizeCareerResult(
          'entrepreneur',
          {
            title: 'Girisimci',
            description: 'Ticari zekanla kendi isini kurdun. Fikirlerin para ediyor.',
            familyReaction: 'Ailen isini merakla takip ediyor.',
          },
          {
            emoji: '\u{1F4C8}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (grades.math > 70 && stats.discipline > 65 && personality.courage >= 55) {
      return {
        domainFit: average([grades.math, stats.discipline, personality.courage]),
        result: localizeCareerResult(
          'financeSpecialist',
          {
            title: 'Finans Uzmani',
            description: 'Sayilarla aran ve sogukkanliligin seni finans sektorune yonlendirdi.',
            familyReaction: 'Ailen piyasa haberlerini seninle konusmayi seviyor.',
          },
          {
            emoji: '\u{1F4B9}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (skills.coding > 70 && skills.business > 60 && personality.courage >= 65) {
      return {
        domainFit: average([skills.coding, skills.business, personality.courage]),
        result: localizeCareerResult(
          'startupFounder',
          {
            title: 'Startup Kurucusu',
            description: 'Teknik bilgin ve girisimci ruhun seni kendi teknoloji sirketini kurmaya yoneltti.',
            familyReaction: 'Ailen sirketini heyecanla takip ediyor.',
          },
          {
            emoji: '\u{1F680}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (stats.money > 2000) {
      return {
        domainFit: average([normalizeMoney(stats.money), stats.intelligence, stats.discipline]),
        result: localizeCareerResult(
          'privateUniversityBusiness',
          {
            title: 'Ozel Uni - Isletme',
            description: 'Notlarin parlak olmasa da finansal gucunle iyi bir baslangic yaptin.',
            familyReaction: 'Ailen: Diploma diplomadir diyor.',
          },
          {
            emoji: '\u{1F393}',
            type: 'NORMAL',
          }
        ),
      };
    }
  }

  if (goal === 'ACADEMIC') {
    if (grades.math > 80 && grades.science > 80 && stats.discipline > 60 && personality.patience >= 40) {
      return {
        domainFit: average([grades.math, grades.science, stats.discipline, stats.intelligence]),
        result: localizeCareerResult(
          'medSchool',
          {
            title: 'Tip Fakultesi',
            description: 'Ulkenin prestijli tip fakultelerinden birini kazandin.',
            familyReaction: 'Ailen herkese doktor olacagini anlatiyor.',
          },
          {
            emoji: '\u{1FA7A}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (grades.language > 80 && stats.intelligence > 70) {
      return {
        domainFit: average([grades.language, stats.intelligence, stats.discipline]),
        result: localizeCareerResult(
          'lawSchool',
          {
            title: 'Hukuk Fakultesi',
            description: 'Keskin zekan ve hitabetinle hukuk yoluna girdin.',
            familyReaction: 'Ailen hukuktaki gelecegine guveniyor.',
          },
          {
            emoji: '\u{2696}\u{FE0F}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (grades.math > 70 && skills.coding > 70) {
      return {
        domainFit: average([grades.math, skills.coding, stats.intelligence]),
        result: localizeCareerResult(
          'softwareEngineering',
          {
            title: 'Yazilim Muhendisligi',
            description: 'Kodlama yetenegin seni teknoloji dunyasina tasidi.',
            familyReaction: 'Ailen bilgisayar basindaki emeginin karsiligini aldigini soyluyor.',
          },
          {
            emoji: '\u{1F4BB}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (skills.logic > 75 && grades.math > 75) {
      return {
        domainFit: average([skills.logic, grades.math, stats.intelligence]),
        result: localizeCareerResult(
          'engineering',
          {
            title: 'Muhendislik',
            description: 'Analitik dusuncen seni muhendislik yoluna tasidi.',
            familyReaction: 'Ailen sayilarla olan bagini hep konusuyordu.',
          },
          {
            emoji: '\u{1F9E0}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (skills.logic > 80 && skills.reading > 75 && stats.discipline > 65) {
      return {
        domainFit: average([skills.logic, skills.reading, stats.discipline]),
        result: localizeCareerResult(
          'researcher',
          {
            title: 'Arastirmaci',
            description: 'Merakli zihnin ve disiplinli calisma aliskanliklarin seni akademik arastirma yoluna tasidi.',
            familyReaction: 'Ailen laboratuvardaki saatlerini saygiyla karsiluyor.',
          },
          {
            emoji: '\u{1F52C}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (personality.empathy >= 60 && personality.patience >= 60 && stats.intelligence > 60) {
      return {
        domainFit: average([personality.empathy, personality.patience, stats.intelligence]),
        result: localizeCareerResult(
          'teacher',
          {
            title: 'Ogretmen',
            description: 'Sabrin ve empatin seni genc nesillere bilgi aktaran bir ogretmene donusturdu.',
            familyReaction: 'Ailen ogrencilerinin sevgisini gormeye bayiliyor.',
          },
          {
            emoji: '\u{1F4D6}',
            type: 'SUCCESS',
          }
        ),
      };
    }
  }

  if (goal === 'BALANCED') {
    const skillsAbove60 = [
      skills.coding, skills.music, skills.sports, skills.design,
      skills.art, skills.writing, skills.reading, skills.teamwork,
      skills.business, skills.logic,
    ].filter(s => s > 60).length;
    if (skillsAbove60 >= 4) {
      return {
        domainFit: average([stats.intelligence, stats.charisma, stats.discipline, stats.health]),
        result: localizeCareerResult(
          'versatileProfessional',
          {
            title: 'Cok Yonlu Profesyonel',
            description: 'Tek bir alana kapanmak yerine bircok beceriyi harmanladin. Farkli sektorlerden teklifler aliyorsun.',
            familyReaction: 'Ailen: Her konuda bi bilgisi var diyor gururla.',
          },
          {
            emoji: '\u{1F3AF}',
            type: 'SUCCESS',
          }
        ),
      };
    }
    if (personality.empathy >= 65 && skills.teamwork > 60 && stats.charisma > 55) {
      return {
        domainFit: average([personality.empathy, skills.teamwork, stats.charisma]),
        result: localizeCareerResult(
          'civicLeader',
          {
            title: 'Sivil Toplum Lideri',
            description: 'Insanlari bir araya getirme yeteneginle toplumsal degisime oncuulk ediyorsun.',
            familyReaction: 'Ailen topluma katkin icin gururlu.',
          },
          {
            emoji: '\u{1F30D}',
            type: 'SUCCESS',
          }
        ),
      };
    }
  }

  if (personality.conformity >= 70 && traits.includes('DISCIPLINED') && stats.discipline > 70) {
    return {
      domainFit: average([personality.conformity, stats.discipline, stats.health]),
      result: localizeCareerResult(
        'officer',
        {
          title: 'Subay',
          description: 'Disiplinin ve duzene saygin seni askerlik yoluna yoneltti.',
          familyReaction: 'Ailen: Kurallara hep saygiliydi diyor.',
        },
        {
          emoji: '\u{1F396}\u{FE0F}',
          type: 'SUCCESS',
        }
      ),
    };
  }

  if (stats.intelligence > 50 && stats.discipline > 50) {
    return {
      domainFit: average([stats.intelligence, stats.discipline, stats.charisma]),
      result: localizeCareerResult(
        'economicsPublicAdmin',
        {
          title: 'Iktisat / Kamu Yonetimi',
          description: 'Dengeli bir profil ile universite yolunu acik tuttun.',
          familyReaction: 'Ailen en azindan iyi bir temel kurdugunu dusunuyor.',
        },
        {
          emoji: '\u{1F4DA}',
          type: 'NORMAL',
        }
      ),
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
  mismatchNote?: string,
  scoreNotes: string[] = []
): CareerResult => {
  const descriptionParts = [base.description, ...achievementFlavor].filter(Boolean);
  const mergedInfluences = [
    ...(base.influences || []),
    tRuntime('endings.influenceGoal', { goal: goalLabel }, `Hedef: ${goalLabel}`),
    tRuntime(
      'endings.influenceCompatibility',
      { score: Math.round(compatibilityScore) },
      `Hedef uyumu: %${Math.round(compatibilityScore)}`
    ),
    tRuntime(
      'endings.influenceErrorDebt',
      { debt: Math.round(errorDebt.total) },
      `Hata borcu: ${Math.round(errorDebt.total)}`
    ),
    ...scoreNotes,
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

interface SecretEndingResult {
  id: string;
  result: CareerResult;
}

const checkSecretEndings = (
  gameState: GameState,
  stats: Stats,
): SecretEndingResult | null => {
  const personality = { ...DEFAULT_PERSONALITY, ...(gameState.personality || {}) };
  const skills = { ...DEFAULT_SKILLS, ...(gameState.skills || {}) };
  const npcs = gameState.npcs || [];
  const fateTokens = gameState.fate?.tokens ?? 0;
  const hasPartner = npcs.some(n => n.role === 'PARTNER');
  const npcCount = npcs.length;

  // secret_true_balance: Tüm temel statlar 70+
  if (
    stats.health >= 70 && stats.intelligence >= 70 &&
    stats.charisma >= 70 && stats.discipline >= 70 &&
    stats.familyRelation >= 70
  ) {
    return {
      id: 'secret_true_balance',
      result: localizeCareerResult(
        'secretTrueBalance',
        {
          title: 'Gercek Denge Ustasi',
          description: 'Hayatin her alaninda denge buldun. Bu basari cok az kisiye nasip olur.',
          familyReaction: 'Ailen her alanda dengeli gelisiminden muhtesem gurur duyuyor.',
        },
        {
          emoji: '\u{1F31F}',
          type: 'LEGENDARY',
        }
      ),
    };
  }

  // secret_family_legacy: Aile ilişkisi çok yüksek
  if (stats.familyRelation >= 90 && personality.empathy >= 70) {
    return {
      id: 'secret_family_legacy',
      result: localizeCareerResult(
        'secretFamilyLegacy',
        {
          title: 'Aile Mirasini Geri Kazan',
          description: 'Ailenle kurdugun derin bag hayatinin en degerli mirasi oldu.',
          familyReaction: 'Ailen: Sen bizim en buyuk gururumuzsun.',
        },
        {
          emoji: '\u{1F3DB}\uFE0F',
          type: 'LEGENDARY',
        }
      ),
    };
  }

  // secret_fate_breaker: 10+ fate token biriktirme
  if (fateTokens >= 10) {
    return {
      id: 'secret_fate_breaker',
      result: localizeCareerResult(
        'secretFateBreaker',
        {
          title: 'Kader Kirici',
          description: 'Kaderin sana bictigini kabul etmedin. Kendi yolunu kendin cizdin.',
          familyReaction: 'Ailen: O hep kendi yolunu buldu diyor.',
        },
        {
          emoji: '\u2694\uFE0F',
          type: 'LEGENDARY',
        }
      ),
    };
  }

  // secret_love_and_glory: Partner + yüksek başarı
  if (hasPartner && stats.charisma >= 75 && stats.intelligence >= 70) {
    return {
      id: 'secret_love_and_glory',
      result: localizeCareerResult(
        'secretLoveAndGlory',
        {
          title: 'Ask ve Zafer',
          description: 'Hem kalbin hem aklin dolu. Ask ve basariyi ayni anda yakaladin.',
          familyReaction: 'Ailen hem iliskinden hem basarindan mutlu.',
        },
        {
          emoji: '\u{1F497}',
          type: 'LEGENDARY',
        }
      ),
    };
  }

  // secret_silent_legend: Az NPC etkileşimi ama yüksek beceri
  if (
    npcCount === 0 &&
    stats.intelligence >= 85 &&
    stats.discipline >= 80 &&
    stats.health >= 60 &&
    (skills.coding > 85 || skills.logic > 85 || skills.writing > 85)
  ) {
    return {
      id: 'secret_silent_legend',
      result: localizeCareerResult(
        'secretSilentLegend',
        {
          title: 'Sessiz Efsane',
          description: 'Kimseye ihtiyac duymadan kendi yolunda sessizce efsanelesen biri oldun.',
          familyReaction: 'Ailen: O hep kendi halinde ama cok yetenekli diyor.',
        },
        {
          emoji: '\u{1F52E}',
          type: 'LEGENDARY',
        }
      ),
    };
  }

  return null;
};

export const resolveEnding = ({
  gameState,
  stats,
  achievements,
  errorDebt,
}: ResolveEndingParams): EndingResolution => {
  // Secret ending kontrolü — normal ending'den önce
  const secretEnding = checkSecretEndings(gameState, stats);
  if (secretEnding) {
    const resolvedDebt = calculateEndingErrorDebt(gameState, stats, errorDebt, 'ending');
    const dominant = detectDominantGoal(gameState, stats);
    return {
      id: secretEnding.id,
      goal: dominant.goal,
      goalLabel: getGoalLabel(dominant.goal),
      selectedGoal: gameState.selectedGoal ?? null,
      selectedGoalLabel: gameState.selectedGoal
        ? getGoalLabel(LIFE_GOAL_TO_ENDING_GOAL[gameState.selectedGoal])
        : tRuntime('endings.noGoalSelected', undefined, 'Hedef Secilmedi (Otomatik Rota)'),
      inferredGoal: dominant.goal,
      inferredGoalLabel: getGoalLabel(dominant.goal),
      mismatchFailure: false,
      compatibilityScore: round1(dominant.score),
      score: 95,
      tier: 'LEGENDARY',
      errorDebt: resolvedDebt,
      achievementFlavor: [tRuntime('endings.secretDiscovered', undefined, 'Gizli bir sonla tanistin!')],
      result: secretEnding.result,
    };
  }

  const mismatchAnalysis = analyzeGoalMismatch(gameState, stats);
  const selectedOrFallbackGoal = mismatchAnalysis.selectedGoal ?? mismatchAnalysis.dominantGoal;
  const goal = mismatchAnalysis.isMismatch ? mismatchAnalysis.dominantGoal : selectedOrFallbackGoal;
  const selectedGoalLabel = mismatchAnalysis.selectedGoal
    ? getGoalLabel(mismatchAnalysis.selectedGoal)
    : tRuntime('endings.noGoalSelected', undefined, 'Hedef Secilmedi (Otomatik Rota)');
  const selectedGoalScore = mismatchAnalysis.selectedGoal
    ? calculateGoalFitBreakdown(gameState, stats, mismatchAnalysis.selectedGoal).score
    : mismatchAnalysis.dominantScore;
  const compatibilityScore = calculateGoalFitBreakdown(gameState, stats, goal).score;
  const basePick = buildCareerByGoal(goal, gameState, stats);
  const resolvedDebt = calculateEndingErrorDebt(gameState, stats, errorDebt, 'ending');
  const achievementIdList = toAchievementIds(achievements, gameState);
  const achievementSet = new Set(achievementIdList);
  const actionVersatility = calculateActionVersatility(gameState);
  const difficultyModifier = calculateDifficultyModifier(gameState, stats, resolvedDebt);

  const achievementBonus = achievementBonusForGoal(goal, achievementSet);
  const rawScore = (compatibilityScore * 0.65) + (basePick.domainFit * 0.35);
  const debtPenalty = resolvedDebt.total * 0.65;
  const mismatchPenalty = mismatchAnalysis.isMismatch ? 8 : 0;
  const finalScore = clamp(
    rawScore
    + achievementBonus
    + difficultyModifier
    - debtPenalty
    - mismatchPenalty
    - actionVersatility.penalty,
    0,
    100
  );

  let tier = calculateTier(finalScore, resolvedDebt);
  if (resolvedDebt.total < 70) { // FAILURE threshold ile senkronize
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

  const mismatchNote = mismatchAnalysis.isMismatch
    ? tRuntime(
      'endings.mismatchNote',
      {
        selectedScore: Math.round(selectedGoalScore),
        inferred: getGoalLabel(mismatchAnalysis.dominantGoal),
        compatibilityScore: Math.round(compatibilityScore),
      },
      `Beklenmedik yol: Secilen hedefte uyum %${Math.round(selectedGoalScore)}, gelistirdigin rota ${getGoalLabel(mismatchAnalysis.dominantGoal)} ile %${Math.round(compatibilityScore)} uyum yakaladi.`
    )
    : undefined;

  const scoreNotes = [
    tRuntime(
      'endings.difficultyAdjustment',
      { value: `${difficultyModifier >= 0 ? '+' : ''}${difficultyModifier}` },
      `Zorluk duzeltmesi: ${difficultyModifier >= 0 ? '+' : ''}${difficultyModifier}`
    ),
  ];
  if (actionVersatility.penalty > 0) {
    scoreNotes.push(
      tRuntime(
        'endings.versatilityPenalty',
        {
          penalty: actionVersatility.penalty,
          entropy: Math.round(actionVersatility.entropy * 100),
          dominant: Math.round(actionVersatility.dominantRatio * 100),
        },
        `Cesitlilik cezasi: -${actionVersatility.penalty} (entropi ${Math.round(actionVersatility.entropy * 100)}%, baskin kategori ${Math.round(actionVersatility.dominantRatio * 100)}%)`
      )
    );
  }
  if (mismatchPenalty > 0) {
    scoreNotes.push(
      tRuntime(
        'endings.routeDeviationPenalty',
        { penalty: mismatchPenalty },
        `Rota sapmasi cezasi: -${mismatchPenalty}`
      )
    );
  }

  const baseResult = mismatchAnalysis.isMismatch
    ? buildMismatchFailureResult(selectedGoalLabel, getGoalLabel(mismatchAnalysis.dominantGoal), basePick.result)
    : (tier === 'FAILURE' ? buildFailureResult() : basePick.result);
  const achievementFlavor = flavorByAchievements(baseResult, achievementSet, stats);
  const finalResult = withFlavor(
    baseResult,
    getGoalLabel(goal),
    compatibilityScore,
    resolvedDebt,
    achievementFlavor,
    tier,
    mismatchNote,
    scoreNotes
  );

  return {
    id: mismatchAnalysis.isMismatch
      ? `${selectedOrFallbackGoal.toLowerCase()}_mismatch_failure`
      : `${goal.toLowerCase()}_${tier.toLowerCase()}`,
    goal,
    goalLabel: getGoalLabel(goal),
    selectedGoal: gameState.selectedGoal ?? null,
    selectedGoalLabel,
    inferredGoal: mismatchAnalysis.dominantGoal,
    inferredGoalLabel: getGoalLabel(mismatchAnalysis.dominantGoal),
    mismatchFailure: mismatchAnalysis.isMismatch,
    compatibilityScore: round1(compatibilityScore),
    score: round1(finalScore),
    tier,
    errorDebt: resolvedDebt,
    achievementFlavor,
    result: finalResult,
  };
};

type FutureVisionMood = 'optimistic' | 'neutral' | 'somber';

interface FutureVisionTemplate {
  at30: [string, string];
  at50: [string, string];
}

const FUTURE_VISION_GOAL_TEMPLATES: Record<EndingGoal, FutureVisionTemplate> = {
  ACADEMIC: {
    at30: [
      '{name}, 30 yasinda arastirma masasinda gecirdigin uzun geceler meyvesini veriyor. Calismalarin seni alaninda guvenilen bir sese donusturuyor.',
      '{name}, 30 yasinda derslik ile laboratuvar arasinda kurdugun denge meyve veriyor. Urettigin fikirler genc zihinlere yeni kapilar aciyor.',
    ],
    at50: [
      '{name}, 50 yasinda yetistirdigin ogrenciler senin izini surmeye devam ediyor.',
      '{name}, 50 yasinda adin bilgiyle anilan bir okulun temel taslarindan biri oluyor.',
    ],
  },
  CREATIVE: {
    at30: [
      '{name}, 30 yasinda hayal gucun somut projelere donusuyor. Eserlerin izleyicilerde iz birakan bir imzaya sahip oluyor.',
      '{name}, 30 yasinda uretim ritmini buluyorsun. Islerin hem duyguyu hem cesareti ayni anda tasiyor.',
    ],
    at50: [
      '{name}, 50 yasinda bir kusagin ilham panosunda adini birakmis oluyorsun.',
      '{name}, 50 yasinda eserlerin yeni sanatcilara yol haritasi olarak gosteriliyor.',
    ],
  },
  ATHLETIC: {
    at30: [
      '{name}, 30 yasinda disiplinin bedenine ve zihnine ayni anda yansiyor. Rekabetin icinde kalirken etrafina da tempo veriyorsun.',
      '{name}, 30 yasinda antrenman rutinin hayatinin iskeleti oluyor. Zirve yarislari kadar toparlanma gunlerine de deger veriyorsun.',
    ],
    at50: [
      '{name}, 50 yasinda birikiminle genc sporculara yol gosteren bir isim haline geliyorsun.',
      '{name}, 50 yasinda performans kadar saglam kalmanin bilgisini paylasiyorsun.',
    ],
  },
  SOCIAL: {
    at30: [
      '{name}, 30 yasinda insanlar arasinda kopru kuran bir role geciyorsun. Guven verdigin icin kapilar once sana aciliyor.',
      '{name}, 30 yasinda iliski agin sadece kalabalik degil, ayni zamanda derin oluyor. Zor anlarda insanlar senden yon buluyor.',
    ],
    at50: [
      '{name}, 50 yasinda etrafinda kurdugun guven cemberi hayatinin en buyuk sermayesine donusuyor.',
      '{name}, 50 yasinda bircok insan seni kriz anlarinda ilk aradigi kisi olarak goruyor.',
    ],
  },
  ENTERPRISE: {
    at30: [
      '{name}, 30 yasinda risk ile plan arasinda yeni bir denge kuruyorsun. Urettigin deger seni sadece kazanan degil yon veren bir oyuncu yapiyor.',
      '{name}, 30 yasinda firsat kokusunu erken alan bir bakis acisi gelistiriyorsun. Dogru ekiplerle buyumeyi hizlandiriyorsun.',
    ],
    at50: [
      '{name}, 50 yasinda kurdugun sistemler senden sonra da islemeye devam ediyor.',
      '{name}, 50 yasinda birikimin hem yatirimlara hem yeni girisimcilere can veriyor.',
    ],
  },
  BALANCED: {
    at30: [
      '{name}, 30 yasinda tek bir alana kapanmak yerine hayatini dengede buyutuyorsun. Is, iliski ve ic huzur arasinda kendi olcunu buluyorsun.',
      '{name}, 30 yasinda farkli rolleri tasirken yorulmadan ilerlemeyi ogreniyorsun. Kucuk ama surekli adimlarin buyuk bir denge kuruyor.',
    ],
    at50: [
      '{name}, 50 yasinda hayatindaki uyum duygusu en guclu pusulana donusuyor.',
      '{name}, 50 yasinda istikrarli yonden sapmadan ilerlemenin degerini cevrendekilere aktariyorsun.',
    ],
  },
};

const FUTURE_VISION_TIER_TONES: Record<CareerResult['type'], {
  mood: FutureVisionMood;
  at30: [string, string];
  at50: [string, string];
}> = {
  LEGENDARY: {
    mood: 'optimistic',
    at30: [
      'Adin ulke sinirlarini asan bir etki alanina ulasiyor.',
      'Basarin sadece sonuclarla degil, etrafinda kurdugun standartla da konusuluyor.',
    ],
    at50: [
      'Zaman gectikce hikayen bir basari olcusune donusuyor.',
      'Birakilan etki, yillara ragmen azalmadan buyuyor.',
    ],
  },
  SUCCESS: {
    mood: 'optimistic',
    at30: [
      'Istikrarli adimlarin seni saglam bir zirveye tasiyor.',
      'Hizli sicramalardan cok, guvenilir ilerlemenin gucunu gostermis oluyorsun.',
    ],
    at50: [
      'Emeginin uzun vadeli getirisi hayatina huzurlu bir genislik katıyor.',
      'Yillar sonra bakildiginda cizginin ne kadar saglam oldugu netlesiyor.',
    ],
  },
  NORMAL: {
    mood: 'neutral',
    at30: [
      'Yolun parlak ama olculu; fazla risk almadan yavas yavas gucleniyorsun.',
      'Buyuk patlamalar yerine duzgun ritim seni ayakta tutuyor.',
    ],
    at50: [
      'Zamanla topladigin deneyim sade ama guvenilir bir hayat kuruyor.',
      'Dengenin de bir basari bicimi oldugunu en iyi sen kanitliyorsun.',
    ],
  },
  FAILURE: {
    mood: 'somber',
    at30: [
      'Hatalarin birikimi omuzlarini zorluyor; yeniden kurmak icin sabir gerekiyor.',
      'Bazi kapilar gec aciliyor, bu da yolunu yeniden cizmeye zorluyor.',
    ],
    at50: [
      'Yine de gecmisin agirligini anlamlandirdikca daha sakin bir dayaniklilik gelisiyor.',
      'Acilar silinmiyor ama onlardan dogan bilgelik hayata tutunmana yardim ediyor.',
    ],
  },
};

const getFutureVisionVariantIndex = (stats: Stats, playerName: string): 0 | 1 => {
  const seed = Math.round(
    stats.health
    + stats.intelligence
    + stats.charisma
    + stats.discipline
    + (stats.money / 100)
    + playerName.length * 3
  );
  return (Math.abs(seed) % 2) as 0 | 1;
};

const injectName = (template: string, name: string): string =>
  template.replaceAll('{name}', name);

export function generateFutureVision(
  stats: Stats,
  ending: EndingResolution,
  playerName: string
): { at30: string; at50: string; mood: FutureVisionMood } {
  const safeName = playerName.trim() || tRuntime('endings.content.futureVision.defaultName', undefined, 'Sen');
  const variant = getFutureVisionVariantIndex(stats, safeName);
  const goalTemplate = FUTURE_VISION_GOAL_TEMPLATES[ending.goal] ?? FUTURE_VISION_GOAL_TEMPLATES.BALANCED;
  const tierTone = FUTURE_VISION_TIER_TONES[ending.tier] ?? FUTURE_VISION_TIER_TONES.NORMAL;
  const variantNumber = variant + 1;
  const goalAt30 = tRuntime(
    `endings.content.futureVision.goals.${ending.goal}.at30.v${variantNumber}`,
    undefined,
    goalTemplate.at30[variant]
  );
  const goalAt50 = tRuntime(
    `endings.content.futureVision.goals.${ending.goal}.at50.v${variantNumber}`,
    undefined,
    goalTemplate.at50[variant]
  );
  const toneAt30 = tRuntime(
    `endings.content.futureVision.tiers.${ending.tier}.at30.v${variantNumber}`,
    undefined,
    tierTone.at30[variant]
  );
  const toneAt50 = tRuntime(
    `endings.content.futureVision.tiers.${ending.tier}.at50.v${variantNumber}`,
    undefined,
    tierTone.at50[variant]
  );

  return {
    at30: `${injectName(goalAt30, safeName)} ${toneAt30}`,
    at50: `${injectName(goalAt50, safeName)} ${toneAt50}`,
    mood: tierTone.mood,
  };
}
