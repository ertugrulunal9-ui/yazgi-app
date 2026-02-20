import { Choice, EventContext, GameEvent, LifeGoal, StoryArc } from '../types';

const GOAL_CHAIN_STAGE_IDS = {
  STAGE_1: 'goal_chain_stage1_discovery',
  STAGE_2: 'goal_chain_stage2_first_competition',
  STAGE_3: 'goal_chain_stage3_grand_final',
} as const;

const GOAL_TEXT: Record<LifeGoal, { stage1: string; stage2: string; stage3: string }> = {
  ACADEMIC: {
    stage1: 'Ogretmenin sende akademik potansiyel gordu ve bir mentor programina davet etti.',
    stage2: 'Ilk ciddi deneme sinavina cikiyorsun. Programin gercekten ise yarayip yaramadigi belli olacak.',
    stage3: 'Ulke capindaki burs finaline ciktin. Tum emegin bu son performansta olculecek.',
  },
  ATHLETIC: {
    stage1: 'Antrenorun fiziksel kapasiteni fark edip seni ozel bir programa aldi.',
    stage2: 'Ilk resmi turnuvana cikiyorsun. Performansin artik sadece idmanla olculmeyecek.',
    stage3: 'Buyuk final maci. Kazanirsan milli kamp listesine girebilirsin.',
  },
  CREATIVE: {
    stage1: 'Atolye hocan tarzini fark etti ve seni ozel bir proje grubuna secti.',
    stage2: 'Ilk kez kalabalik bir sahnede/sergide isini gostereceksin.',
    stage3: 'Buyuk final gecesi. Isin dogru etkiyi yaratirsa profesyonel bir firsat acilacak.',
  },
  WEALTH: {
    stage1: 'Kucuk bir is fikrin dikkat cekti. Bir mentor senden mini bir is plani istiyor.',
    stage2: 'Ilk gercek musteri ve gelir baskisiyla karsi karsiyasin.',
    stage3: 'Yatirimci onunde son sunum. Planin ya buyuyecek ya da kapanacak.',
  },
  SOCIAL: {
    stage1: 'Okul toplulugu seni temsilci adayi olarak one cikardi.',
    stage2: 'Ilk kriz toplantisini yonetiyorsun. Insanlari ayni hedefte tutman gerekiyor.',
    stage3: 'Sehir capinda buyuk forum finali. Bag kurma becerin sinanin zirvesinde.',
  },
};

const DEFAULT_GOAL: LifeGoal = 'ACADEMIC';

const resolveGoal = (context: EventContext): LifeGoal => (
  context.gameState?.selectedGoal ?? DEFAULT_GOAL
);

const effectByGoal = (
  goal: LifeGoal,
  stage: 1 | 2 | 3,
  variant: 'safe' | 'risky'
): Choice['effect'] => {
  if (goal === 'ACADEMIC') {
    if (stage === 1) return variant === 'safe'
      ? { intelligence: 3, discipline: 2, energy: -3 }
      : { intelligence: 5, discipline: 1, health: -1, energy: -5 };
    if (stage === 2) return variant === 'safe'
      ? { intelligence: 4, discipline: 3, energy: -4 }
      : { intelligence: 6, discipline: 2, charisma: -1, energy: -6 };
    return variant === 'safe'
      ? { intelligence: 5, discipline: 4, charisma: 1, energy: -5 }
      : { intelligence: 7, discipline: 3, health: -2, energy: -8 };
  }

  if (goal === 'ATHLETIC') {
    if (stage === 1) return variant === 'safe'
      ? { health: 3, discipline: 2, energy: -4 }
      : { health: 5, discipline: 1, intelligence: -1, energy: -6 };
    if (stage === 2) return variant === 'safe'
      ? { health: 4, discipline: 3, charisma: 1, energy: -5 }
      : { health: 6, discipline: 2, familyRelation: -1, energy: -7 };
    return variant === 'safe'
      ? { health: 5, discipline: 4, charisma: 2, energy: -6 }
      : { health: 7, discipline: 3, money: 80, energy: -8 };
  }

  if (goal === 'CREATIVE') {
    if (stage === 1) return variant === 'safe'
      ? { charisma: 3, intelligence: 1, energy: -3 }
      : { charisma: 5, intelligence: 1, discipline: -1, energy: -5 };
    if (stage === 2) return variant === 'safe'
      ? { charisma: 4, intelligence: 2, familyRelation: 1, energy: -4 }
      : { charisma: 6, intelligence: 2, discipline: -1, energy: -6 };
    return variant === 'safe'
      ? { charisma: 5, intelligence: 2, money: 120, energy: -5 }
      : { charisma: 7, intelligence: 3, familyRelation: -2, energy: -7 };
  }

  if (goal === 'WEALTH') {
    if (stage === 1) return variant === 'safe'
      ? { money: 90, discipline: 2, energy: -3 }
      : { money: 150, discipline: 1, familyRelation: -1, energy: -5 };
    if (stage === 2) return variant === 'safe'
      ? { money: 140, discipline: 3, intelligence: 1, energy: -4 }
      : { money: 220, discipline: 2, charisma: -1, energy: -6 };
    return variant === 'safe'
      ? { money: 220, discipline: 4, charisma: 1, energy: -5 }
      : { money: 320, discipline: 3, familyRelation: -2, energy: -7 };
  }

  if (stage === 1) return variant === 'safe'
    ? { charisma: 2, familyRelation: 3, energy: -2 }
    : { charisma: 4, familyRelation: 2, discipline: -1, energy: -4 };
  if (stage === 2) return variant === 'safe'
    ? { charisma: 3, familyRelation: 4, discipline: 1, energy: -3 }
    : { charisma: 5, familyRelation: 3, money: -40, energy: -5 };
  return variant === 'safe'
    ? { charisma: 4, familyRelation: 5, discipline: 1, energy: -4 }
    : { charisma: 6, familyRelation: 4, money: 100, energy: -6 };
};

const feedbackByGoal = (
  goal: LifeGoal,
  stage: 1 | 2 | 3,
  variant: 'safe' | 'risky'
): string => {
  if (variant === 'safe') {
    return `${GOAL_TEXT[goal][`stage${stage}` as 'stage1' | 'stage2' | 'stage3']} Dengeli bir yaklasimla istikrar kurdun.`;
  }
  return `${GOAL_TEXT[goal][`stage${stage}` as 'stage1' | 'stage2' | 'stage3']} Yuksek risk aldin; hizli kazandin ama bedel odedin.`;
};

const buildStageChoices = (stage: 1 | 2 | 3): ((context: EventContext) => Choice)[] => [
  (context) => {
    const goal = resolveGoal(context);
    return {
      id: `goal_chain_s${stage}_safe`,
      text: 'Planli ve kontrollu ilerle',
      effect: effectByGoal(goal, stage, 'safe'),
      stressEffect: 3,
      feedback: feedbackByGoal(goal, stage, 'safe'),
    };
  },
  (context) => {
    const goal = resolveGoal(context);
    return {
      id: `goal_chain_s${stage}_risky`,
      text: 'Agresif hamle yap, hizli sonucu zorla',
      effect: effectByGoal(goal, stage, 'risky'),
      stressEffect: 10,
      feedback: feedbackByGoal(goal, stage, 'risky'),
    };
  },
];

const buildStageText = (stage: 1 | 2 | 3) => (context: EventContext): string => {
  const goal = resolveGoal(context);
  const textSet = GOAL_TEXT[goal];
  if (stage === 1) return textSet.stage1;
  if (stage === 2) return textSet.stage2;
  return textSet.stage3;
};

export const GOAL_CHAIN_EVENTS: GameEvent[] = [
  {
    id: GOAL_CHAIN_STAGE_IDS.STAGE_1,
    text: buildStageText(1),
    minAge: 14,
    maxAge: 18,
    rarity: 'UNCOMMON',
    isRepeatable: false,
    difficulty: 3,
    tags: ['goal_chain', 'goal_stage_1'],
    personalityCategory: 'GROWTH',
    choices: buildStageChoices(1),
  },
  {
    id: GOAL_CHAIN_STAGE_IDS.STAGE_2,
    text: buildStageText(2),
    minAge: 14,
    maxAge: 18,
    rarity: 'RARE',
    isRepeatable: false,
    difficulty: 4,
    tags: ['goal_chain', 'goal_stage_2'],
    personalityCategory: 'RISK',
    choices: buildStageChoices(2),
  },
  {
    id: GOAL_CHAIN_STAGE_IDS.STAGE_3,
    text: buildStageText(3),
    minAge: 15,
    maxAge: 18,
    rarity: 'RARE',
    isRepeatable: false,
    difficulty: 4,
    tags: ['goal_chain', 'goal_stage_3'],
    personalityCategory: 'CONFLICT',
    choices: buildStageChoices(3),
  },
];

export const GOAL_CHAIN_ARC: StoryArc = {
  id: 'arc_goal_path_chain',
  title: 'Hayat Amaci Zinciri',
  ageRange: [14, 18],
  isRepeatable: false,
  events: [
    {
      eventId: GOAL_CHAIN_STAGE_IDS.STAGE_1,
      stage: 1,
      requiresPrevious: false,
      branchCondition: (context) => Boolean(context.gameState?.selectedGoal),
    },
    {
      eventId: GOAL_CHAIN_STAGE_IDS.STAGE_2,
      stage: 2,
      requiresPrevious: true,
      branchCondition: (context) => Boolean(context.gameState?.selectedGoal),
    },
    {
      eventId: GOAL_CHAIN_STAGE_IDS.STAGE_3,
      stage: 3,
      requiresPrevious: true,
      branchCondition: (context) => Boolean(context.gameState?.selectedGoal),
    },
  ],
};

export const getGoalChainStage = (eventId: string): 1 | 2 | 3 | null => {
  if (eventId === GOAL_CHAIN_STAGE_IDS.STAGE_1) return 1;
  if (eventId === GOAL_CHAIN_STAGE_IDS.STAGE_2) return 2;
  if (eventId === GOAL_CHAIN_STAGE_IDS.STAGE_3) return 3;
  return null;
};

