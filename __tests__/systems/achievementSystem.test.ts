import {
  applyAchievementReward,
  checkAchievement,
  checkAllAchievements,
  getAchievementProgress,
  getAchievementStats,
  isAchievementUnlocked,
  loadAchievements,
  resetAchievements,
  saveAchievements,
  shareAchievement,
  unlockAchievement,
} from '../../src/systems/achievementSystem';
import { ACHIEVEMENTS, getAchievement } from '../../src/systems/achievementDefinitions';
import { setRuntimeLocale } from '../../src/i18n/strings';
import { analyticsService } from '../../src/services/analytics';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';
import type {
  Achievement,
  AchievementProgress,
  GameState,
  SchoolGrades,
  Skills,
  Stats,
  UnlockedAchievement,
} from '../../src/types';

const STORAGE_KEY = '@yazgi/achievements/v1';

const makeStats = (overrides: Partial<Stats> = {}): Stats => ({
  ...getInitialStats(),
  health: 60,
  intelligence: 60,
  charisma: 60,
  discipline: 60,
  money: 0,
  energy: 60,
  familyRelation: 60,
  ...overrides,
});

const makeGameState = (overrides: Partial<GameState> = {}): GameState => ({
  ...getInitialGameState(),
  age: 10,
  maxEnergy: 100,
  totalTurns: 30,
  recentEvents: [],
  eventChoiceHistory: [],
  memories: [],
  actionCounts: {},
  npcs: [],
  inventory: [],
  unlockedAchievements: [],
  achievementProgress: {},
  ...overrides,
});

const makeSkills = (overrides: Partial<Skills> = {}): Skills => ({
  coding: 0,
  music: 0,
  sports: 0,
  design: 0,
  athletics: 0,
  logic: 0,
  reading: 0,
  teamwork: 0,
  art: 0,
  writing: 0,
  work_ethic: 0,
  business: 0,
  ...overrides,
});

const makeGrades = (overrides: Partial<SchoolGrades> = {}): SchoolGrades => ({
  math: 50,
  science: 50,
  language: 50,
  turkish: 50,
  history: 50,
  geography: 50,
  art: 50,
  music: 50,
  ...overrides,
});

const makeUnlocked = (achievementId: string): UnlockedAchievement => ({
  achievementId,
  unlockedAt: 10,
  timestamp: new Date('2026-01-01T00:00:00.000Z').toISOString(),
});

const mustGetAchievement = (id: string): Achievement => {
  const achievement = getAchievement(id);
  if (!achievement) {
    throw new Error(`Missing achievement: ${id}`);
  }
  return achievement;
};

describe('achievementSystem', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('saves and loads achievements with localStorage', async () => {
    const payload = [makeUnlocked('first_income')];

    await saveAchievements(payload);
    const loaded = await loadAchievements();

    expect(loaded).toEqual(payload);
  });

  it('returns empty array on malformed localStorage payload', async () => {
    localStorage.setItem(STORAGE_KEY, '{invalid json');

    const loaded = await loadAchievements();

    expect(loaded).toEqual([]);
    expect(console.error).toHaveBeenCalledWith('Failed to load achievements:', expect.anything());
  });

  it('handles storage write failures gracefully', async () => {
    const originalSetItem = localStorage.setItem;
    const writeError = new Error('write failed');
    (localStorage as unknown as { setItem: (key: string, value: string) => void }).setItem = () => {
      throw writeError;
    };

    await saveAchievements([makeUnlocked('first_income')]);

    expect(console.error).toHaveBeenCalledWith('Failed to save achievements:', writeError);
    (localStorage as unknown as { setItem: Storage['setItem'] }).setItem = originalSetItem;
  });

  it('checks unlocked state, unlocks once, logs analytics and floating text', async () => {
    const achievement = mustGetAchievement('first_income');
    const state = makeGameState({ age: 12 });
    const showFloatingText = jest.fn();
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);

    expect(isAchievementUnlocked(achievement.id, [])).toBe(false);

    const firstUnlock = await unlockAchievement(achievement, state, [], showFloatingText);
    expect(firstUnlock).not.toBeNull();
    expect(firstUnlock?.unlocked.achievementId).toBe('first_income');
    expect(firstUnlock?.unlocked.unlockedAt).toBe(12);
    expect(firstUnlock?.reward).toEqual(achievement.reward);
    expect((analyticsService.logCustomEvent as jest.Mock).mock.calls[0][0]).toBe('achievement_unlocked');
    expect(showFloatingText).toHaveBeenCalledWith(
      expect.stringContaining(achievement.name),
      100,
      100,
      '#fbbf24',
      { animationType: 'bounce', duration: 3000 },
    );

    const secondUnlock = await unlockAchievement(
      achievement,
      state,
      [firstUnlock!.unlocked],
      showFloatingText,
    );
    expect(secondUnlock).toBeNull();
    expect(isAchievementUnlocked(achievement.id, [firstUnlock!.unlocked])).toBe(true);

    randomSpy.mockRestore();
  });

  it('evaluates achievements safely and catches checker failures', () => {
    const safeAchievement: Achievement = {
      id: 'safe_progress',
      name: 'Safe Progress',
      description: 'safe',
      category: 'EVENTS',
      rarity: 'COMMON',
      icon: 'ok',
      isSecret: false,
      check: () => ({ current: 2, target: 5 }),
    };
    const error = new Error('check failed');
    const brokenAchievement: Achievement = {
      id: 'broken',
      name: 'Broken',
      description: 'broken',
      category: 'EVENTS',
      rarity: 'COMMON',
      icon: 'x',
      isSecret: true,
      check: () => {
        throw error;
      },
    };

    const state = makeGameState();
    const stats = makeStats();
    const skills = makeSkills();
    const grades = makeGrades();

    const safeResult = checkAchievement(safeAchievement, stats, state, skills, grades);
    expect(safeResult).toEqual({ current: 2, target: 5 });

    const brokenResult = checkAchievement(brokenAchievement, stats, state, skills, grades);
    expect(brokenResult).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Achievement check failed: broken', error);
  });

  it('checks all achievements and skips already unlocked ids', async () => {
    const stats = makeStats({ money: 5, energy: 90 });
    const state = makeGameState({
      age: 1,
      totalTurns: 21,
      eventChoiceHistory: ['intro_choice'],
      sessionCount: 1,
    });
    const skills = makeSkills();
    const grades = makeGrades();
    const showFloatingText = jest.fn();
    const alreadyUnlocked = [makeUnlocked('first_year')];

    const newlyUnlocked = await checkAllAchievements(
      stats,
      state,
      skills,
      grades,
      alreadyUnlocked,
      showFloatingText,
    );

    expect(newlyUnlocked.length).toBeGreaterThan(0);
    expect(newlyUnlocked.some((entry) => entry.achievementId === 'first_year')).toBe(false);
    expect(newlyUnlocked.some((entry) => entry.achievementId === 'first_income')).toBe(true);
    expect(analyticsService.logCustomEvent).toHaveBeenCalled();
    expect(showFloatingText).toHaveBeenCalled();
  });

  it('computes achievement progress for boolean and object results', () => {
    const state = makeGameState();
    const skills = makeSkills();
    const grades = makeGrades();

    const positive = mustGetAchievement('first_income');
    expect(getAchievementProgress(positive, makeStats({ money: 1 }), state, skills, grades)).toBe(100);
    expect(getAchievementProgress(positive, makeStats({ money: 0 }), state, skills, grades)).toBe(0);

    const progressAchievement: Achievement = {
      id: 'progressing',
      name: 'Progressing',
      description: 'progressing',
      category: 'EVENTS',
      rarity: 'COMMON',
      icon: 'p',
      isSecret: false,
      check: () => ({ current: 3, target: 5 }),
    };
    expect(getAchievementProgress(progressAchievement, makeStats(), state, skills, grades)).toBe(60);

    const cappedProgressAchievement: Achievement = {
      ...progressAchievement,
      id: 'capped',
      check: () => ({ current: 20, target: 5 }),
    };
    expect(getAchievementProgress(cappedProgressAchievement, makeStats(), state, skills, grades)).toBe(100);

    const invalidProgressAchievement: Achievement = {
      ...progressAchievement,
      id: 'invalid',
      check: () => ({ foo: 1 } as unknown as AchievementProgress),
    };
    expect(getAchievementProgress(invalidProgressAchievement, makeStats(), state, skills, grades)).toBe(0);
  });

  it('applies only non-money stat rewards and clamps non-money stats', () => {
    const base = makeStats({ health: 95, discipline: 5, money: 10 });
    const unchanged = applyAchievementReward(base, undefined);
    expect(unchanged).toBe(base);

    const rewarded = applyAchievementReward(base, {
      money: 100,
      stats: {
        health: 20,
        discipline: -50,
        money: 50,
        charisma: 'skip' as unknown as number,
      },
    });
    expect(rewarded.money).toBe(10);
    expect(rewarded.health).toBe(100);
    expect(rewarded.discipline).toBe(0);
    expect(rewarded.charisma).toBe(base.charisma);
  });

  it('returns achievement stats and share url payload', () => {
    const firstIncome = mustGetAchievement('first_income');
    const unlocked = [
      makeUnlocked('first_income'),
      makeUnlocked('millionaire'),
      makeUnlocked('missing_id'),
    ];

    const stats = getAchievementStats(unlocked);
    expect(stats.total).toBe(ACHIEVEMENTS.length);
    expect(stats.unlocked).toBe(3);
    expect(stats.percentage).toBe(Math.round((3 / ACHIEVEMENTS.length) * 100));
    expect(stats.byRarity.COMMON).toBe(1);
    expect(stats.byRarity.LEGENDARY).toBe(1);
    expect(stats.byRarity.RARE).toBe(0);
    expect(stats.byRarity.EPIC).toBe(0);

    // TR locale (default)
    const shareUrlTr = shareAchievement(firstIncome);
    expect(shareUrlTr).toContain('https://twitter.com/intent/tweet?text=');
    expect(shareUrlTr).toContain('&hashtags=');
    expect(shareUrlTr).toContain('Yazgi,Basari,HayatSimulatoru');

    // EN locale
    setRuntimeLocale('en');
    const shareUrlEn = shareAchievement(firstIncome);
    expect(shareUrlEn).toContain('Yazgi,Achievement,LifeSimulator');
    setRuntimeLocale('tr');

    expect(decodeURIComponent(shareUrlTr)).toContain(firstIncome.name);
  });

  it('resets achievements and handles reset failures', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([makeUnlocked('first_income')]));
    await resetAchievements();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();

    const originalRemoveItem = localStorage.removeItem;
    const resetError = new Error('remove failed');
    (localStorage as unknown as { removeItem: (key: string) => void }).removeItem = () => {
      throw resetError;
    };

    await resetAchievements();
    expect(console.error).toHaveBeenCalledWith('Failed to reset achievements:', resetError);
    (localStorage as unknown as { removeItem: Storage['removeItem'] }).removeItem = originalRemoveItem;
  });

  it('uses AsyncStorage path when localStorage is unavailable', async () => {
    const globalWithLocalStorage = global as typeof globalThis & { localStorage: Storage };
    const originalLocalStorage = globalWithLocalStorage.localStorage;
    const asyncStorageMock = {
      getItem: jest.fn<Promise<string | null>, [string]>(async () => null),
      setItem: jest.fn<Promise<void>, [string, string]>(async () => {}),
      removeItem: jest.fn<Promise<void>, [string]>(async () => {}),
    };

    try {
      jest.resetModules();
      jest.doMock('@react-native-async-storage/async-storage', () => ({
        __esModule: true,
        default: asyncStorageMock,
      }));
      Object.defineProperty(globalWithLocalStorage, 'localStorage', {
        configurable: true,
        writable: true,
        value: undefined,
      });

      const isolatedModule = await import('../../src/systems/achievementSystem');
      const payload = [makeUnlocked('first_income')];
      asyncStorageMock.getItem.mockResolvedValueOnce(JSON.stringify(payload));

      await isolatedModule.saveAchievements(payload);
      const loaded = await isolatedModule.loadAchievements();
      await isolatedModule.resetAchievements();

      expect(asyncStorageMock.setItem).toHaveBeenCalledWith(STORAGE_KEY, JSON.stringify(payload));
      expect(loaded).toEqual(payload);
      expect(asyncStorageMock.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    } finally {
      jest.dontMock('@react-native-async-storage/async-storage');
      Object.defineProperty(globalWithLocalStorage, 'localStorage', {
        configurable: true,
        writable: true,
        value: originalLocalStorage,
      });
      jest.resetModules();
    }
  });
});
