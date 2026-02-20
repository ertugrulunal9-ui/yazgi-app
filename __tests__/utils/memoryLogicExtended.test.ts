import {
  analyzeMemories,
  buildLifeReflection,
  buildMemoryAwareEventText,
  getRandomMemoryText,
} from '../../src/utils/memoryLogic';
import { EventMemory, Personality } from '../../src/types';

const basePersonality: Personality = {
  openness: 50,
  courage: 50,
  empathy: 50,
  patience: 50,
  conformity: 50,
};

const hashSeedLikeSource = (value: string): number => {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
};

const stableRoll = (eventId: string, turn: number, age: number) =>
  hashSeedLikeSource(`${eventId}:${turn}:${age}`) % 100;

const findEventIdForRoll = (
  predicate: (roll: number) => boolean,
  turn: number,
  age: number
): string => {
  for (let i = 0; i < 5000; i += 1) {
    const candidate = `evt_${i}`;
    if (predicate(stableRoll(candidate, turn, age))) {
      return candidate;
    }
  }
  throw new Error('No event id found for stable roll predicate');
};

const makeMemory = (overrides?: Partial<EventMemory>): EventMemory => ({
  id: 'mem',
  eventId: 'evt_a',
  choiceId: 'choice',
  age: 10,
  emotion: 'PRIDE',
  weight: 'MEDIUM',
  turnTimestamp: 10,
  ...overrides,
});

describe('memoryLogic extended', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('analyzes memory scores with weighted positive/negative emotions', () => {
    const result = analyzeMemories([
      makeMemory({ emotion: 'REGRET', weight: 'HIGH' }),
      makeMemory({ id: 'm2', emotion: 'GUILT', weight: 'LOW' }),
      makeMemory({ id: 'm3', emotion: 'PRIDE', weight: 'MEDIUM' }),
      makeMemory({ id: 'm4', emotion: 'SATISFACTION', weight: 'HIGH' }),
      makeMemory({ id: 'm5', emotion: 'NEUTRAL', weight: 'HIGH' }),
    ]);

    expect(result.regretScore).toBe(4);
    expect(result.prideScore).toBe(5);
    expect(result.totalMemories).toBe(5);
  });

  it('returns memory text for wallet event negative/positive branches and empty pool', () => {
    const walletMemories = [
      makeMemory({ id: 'n1', eventId: 'found_wallet', emotion: 'REGRET' }),
      makeMemory({ id: 'p1', eventId: 'found_wallet', emotion: 'SATISFACTION' }),
    ];

    jest.spyOn(Math, 'random').mockReturnValue(0);
    const negative = getRandomMemoryText(walletMemories, 'NEGATIVE');
    expect(negative).toContain('cuzdan');

    const positive = getRandomMemoryText(walletMemories, 'POSITIVE');
    expect(positive).toContain('teslim');

    const noTarget = getRandomMemoryText([makeMemory({ emotion: 'NEUTRAL' })], 'POSITIVE');
    expect(noTarget).toBe('');
  });

  it('returns generic memory text with timing calculation', () => {
    const memories = [
      makeMemory({ id: 'a', eventId: 'evt_old', age: 12, emotion: 'PRIDE', turnTimestamp: 10 }),
      makeMemory({ id: 'b', eventId: 'evt_latest', age: 16, emotion: 'PRIDE', turnTimestamp: 50 }),
    ];

    jest.spyOn(Math, 'random').mockReturnValue(0);
    const generic = getRandomMemoryText(memories, 'POSITIVE');
    expect(generic).toContain('4 yil once');
  });

  it('returns base text for short/empty/reference/unstable scenarios', () => {
    const memories = [
      makeMemory({ id: 'm1', emotion: 'PRIDE', weight: 'HIGH' }),
      makeMemory({ id: 'm2', emotion: 'REGRET', weight: 'LOW' }),
    ];

    expect(buildMemoryAwareEventText('', memories, { eventId: 'evt', currentAge: 15, currentTurn: 1 })).toBe('');
    expect(
      buildMemoryAwareEventText('Base', memories.slice(0, 1), { eventId: 'evt', currentAge: 15, currentTurn: 1 })
    ).toBe('Base');
    expect(
      buildMemoryAwareEventText('Bu bir hafiza metni', memories, { eventId: 'evt', currentAge: 15, currentTurn: 1 })
    ).toBe('Bu bir hafiza metni');

    const highRollEvent = findEventIdForRoll(roll => roll > 44, 11, 17);
    const highRollResult = buildMemoryAwareEventText('Base high roll', memories, {
      eventId: highRollEvent,
      currentAge: 17,
      currentTurn: 11,
      personalityCategory: 'MIXED',
    });
    expect(highRollResult).toBe('Base high roll');
  });

  it('returns base text when preferred memory pool is empty', () => {
    const memories = [
      makeMemory({ id: 'm1', emotion: 'REGRET' }),
      makeMemory({ id: 'm2', emotion: 'GUILT' }),
    ];
    const lowRollEvent = findEventIdForRoll(roll => roll <= 44, 9, 16);
    const result = buildMemoryAwareEventText('Social base', memories, {
      eventId: lowRollEvent,
      currentAge: 16,
      currentTurn: 9,
      personalityCategory: 'SOCIAL',
    });
    expect(result).toBe('Social base');
  });

  it('appends deterministic emotion lines for multiple emotion branches', () => {
    const lowRollEvent = findEventIdForRoll(roll => roll <= 44, 7, 14);
    const neutralTail = makeMemory({ id: 'tail', emotion: 'NEUTRAL', age: 9, turnTimestamp: 2 });

    const regretText = buildMemoryAwareEventText(
      'Base regret',
      [makeMemory({ id: 'r', emotion: 'REGRET', weight: 'HIGH', age: 14, turnTimestamp: 20 }), neutralTail],
      { eventId: lowRollEvent, currentAge: 14, currentTurn: 7, personalityCategory: 'MIXED' }
    );
    expect(regretText).toContain('Az once');

    const guiltText = buildMemoryAwareEventText(
      'Base guilt',
      [makeMemory({ id: 'g', emotion: 'GUILT', weight: 'HIGH', age: 13, turnTimestamp: 21 }), neutralTail],
      { eventId: lowRollEvent, currentAge: 14, currentTurn: 7, personalityCategory: 'MIXED' }
    );
    expect(guiltText).toContain('yasinda');

    const prideText = buildMemoryAwareEventText(
      'Base pride',
      [makeMemory({ id: 'p', emotion: 'PRIDE', weight: 'HIGH', age: 11, turnTimestamp: 25 }), neutralTail],
      { eventId: lowRollEvent, currentAge: 14, currentTurn: 7, personalityCategory: 'MIXED' }
    );
    expect(prideText).toContain('omurg');

    const satisfactionText = buildMemoryAwareEventText(
      'Base sat',
      [makeMemory({ id: 's', emotion: 'SATISFACTION', weight: 'HIGH', age: 10, turnTimestamp: 26 }), neutralTail],
      { eventId: lowRollEvent, currentAge: 14, currentTurn: 7, personalityCategory: 'MIXED' }
    );
    expect(satisfactionText).toContain('sakin');

    const unknownEmotionText = buildMemoryAwareEventText(
      'Base other',
      [
        makeMemory({
          id: 'u',
          emotion: 'UNKNOWN' as EventMemory['emotion'],
          weight: 'HIGH',
          age: 8,
          turnTimestamp: 27,
        }),
        neutralTail,
      ],
      { eventId: lowRollEvent, currentAge: 14, currentTurn: 7, personalityCategory: 'MIXED' }
    );
    expect(unknownEmotionText).toContain('kisa bir iz');
  });

  it('builds life reflection with mixed/pride/regret dominant themes', () => {
    const prideMemories = [
      makeMemory({ id: 'p1', emotion: 'PRIDE', weight: 'HIGH', age: 8 }),
      makeMemory({ id: 'p2', emotion: 'SATISFACTION', weight: 'HIGH', age: 10 }),
      makeMemory({ id: 'p3', emotion: 'REGRET', weight: 'LOW', age: 12 }),
    ];
    const prideReflection = buildLifeReflection(prideMemories, { ...basePersonality, courage: 80 });
    expect(prideReflection.dominantTheme).toBe('PRIDE_PATH');
    expect(prideReflection.keyDecisions.length).toBe(3);
    expect(prideReflection.summaryNarrative).toContain('Cesaret');

    const regretMemories = [
      makeMemory({ id: 'r1', emotion: 'REGRET', weight: 'HIGH', age: 7 }),
      makeMemory({ id: 'r2', emotion: 'GUILT', weight: 'HIGH', age: 9 }),
      makeMemory({ id: 'r3', emotion: 'PRIDE', weight: 'LOW', age: 14 }),
    ];
    const regretReflection = buildLifeReflection(regretMemories, { ...basePersonality, empathy: 80 });
    expect(regretReflection.dominantTheme).toBe('REGRET_PATH');
    expect(regretReflection.summaryNarrative.length).toBeGreaterThan(20);

    const mixedMemories = [
      makeMemory({ id: 'm1', emotion: 'PRIDE', weight: 'MEDIUM', age: 6 }),
      makeMemory({ id: 'm2', emotion: 'REGRET', weight: 'MEDIUM', age: 16 }),
      makeMemory({ id: 'm3', emotion: 'NEUTRAL', weight: 'HIGH', age: 20 }),
    ];
    const mixedReflection = buildLifeReflection(mixedMemories, { ...basePersonality, openness: 70 });
    expect(mixedReflection.dominantTheme).toBe('MIXED_PATH');
    expect(mixedReflection.keyDecisions.every(item => item.emotion !== 'NEUTRAL')).toBe(true);
  });

  it('limits key decisions to seven items and keeps chronological order', () => {
    const manyMemories = Array.from({ length: 10 }).map((_, index) =>
      makeMemory({
        id: `m_${index}`,
        eventId: `evt_${index}`,
        age: 10 - index,
        emotion: index % 2 === 0 ? 'PRIDE' : 'REGRET',
        weight: index < 7 ? 'HIGH' : 'LOW',
        turnTimestamp: index,
      })
    );

    const reflection = buildLifeReflection(manyMemories, basePersonality);
    expect(reflection.keyDecisions).toHaveLength(7);
    const ages = reflection.keyDecisions.map(item => item.age);
    const sortedAges = [...ages].sort((a, b) => a - b);
    expect(ages).toEqual(sortedAges);
  });
});
