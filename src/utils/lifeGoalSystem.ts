import { Choice, GameEvent, GameState, LifeGoal } from '../types';

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

const clamp = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, value));

export const getLifeGoalMeta = (goal?: LifeGoal | null): LifeGoalMeta | null => {
  if (!goal) return null;
  return LIFE_GOAL_META[goal] ?? null;
};

export const getLifeGoalLabel = (goal?: LifeGoal | null): string => {
  const meta = getLifeGoalMeta(goal);
  return meta?.label ?? 'Hedef Belirsiz';
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

const GOAL_FEEDBACK: Record<LifeGoal, string> = {
  ACADEMIC: 'Kendine net bir akademik rota cizdin.',
  ATHLETIC: 'Sporcu hedefin artik yol haritan oldu.',
  CREATIVE: 'Yaratici hedefin icin risk almayi kabul ettin.',
  WEALTH: 'Finansal hedefin artik kararlarini yonlendiriyor.',
  SOCIAL: 'Insan odakli bir gelecek plani yaptin.',
};

const buildGoalChoice = (
  goal: LifeGoal,
  options?: {
    prefix?: string;
    textPrefix?: string;
  }
): Choice => {
  const prefix = options?.prefix ?? 'goal_select';
  const textPrefix = options?.textPrefix ?? 'Hedefi sec:';
  return {
    id: `${prefix}_${goal.toLowerCase()}`,
    text: `${textPrefix} ${LIFE_GOAL_META[goal].shortLabel}`,
    effect: GOAL_EFFECTS[goal],
    setSelectedGoal: goal,
    feedback: GOAL_FEEDBACK[goal],
  };
};

export const buildInitialLifeGoalEvent = (): GameEvent => ({
  id: LIFE_GOAL_SELECTION_EVENT_ID,
  text: '10 yasina girdin. Artik gelecekte neyin pesinden kosacagina karar vermelisin.',
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
    text: `${currentLabel} hedefine sadik kal`,
    effect: { discipline: 2, energy: -2 },
    setSelectedGoal: currentGoal,
    feedback: 'Planini degistirmedin. Bundan sonra tercihlerin daha kritik olacak.',
  };

  const pivotChoices = alternatives.map((goal, index) => {
    const textPrefix = index === 0 && goal === suggestedGoal
      ? `Rota degistir (${suggestedLabel})`
      : 'Hedefi guncelle:';
    return buildGoalChoice(goal, {
      prefix: 'goal_pivot',
      textPrefix,
    });
  });

  return {
    id: LIFE_GOAL_PIVOT_EVENT_ID,
    text: `${currentLabel} hedefinle mevcut gelisimin arasinda ciddi bir fark olustu (fark: ${Math.round(mismatchGap)}). Yeni bir rota secmek ister misin?`,
    minAge: 16,
    maxAge: 99,
    rarity: 'RARE',
    isRepeatable: false,
    personalityCategory: 'RISK',
    choices: [keepChoice, ...pivotChoices],
  };
};
