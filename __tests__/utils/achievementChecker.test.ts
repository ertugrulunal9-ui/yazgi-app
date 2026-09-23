jest.mock('../../src/systems/achievementSystem', () => ({
  checkAllAchievements: jest.fn(),
}));

import { checkAllAchievements } from '../../src/systems/achievementSystem';
import {
  autoCheckAchievements,
  debouncedAchievementCheck,
  trackSpecialProgress,
} from '../../src/utils/achievementChecker';

const stats = {
  health: 60,
  intelligence: 50,
  charisma: 40,
  discipline: 45,
  money: 60000,
  energy: 80,
  familyRelation: 55,
};

const prevStats = {
  health: 5,
  intelligence: 50,
  charisma: 40,
  discipline: 45,
  money: 0,
  energy: 80,
  familyRelation: 55,
};

const gameState = {
  achievementProgress: {},
  schoolGrades: {
    math: 95,
    science: 92,
    language: 88,
  },
  npcs: [{ role: 'PARTNER' }],
  unlockedAchievements: [{ achievementId: 'old_1' }],
} as any;

const skills = {
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
};

const grades = {
  math: 90,
  science: 90,
  language: 90,
  turkish: 80,
  history: 70,
  geography: 70,
  art: 60,
  music: 60,
};

describe('achievementChecker', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('tracks special progress branches and accumulates spender/heartbreaker', () => {
    const updated = trackSpecialProgress(gameState, stats, prevStats);

    expect(updated.achievementProgress.survivor).toBe(1);
    expect(updated.achievementProgress.broke_to_rich).toBe(1);
    expect(updated.achievementProgress.comeback_kid).toBe(1);
    expect(updated.achievementProgress.spender).toBeUndefined();
    expect(updated.achievementProgress.heartbreaker).toBe(1);

    const spentUpdate = trackSpecialProgress(
      {
        ...gameState,
        achievementProgress: { spender: 100 },
      } as any,
      { ...stats, money: 80 },
      { ...prevStats, money: 200 } as any
    );
    expect(spentUpdate.achievementProgress.spender).toBe(220);
  });

  it('initializes missing achievementProgress and skips prevStats-dependent branches', () => {
    const updated = trackSpecialProgress(
      {
        ...gameState,
        achievementProgress: undefined,
      } as any,
      stats,
      undefined
    );

    expect(updated.achievementProgress).toEqual({});
  });

  it('auto-checks achievements and invokes onNewUnlock callback', async () => {
    jest.useFakeTimers();
    (checkAllAchievements as jest.Mock).mockResolvedValueOnce([
      { achievementId: 'new_ach_1' },
      { achievementId: 'new_ach_2' },
    ]);

    const onNewUnlock = jest.fn();
    const showFloatingText = jest.fn();

    await autoCheckAchievements(
      stats as any,
      gameState,
      skills as any,
      grades as any,
      onNewUnlock,
      showFloatingText
    );

    await jest.runAllTimersAsync();

    expect(checkAllAchievements).toHaveBeenCalledWith(
      stats,
      gameState,
      skills,
      grades,
      gameState.unlockedAchievements,
      showFloatingText
    );
    expect(onNewUnlock).toHaveBeenCalledWith(['new_ach_1', 'new_ach_2']);
  });

  it('does not call onNewUnlock when no new achievements were unlocked', async () => {
    jest.useFakeTimers();
    (checkAllAchievements as jest.Mock).mockResolvedValueOnce([]);
    const onNewUnlock = jest.fn();

    await autoCheckAchievements(stats as any, gameState, skills as any, grades as any, onNewUnlock);
    await jest.runAllTimersAsync();

    expect(onNewUnlock).not.toHaveBeenCalled();
  });

  it('logs errors when scheduling auto-check fails', async () => {
    const timerError = new Error('timer broke');
    const originalSetTimeout = global.setTimeout;
    (global as any).setTimeout = () => {
      throw timerError;
    };

    await autoCheckAchievements(stats as any, gameState, skills as any, grades as any);

    expect(console.error).toHaveBeenCalledWith('Auto-check achievements failed:', timerError);
    global.setTimeout = originalSetTimeout;
  });

  it('debounces repeated checks and clears prior timeout', async () => {
    jest.useFakeTimers();
    (checkAllAchievements as jest.Mock).mockResolvedValue([]);
    const clearSpy = jest.spyOn(global, 'clearTimeout');
    const onNewUnlock = jest.fn();

    debouncedAchievementCheck(stats as any, gameState, skills as any, grades as any, onNewUnlock, 200);
    debouncedAchievementCheck(stats as any, gameState, skills as any, grades as any, onNewUnlock, 200);

    expect(clearSpy).toHaveBeenCalled();
    await jest.advanceTimersByTimeAsync(250);
    await jest.runAllTimersAsync();

    expect(checkAllAchievements).toHaveBeenCalledTimes(1);
  });
});
