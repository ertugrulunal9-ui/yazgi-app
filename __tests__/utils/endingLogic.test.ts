import { determineEnding, getKeyMemories } from '@/utils/endingLogic';
import { GameState, Stats, EventMemory } from '@/types';

function createMockStats(overrides: Partial<Stats> = {}): Stats {
  return {
    health: 50, intelligence: 50, charisma: 50,
    discipline: 50, money: 1000, energy: 80, familyRelation: 50,
    ...overrides,
  };
}

function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 18,
    turn: 100,
    traits: [],
    ...overrides,
  } as GameState;
}

// ==========================================
// determineEnding
// ==========================================

describe('determineEnding', () => {
  it('returns ivy_league ending for high intelligence + DISCIPLINED trait', () => {
    const stats = createMockStats({ intelligence: 95 });
    const gameState = createMockGameState({ traits: ['DISCIPLINED'] });
    const ending = determineEnding(gameState, stats);

    expect(ending.id).toBe('ivy_league');
    expect(ending.title).toBeTruthy();
    expect(ending.description).toBeTruthy();
  });

  it('returns crime_lord ending for REBELLIOUS + CHEATER', () => {
    const stats = createMockStats({ intelligence: 30 });
    const gameState = createMockGameState({ traits: ['REBELLIOUS', 'CHEATER'] });
    const ending = determineEnding(gameState, stats);

    expect(ending.id).toBe('crime_lord');
  });

  it('returns social_star ending for high charisma', () => {
    const stats = createMockStats({ charisma: 85 });
    const gameState = createMockGameState({ traits: [] });
    const ending = determineEnding(gameState, stats);

    expect(ending.id).toBe('social_star');
  });

  it('returns social_star ending for SOCIAL_BUTTERFLY trait', () => {
    const stats = createMockStats();
    const gameState = createMockGameState({ traits: ['SOCIAL_BUTTERFLY'] });
    const ending = determineEnding(gameState, stats);

    expect(ending.id).toBe('social_star');
  });

  it('returns average_joe as fallback', () => {
    const stats = createMockStats({ intelligence: 40, charisma: 40 });
    const gameState = createMockGameState({ traits: [] });
    const ending = determineEnding(gameState, stats);

    expect(ending.id).toBe('average_joe');
  });

  it('higher priority endings take precedence', () => {
    // If someone qualifies for both ivy_league and social_star, ivy_league wins
    const stats = createMockStats({ intelligence: 95, charisma: 85 });
    const gameState = createMockGameState({ traits: ['DISCIPLINED'] });
    const ending = determineEnding(gameState, stats);

    expect(ending.id).toBe('ivy_league');
  });

  it('always returns a valid ending (never undefined)', () => {
    const ending = determineEnding(createMockGameState(), createMockStats());
    expect(ending).toBeDefined();
    expect(ending.id).toBeTruthy();
    expect(ending.title).toBeTruthy();
    expect(ending.description).toBeTruthy();
    expect(typeof ending.priority).toBe('number');
  });
});

// ==========================================
// getKeyMemories
// ==========================================

describe('getKeyMemories', () => {
  function createMemory(overrides: Partial<EventMemory> = {}): EventMemory {
    return {
      id: `mem_${Math.random()}`,
      eventId: 'evt_1',
      choiceId: 'ch_1',
      age: 12,
      emotion: 'NEUTRAL',
      weight: 'LOW',
      turnTimestamp: 10,
      ...overrides,
    };
  }

  it('returns at most 3 memories', () => {
    const memories = [
      createMemory({ weight: 'HIGH', turnTimestamp: 1 }),
      createMemory({ weight: 'HIGH', turnTimestamp: 2 }),
      createMemory({ weight: 'HIGH', turnTimestamp: 3 }),
      createMemory({ weight: 'HIGH', turnTimestamp: 4 }),
    ];
    const result = getKeyMemories(memories);
    expect(result.length).toBe(3);
  });

  it('returns empty array for no memories', () => {
    expect(getKeyMemories([])).toEqual([]);
  });

  it('prioritizes HIGH weight memories', () => {
    const memories = [
      createMemory({ weight: 'LOW', turnTimestamp: 100 }),
      createMemory({ weight: 'HIGH', turnTimestamp: 1 }),
      createMemory({ weight: 'MEDIUM', turnTimestamp: 50 }),
    ];
    const result = getKeyMemories(memories);

    expect(result[0].weight).toBe('HIGH');
    expect(result[1].weight).toBe('MEDIUM');
    expect(result[2].weight).toBe('LOW');
  });

  it('breaks weight ties by most recent timestamp', () => {
    const memories = [
      createMemory({ weight: 'HIGH', turnTimestamp: 10 }),
      createMemory({ weight: 'HIGH', turnTimestamp: 50 }),
      createMemory({ weight: 'HIGH', turnTimestamp: 30 }),
    ];
    const result = getKeyMemories(memories);

    expect(result[0].turnTimestamp).toBe(50);
    expect(result[1].turnTimestamp).toBe(30);
    expect(result[2].turnTimestamp).toBe(10);
  });

  it('handles memories with different emotions', () => {
    const memories = [
      createMemory({ emotion: 'PRIDE', weight: 'HIGH', turnTimestamp: 1 }),
      createMemory({ emotion: 'REGRET', weight: 'MEDIUM', turnTimestamp: 2 }),
      createMemory({ emotion: 'GUILT', weight: 'LOW', turnTimestamp: 3 }),
    ];
    const result = getKeyMemories(memories);
    expect(result.length).toBe(3);
  });

  it('returns fewer than 3 when fewer exist', () => {
    const memories = [createMemory()];
    const result = getKeyMemories(memories);
    expect(result.length).toBe(1);
  });
});
