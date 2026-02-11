import { EventMemory, MemoryEmotion, GameEvent, Personality } from '../types';

const NEGATIVE_EMOTIONS: readonly MemoryEmotion[] = ['REGRET', 'GUILT'];
const POSITIVE_EMOTIONS: readonly MemoryEmotion[] = ['PRIDE', 'SATISFACTION'];

const WEIGHT_SCORES: Record<EventMemory['weight'], number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const CATEGORY_MEMORY_PREFERENCE: Record<
  NonNullable<GameEvent['personalityCategory']>,
  'NEGATIVE' | 'POSITIVE' | 'MIXED'
> = {
  SOCIAL: 'POSITIVE',
  RISK: 'MIXED',
  MORAL: 'MIXED',
  CONFLICT: 'NEGATIVE',
  GROWTH: 'POSITIVE',
  BREAKDOWN: 'NEGATIVE',
};

// Hafizadaki baskin duyguyu bulur.
export const analyzeMemories = (memories: EventMemory[]) => {
  let regretScore = 0;
  let prideScore = 0;

  memories.forEach(mem => {
    const score = WEIGHT_SCORES[mem.weight];

    if (NEGATIVE_EMOTIONS.includes(mem.emotion)) {
      regretScore += score;
    } else if (POSITIVE_EMOTIONS.includes(mem.emotion)) {
      prideScore += score;
    }
  });

  return { regretScore, prideScore, totalMemories: memories.length };
};

// Hafizalardan rastgele bir ornek secer (metin icinde kullanmak icin).
export const getRandomMemoryText = (
  memories: EventMemory[],
  emotionType: 'NEGATIVE' | 'POSITIVE'
): string => {
  const targetMemories = memories.filter(memory =>
    emotionType === 'NEGATIVE'
      ? NEGATIVE_EMOTIONS.includes(memory.emotion)
      : POSITIVE_EMOTIONS.includes(memory.emotion)
  );

  if (targetMemories.length === 0) return '';

  const randomMem = targetMemories[Math.floor(Math.random() * targetMemories.length)];
  const yearsAgo = Math.max(0, (memories[memories.length - 1]?.age ?? randomMem.age) - randomMem.age);
  const timing = yearsAgo <= 1 ? 'gecen yil' : `${yearsAgo} yil once`;

  if (randomMem.eventId === 'found_wallet') {
    if (emotionType === 'NEGATIVE') {
      return 'Buldugun o cuzdan sahnesi yeniden zihninde canlaniyor; vicdanin sizliyor.';
    }
    return 'Cuzdani sahibine teslim ettigin an aklina geliyor; dogru olanin agirligi hafifletiyor.';
  }

  return `${timing} verdigin bir karar yine aklina dusuyor.`;
};

export interface MemoryAwareEventTextOptions {
  eventId: string;
  currentAge: number;
  currentTurn: number;
  personalityCategory?: GameEvent['personalityCategory'];
}

const hasMemoryReference = (text: string): boolean =>
  /hafiza|hatir|ani|memory|echo/i.test(text);

const hashSeed = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const getEmotionLine = (memory: EventMemory, currentAge: number): string => {
  const yearsAgo = Math.max(0, currentAge - memory.age);
  const agePrefix = yearsAgo <= 0
    ? 'Az once'
    : yearsAgo === 1
      ? `${memory.age} yasinda`
      : `${memory.age} yasinda`;

  switch (memory.emotion) {
    case 'REGRET':
      return `${agePrefix} yaptigin bir secimin golgesi icini hafifce yokluyor.`;
    case 'GUILT':
      return `${agePrefix} yasadigin bir sucluluk hissi sessizce geri donuyor.`;
    case 'PRIDE':
      return `${agePrefix} gosterdigin cesaret bugun yine omurgani diklestiriyor.`;
    case 'SATISFACTION':
      return `${agePrefix} aldigin dogru karar icini yeniden sakinlestiriyor.`;
    default:
      return `${agePrefix} bir ani zihninde kisa bir iz birakiyor.`;
  }
};

const pickMemoryPool = (
  memories: EventMemory[],
  personalityCategory?: GameEvent['personalityCategory']
): EventMemory[] => {
  const preference = personalityCategory
    ? CATEGORY_MEMORY_PREFERENCE[personalityCategory]
    : 'MIXED';

  if (preference === 'NEGATIVE') {
    return memories.filter(memory => NEGATIVE_EMOTIONS.includes(memory.emotion));
  }
  if (preference === 'POSITIVE') {
    return memories.filter(memory => POSITIVE_EMOTIONS.includes(memory.emotion));
  }
  return memories.filter(memory => memory.emotion !== 'NEUTRAL');
};

// Event metnini hafiza-duyarli hale getirir.
export const buildMemoryAwareEventText = (
  baseText: string,
  memories: EventMemory[],
  options: MemoryAwareEventTextOptions
): string => {
  if (!baseText || memories.length < 2) return baseText;
  if (hasMemoryReference(baseText)) return baseText;

  const stableRoll = hashSeed(`${options.eventId}:${options.currentTurn}:${options.currentAge}`) % 100;
  if (stableRoll > 44) {
    return baseText;
  }

  const pooled = pickMemoryPool(memories, options.personalityCategory);
  if (pooled.length === 0) return baseText;

  const sorted = [...pooled]
    .sort((a, b) => {
      const scoreA = WEIGHT_SCORES[a.weight] * 1000 + a.turnTimestamp;
      const scoreB = WEIGHT_SCORES[b.weight] * 1000 + b.turnTimestamp;
      return scoreB - scoreA;
    })
    .slice(0, 8);

  const index = hashSeed(`${options.eventId}:${options.currentTurn}:${sorted.length}`) % sorted.length;
  const picked = sorted[index];
  if (!picked) return baseText;

  const memoryLine = getEmotionLine(picked, options.currentAge);
  return `${baseText}\n\n${memoryLine}`;
};

// =================================================================
// YASAM YANSIMASI (Life Reflection)
// Oyun sonunda oyuncunun hayat yolculugunu ozetler.
// =================================================================

export type LifeTheme = 'REGRET_PATH' | 'PRIDE_PATH' | 'MIXED_PATH';

export interface KeyDecision {
  age: number;
  eventId: string;
  emotion: MemoryEmotion;
  weight: EventMemory['weight'];
  narrativeLine: string;
}

export interface LifeReflection {
  keyDecisions: KeyDecision[];
  dominantTheme: LifeTheme;
  summaryNarrative: string;
}

const getDecisionNarrative = (memory: EventMemory): string => {
  switch (memory.emotion) {
    case 'PRIDE':
      return `${memory.age} yaşında gurur duydun.`;
    case 'REGRET':
      return `${memory.age} yaşında pişman oldun.`;
    case 'GUILT':
      return `${memory.age} yaşında suçluluk hissettin.`;
    case 'SATISFACTION':
      return `${memory.age} yaşında huzur buldun.`;
    default:
      return `${memory.age} yaşında bir karar verdin.`;
  }
};

const getThemeSummary = (theme: LifeTheme, personality: Personality): string => {
  const isOpen = personality.openness > 60;
  const isBrave = personality.courage > 60;
  const isEmpath = personality.empathy > 60;

  switch (theme) {
    case 'PRIDE_PATH':
      if (isBrave) return 'Cesaretle dolu bir hayat yaşadın. Korkularını yendin ve iz bıraktın.';
      if (isEmpath) return 'İnsanlara dokunarak hayatını anlamlı kıldın.';
      if (isOpen) return 'Yeni deneyimlere açık bir hayat sürdün ve çok şey öğrendin.';
      return 'Başarılarla dolu bir yolculuk geçirdin. Her adım seni güçlendirdi.';
    case 'REGRET_PATH':
      if (isBrave) return 'Hatalar yaptın ama her seferinde ayağa kalktın. Bu cesaret seni tanımlıyor.';
      if (isEmpath) return 'Pişmanlıkların seni daha anlayışlı bir insan yaptı.';
      return 'Düşüşler ve dersler dolu bir yolculuk. Her hata seni olgunlaştırdı.';
    case 'MIXED_PATH':
      return 'Hem zaferler hem yenilgiler yaşadın. Bu denge seni gerçekten olgunlaştırdı.';
  }
};

export const buildLifeReflection = (
  memories: EventMemory[],
  personality: Personality,
): LifeReflection => {
  const { regretScore, prideScore } = analyzeMemories(memories);

  // Dominant tema belirle
  let dominantTheme: LifeTheme;
  if (prideScore > regretScore * 1.5) {
    dominantTheme = 'PRIDE_PATH';
  } else if (regretScore > prideScore * 1.5) {
    dominantTheme = 'REGRET_PATH';
  } else {
    dominantTheme = 'MIXED_PATH';
  }

  // En onemli 7 aniyi sec (agirliga gore, sonra yasa gore)
  const significantMemories = [...memories]
    .filter(m => m.emotion !== 'NEUTRAL')
    .sort((a, b) => {
      const weightDiff = WEIGHT_SCORES[b.weight] - WEIGHT_SCORES[a.weight];
      if (weightDiff !== 0) return weightDiff;
      return a.age - b.age; // Kronolojik siralama
    })
    .slice(0, 7);

  // Kronolojik sirala
  significantMemories.sort((a, b) => a.age - b.age);

  const keyDecisions: KeyDecision[] = significantMemories.map(mem => ({
    age: mem.age,
    eventId: mem.eventId,
    emotion: mem.emotion,
    weight: mem.weight,
    narrativeLine: getDecisionNarrative(mem),
  }));

  const summaryNarrative = getThemeSummary(dominantTheme, personality);

  return {
    keyDecisions,
    dominantTheme,
    summaryNarrative,
  };
};
