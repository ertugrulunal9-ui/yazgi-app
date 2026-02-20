import { EventMemory, FateOutcome, GameState, InnerThoughtType, LifeGoal, PersonalityState, PersonalityTendency } from '../types';
import { normalizePersonalityState } from '../systems/PersonalityMomentumEngine';
import { GoalMismatchAnalysis } from './endingResolver';
import { getTraitName } from '../data/traits';
import { getMomentumVisibilityFromPersonalityState } from './momentumVisibility';

const TENDENCIES: PersonalityTendency[] = ['HELPFUL', 'PRAGMATIC', 'AGGRESSIVE'];

// ── Momentum Monologue Bank (mevcut) ──────────────────────────────────

const MONOLOGUE_BANK: Record<PersonalityTendency, string[]> = {
  HELPFUL: [
    'Bugun insanlara destek olmak icimi sakinlestirdi.',
    'Yardim ettikce bu sehrin bana daha az soguk geldigini fark ediyorum.',
    'Birinin yukunu hafifletmek, kendi yolumu da netlestiriyor.',
  ],
  PRAGMATIC: [
    'Dogru adimi dogru anda atmak bugunu kazandirdi.',
    'Duygu degil plan kurtardi; bunu giderek daha net goruyorum.',
    'Sakin kalip hesap yapmak, kaosun icinde bana alan aciyor.',
  ],
  AGGRESSIVE: [
    'Bu sehirde ayakta kalmak icin geri cekilmemek gerekiyor.',
    'Sinirlarimi sert cizdigimde dunya daha anlasilir oluyor.',
    'Bugun yumusamadim ve bunun bedelini de gucunu de hissettim.',
  ],
};

// ── Crisis Messages ───────────────────────────────────────────────────

const CRISIS_MESSAGES = {
  WARNING: [
    'Kafam cok yorgun... Biraz mola vermeliyim.',
    'Son gunlerde her sey daha agir geliyor.',
    'Nefes almam lazim. Kendimi zorluyorum.',
  ],
  SEVERE: [
    'Her sey ust uste biniyor. Bir adim geri atmazsam cokeceğim.',
    'Vucudum uyari veriyor. Durmaliyim.',
  ],
  CRITICAL: [
    'Zihnim bulaniklasıyor... Biraz dinlenmezsem bayilacagim.',
  ],
};

// ── Mismatch Messages (hedef-spesifik) ────────────────────────────────

const MISMATCH_MESSAGES: Record<LifeGoal, string[]> = {
  ACADEMIC: [
    'Akademisyen olacaktim ama derslerden uzaklastim... Kendimi mi kandiriyorum?',
    'Kitaplara bakmayali cok oldu. Gercekten akademik mi olmak istiyorum?',
  ],
  ATHLETIC: [
    'Sporcu olacagim dedim ama antrenmanlara gitmiyorum... Gercekten istiyor muyum?',
    'Son zamanlarda spor yapmiyorum. Bu hayal benim mi yoksa baskasinin mi?',
  ],
  CREATIVE: [
    'Sanatci ruhum var dedim ama son zamanlarda hic uretmiyorum...',
    'Yaraticiligim nereye gitti? Belki de baska bir yol cagiriyor beni.',
  ],
  WEALTH: [
    'Zengin olacaktim ama para kazanmak icin bir adim atmiyorum...',
    'Is dunyasina atilacaktim ama hala hayal kuruyorum sadece.',
  ],
  SOCIAL: [
    'Insanlarla bag kuracaktim ama hep yalniz kaliyorum...',
    'Sosyal olacaktim ama etrafimda kimse yok. Bir seyler degismeli.',
  ],
};

// ── Trait Progress Messages ───────────────────────────────────────────

const TRAIT_PROGRESS_TEMPLATES = [
  '{traitName} olmaya alisiyorum... Biraz daha devam edersem bu kalici olacak.',
  'Icimde bir sey degisiyor. {traitName} ozelligim gucleniyor.',
];

// ── Strategic Monologue Interface ─────────────────────────────────────

// ── Age Milestone Monologues ──────────────────────────────────────────

const AGE_MILESTONE_MONOLOGUES: Record<number, string[]> = {
  7:  ['Artık daha büyüğüm... İlkokul bitti, yeni bir başlangıç.'],
  10: ['Tek haneli yaşlar geride kaldı. Bir şeyler değişiyor içimde.'],
  11: ['Az sonra 12 olacağım. Ortaokul bitiyor...'],
  13: ['13 yaşındayım artık. Her şey daha karmaşık hissettiriyor.'],
  15: ['15... Lise ortasındayım. Kimin olacağımı hâlâ bilmiyorum.'],
  17: ['17 oldum. Artık sadece bir yılım var.'],
  18: ['18... Her şeyin başlangıcı mı, yoksa sonu mu?'],
};

// ── Fate Roll Reactive Lines ──────────────────────────────────────────

const FATE_REACTIVE_LINES: Record<FateOutcome, string[]> = {
  BLESSED:   ['Bu kadar şanslı olmak... Kader bugün benim yanımda.'],
  FORTUNATE: ['İşler beklenmedik bir şekilde yolunda gitti. Belki şans var.'],
  NEUTRAL:   [],
  UNLUCKY:   ['Bu kadar şanssız olmak... Kader mi bu, yoksa ben mi?'],
  CURSED:    ['Her şey ters gitti. Bu kadar kötü bir gün olabilir mi?'],
};

// ── Memory-Based Recall Lines ─────────────────────────────────────────

const MEMORY_RECALL_TEMPLATES: Record<string, string> = {
  REGRET:       'O kararı verdiğimden bu yana... hâlâ aklımda.',
  GUILT:        'O an yanlış bir şey yaptığımı biliyordum. Umarım telafi ederim.',
  PRIDE:        'O anı düşününce içim ısınıyor. Doğru yaptım.',
  SATISFACTION: 'Bazı kararlar insanı sakinleştiriyor. O öyle bir andı.',
  NEUTRAL:      '',
};

export interface StrategicMonologueInput {
  burdenRisk: number;
  age: number;
  turnsUntilNextAge?: number;
  selectedGoal: LifeGoal | null;
  goalMismatch: GoalMismatchAnalysis;
  traitProgress: GameState['traitProgress'];
  personalityState: Partial<PersonalityState> | undefined;
  turn: number;
  pendingCliffhanger?: { type: string; title: string; description: string };
  lastFateOutcome?: FateOutcome;
  recentHighWeightMemory?: EventMemory;
  turnsSinceMemory?: number;
}

export interface StrategicMonologueResult {
  text: string;
  type: InnerThoughtType;
}

// ── Helpers ───────────────────────────────────────────────────────────

const pickByTurn = (messages: string[], turn: number, salt: number = 0): string => {
  const index = Math.abs(turn + salt) % messages.length;
  return messages[index];
};

const stripEmoji = (text: string): string =>
  text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').trim();

// ── Priority Queue: Strategic Monologue ───────────────────────────────

export const getStrategicMonologue = (input: StrategicMonologueInput): StrategicMonologueResult | null => {
  const {
    burdenRisk,
    age,
    turnsUntilNextAge,
    selectedGoal,
    goalMismatch,
    traitProgress,
    personalityState,
    turn,
    pendingCliffhanger,
    lastFateOutcome,
    recentHighWeightMemory,
    turnsSinceMemory,
  } = input;

  // P0 — CLIFFHANGER HINT (pending event teasers)
  if (pendingCliffhanger && turn % 3 === 0) {
    const hints = [
      `${pendingCliffhanger.title}... Merak ediyorum ne olacak.`,
      `Aklimdan ${pendingCliffhanger.title} cikmıyor. Neler olacak acaba?`,
      `Bir seyler olacagini hissediyorum... ${pendingCliffhanger.title}.`,
    ];
    return { text: pickByTurn(hints, turn), type: 'CLIFFHANGER' };
  }

  // P1 — CRISIS WARNING (burdenRisk > 60)
  if (burdenRisk > 80) {
    return { text: pickByTurn(CRISIS_MESSAGES.CRITICAL, turn), type: 'CRISIS' };
  }
  if (burdenRisk > 70) {
    return { text: pickByTurn(CRISIS_MESSAGES.SEVERE, turn), type: 'CRISIS' };
  }
  if (burdenRisk > 60) {
    return { text: pickByTurn(CRISIS_MESSAGES.WARNING, turn), type: 'CRISIS' };
  }

  // P2 — MISMATCH ALERT (age 13-15, erken uyarı eşikleri)
  if (
    selectedGoal &&
    age >= 13 &&
    age <= 15 &&
    goalMismatch.selectedGoal &&
    goalMismatch.dominantGoal !== goalMismatch.selectedGoal &&
    (goalMismatch.selectedScore <= 45 || goalMismatch.gap >= 12)
  ) {
    const messages = MISMATCH_MESSAGES[selectedGoal];
    return { text: pickByTurn(messages, turn), type: 'MISMATCH' };
  }

  // P2.5 — AGE MILESTONE yaklaşıyor (3 tur içinde)
  if (turnsUntilNextAge !== undefined && turnsUntilNextAge <= 3) {
    const nextAge = age + 1;
    const lines = AGE_MILESTONE_MONOLOGUES[nextAge];
    if (lines && lines.length > 0 && turn % 2 === 0) {
      return { text: pickByTurn(lines, turn), type: 'IDLE' };
    }
  }

  // P2.6 — FATE ROLL tepkisi (son tur içinde, yalnızca aşırı uçlar)
  if (lastFateOutcome && (lastFateOutcome === 'CURSED' || lastFateOutcome === 'BLESSED')) {
    const fateLines = FATE_REACTIVE_LINES[lastFateOutcome];
    if (fateLines.length > 0 && turn % 4 === 0) {
      return { text: pickByTurn(fateLines, turn), type: 'MOMENTUM' };
    }
  }

  // P2.7 — BELLEK ANISI (5-10 tur önce oluşan HIGH weight memory'ye gönderme)
  if (
    recentHighWeightMemory &&
    turnsSinceMemory !== undefined &&
    turnsSinceMemory >= 5 &&
    turnsSinceMemory <= 10 &&
    turn % 5 === 0
  ) {
    const template = MEMORY_RECALL_TEMPLATES[recentHighWeightMemory.emotion];
    if (template) {
      return { text: template, type: 'IDLE' };
    }
  }

  // P3 — TRAIT PROGRESS (>= 50% ilerleme; >= 70% için daha güçlü satır)
  if (traitProgress) {
    const TRAIT_PROGRESS_STRONG = [
      '{traitName} artık benim bir parçam. Daha fazla değiştiremez kimse bunu.',
      'Kitaplarla, kararlarla geçen her gün... {traitName} beni şekillendirdi.',
    ];

    const progressEntries = Object.entries(traitProgress);
    for (const [traitId, progress] of progressEntries) {
      if (
        progress &&
        !progress.isLocked &&
        progress.required > 0 &&
        progress.points / progress.required >= 0.5
      ) {
        const rawName = getTraitName(traitId);
        const traitName = stripEmoji(rawName);
        const ratio = progress.points / progress.required;
        const templates = ratio >= 0.7 ? TRAIT_PROGRESS_STRONG : TRAIT_PROGRESS_TEMPLATES;
        const template = pickByTurn(templates, turn, traitId.length);
        return { text: template.replace('{traitName}', traitName), type: 'TRAIT' };
      }
    }
  }

  // P4 — MOMENTUM (narrative feedback, numeric-free)
  const visibility = getMomentumVisibilityFromPersonalityState(personalityState);
  if (visibility.streakLevel === 'ACTIVE') {
    return { text: visibility.hint, type: 'MOMENTUM' };
  }
  if (visibility.streakLevel === 'BUILDING' && turn % 3 === 0 && visibility.hint) {
    return { text: visibility.hint, type: 'MOMENTUM' };
  }

  // P4.1 — MOMENTUM HIGH (streak >= 5): stronger flavor line
  const normalized = normalizePersonalityState(personalityState);
  const dominant = TENDENCIES
    .slice()
    .sort((a, b) => {
      if (normalized[b].streak !== normalized[a].streak) {
        return normalized[b].streak - normalized[a].streak;
      }
      return normalized[b].multiplier - normalized[a].multiplier;
    })[0];

  if (dominant && visibility.streakLevel === 'POWERFUL' && normalized[dominant].streak >= 5) {
    const entry = normalized[dominant];
    const lines = MONOLOGUE_BANK[dominant];
    const index = Math.abs(turn + entry.streak + entry.count) % lines.length;
    return { text: lines[index], type: 'MOMENTUM' };
  }

  // P5 — IDLE (null = family/fallback devralır)
  return null;
};

// ── Legacy Export (geriye uyumluluk) ──────────────────────────────────

export const getMomentumInternalMonologue = (
  personalityState: Partial<PersonalityState> | undefined,
  turn: number,
  threshold: number = 1.25
): string | null => {
  const normalized = normalizePersonalityState(personalityState);
  const dominant = TENDENCIES
    .slice()
    .sort((a, b) => {
      if (normalized[b].multiplier !== normalized[a].multiplier) {
        return normalized[b].multiplier - normalized[a].multiplier;
      }
      if (normalized[b].streak !== normalized[a].streak) {
        return normalized[b].streak - normalized[a].streak;
      }
      return normalized[b].count - normalized[a].count;
    })[0];

  if (!dominant) return null;
  const entry = normalized[dominant];
  if (entry.multiplier < threshold) return null;

  const lines = MONOLOGUE_BANK[dominant];
  const index = Math.abs(turn + entry.streak + entry.count) % lines.length;
  return lines[index];
};

// ── Compose Inner Thought ─────────────────────────────────────────────

export const composeInnerThought = (
  familyThought: string | null | undefined,
  strategicResult: StrategicMonologueResult | null,
  fallbackThought: string
): { text: string; type: InnerThoughtType } => {
  // Strategic always takes priority (uyarı mesajları family text ile karışmamalı)
  if (strategicResult) {
    return { text: strategicResult.text, type: strategicResult.type };
  }

  const familyText = familyThought?.trim();
  if (familyText) {
    return { text: familyText, type: 'IDLE' };
  }

  return { text: fallbackThought, type: 'IDLE' };
};
