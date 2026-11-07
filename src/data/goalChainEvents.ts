import { Choice, EventContext, GameEvent, LifeGoal, StoryArc } from '../types';

const GOAL_CHAIN_STAGE_IDS = {
  STAGE_1: 'goal_chain_stage1_discovery',
  STAGE_2: 'goal_chain_stage2_first_competition',
  STAGE_3: 'goal_chain_stage3_grand_final',
} as const;

const GOAL_TEXT: Record<LifeGoal, { stage1: string; stage2: string; stage3: string }> = {
  ACADEMIC: {
    stage1: 'Öğretmenin sende akademik potansiyel gördü ve bir mentor programına davet etti.',
    stage2: 'İlk ciddi deneme sınavına çıkıyorsun. Programın gerçekten işe yarayıp yaramadığı belli olacak.',
    stage3: 'Ülke çapındaki burs finaline çıktın. Tüm emeğin bu son performansta ölçülecek.',
  },
  ATHLETIC: {
    stage1: 'Antrenörün fiziksel kapasiteni fark edip seni özel bir programa aldı.',
    stage2: 'İlk resmi turnuvana çıkıyorsun. Performansın artık sadece idmanla ölçülmeyecek.',
    stage3: 'Büyük final maçı. Kazanırsan milli kamp listesine girebilirsin.',
  },
  CREATIVE: {
    stage1: 'Atölye hocan tarzını fark etti ve seni özel bir proje grubuna seçti.',
    stage2: 'İlk kez kalabalık bir sahnede/sergide işini göstereceksin.',
    stage3: 'Büyük final gecesi. İşin doğru etkiyi yaratırsa profesyonel bir fırsat açılacak.',
  },
  WEALTH: {
    stage1: 'Küçük bir iş fikrin dikkat çekti. Bir mentor senden mini bir iş planı istiyor.',
    stage2: 'İlk gerçek müşteri ve gelir baskısıyla karşı karşıyasın.',
    stage3: 'Yatırımcı önünde son sunum. Planın ya büyüyecek ya da kapanacak.',
  },
  SOCIAL: {
    stage1: 'Okul topluluğu seni temsilci adayı olarak öne çıkardı.',
    stage2: 'İlk kriz toplantısını yönetiyorsun. İnsanları aynı hedefte tutman gerekiyor.',
    stage3: 'Şehir çapında büyük forum finali. Bağ kurma becerin sınavın zirvesinde.',
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

const GOAL_FEEDBACK: Record<LifeGoal, Record<'stage1' | 'stage2' | 'stage3', { safe: string; risky: string }>> = {
  ACADEMIC: {
    stage1: {
      safe: 'Mentorla her hafta aynı saatte oturup bir konu defteri tutmaya başladın. Yavaş ilerliyorsun ama sayfalar dolmaya başladı.',
      risky: 'İlk haftada mentorun verdiği listenin iki katını bitirdin. Hocanın yüzü güldü, ama gözlerinin altı mor.',
    },
    stage2: {
      safe: 'Çözdüğün yanlışları tek tek defterine geçirmiştin. Kâğıtta tanıdık sorular görünce elin titremedi.',
      risky: 'Son geceyi sabaha kadar deneme çözerek geçirdin. Puanın yükseldi, ama çıkışta arkadaşlarının şakasına gülecek halin kalmamıştı.',
    },
    stage3: {
      safe: 'Salona girerken cebindeki özet kartını bir kez daha yokladın. Sorular sırayla ve sakince yerine oturdu.',
      risky: 'Zor soruları öne alıp süreyle yarıştın. Birkaçı tuttu, birkaçı kâğıtta yarım kaldı; çıkışta başın zonkluyordu.',
    },
  },
  ATHLETIC: {
    stage1: {
      safe: 'Antrenörün seni her sabah ısınmayla başlatıp bir koşu çizelgesine yazdı. Nefesin her hafta biraz daha uzun dayanıyor.',
      risky: 'Programın dışına ekstra tekrarlar eklemeye başladın. Hızın fark edildi, ama derste otururken bile bacakların sızlıyor.',
    },
    stage2: {
      safe: 'Turnuvada tempoyu ilk dakikada değil, son çeyrekte yükseltmeyi seçtin. Rakipler yorulurken sen tam yerindeydin.',
      risky: 'Daha ilk dakikada tempoyu zorlayıp öne geçtin. Maç sonrası eve gitmek yerine tesiste oyalandın, ailen seni bekledi.',
    },
    stage3: {
      safe: 'Finalde antrenörün çizdiği oyun planına sadık kaldın. Skor tabelası ağır ağır senin lehine döndü.',
      risky: 'Son dakikalarda büyük bir riske girdin ve hamle tuttu. Salondaki alkışla birlikte cebine küçük bir ödül de girdi.',
    },
  },
  CREATIVE: {
    stage1: {
      safe: 'Proje grubuna işini önce küçük bir taslakla gösterdin. Hocanın kenara yazdığı notları tek tek uyguladın.',
      risky: 'Taslağı bırakıp tamamen yeni bir fikre atladın. Grup şaşırdı, ama plansız gece mesaileri düzenini bozdu.',
    },
    stage2: {
      safe: 'Sahneye çıkmadan önce parçanı üç kez baştan sona prova etmiştin. Seyirciden gelen ilk alkış omuzlarını gevşetti.',
      risky: 'Provadaki halini bırakıp sahnede doğaçlama yaptın. Salon seni ayrıca not etti, ama bir yerde ipin ucu elinden kaydı.',
    },
    stage3: {
      safe: 'Final gecesi işini en güvendiğin haliyle sundun. Jüriden biri sonra yanına gelip bir atölye teklifi bıraktı.',
      risky: 'Işıkları kısıp işini hiç denemediğin bir biçimde sundun. Salon önce sustu, sonra ayağa kalktı; ailene sarılmak için vakit bulamadın.',
    },
  },
  WEALTH: {
    stage1: {
      safe: 'Mentorun için iki sayfalık bir iş planı yazıp maliyetleri satır satır çıkardın. Küçük ama sağlam bir ilk gelir kapıyı çaldı.',
      risky: 'Planı beklemeden ilk siparişi aldın. Para daha hızlı geldi, ama akşam yemeğine geç kalmaya başladın.',
    },
    stage2: {
      safe: 'İlk müşteriye söz verdiğin tarihten bir gün önce teslim ettin. Müşteri bir sonraki siparişini aynı akşam yazdı.',
      risky: 'Fiyatı yükseltip teslimatı sıkıştırdın. Kasa doldu, ama müşterinin sesindeki soğukluk aklında kaldı.',
    },
    stage3: {
      safe: 'Yatırımcıya hayalini değil, rakamlarını anlattın. Sorulara defterindeki sayfalarla tek tek cevap verdin.',
      risky: 'Sunumun ortasında hedefi büyütüp iddialı bir rakam söyledin. Yatırımcı etkilendi; evdeki sofrada ise sessizlik uzadı.',
    },
  },
  SOCIAL: {
    stage1: {
      safe: 'Aday olarak önce sınıfları tek tek gezip herkesi dinledin. Kendini anlatmadan önce not aldın ve insanlar bunu fark etti.',
      risky: 'Tanıtım konuşmasını sınıf sınıf koşarak yaptın. Adın herkesin dilinde, ama ödev defterin yarım kaldı.',
    },
    stage2: {
      safe: 'Herkesin söz hakkı olduğunu açıkça söyleyip sırayla dinledin. Toplantı sonunda iki taraf da el sıkıştı.',
      risky: 'Karşı çıkanın sözünü kesip kararı kendin verdin. Toplantı bitti, ama pankart masrafı cebinden çıktı.',
    },
    stage3: {
      safe: 'Forumda konuşmanı tek bir hikaye etrafında topladın. Çıkarken tanımadığın birkaç kişi sana teşekkür etti.',
      risky: 'Hazırladığın metni bırakıp doğrudan seyirciye konuştun. Salon coştu, kuliste sesin kısılmıştı ama elinde ödül parası vardı.',
    },
  },
};

const feedbackByGoal = (
  goal: LifeGoal,
  stage: 1 | 2 | 3,
  variant: 'safe' | 'risky'
): string => GOAL_FEEDBACK[goal][`stage${stage}` as 'stage1' | 'stage2' | 'stage3'][variant];

const buildStageChoices = (stage: 1 | 2 | 3): ((context: EventContext) => Choice)[] => [
  (context) => {
    const goal = resolveGoal(context);
    return {
      id: `goal_chain_s${stage}_safe`,
      text: 'Planlı ve kontrollü ilerle',
      effect: effectByGoal(goal, stage, 'safe'),
      stressEffect: 3,
      feedback: feedbackByGoal(goal, stage, 'safe'),
    };
  },
  (context) => {
    const goal = resolveGoal(context);
    return {
      id: `goal_chain_s${stage}_risky`,
      text: 'Agresif hamle yap, hızlı sonucu zorla',
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
    reqEventIds: [GOAL_CHAIN_STAGE_IDS.STAGE_1],
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
    reqEventIds: [GOAL_CHAIN_STAGE_IDS.STAGE_2],
    tags: ['goal_chain', 'goal_stage_3'],
    personalityCategory: 'CONFLICT',
    choices: buildStageChoices(3),
  },
];

export const GOAL_CHAIN_ARC: StoryArc = {
  id: 'arc_goal_path_chain',
  title: 'Hayat Amacı Zinciri',
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

