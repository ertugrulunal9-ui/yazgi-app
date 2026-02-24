import { Choice, GameEvent, GameState, LifeGoal } from '../types';
import { tRuntime } from '../i18n/strings';

export const LIFE_GOAL_SELECTION_EVENT_ID = 'life_goal_selection_10';
export const LIFE_GOAL_PIVOT_EVENT_ID = 'life_goal_pivot_16';

export const LIFE_GOAL_ORDER: LifeGoal[] = ['ACADEMIC', 'ATHLETIC', 'CREATIVE', 'WEALTH', 'SOCIAL'];

export interface LifeGoalMeta {
  label: string;
  shortLabel: string;
  accentColor: string;
  statHint: string;
}

export const LIFE_GOAL_META: Record<LifeGoal, LifeGoalMeta> = {
  ACADEMIC: {
    label: 'Akademik Yol',
    shortLabel: 'Akademik',
    accentColor: '#3b82f6',
    statHint: 'Zeka + Disiplin',
  },
  ATHLETIC: {
    label: 'Sporcu Yol',
    shortLabel: 'Atletik',
    accentColor: '#22c55e',
    statHint: 'Saglik + Disiplin',
  },
  CREATIVE: {
    label: 'Yaratici Yol',
    shortLabel: 'Yaratici',
    accentColor: '#f97316',
    statHint: 'Karizma + Zeka',
  },
  WEALTH: {
    label: 'Zenginlik Yol',
    shortLabel: 'Zenginlik',
    accentColor: '#14b8a6',
    statHint: 'Para + Disiplin',
  },
  SOCIAL: {
    label: 'Sosyal Yol',
    shortLabel: 'Sosyal',
    accentColor: '#a855f7',
    statHint: 'Karizma + Aile',
  },
};

const GOAL_KEY_PATHS: Record<LifeGoal, {
  label: string;
  shortLabel: string;
  statHint: string;
  feedback: string;
}> = {
  ACADEMIC: {
    label: 'goals.ACADEMIC.label',
    shortLabel: 'goals.ACADEMIC.shortLabel',
    statHint: 'goals.ACADEMIC.statHint',
    feedback: 'goals.feedback.ACADEMIC',
  },
  ATHLETIC: {
    label: 'goals.ATHLETIC.label',
    shortLabel: 'goals.ATHLETIC.shortLabel',
    statHint: 'goals.ATHLETIC.statHint',
    feedback: 'goals.feedback.ATHLETIC',
  },
  CREATIVE: {
    label: 'goals.CREATIVE.label',
    shortLabel: 'goals.CREATIVE.shortLabel',
    statHint: 'goals.CREATIVE.statHint',
    feedback: 'goals.feedback.CREATIVE',
  },
  WEALTH: {
    label: 'goals.WEALTH.label',
    shortLabel: 'goals.WEALTH.shortLabel',
    statHint: 'goals.WEALTH.statHint',
    feedback: 'goals.feedback.WEALTH',
  },
  SOCIAL: {
    label: 'goals.SOCIAL.label',
    shortLabel: 'goals.SOCIAL.shortLabel',
    statHint: 'goals.SOCIAL.statHint',
    feedback: 'goals.feedback.SOCIAL',
  },
};

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const getLifeGoalMeta = (goal?: LifeGoal | null): LifeGoalMeta | null => {
  if (!goal) return null;
  const fallback = LIFE_GOAL_META[goal];
  if (!fallback) return null;

  const keyPaths = GOAL_KEY_PATHS[goal];

  return {
    label: tRuntime(keyPaths.label, undefined, fallback.label),
    shortLabel: tRuntime(keyPaths.shortLabel, undefined, fallback.shortLabel),
    accentColor: fallback.accentColor,
    statHint: tRuntime(keyPaths.statHint, undefined, fallback.statHint),
  };
};

export const getLifeGoalLabel = (goal?: LifeGoal | null): string => {
  const meta = getLifeGoalMeta(goal);
  return meta?.label ?? tRuntime('goals.unknown', undefined, 'Hedef Belirsiz');
};

export const mapEndingGoalToLifeGoal = (
  endingGoal: string,
  fallback: LifeGoal = 'ACADEMIC'
): LifeGoal => {
  if (endingGoal === 'ENTERPRISE') return 'WEALTH';
  if (endingGoal === 'ACADEMIC' || endingGoal === 'ATHLETIC' || endingGoal === 'CREATIVE' || endingGoal === 'SOCIAL') {
    return endingGoal;
  }
  return fallback;
};

export const hasSeenLifeGoalEvent = (gameState: GameState, eventId: string): boolean => (
  (gameState.eventChoiceHistory || []).includes(eventId)
);

export const shouldTriggerInitialLifeGoalEvent = (
  gameState: GameState,
  currentAge: number
): boolean => (
  currentAge >= 10
  && !gameState.selectedGoal
  && !hasSeenLifeGoalEvent(gameState, LIFE_GOAL_SELECTION_EVENT_ID)
);

export const shouldTriggerPivotLifeGoalEvent = (params: {
  gameState: GameState;
  currentAge: number;
  isMismatch: boolean;
  mismatchGap: number;
}): boolean => {
  const { gameState, currentAge, isMismatch, mismatchGap } = params;
  if (currentAge < 16) return false;
  if (!gameState.selectedGoal) return false;
  if (!isMismatch) return false;
  if (hasSeenLifeGoalEvent(gameState, LIFE_GOAL_PIVOT_EVENT_ID)) return false;

  const baseChance = currentAge <= 16 ? 0.45 : 0.22;
  const gapBonus = clamp((mismatchGap - 16) * 0.012, 0, 0.2);
  return Math.random() < (baseChance + gapBonus);
};

const GOAL_EFFECTS: Record<LifeGoal, Choice['effect']> = {
  ACADEMIC: { intelligence: 2, discipline: 2, energy: -2 },
  ATHLETIC: { health: 3, discipline: 1, energy: -3 },
  CREATIVE: { charisma: 2, intelligence: 1, energy: -2 },
  WEALTH: { money: 120, discipline: 1, energy: -2 },
  SOCIAL: { charisma: 2, familyRelation: 2, energy: -2 },
};

const getGoalFeedback = (goal: LifeGoal): string => {
  const key = GOAL_KEY_PATHS[goal].feedback;
  const fallbackByGoal: Record<LifeGoal, string> = {
    ACADEMIC: 'Kendine net bir akademik rota cizdin.',
    ATHLETIC: 'Sporcu hedefin artik yol haritan oldu.',
    CREATIVE: 'Yaratici hedefin icin risk almayi kabul ettin.',
    WEALTH: 'Finansal hedefin artik kararlarini yonlendiriyor.',
    SOCIAL: 'Insan odakli bir gelecek plani yaptin.',
  };
  return tRuntime(key, undefined, fallbackByGoal[goal]);
};

const buildGoalChoice = (
  goal: LifeGoal,
  options?: {
    prefix?: string;
    textPrefix?: string;
  }
): Choice => {
  const prefix = options?.prefix ?? 'goal_select';
  const textPrefix = options?.textPrefix ?? tRuntime('goals.selectPrefix', undefined, 'Hedefi sec:');
  const localizedMeta = getLifeGoalMeta(goal) ?? LIFE_GOAL_META[goal];

  return {
    id: `${prefix}_${goal.toLowerCase()}`,
    text: `${textPrefix} ${localizedMeta.shortLabel}`,
    effect: GOAL_EFFECTS[goal],
    setSelectedGoal: goal,
    feedback: getGoalFeedback(goal),
  };
};

export const buildInitialLifeGoalEvent = (): GameEvent => ({
  id: LIFE_GOAL_SELECTION_EVENT_ID,
  text: tRuntime(
    'goals.lifeGoalEventText',
    undefined,
    '10 yasina girdin. Artik gelecekte neyin pesinden kosacagina karar vermelisin.'
  ),
  minAge: 10,
  maxAge: 99,
  rarity: 'RARE',
  isRepeatable: false,
  personalityCategory: 'GROWTH',
  choices: LIFE_GOAL_ORDER.map(goal => buildGoalChoice(goal)),
});

const orderPivotAlternatives = (currentGoal: LifeGoal, suggestedGoal: LifeGoal): LifeGoal[] => {
  const alternatives = LIFE_GOAL_ORDER.filter(goal => goal !== currentGoal);
  alternatives.sort((a, b) => {
    if (a === suggestedGoal) return -1;
    if (b === suggestedGoal) return 1;
    return 0;
  });
  return alternatives;
};

export const buildPivotLifeGoalEvent = (
  currentGoal: LifeGoal,
  suggestedGoal: LifeGoal,
  mismatchGap: number
): GameEvent => {
  const currentLabel = getLifeGoalLabel(currentGoal);
  const suggestedLabel = getLifeGoalLabel(suggestedGoal);
  const alternatives = orderPivotAlternatives(currentGoal, suggestedGoal);

  const keepChoice: Choice = {
    id: 'goal_keep_current',
    text: tRuntime('goals.keepCurrent', { currentLabel }, `${currentLabel} hedefine sadik kal`),
    effect: { discipline: 2, energy: -2 },
    setSelectedGoal: currentGoal,
    feedback: tRuntime(
      'goals.keepCurrentFeedback',
      undefined,
      'Planini degistirmedin. Bundan sonra tercihlerin daha kritik olacak.'
    ),
  };

  const pivotChoices = alternatives.map((goal, index) => {
    const textPrefix = index === 0 && goal === suggestedGoal
      ? tRuntime('goals.pivotSuggested', { suggestedLabel }, `Rota degistir (${suggestedLabel})`)
      : tRuntime('goals.pivotUpdate', undefined, 'Hedefi guncelle:');
    return buildGoalChoice(goal, {
      prefix: 'goal_pivot',
      textPrefix,
    });
  });

  return {
    id: LIFE_GOAL_PIVOT_EVENT_ID,
    text: tRuntime(
      'goals.pivotEventText',
      {
        currentLabel,
        gap: Math.round(mismatchGap),
      },
      `${currentLabel} hedefinle mevcut gelisimin arasinda ciddi bir fark olustu (fark: ${Math.round(mismatchGap)}). Yeni bir rota secmek ister misin?`
    ),
    minAge: 16,
    maxAge: 99,
    rarity: 'RARE',
    isRepeatable: false,
    personalityCategory: 'RISK',
    choices: [keepChoice, ...pivotChoices],
  };
};
