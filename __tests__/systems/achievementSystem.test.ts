import {
  loadAchievements,
  saveAchievements,
  isAchievementUnlocked,
  unlockAchievement,
  checkAchievement,
  getAchievementProgress,
  applyAchievementReward,
  getAchievementStats,
  shareAchievement,
  resetAchievements,
} from '@/systems/achievementSystem';
import { Achievement, Stats, GameState, UnlockedAchievement } from '@/types';

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
    unlockedAchievements: [],
    achievementProgress: {},
    ...overrides,
  } as GameState;
}

function createMockAchievement(overrides: Partial<Achievement> = {}): Achievement {
  return {
    id: 'test_achievement',
    name: 'Test Achievement',
    description: 'A test achievement',
    category: 'STATS',
    rarity: 'COMMON',
    icon: '🏆',
    isSecret: false,
    reward: { money: 100 },
    check: () => true,
    ...overrides,
  };
}

// ==========================================
// Storage tests
// ==========================================

describe('loadAchievements / saveAchievements', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('loads empty array when no data exists', async () => {
    const result = await loadAchievements();
    expect(result).toEqual([]);
  });

  it('saves and loads achievements', async () => {
    const achievements: UnlockedAchievement[] = [
      { achievementId: 'a1', unlockedAt: 10, timestamp: '2024-01-01' },
    ];

    await saveAchievements(achievements);
    const loaded = await loadAchievements();

    expect(loaded).toEqual(achievements);
  });

  it('handles corrupted localStorage gracefully', async () => {
    localStorage.setItem('@yazgi/achievements/v1', 'not-json');
    // Should not throw
    await expect(loadAchievements()).resolves.toEqual([]);
  });
});

// ==========================================
// isAchievementUnlocked
// ==========================================

describe('isAchievementUnlocked', () => {
  const unlocked: UnlockedAchievement[] = [
    { achievementId: 'genius', unlockedAt: 15, timestamp: '2024-01-01' },
    { achievementId: 'survivor', unlockedAt: 12, timestamp: '2024-01-01' },
  ];

  it('returns true for unlocked achievement', () => {
    expect(isAchievementUnlocked('genius', unlocked)).toBe(true);
  });

  it('returns false for locked achievement', () => {
    expect(isAchievementUnlocked('nonexistent', unlocked)).toBe(false);
  });

  it('returns false for empty list', () => {
    expect(isAchievementUnlocked('genius', [])).toBe(false);
  });
});

// ==========================================
// unlockAchievement
// ==========================================

describe('unlockAchievement', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('unlocks a new achievement', async () => {
    const achievement = createMockAchievement();
    const gameState = createMockGameState();
    const result = await unlockAchievement(achievement, gameState, []);

    expect(result).not.toBeNull();
    expect(result!.unlocked.achievementId).toBe('test_achievement');
    expect(result!.unlocked.unlockedAt).toBe(15);
    expect(result!.reward).toEqual({ money: 100 });
  });

  it('returns null for already unlocked achievement', async () => {
    const achievement = createMockAchievement();
    const gameState = createMockGameState();
    const existing: UnlockedAchievement[] = [
      { achievementId: 'test_achievement', unlockedAt: 10, timestamp: '2024-01-01' },
    ];

    const result = await unlockAchievement(achievement, gameState, existing);
    expect(result).toBeNull();
  });

  it('calls floating text callback if provided', async () => {
    const showFloatingText = jest.fn();
    const achievement = createMockAchievement();
    const gameState = createMockGameState();

    await unlockAchievement(achievement, gameState, [], showFloatingText);
    expect(showFloatingText).toHaveBeenCalledTimes(1);
    expect(showFloatingText).toHaveBeenCalledWith(
      expect.stringContaining('Test Achievement'),
      expect.any(Number),
      expect.any(Number),
      '#fbbf24',
      expect.any(Object)
    );
  });
});

// ==========================================
// checkAchievement
// ==========================================

describe('checkAchievement', () => {
  it('returns true when check passes', () => {
    const achievement = createMockAchievement({ check: () => true });
    const result = checkAchievement(
      achievement,
      createMockStats(),
      createMockGameState(),
      {} as any,
      {} as any
    );
    expect(result).toBe(true);
  });

  it('returns false when check fails', () => {
    const achievement = createMockAchievement({ check: () => false });
    const result = checkAchievement(
      achievement,
      createMockStats(),
      createMockGameState(),
      {} as any,
      {} as any
    );
    expect(result).toBe(false);
  });

  it('returns progress object for progress-based achievements', () => {
    const achievement = createMockAchievement({
      check: () => ({ current: 5, target: 10 }),
    });
    const result = checkAchievement(
      achievement,
      createMockStats(),
      createMockGameState(),
      {} as any,
      {} as any
    );
    expect(result).toEqual({ current: 5, target: 10 });
  });

  it('returns false when check throws', () => {
    const achievement = createMockAchievement({
      check: () => { throw new Error('check error'); },
    });
    const result = checkAchievement(
      achievement,
      createMockStats(),
      createMockGameState(),
      {} as any,
      {} as any
    );
    expect(result).toBe(false);
  });
});

// ==========================================
// getAchievementProgress
// ==========================================

describe('getAchievementProgress', () => {
  it('returns 100 for completed boolean achievement', () => {
    const achievement = createMockAchievement({ check: () => true });
    const progress = getAchievementProgress(
      achievement, createMockStats(), createMockGameState(), {} as any, {} as any
    );
    expect(progress).toBe(100);
  });

  it('returns 0 for incomplete boolean achievement', () => {
    const achievement = createMockAchievement({ check: () => false });
    const progress = getAchievementProgress(
      achievement, createMockStats(), createMockGameState(), {} as any, {} as any
    );
    expect(progress).toBe(0);
  });

  it('returns percentage for progress-based achievement', () => {
    const achievement = createMockAchievement({
      check: () => ({ current: 7, target: 10 }),
    });
    const progress = getAchievementProgress(
      achievement, createMockStats(), createMockGameState(), {} as any, {} as any
    );
    expect(progress).toBe(70);
  });

  it('caps progress at 100%', () => {
    const achievement = createMockAchievement({
      check: () => ({ current: 15, target: 10 }),
    });
    const progress = getAchievementProgress(
      achievement, createMockStats(), createMockGameState(), {} as any, {} as any
    );
    expect(progress).toBe(100);
  });
});

// ==========================================
// applyAchievementReward
// ==========================================

describe('applyAchievementReward', () => {
  it('adds money reward', () => {
    const stats = createMockStats({ money: 500 });
    const result = applyAchievementReward(stats, { money: 200 });
    expect(result.money).toBe(700);
  });

  it('adds stat rewards', () => {
    const stats = createMockStats({ intelligence: 50 });
    const result = applyAchievementReward(stats, { stats: { intelligence: 10 } });
    expect(result.intelligence).toBe(60);
  });

  it('clamps stat rewards at 100', () => {
    const stats = createMockStats({ charisma: 95 });
    const result = applyAchievementReward(stats, { stats: { charisma: 10 } });
    expect(result.charisma).toBe(100);
  });

  it('clamps stat rewards at 0', () => {
    const stats = createMockStats({ health: 3 });
    const result = applyAchievementReward(stats, { stats: { health: -10 } });
    expect(result.health).toBe(0);
  });

  it('returns unchanged stats when reward is undefined', () => {
    const stats = createMockStats();
    const result = applyAchievementReward(stats, undefined as any);
    expect(result).toEqual(stats);
  });

  it('handles combined money + stat reward', () => {
    const stats = createMockStats({ money: 100, intelligence: 50 });
    const result = applyAchievementReward(stats, {
      money: 500,
      stats: { intelligence: 5 },
    });
    expect(result.money).toBe(600);
    expect(result.intelligence).toBe(55);
  });
});

// ==========================================
// getAchievementStats
// ==========================================

describe('getAchievementStats', () => {
  it('returns correct stats for unlocked achievements', () => {
    const unlocked: UnlockedAchievement[] = [
      { achievementId: 'genius', unlockedAt: 15, timestamp: '2024-01-01' },
    ];
    const result = getAchievementStats(unlocked);

    expect(result.unlocked).toBe(1);
    expect(result.total).toBeGreaterThan(0);
    expect(result.percentage).toBeGreaterThanOrEqual(0);
    expect(result.percentage).toBeLessThanOrEqual(100);
  });

  it('returns 0% for no unlocked achievements', () => {
    const result = getAchievementStats([]);
    expect(result.unlocked).toBe(0);
    expect(result.percentage).toBe(0);
  });
});

// ==========================================
// shareAchievement
// ==========================================

describe('shareAchievement', () => {
  it('returns a Twitter share URL', () => {
    const achievement = createMockAchievement({ name: 'Test', icon: '🏆' });
    const url = shareAchievement(achievement);

    expect(url).toContain('twitter.com/intent/tweet');
    expect(url).toContain('Test');
  });
});

// ==========================================
// resetAchievements
// ==========================================

describe('resetAchievements', () => {
  it('clears achievements from storage', async () => {
    await saveAchievements([
      { achievementId: 'a1', unlockedAt: 10, timestamp: '2024-01-01' },
    ]);

    await resetAchievements();

    const loaded = await loadAchievements();
    expect(loaded).toEqual([]);
  });
});
