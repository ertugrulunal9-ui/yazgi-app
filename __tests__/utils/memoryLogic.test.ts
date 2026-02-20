import { buildMemoryAwareEventText } from '../../src/utils/memoryLogic';
import { EventMemory } from '../../src/types';

const memories: EventMemory[] = [
  {
    id: 'm1',
    eventId: 'evt_1',
    choiceId: 'c1',
    age: 12,
    emotion: 'REGRET',
    weight: 'HIGH',
    turnTimestamp: 22,
  },
  {
    id: 'm2',
    eventId: 'evt_2',
    choiceId: 'c1',
    age: 13,
    emotion: 'PRIDE',
    weight: 'MEDIUM',
    turnTimestamp: 28,
  },
  {
    id: 'm3',
    eventId: 'evt_3',
    choiceId: 'c1',
    age: 14,
    emotion: 'SATISFACTION',
    weight: 'LOW',
    turnTimestamp: 30,
  },
];

describe('buildMemoryAwareEventText', () => {
  it('returns base text when memory count is too low', () => {
    const result = buildMemoryAwareEventText('Base metin', memories.slice(0, 1), {
      eventId: 'evt_test',
      currentAge: 15,
      currentTurn: 31,
      personalityCategory: 'SOCIAL',
    });

    expect(result).toBe('Base metin');
  });

  it('does not append when base text already references memory', () => {
    const result = buildMemoryAwareEventText('Bu aniyi zaten hatirliyorsun.', memories, {
      eventId: 'evt_test',
      currentAge: 15,
      currentTurn: 31,
      personalityCategory: 'MORAL',
    });

    expect(result).toBe('Bu aniyi zaten hatirliyorsun.');
  });

  it('is deterministic for same event/turn input', () => {
    const first = buildMemoryAwareEventText('Karar anindasin.', memories, {
      eventId: 'evt_same_seed',
      currentAge: 15,
      currentTurn: 40,
      personalityCategory: 'BREAKDOWN',
    });
    const second = buildMemoryAwareEventText('Karar anindasin.', memories, {
      eventId: 'evt_same_seed',
      currentAge: 15,
      currentTurn: 40,
      personalityCategory: 'BREAKDOWN',
    });

    expect(first).toBe(second);
  });
});

