import { EventContext, GameEvent, PersonalityState, PersonalityTendency } from '../types';
import { HIGH_MOMENTUM_THRESHOLD, normalizePersonalityState } from '../systems/PersonalityMomentumEngine';
import { isEventEligible } from '../utils/eventSelection';
import { withEventLocalizationKeysForAll } from '../i18n/events/keyMapper';

export const PERSONALITY_GATE_THRESHOLD = HIGH_MOMENTUM_THRESHOLD;

const TENDENCIES: PersonalityTendency[] = ['HELPFUL', 'PRAGMATIC', 'AGGRESSIVE'];

const MOMENTUM_EVENTS: Record<PersonalityTendency, GameEvent[]> = {
  HELPFUL: [
    {
      id: 'evt_momentum_helpful_street_thanks',
      text: 'Sokakta daha önce destek olduğun biri seni görüp durduruyor: "İyi ki yardım etmiştin, şimdi ben ayaktayım."',
      minAge: 7,
      maxAge: 100,
      rarity: 'UNCOMMON',
      isRepeatable: true,
      personalityCategory: 'SOCIAL',
      tags: ['momentum', 'helpful', 'unique'],
      choices: [
        {
          id: 'helpful_street_thanks_accept',
          text: 'Gülümseyip teşekkürü kabul et',
          effect: { charisma: 2, familyRelation: 2, energy: -2 },
          feedback: 'İnsanların güveni etrafında sessiz bir güce dönüştü.',
          momentumTag: 'HELPFUL',
          choiceType: 'PASSIVE',
        },
        {
          id: 'helpful_street_thanks_redirect',
          text: 'Desteğe ihtiyacı olan başka birini yönlendir',
          effect: { charisma: 1, discipline: 1, familyRelation: 3, energy: -3 },
          feedback: 'İyilik zinciri seninle büyümeye devam etti.',
          momentumTag: 'HELPFUL',
          choiceType: 'CHALLENGE',
        },
      ],
    },
    {
      id: 'evt_momentum_helpful_unexpected_support',
      text: 'Geçmişte yardım ettiğin bir tanıdık, dar bir anda sana beklenmedik bir destek sunuyor.',
      minAge: 8,
      maxAge: 100,
      rarity: 'UNCOMMON',
      isRepeatable: true,
      personalityCategory: 'GROWTH',
      tags: ['momentum', 'helpful', 'unique'],
      choices: [
        {
          id: 'helpful_support_accept',
          text: 'Desteği kabul edip teşekkür et',
          effect: { money: 45, charisma: 2, familyRelation: 1 },
          feedback: 'Dünya bazen verdiğin şeyin fazlasıyla geri döndüğü bir yer.',
          momentumTag: 'HELPFUL',
          choiceType: 'PASSIVE',
        },
        {
          id: 'helpful_support_share',
          text: 'Desteğin bir kısmını başka birine aktar',
          effect: { money: 20, charisma: 3, familyRelation: 3 },
          feedback: 'Paylaştıkça ağın büyüdü ve ismin güvenle anıldı.',
          momentumTag: 'HELPFUL',
          choiceType: 'CHALLENGE',
        },
      ],
    },
  ],
  PRAGMATIC: [
    {
      id: 'evt_momentum_pragmatic_short_offer',
      text: 'Planlı ve tutarlı tavrın dikkat çekmiş. Mahalleden biri sana kısa süreli ama iyi ödemeli bir iş teklif ediyor.',
      minAge: 10,
      maxAge: 100,
      rarity: 'UNCOMMON',
      isRepeatable: true,
      personalityCategory: 'GROWTH',
      tags: ['momentum', 'pragmatic', 'unique'],
      choices: [
        {
          id: 'pragmatic_offer_accept',
          text: 'Teklifi kabul et ve net bir plan çıkar',
          effect: { money: 70, discipline: 2, intelligence: 1, energy: -8 },
          feedback: 'Hızlı hesap yaptın, riski yönettin ve kazancın arttı.',
          momentumTag: 'PRAGMATIC',
          choiceType: 'PASSIVE',
        },
        {
          id: 'pragmatic_offer_negotiate',
          text: 'Şartları pazarlıkla iyileştir',
          effect: { money: 95, discipline: 1, charisma: 1, energy: -12 },
          feedback: 'Detayları okuyup avantajı lehine çevirdin.',
          momentumTag: 'PRAGMATIC',
          choiceType: 'CHALLENGE',
        },
      ],
    },
    {
      id: 'evt_momentum_pragmatic_information_edge',
      text: 'Önceden yaptığın sistemli notlar sayesinde herkesten önce kritik bir fırsatı fark ettin.',
      minAge: 11,
      maxAge: 100,
      rarity: 'UNCOMMON',
      isRepeatable: true,
      personalityCategory: 'RISK',
      tags: ['momentum', 'pragmatic', 'unique'],
      choices: [
        {
          id: 'pragmatic_info_calm',
          text: 'Soğukkanlı davran ve kontrollü ilerle',
          effect: { intelligence: 3, discipline: 2, money: 35, energy: -6 },
          feedback: 'Doğru bilgi, doğru zamanda seni bir adım öne taşıdı.',
          momentumTag: 'PRAGMATIC',
          choiceType: 'PASSIVE',
        },
        {
          id: 'pragmatic_info_press',
          text: 'Agresif bir zamanlama ile hamleyi hızlandır',
          effect: { money: 60, intelligence: 1, energy: -10, familyRelation: -1 },
          feedback: 'Dakik karar kâr getirdi ama tempoyu sertleştirdi.',
          momentumTag: 'PRAGMATIC',
          choiceType: 'CHALLENGE',
        },
      ],
    },
  ],
  AGGRESSIVE: [
    {
      id: 'evt_momentum_aggressive_reputation',
      text: 'Mahallede sert ve net duruşun dilden dile yayılmış. Bazı insanlar geri adım atıyor, bazı kapılar ise aniden açılıyor.',
      minAge: 10,
      maxAge: 100,
      rarity: 'UNCOMMON',
      isRepeatable: true,
      personalityCategory: 'CONFLICT',
      tags: ['momentum', 'aggressive', 'unique'],
      choices: [
        {
          id: 'aggressive_reputation_control',
          text: 'Gücü kontrol edip sınırlarını net çiz',
          effect: { discipline: 2, health: 2, charisma: 1, energy: -7 },
          feedback: 'Korku değil saygı uyandıran bir çizgi yakaladın.',
          momentumTag: 'AGGRESSIVE',
          choiceType: 'PASSIVE',
        },
        {
          id: 'aggressive_reputation_push',
          text: 'Baskıyı artırıp daha sert bir tavır al',
          effect: { health: 3, discipline: 1, familyRelation: -3, energy: -10 },
          feedback: 'Etkin arttı ama ilişkilerde çatlaklar büyüdü.',
          momentumTag: 'AGGRESSIVE',
          choiceType: 'CHALLENGE',
        },
      ],
    },
  ],
};

const LOCALIZED_MOMENTUM_EVENTS: Record<PersonalityTendency, GameEvent[]> = {
  HELPFUL: withEventLocalizationKeysForAll(MOMENTUM_EVENTS.HELPFUL),
  PRAGMATIC: withEventLocalizationKeysForAll(MOMENTUM_EVENTS.PRAGMATIC),
  AGGRESSIVE: withEventLocalizationKeysForAll(MOMENTUM_EVENTS.AGGRESSIVE),
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

    LOCALIZED_MOMENTUM_EVENTS[tendency].forEach(event => {
      if (!isEventEligible(event, context, recentEventIds, allSeenEvents)) return;
      candidates.push({
        event,
        weight: tendencyWeight,
      });
    });
  });

  return pickWeightedEvent(candidates, randomFn);
};

export const MOMENTUM_EVENT_POOL = LOCALIZED_MOMENTUM_EVENTS;
