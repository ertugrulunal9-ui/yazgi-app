import { EventMemory, Family, MemoryEmotion, GameEvent, Personality, PersonalityTendency } from '../types';
import { getPersonalityArchetype, getArchetypeDescription, getPersonalityLevelDescription } from './personalitySystem';
import { tRuntime } from '../i18n/strings';

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
  const timing = yearsAgo <= 1
    ? tRuntime('narrative.memory.timing.lastYear')
    : tRuntime('narrative.memory.timing.yearsAgo', { years: yearsAgo });

  if (randomMem.eventId === 'found_wallet') {
    if (emotionType === 'NEGATIVE') {
      return tRuntime('narrative.memory.random.foundWallet.negative');
    }
    return tRuntime('narrative.memory.random.foundWallet.positive');
  }

  return tRuntime('narrative.memory.random.generic', { timing });
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
    ? tRuntime('narrative.memory.agePrefix.current')
    : tRuntime('narrative.memory.agePrefix.atAge', { age: memory.age });

  switch (memory.emotion) {
    case 'REGRET':
      return tRuntime('narrative.memory.emotionLine.regret', { agePrefix });
    case 'GUILT':
      return tRuntime('narrative.memory.emotionLine.guilt', { agePrefix });
    case 'PRIDE':
      return tRuntime('narrative.memory.emotionLine.pride', { agePrefix });
    case 'SATISFACTION':
      return tRuntime('narrative.memory.emotionLine.satisfaction', { agePrefix });
    default:
      return tRuntime('narrative.memory.emotionLine.neutral', { agePrefix });
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
      return tRuntime('narrative.memory.decisionNarrative.pride', { age: memory.age });
    case 'REGRET':
      return tRuntime('narrative.memory.decisionNarrative.regret', { age: memory.age });
    case 'GUILT':
      return tRuntime('narrative.memory.decisionNarrative.guilt', { age: memory.age });
    case 'SATISFACTION':
      return tRuntime('narrative.memory.decisionNarrative.satisfaction', { age: memory.age });
    default:
      return tRuntime('narrative.memory.decisionNarrative.neutral', { age: memory.age });
  }
};

const getThemeSummary = (theme: LifeTheme, personality: Personality): string => {
  const isOpen = personality.openness > 60;
  const isBrave = personality.courage > 60;
  const isEmpath = personality.empathy > 60;

  switch (theme) {
    case 'PRIDE_PATH':
      if (isBrave) return tRuntime('narrative.memory.themeSummary.pridePath.brave');
      if (isEmpath) return tRuntime('narrative.memory.themeSummary.pridePath.empath');
      if (isOpen) return tRuntime('narrative.memory.themeSummary.pridePath.open');
      return tRuntime('narrative.memory.themeSummary.pridePath.default');
    case 'REGRET_PATH':
      if (isBrave) return tRuntime('narrative.memory.themeSummary.regretPath.brave');
      if (isEmpath) return tRuntime('narrative.memory.themeSummary.regretPath.empath');
      return tRuntime('narrative.memory.themeSummary.regretPath.default');
    case 'MIXED_PATH':
      return tRuntime('narrative.memory.themeSummary.mixedPath');
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

// =================================================================
// HAYAT HİKAYESİ ANLATISI (Life Story Narrative)
// Ending ekranında oyuncunun benzersiz hayat hikayesini 3-5 paragrafla anlatır.
// =================================================================

export interface LifeStoryNarrative {
  paragraphs: string[];
}

const FAMILY_OPENING: Record<string, string> = {
  SUPPORTIVE: 'narrative.memory.familyOpening.supportive',
  STRICT: 'narrative.memory.familyOpening.strict',
  CHAOTIC: 'narrative.memory.familyOpening.chaotic',
};

const FAMILY_OPENING_DEFAULT = 'narrative.memory.familyOpening.default';

const PERSONALITY_AXES: (keyof Personality)[] = ['openness', 'courage', 'empathy', 'patience', 'conformity'];

const TENDENCY_LABELS: Record<PersonalityTendency, string> = {
  HELPFUL: 'narrative.memory.tendency.helpful',
  PRAGMATIC: 'narrative.memory.tendency.pragmatic',
  AGGRESSIVE: 'narrative.memory.tendency.aggressive',
};

const buildEarlyMemoryParagraph = (decisions: KeyDecision[]): string | null => {
  const earlyDecisions = decisions.filter(d => d.age >= 7 && d.age <= 12);
  if (earlyDecisions.length === 0) return null;

  const lines = earlyDecisions.slice(0, 3).map(d => d.narrativeLine);
  return tRuntime('narrative.memory.paragraph.earlyYears', { lines: lines.join(' ') });
};

const buildTeenMemoryParagraph = (decisions: KeyDecision[]): string | null => {
  const teenDecisions = decisions.filter(d => d.age >= 13);
  if (teenDecisions.length === 0) return null;

  const lines = teenDecisions.slice(0, 3).map(d => d.narrativeLine);
  return tRuntime('narrative.memory.paragraph.teenYears', { lines: lines.join(' ') });
};

const buildPersonalityParagraph = (
  personality: Personality,
  dominantTendency: PersonalityTendency | null,
): string => {
  const archetype = getPersonalityArchetype(personality);
  const archetypeDesc = getArchetypeDescription(archetype);

  let highAxis: keyof Personality = 'openness';
  let highVal = -1;
  for (const axis of PERSONALITY_AXES) {
    if (personality[axis] > highVal) { highVal = personality[axis]; highAxis = axis; }
  }
  const highLabel = getPersonalityLevelDescription(highAxis, highVal);

  let text = tRuntime('narrative.memory.paragraph.personality', {
    archetypeDesc,
    highLabel: highLabel.toLowerCase(),
  });

  if (dominantTendency) {
    const tendencyLabel = tRuntime(TENDENCY_LABELS[dominantTendency]);
    text += ` ${tRuntime('narrative.memory.paragraph.tendencySuffix', { tendency: tendencyLabel })}`;
  }

  return text;
};

export const buildLifeStoryNarrative = (
  memories: EventMemory[],
  personality: Personality,
  dominantTendency: PersonalityTendency | null,
  family: Family | null,
  _traits: string[],
  playerName: string,
): LifeStoryNarrative => {
  const reflection = buildLifeReflection(memories, personality);
  const paragraphs: string[] = [];

  // P1: Erken cocukluk + aile
  const familyDynamic = family?.dynamic ?? 'SUPPORTIVE';
  const openingKey = FAMILY_OPENING[familyDynamic] ?? FAMILY_OPENING_DEFAULT;
  paragraphs.push(tRuntime(openingKey, { name: playerName }));

  // P2: 7-12 yas anahtar anilar
  const earlyPara = buildEarlyMemoryParagraph(reflection.keyDecisions);
  if (earlyPara) paragraphs.push(earlyPara);

  // P3: Kisilik kristallesmesi
  paragraphs.push(buildPersonalityParagraph(personality, dominantTendency));

  // P4: 13-18 yas donum noktalari
  const teenPara = buildTeenMemoryParagraph(reflection.keyDecisions);
  if (teenPara) paragraphs.push(teenPara);

  // P5: Kapanış - dominant tema
  paragraphs.push(reflection.summaryNarrative);

  return { paragraphs };
};
