import { EventContext, GameEvent, PersonalityState, PersonalityTendency } from '../types';
import { HIGH_MOMENTUM_THRESHOLD, normalizePersonalityState } from '../systems/PersonalityMomentumEngine';
import { isEventEligible } from '../utils/eventSelection';

export const PERSONALITY_GATE_THRESHOLD = HIGH_MOMENTUM_THRESHOLD;

const TENDENCIES: PersonalityTendency[] = ['HELPFUL', 'PRAGMATIC', 'AGGRESSIVE'];

const MOMENTUM_EVENTS: Record<PersonalityTendency, GameEvent[]> = {
  HELPFUL: [
    {
      id: 'evt_momentum_helpful_street_thanks',
      text: 'Sokakta daha once destek oldugun biri seni gorup durduruyor: "Iyi ki yardim etmistin, simdi ben ayaktayim."',
      minAge: 7,
      maxAge: 100,
      rarity: 'UNCOMMON',
      isRepeatable: true,
      personalityCategory: 'SOCIAL',
      tags: ['momentum', 'helpful', 'unique'],
      choices: [
        {
          id: 'helpful_street_thanks_accept',
          text: 'Gulumseyip tesekkuru kabul et',
          effect: { charisma: 2, familyRelation: 2, energy: -2 },
          feedback: 'Insanlarin guveni etrafinda sessiz bir guce donustu.',
          momentumTag: 'HELPFUL',
          choiceType: 'PASSIVE',
        },
        {
          id: 'helpful_street_thanks_redirect',
          text: 'Destege ihtiyaci olan baska birini yonlendir',
          effect: { charisma: 1, discipline: 1, familyRelation: 3, energy: -3 },
          feedback: 'Iyilik zinciri seninle buyumeye devam etti.',
          momentumTag: 'HELPFUL',
          choiceType: 'CHALLENGE',
        },
      ],
    },
    {
      id: 'evt_momentum_helpful_unexpected_support',
      text: 'Gecmiste yardim ettigin bir tanidik, dar bir anda sana beklenmedik bir destek sunuyor.',
      minAge: 8,
      maxAge: 100,
      rarity: 'UNCOMMON',
      isRepeatable: true,
      personalityCategory: 'GROWTH',
      tags: ['momentum', 'helpful', 'unique'],
      choices: [
        {
          id: 'helpful_support_accept',
          text: 'Destegi kabul edip tesekkur et',
          effect: { money: 45, charisma: 2, familyRelation: 1 },
          feedback: 'Dunya bazen verdigin seyin fazlasiyla geri dondugu bir yer.',
          momentumTag: 'HELPFUL',
          choiceType: 'PASSIVE',
        },
        {
          id: 'helpful_support_share',
          text: 'Destegin bir kismini baska birine aktar',
          effect: { money: 20, charisma: 3, familyRelation: 3 },
          feedback: 'Paylastikca agin buyudu ve ismin guvenle anildi.',
          momentumTag: 'HELPFUL',
          choiceType: 'CHALLENGE',
        },
      ],
    },
  ],
  PRAGMATIC: [
    {
      id: 'evt_momentum_pragmatic_short_offer',
      text: 'Planli ve tutarli tavrin dikkat cekmis. Mahalleden biri sana kisa sureli ama iyi odemeli bir is teklif ediyor.',
      minAge: 10,
      maxAge: 100,
      rarity: 'UNCOMMON',
      isRepeatable: true,
      personalityCategory: 'GROWTH',
      tags: ['momentum', 'pragmatic', 'unique'],
      choices: [
        {
          id: 'pragmatic_offer_accept',
          text: 'Teklifi kabul et ve net bir plan cikar',
          effect: { money: 70, discipline: 2, intelligence: 1, energy: -8 },
          feedback: 'Hizli hesap yaptin, riski yonettin ve kazancin artti.',
          momentumTag: 'PRAGMATIC',
          choiceType: 'PASSIVE',
        },
        {
          id: 'pragmatic_offer_negotiate',
          text: 'Sartlari pazarlikla iyilestir',
          effect: { money: 95, discipline: 1, charisma: 1, energy: -12 },
          feedback: 'Detaylari okuyup avantaji lehine cevirdin.',
          momentumTag: 'PRAGMATIC',
          choiceType: 'CHALLENGE',
        },
      ],
    },
    {
      id: 'evt_momentum_pragmatic_information_edge',
      text: 'Onceden yaptigin sistemli notlar sayesinde herkesten once kritik bir firsati fark ettin.',
      minAge: 11,
      maxAge: 100,
      rarity: 'UNCOMMON',
      isRepeatable: true,
      personalityCategory: 'RISK',
      tags: ['momentum', 'pragmatic', 'unique'],
      choices: [
        {
          id: 'pragmatic_info_calm',
          text: 'Sogukkanli davran ve kontrollu ilerle',
          effect: { intelligence: 3, discipline: 2, money: 35, energy: -6 },
          feedback: 'Dogru bilgi, dogru zamanda seni bir adim one tasidi.',
          momentumTag: 'PRAGMATIC',
          choiceType: 'PASSIVE',
        },
        {
          id: 'pragmatic_info_press',
          text: 'Agresif bir zamanlama ile hamleyi hizlandir',
          effect: { money: 60, intelligence: 1, energy: -10, familyRelation: -1 },
          feedback: 'Dakik karar kar getirdi ama tempoyu sertlestirdi.',
          momentumTag: 'PRAGMATIC',
          choiceType: 'CHALLENGE',
        },
      ],
    },
  ],
  AGGRESSIVE: [
    {
      id: 'evt_momentum_aggressive_reputation',
      text: 'Mahallede sert ve net durusun dilden dile yayilmis. Bazi insanlar geri adim atiyor, bazi kapilar ise aniden aciliyor.',
      minAge: 10,
      maxAge: 100,
      rarity: 'UNCOMMON',
      isRepeatable: true,
      personalityCategory: 'CONFLICT',
      tags: ['momentum', 'aggressive', 'unique'],
      choices: [
        {
          id: 'aggressive_reputation_control',
          text: 'Gucu kontrol edip sinirlarini net ciz',
          effect: { discipline: 2, health: 2, charisma: 1, energy: -7 },
          feedback: 'Korku degil saygi uyandiran bir cizgi yakaladin.',
          momentumTag: 'AGGRESSIVE',
          choiceType: 'PASSIVE',
        },
        {
          id: 'aggressive_reputation_push',
          text: 'Baskiyi artirip daha sert bir tavir al',
          effect: { health: 3, discipline: 1, familyRelation: -3, energy: -10 },
          feedback: 'Etkin artti ama iliskilerde catlaklar buyudu.',
          momentumTag: 'AGGRESSIVE',
          choiceType: 'CHALLENGE',
        },
      ],
    },
  ],
};

interface PersonalityGateInput {
  personalityState: Partial<PersonalityState> | undefined;
  context: EventContext;
  recentEventIds: string[] | Set<string>;
  allSeenEvents: string[] | Set<string>;
  threshold?: number;
  randomFn?: () => number;
}

const pickWeightedEvent = (
  candidates: { event: GameEvent; weight: number }[],
  randomFn: () => number
): GameEvent | null => {
  if (candidates.length === 0) return null;
  const totalWeight = candidates.reduce((sum, candidate) => sum + candidate.weight, 0);
  if (totalWeight <= 0) return null;

  let roll = randomFn() * totalWeight;
  for (const candidate of candidates) {
    roll -= candidate.weight;
    if (roll <= 0) return candidate.event;
  }

  return candidates[candidates.length - 1].event;
};

const clamp = (value: number, min: number, max: number): number => (
  Math.min(Math.max(value, min), max)
);

export const getHighMomentumTendencies = (
  personalityState: Partial<PersonalityState> | undefined,
  threshold: number = PERSONALITY_GATE_THRESHOLD
): PersonalityTendency[] => {
  const normalized = normalizePersonalityState(personalityState);
  return TENDENCIES.filter(tendency => normalized[tendency].multiplier >= threshold);
};

export const selectMomentumGateEvent = ({
  personalityState,
  context,
  recentEventIds,
  allSeenEvents,
  threshold = PERSONALITY_GATE_THRESHOLD,
  randomFn = Math.random,
}: PersonalityGateInput): GameEvent | null => {
  const normalized = normalizePersonalityState(personalityState);
  const unlocked = getHighMomentumTendencies(normalized, threshold);
  if (unlocked.length === 0) return null;

  const strongestMultiplier = unlocked.reduce((max, tendency) => {
    return Math.max(max, normalized[tendency].multiplier);
  }, threshold);
  const gateChance = clamp(0.3 + (strongestMultiplier - threshold) * 0.9, 0.3, 0.8);
  if (randomFn() > gateChance) return null;

  const candidates: { event: GameEvent; weight: number }[] = [];

  unlocked.forEach(tendency => {
    const entry = normalized[tendency];
    const tendencyWeight = Math.max(1, Math.round((entry.multiplier - 1) * 100) + entry.streak);

    MOMENTUM_EVENTS[tendency].forEach(event => {
      if (!isEventEligible(event, context, recentEventIds, allSeenEvents)) return;
      candidates.push({
        event,
        weight: tendencyWeight,
      });
    });
  });

  return pickWeightedEvent(candidates, randomFn);
};

export const MOMENTUM_EVENT_POOL = MOMENTUM_EVENTS;
