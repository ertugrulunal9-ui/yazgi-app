import { trackSpecialProgress } from '@/utils/achievementChecker';
import { Stats, GameState, SchoolGrades } from '@/types';

// Mock achievementSystem
jest.mock('@/systems/achievementSystem', () => ({
  checkAllAchievements: jest.fn().mockResolvedValue([]),
}));

// Mock analytics
jest.mock('@/services/analytics', () => require('../mocks/Firebase.mock'));

function createMockStats(overrides: Partial<Stats> = {}): Stats {
  return {
    health: 50, intelligence: 50, charisma: 50,
    discipline: 50, money: 1000, energy: 80, familyRelation: 50,
    ...overrides,
  };
}

function createMockGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 15,
    turn: 30,
    traits: [],
    npcs: [],
    schoolGrades: { math: 70, science: 70, language: 70, turkish: 70, history: 70, geography: 70, art: 70, music: 70 },
    achievementProgress: {},
    unlockedAchievements: [],
    ...overrides,
  } as GameState;
}

describe('trackSpecialProgress', () => {
  it('initializes achievementProgress if missing', () => {
    const gameState = createMockGameState();
    delete (gameState as any).achievementProgress;

    const result = trackSpecialProgress(gameState, createMockStats());
    expect(result.achievementProgress).toBeDefined();
  });

  it('tracks survivor achievement (health recovery)', () => {
    const prevStats = createMockStats({ health: 8 });
    const currentStats = createMockStats({ health: 55 });
    const gameState = createMockGameState();

    const result = trackSpecialProgress(gameState, currentStats, prevStats);
    expect(result.achievementProgress['survivor']).toBe(1);
  });

  it('does not track survivor when health did not drop below 10', () => {
    const prevStats = createMockStats({ health: 15 });
    const currentStats = createMockStats({ health: 55 });
    const gameState = createMockGameState();

    const result = trackSpecialProgress(gameState, currentStats, prevStats);
    expect(result.achievementProgress['survivor']).toBeUndefined();
  });

  it('tracks broke_to_rich achievement', () => {
    const prevStats = createMockStats({ money: 0 });
    const currentStats = createMockStats({ money: 60000 });
    const gameState = createMockGameState();

    const result = trackSpecialProgress(gameState, currentStats, prevStats);
    expect(result.achievementProgress['broke_to_rich']).toBe(1);
  });

  it('does not track broke_to_rich when not starting from 0', () => {
    const prevStats = createMockStats({ money: 100 });
    const currentStats = createMockStats({ money: 60000 });
    const gameState = createMockGameState();

    const result = trackSpecialProgress(gameState, currentStats, prevStats);
    expect(result.achievementProgress['broke_to_rich']).toBeUndefined();
  });

  it('tracks comeback_kid for high grades', () => {
    const prevStats = createMockStats();
    const currentStats = createMockStats();
    const gameState = createMockGameState({
      schoolGrades: { math: 95, science: 70, language: 70, turkish: 70, history: 70, geography: 70, art: 70, music: 70 },
    });

    const result = trackSpecialProgress(gameState, currentStats, prevStats);
    expect(result.achievementProgress['comeback_kid']).toBe(1);
  });

  it('tracks spender progress cumulatively', () => {
    const prevStats = createMockStats({ money: 5000 });
    const currentStats = createMockStats({ money: 3000 });
    const gameState = createMockGameState({ achievementProgress: { spender: 1000 } });

    const result = trackSpecialProgress(gameState, currentStats, prevStats);
    expect(result.achievementProgress['spender']).toBe(3000); // 1000 + 2000
  });

  it('does not track spender when money increases', () => {
    const prevStats = createMockStats({ money: 1000 });
    const currentStats = createMockStats({ money: 2000 });
    const gameState = createMockGameState();

    const result = trackSpecialProgress(gameState, currentStats, prevStats);
    expect(result.achievementProgress['spender']).toBeUndefined();
  });

  it('tracks heartbreaker for partner NPCs', () => {
    const prevStats = createMockStats();
    const currentStats = createMockStats();
    const gameState = createMockGameState({
      npcs: [{ id: 'npc1', role: 'PARTNER' } as any],
    });

    const result = trackSpecialProgress(gameState, currentStats, prevStats);
    expect(result.achievementProgress['heartbreaker']).toBe(1);
  });

  it('handles no prevStats gracefully (no tracking)', () => {
    const currentStats = createMockStats();
    const gameState = createMockGameState();

    const result = trackSpecialProgress(gameState, currentStats);
    // No prevStats means no comparison-based tracking
    expect(result.achievementProgress['survivor']).toBeUndefined();
    expect(result.achievementProgress['broke_to_rich']).toBeUndefined();
  });
});
