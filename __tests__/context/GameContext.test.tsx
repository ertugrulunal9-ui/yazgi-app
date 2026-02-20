import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { AppState } from 'react-native';
import { SaveSlotData, SAVE_VERSION } from '../../src/save/SaveSlot';
import { GameContextType, GameProvider, useGame } from '../../src/context/GameContext';
import {
  getInitialGameState,
  getInitialStats,
  initializeSaveSystem,
  loadGame,
  saveGame,
  setCurrentSlotId,
} from '../../src/utils/gameUtils';
import SaveManager from '../../src/save/SaveManager';
import { applyLegacyBonusesToStats, applyRunToMetaProgression } from '../../src/utils/metaProgression';
import { resolveEnding } from '../../src/utils/endingResolver';
import { createInitialFateState } from '../../src/systems/FateEngine';
import { trackSpecialProgress } from '../../src/utils/achievementChecker';
import { ensureStructuredGameState } from '../../src/utils/gameStateAdapter';

jest.mock('../../src/utils/achievementChecker', () => ({
  trackSpecialProgress: jest.fn((state: any) => state),
}));

jest.mock('../../src/utils/gameStateAdapter', () => ({
  ensureStructuredGameState: jest.fn((state: any) => state),
  mergeGameStateUpdate: jest.fn((prev: any, updates: any) => {
    const next = { ...prev, ...updates };

    if (updates?.stats) {
      next.stats = { ...(prev.stats || {}), ...updates.stats };
    }
    if (updates?.progress) {
      next.progress = { ...(prev.progress || {}), ...updates.progress };
    }
    if (updates?.character) {
      next.character = { ...(prev.character || {}), ...updates.character };
    }
    if (updates?.social) {
      next.social = { ...(prev.social || {}), ...updates.social };
    }
    if (updates?.academic) {
      next.academic = { ...(prev.academic || {}), ...updates.academic };
    }
    if (updates?.events) {
      next.events = { ...(prev.events || {}), ...updates.events };
      if (updates.events.currentEvent !== undefined) {
        next.currentEvent = updates.events.currentEvent;
      }
    }

    return next;
  }),
  stripRuntimeGameStateCaches: jest.fn((state: any) => state),
}));

jest.mock('../../src/utils/endingResolver', () => ({
  resolveEnding: jest.fn(() => ({
    id: 'ending_test',
    result: {
      title: 'Test Ending',
      description: 'desc',
      emoji: 'x',
      type: 'SUCCESS',
      familyReaction: 'ok',
    },
    tier: 'SUCCESS',
    compatibilityScore: 88,
    selectedGoal: null,
  })),
}));

jest.mock('../../src/systems/FateEngine', () => ({
  createInitialFateState: jest.fn((zodiacSign: string) => ({
    seed: 1,
    tokens: 0,
    totalRolls: 0,
    outcomeHistory: [],
    zodiacSign,
    consecutiveBadOutcomes: 0,
  })),
}));

jest.mock('../../src/utils/metaProgression', () => ({
  createInitialMetaProgression: jest.fn(() => ({
    version: 1,
    totalRunsCompleted: 0,
    totalLegacyPoints: 0,
    legacyLevel: 1,
    bestTier: null,
    highestCompatibilityScore: 0,
    highestAgeReached: 0,
    lifetimeAchievementIds: [],
    recentRuns: [],
    updatedAt: 1000,
  })),
  applyLegacyBonusesToStats: jest.fn((stats: any) => ({
    ...stats,
    intelligence: (stats.intelligence || 0) + 2,
  })),
  applyRunToMetaProgression: jest.fn((meta: any, run: any) => ({
    nextMeta: {
      ...meta,
      totalRunsCompleted: (meta.totalRunsCompleted || 0) + 1,
      recentRuns: [
        {
          ...run,
          endedAt: 2000,
          pointsEarned: 10,
        },
        ...(meta.recentRuns || []),
      ],
      updatedAt: 2000,
    },
  })),
}));

jest.mock('../../src/utils/gameUtils', () => {
  const actual = jest.requireActual('../../src/utils/gameUtils');
  return {
    ...actual,
    initializeSaveSystem: jest.fn(async () => true),
    loadGame: jest.fn(async () => null),
    saveGame: jest.fn(async () => true),
    setCurrentSlotId: jest.fn(),
  };
});

jest.mock('../../src/save/SaveManager', () => ({
  __esModule: true,
  default: {
    registerAutoSaveCallback: jest.fn(),
    unregisterAutoSaveCallback: jest.fn(),
    getMetaProgression: jest.fn(async () => ({
      version: 1,
      totalRunsCompleted: 0,
      totalLegacyPoints: 0,
      legacyLevel: 1,
      bestTier: null,
      highestCompatibilityScore: 0,
      highestAgeReached: 0,
      lifetimeAchievementIds: [],
      recentRuns: [],
      updatedAt: 1500,
    })),
    setMetaProgression: jest.fn(async () => true),
  },
}));

const flushEffects = async () => {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
};

let latestContext: GameContextType | null = null;

const ContextProbe = () => {
  latestContext = useGame();
  return null;
};

const renderProvider = async () => {
  latestContext = null;
  let tree: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <GameProvider>
        <ContextProbe />
      </GameProvider>,
    );
  });
  await flushEffects();
  return tree!;
};

describe('GameContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    latestContext = null;
  });

  it('throws when useGame is called outside provider', () => {
    const BrokenConsumer = () => {
      useGame();
      return null;
    };

    expect(() => {
      act(() => {
        renderer.create(<BrokenConsumer />);
      });
    }).toThrow('useGame must be used within GameProvider');
  });

  it('bootstraps save/meta flow and registers auto-save callback', async () => {
    const removeSpy = jest.fn();
    (AppState.addEventListener as jest.Mock).mockImplementationOnce(() => ({ remove: removeSpy }));

    const tree = await renderProvider();

    expect(initializeSaveSystem).toHaveBeenCalledTimes(1);
    expect((SaveManager.getMetaProgression as jest.Mock)).toHaveBeenCalled();
    expect((SaveManager.registerAutoSaveCallback as jest.Mock)).toHaveBeenCalledTimes(1);
    expect(latestContext?.isLoading).toBe(false);

    const registeredCallback = (SaveManager.registerAutoSaveCallback as jest.Mock).mock.calls[0][0];
    expect(registeredCallback()).toBeNull();

    act(() => {
      latestContext?.startNewGame('Aylin');
    });

    const payload = registeredCallback();
    expect(payload?.playerName).toBe('Aylin');

    await act(async () => {
      tree.unmount();
    });

    expect((SaveManager.unregisterAutoSaveCallback as jest.Mock)).toHaveBeenCalledTimes(1);
    expect(removeSpy).toHaveBeenCalled();
  });

  it('loads provided save data and switches slot', async () => {
    await renderProvider();

    const savedState = {
      ...getInitialGameState(),
      age: 12,
      turn: 44,
      phase: 'HUB' as const,
      stats: {
        ...getInitialStats(),
        money: 250,
      },
    };

    const saveData: SaveSlotData = {
      metadata: {
        slotId: '2',
        characterName: 'Loaded Player',
        age: savedState.age,
        playtime: 120,
        lastPlayed: 1700000000000,
        version: SAVE_VERSION,
        checksum: 'checksum',
        status: 'active',
        isPremium: false,
      },
      playerName: 'Loaded Player',
      stats: savedState.stats!,
      gameState: savedState,
    };

    let loaded = false;
    await act(async () => {
      loaded = await latestContext!.loadSavedGame('2', saveData);
    });

    expect(loaded).toBe(true);
    expect(setCurrentSlotId).toHaveBeenCalledWith('2');
    expect(latestContext?.playerName).toBe('Loaded Player');
    expect(latestContext?.gameState.age).toBe(12);
    expect(latestContext?.stats.money).toBe(250);
  });

  it('loads sparse save data and falls back to defaults across fields', async () => {
    await renderProvider();

    const sparseSave = {
      metadata: { slotId: '3' },
      playerName: '',
      stats: undefined,
      gameState: {
        age: 3,
        turn: 7,
        childhood: { completed: true },
      },
    } as unknown as SaveSlotData;

    let loaded = false;
    await act(async () => {
      loaded = await latestContext!.loadSavedGame('3', sparseSave);
    });

    expect(loaded).toBe(true);
    expect(latestContext?.playerName).toBe('');
    expect(latestContext?.gameState.childhood.completed).toBe(true);
    expect(latestContext?.stats).toEqual(getInitialStats());
  });

  it('starts new game with legacy bonuses and fate initialization', async () => {
    await renderProvider();

    const baseIntelligence = latestContext!.stats.intelligence;
    act(() => {
      latestContext?.startNewGame('Selin', {
        firstName: 'Selin',
        lastName: 'Kaya',
        gender: 'FEMALE',
        birthMonth: 4,
        birthDay: 8,
        birthCity: 'Istanbul',
        zodiacSign: 'KOC',
      });
    });

    expect(applyLegacyBonusesToStats).toHaveBeenCalled();
    expect(createInitialFateState).toHaveBeenCalledWith('KOC');
    expect(latestContext?.playerName).toBe('Selin');
    expect(latestContext?.gameState.characterInfo?.firstName).toBe('Selin');
    expect(latestContext?.stats.intelligence).toBe(baseIntelligence + 2);
  });

  it('updates stats with clamping', async () => {
    await renderProvider();

    act(() => {
      latestContext?.startNewGame('ClampTester');
    });

    act(() => {
      latestContext?.updateStats({
        money: -9999,
        energy: 9999,
        intelligence: 9999,
        charisma: -9999,
      });
    });

    expect(latestContext?.stats.money).toBe(0);
    expect(latestContext?.stats.energy).toBeLessThanOrEqual(latestContext!.gameState.maxEnergy || 100);
    expect(latestContext?.stats.intelligence).toBeLessThanOrEqual(100);
    expect(latestContext?.stats.charisma).toBeGreaterThanOrEqual(0);
  });

  it('auto-saves on meaningful changes and on app background', async () => {
    jest.useFakeTimers();
    await renderProvider();

    act(() => {
      latestContext?.startNewGame('Saver');
    });

    act(() => {
      latestContext?.updateGameState({
        turn: latestContext!.gameState.turn + 1,
        age: latestContext!.gameState.age + 1,
      });
    });

    await act(async () => {
      jest.advanceTimersByTime(600);
      await Promise.resolve();
    });

    const saveCallsAfterTimer = (saveGame as jest.Mock).mock.calls.length;
    expect(saveCallsAfterTimer).toBeGreaterThan(0);

    act(() => {
      const appStateListener = (AppState.addEventListener as jest.Mock).mock.calls[0]?.[1] as
        | ((state: 'active' | 'inactive' | 'background') => void)
        | undefined;
      appStateListener?.('background');
    });

    expect((saveGame as jest.Mock).mock.calls.length).toBeGreaterThan(saveCallsAfterTimer);
    jest.useRealTimers();
  });

  it('runs queued pending-save when a save is already in progress', async () => {
    jest.useFakeTimers();
    let resolveFirstSave: ((value: boolean) => void) | null = null;
    const firstSavePromise = new Promise<boolean>(resolve => {
      resolveFirstSave = resolve;
    });

    (saveGame as jest.Mock)
      .mockImplementationOnce(() => firstSavePromise)
      .mockResolvedValue(true);

    await renderProvider();

    act(() => {
      latestContext?.startNewGame('PendingQueue');
    });

    act(() => {
      latestContext?.updateGameState({
        turn: latestContext!.gameState.turn + 1,
        age: latestContext!.gameState.age + 1,
      });
    });

    await act(async () => {
      jest.advanceTimersByTime(600);
      await Promise.resolve();
    });
    expect((saveGame as jest.Mock).mock.calls.length).toBe(1);

    act(() => {
      latestContext?.updateGameState({
        turn: latestContext!.gameState.turn + 1,
        age: latestContext!.gameState.age + 1,
      });
    });

    await act(async () => {
      jest.advanceTimersByTime(600);
      await Promise.resolve();
    });
    expect((saveGame as jest.Mock).mock.calls.length).toBe(1);

    await act(async () => {
      resolveFirstSave?.(true);
      await Promise.resolve();
    });
    expect((saveGame as jest.Mock).mock.calls.length).toBe(2);
    jest.useRealTimers();
  });

  it('logs auto-save errors from timer catch branch', async () => {
    jest.useFakeTimers();
    const autoSaveError = new Error('auto-save boom');

    await renderProvider();
    jest.clearAllMocks();

    // Always reject so all 3 retry attempts fail
    (saveGame as jest.Mock).mockRejectedValue(autoSaveError);

    act(() => {
      latestContext?.startNewGame('AutoSaveError');
    });
    act(() => {
      latestContext?.updateGameState({
        turn: latestContext!.gameState.turn + 1,
        age: latestContext!.gameState.age + 1,
      });
    });

    // Trigger debounce (500ms) → first attempt fails → retry delay 1 (200ms) → second fails → retry delay 2 (400ms) → third fails → error logged
    await act(async () => {
      jest.advanceTimersByTime(600); // debounce fires
      await Promise.resolve();       // first save rejects, setTimeout(200) created
    });
    await act(async () => {
      jest.advanceTimersByTime(200); // retry delay 1 fires
      await Promise.resolve();       // second save rejects, setTimeout(400) created
    });
    await act(async () => {
      jest.advanceTimersByTime(400); // retry delay 2 fires
      await Promise.resolve();       // third save rejects → console.error
    });

    expect(console.error).toHaveBeenCalledWith('Auto-save failed after 3 attempts:', autoSaveError);
    // Restore to avoid bleeding into other tests
    (saveGame as jest.Mock).mockResolvedValue(true);
    jest.useRealTimers();
  });

  it('handles refreshMetaProgression failure via catch branch', async () => {
    await renderProvider();
    const refreshError = new Error('meta fail');
    (SaveManager.getMetaProgression as jest.Mock).mockRejectedValueOnce(refreshError);

    await act(async () => {
      await latestContext!.refreshMetaProgression();
    });

    expect(console.error).toHaveBeenCalledWith('Failed to refresh meta progression:', refreshError);
  });

  it('handles loadSavedGame failure when loadGame throws', async () => {
    await renderProvider();
    const loadError = new Error('load fail');
    (loadGame as jest.Mock).mockRejectedValueOnce(loadError);

    let result = true;
    await act(async () => {
      result = await latestContext!.loadSavedGame();
    });

    expect(result).toBe(false);
    expect(console.error).toHaveBeenCalledWith('Failed to load saved game:', loadError);
  });

  it('logs bootstrap initialization errors from outer catch', async () => {
    const initError = new Error('init fail');
    (initializeSaveSystem as jest.Mock).mockRejectedValueOnce(initError);

    await renderProvider();

    expect(console.error).toHaveBeenCalledWith('Save system initialization failed:', initError);
    expect(latestContext?.isLoading).toBe(false);
  });

  it('persists meta progression when run reaches GAME_OVER once', async () => {
    await renderProvider();

    act(() => {
      latestContext?.startNewGame('MetaRunner');
    });

    act(() => {
      latestContext?.setGameState(prev => ({
        ...prev,
        phase: 'GAME_OVER',
        age: 18,
        turn: 120,
        totalTurns: 120,
        unlockedAchievements: [
          {
            achievementId: 'ach_1',
            unlockedAt: 120,
            timestamp: '2026-01-01T00:00:00.000Z',
          },
        ],
        metaRunRecorded: false,
      }));
    });

    await flushEffects();
    await flushEffects();

    expect(resolveEnding).toHaveBeenCalled();
    expect(applyRunToMetaProgression).toHaveBeenCalled();
    expect((SaveManager.setMetaProgression as jest.Mock)).toHaveBeenCalledTimes(1);
    expect(latestContext?.gameState.metaRunRecorded).toBe(true);

    await flushEffects();
    expect((SaveManager.setMetaProgression as jest.Mock)).toHaveBeenCalledTimes(1);
  });

  it('handles meta persistence failure through GAME_OVER catch branch', async () => {
    await renderProvider();
    const persistError = new Error('persist fail');
    (SaveManager.setMetaProgression as jest.Mock).mockRejectedValueOnce(persistError);

    act(() => {
      latestContext?.startNewGame('MetaFail');
    });

    act(() => {
      latestContext?.setGameState(prev => ({
        ...prev,
        phase: 'GAME_OVER',
        age: 18,
        turn: 50,
        totalTurns: 50,
        metaRunRecorded: false,
      }));
    });

    await flushEffects();
    await flushEffects();

    expect(console.error).toHaveBeenCalledWith('Failed to persist meta progression run:', persistError);
  });

  it('executes setStats function/object branches and resetGame path', async () => {
    await renderProvider();

    act(() => {
      latestContext?.startNewGame('Resettable');
    });

    act(() => {
      latestContext?.setStats(prev => ({
        ...prev,
        health: prev.health + 1,
      }));
    });
    expect(latestContext?.stats.health).toBeGreaterThan(0);

    act(() => {
      latestContext?.setStats({
        ...latestContext!.stats,
        health: 22,
      });
    });
    expect(latestContext?.stats.health).toBe(22);

    act(() => {
      latestContext?.setGameState({
        ...latestContext!.gameState,
      });
    });

    act(() => {
      latestContext?.resetGame();
    });
    expect(latestContext?.playerName).toBe('');
  });

  it('applies tracked progress state when stats change and tracker returns new state', async () => {
    await renderProvider();
    act(() => {
      latestContext?.startNewGame('TrackerUser');
    });

    (trackSpecialProgress as jest.Mock).mockImplementationOnce((prev: any) => ({
      ...prev,
      innerThought: 'tracked-state',
    }));

    act(() => {
      latestContext?.setStats(prev => ({
        ...prev,
        intelligence: prev.intelligence + 1,
      }));
    });
    await flushEffects();

    expect(trackSpecialProgress).toHaveBeenCalled();
    expect(latestContext?.gameState.innerThought).toBe('tracked-state');
  });

  it('advances turn via progress/events update paths', async () => {
    await renderProvider();
    act(() => {
      latestContext?.startNewGame('AdvanceUser');
    });

    const nextEvent = {
      id: 'evt_adv',
      text: 'Advance event',
      minAge: 0,
      maxAge: 100,
      difficulty: 1,
      rarity: 'COMMON',
      choices: [],
    } as any;

    act(() => {
      latestContext?.advanceTurnInContext({
        newStats: { money: 321 },
        newGameState: {
          progress: { phase: 'EVENT' },
          events: { currentEvent: nextEvent },
        },
      });
    });

    expect(latestContext?.stats.money).toBe(321);
    expect(latestContext?.gameState.currentEvent?.id).toBe('evt_adv');
  });

  it('setGameState function branch runs without error', async () => {
    await renderProvider();

    act(() => {
      latestContext?.startNewGame('BranchTest');
    });

    act(() => {
      latestContext?.setGameState(prev => ({ ...prev, turn: prev.turn + 1 }));
    });

    expect(latestContext?.gameState.turn).toBeGreaterThanOrEqual(0);
  });

  it('falls back to initial stats when structured state omits stats', async () => {
    (ensureStructuredGameState as jest.Mock).mockImplementationOnce((state: any) => ({
      ...state,
      stats: undefined,
    }));

    await renderProvider();

    expect(latestContext?.stats).toEqual(getInitialStats());

    act(() => {
      latestContext?.updateStats({ energy: 5, health: undefined as any });
    });
    expect(latestContext?.stats.energy).toBeGreaterThanOrEqual(0);
  });
});
