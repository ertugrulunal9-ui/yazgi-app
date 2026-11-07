import React from 'react';
import renderer, { act } from 'react-test-renderer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GameProvider, useGame } from '../../src/context/GameContext';
import type { GameContextType } from '../../src/context/GameContext';
import { useEvents } from '../../src/hooks/useEvents';
import SaveManager from '../../src/save/SaveManager';
import type { GameEvent, GameState, Stats } from '../../src/types';

// "Seçimi Geri Al" verisi (undoSnapshot) kayıtta tek seviye kalmalı.
// Eskiden her seçim önceki undoSnapshot'ı da kopyalıyordu: 17 yaşta 62 seviyelik zincir,
// gameState JSON 2,18 MB, tek kayıtta 11 MB yazım (Android AsyncStorage varsayılan sınırı 6 MB).

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

jest.mock('../../src/context/UIContext', () => ({
  useUI: () => ({ showFloatingText: jest.fn() }),
}));

jest.mock('../../src/services/notificationService', () => ({
  scheduleReengagement: jest.fn(async () => undefined),
  scheduleNPCReminder: jest.fn(async () => undefined),
}));

jest.mock('../../src/services/subscriptionManager', () => ({
  isPremium: () => false,
}));

jest.mock('../../src/utils/analyticsEvents');

jest.mock('../../src/animations/HapticFeedback', () => ({
  ageTransitionHaptic: jest.fn(),
}));

const CHOICE_ROUNDS = 65;
const MAX_SLOT_BYTES = 300 * 1024;

const snapshotDepth = (state: GameState | undefined): number => {
  let depth = 0;
  let snapshot = state?.undoSnapshot;
  while (snapshot) {
    depth += 1;
    snapshot = snapshot.gameState?.undoSnapshot;
  }
  return depth;
};

const makeEvent = (index: number): GameEvent => ({
  id: `test_undo_chain_${index}`,
  text: `Deneme olayı ${index}`,
  minAge: 0,
  maxAge: 18,
  choices: [
    {
      id: 'read',
      text: 'Kitap oku',
      effect: { intelligence: 2, energy: -3 },
      feedback: 'Biraz daha öğrendin.',
    },
    {
      id: 'rest',
      text: 'Dinlen',
      effect: { health: 1 },
      feedback: 'Dinlendin.',
    },
  ],
} as unknown as GameEvent);

let ctx: GameContextType | null = null;
let events: ReturnType<typeof useEvents> | null = null;

const Probe = () => {
  ctx = useGame();
  events = useEvents();
  return null;
};

const flushEffects = async () => {
  await act(async () => {
    await Promise.resolve();
  });
  await act(async () => {
    await Promise.resolve();
  });
};

const renderGame = async () => {
  ctx = null;
  events = null;
  let tree: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <GameProvider>
        <Probe />
      </GameProvider>,
    );
  });
  await flushEffects();
  return tree!;
};

const game = (): GameContextType => {
  if (!ctx) throw new Error('GameProvider render edilmedi');
  return ctx;
};

const hooks = (): ReturnType<typeof useEvents> => {
  if (!events) throw new Error('useEvents render edilmedi');
  return events;
};

const openEvent = (event: GameEvent) => {
  act(() => {
    game().updateGameState({ phase: 'EVENT', currentEvent: event, lastResult: null });
  });
};

const choose = (event: GameEvent, index = 0) => {
  act(() => {
    hooks().handleEventChoice(event.choices[index], index);
  });
};

/** GameProvider'ın otomatik kayıtta diske verdiği yük (prepareStateForPersistence dahil). */
const autosavePayload = () => {
  const callback = (SaveManager as unknown as {
    autoSaveCallback: (() => { gameState: GameState; stats: Stats; playerName: string } | null) | null;
  }).autoSaveCallback;
  const payload = callback?.();
  if (!payload) throw new Error('Otomatik kayıt yükü alınamadı');
  return payload;
};

const resetSaveManager = async () => {
  await AsyncStorage.clear();
  const manager = SaveManager as any;
  manager.state = {
    ...manager.state,
    slots: {},
    metadata: {},
    lastAutoSave: 0,
    cloudSync: {
      ...manager.state.cloudSync,
      enabled: false,
      pendingSlots: [],
    },
  };
  manager.saveLocks?.clear?.();
  manager.saveQueue?.clear?.();
  manager.deviceId = null;
};

describe('Geri Al verisi (undoSnapshot) tek seviye kalır', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    await resetSaveManager();
    tree = await renderGame();
    act(() => {
      game().startNewGame('Ada');
    });
  });

  afterEach(async () => {
    await act(async () => {
      tree?.unmount();
    });
    tree = null;
  });

  it('her seçimde yeni snapshot tek seviyedir (Devam araya girmese bile)', () => {
    for (let round = 0; round < CHOICE_ROUNDS; round += 1) {
      const event = makeEvent(round);
      openEvent(event);
      choose(event);

      expect(game().gameState.phase).toBe('RESULT');
      expect(snapshotDepth(game().gameState)).toBe(1);
      expect(game().gameState.undoSnapshot?.gameState.undoSnapshot ?? null).toBeNull();
    }
  });

  it(`${CHOICE_ROUNDS} seçim + Devam: derinlik en fazla 1, Devam temizler, kayıt < 300 KB`, async () => {
    for (let round = 0; round < CHOICE_ROUNDS; round += 1) {
      const event = makeEvent(round);
      openEvent(event);
      choose(event, round % 2);

      expect(snapshotDepth(game().gameState)).toBe(1);

      if (round === CHOICE_ROUNDS - 1) break; // son seçimin sonuç ekranında ölç (en kötü durum)

      act(() => {
        hooks().continueAfterResult();
      });
      // Düşük statta Devam zorunlu toparlanma olayına (EVENT) geçebilir; ikisinde de snapshot kalmaz.
      expect(['HUB', 'EVENT']).toContain(game().gameState.phase);
      expect(game().gameState.undoSnapshot ?? null).toBeNull();
    }

    expect(game().gameState.phase).toBe('RESULT');
    expect(game().gameState.eventChoiceHistory.length).toBeGreaterThanOrEqual(CHOICE_ROUNDS);

    const payload = autosavePayload();
    expect(snapshotDepth(payload.gameState)).toBe(1);

    const saved = await SaveManager.saveToSlot('auto', payload.playerName, payload.stats, payload.gameState);
    expect(saved).toBe(true);

    const slotValue = await AsyncStorage.getItem('@yazgi_save/slot_auto/v5');
    expect(slotValue).not.toBeNull();
    expect(slotValue!.length).toBeLessThan(MAX_SLOT_BYTES);
  });

  it('Devam toparlanma olayına geçerken de snapshot temizlenir', () => {
    const event = makeEvent(0);
    openEvent(event);
    choose(event);
    expect(snapshotDepth(game().gameState)).toBe(1);

    act(() => {
      const lastResult = game().gameState.lastResult!;
      game().updateGameState({ lastResult: { ...lastResult, shouldForceRecovery: true } });
    });
    act(() => {
      hooks().continueAfterResult();
    });

    expect(game().gameState.phase).toBe('EVENT');
    expect(game().gameState.undoSnapshot ?? null).toBeNull();
  });

  it('Geri Al sonuç ekranında seçim öncesine döner (stat + gameState)', () => {
    const warmup = makeEvent(100);
    openEvent(warmup);
    choose(warmup);
    act(() => {
      hooks().continueAfterResult();
    });

    const event = makeEvent(101);
    openEvent(event);
    const before = game().gameState;
    const statsBefore = { ...game().stats };

    choose(event);
    expect(game().gameState.phase).toBe('RESULT');
    expect(game().stats).not.toEqual(statsBefore);

    let undone = false;
    act(() => {
      undone = hooks().undoLastChoice();
    });

    expect(undone).toBe(true);
    const after = game().gameState;
    expect(game().stats).toEqual(statsBefore);
    expect(after.phase).toBe('EVENT');
    expect(after.currentEvent?.id).toBe(event.id);
    expect(after.lastResult).toBeNull();
    expect(after.eventChoiceHistory).toEqual(before.eventChoiceHistory);
    expect(after.turn).toBe(before.turn);
    expect(after.totalTurns).toBe(before.totalTurns);
    expect(after.undoSnapshot ?? null).toBeNull();
    expect(after.undosUsedThisAge).toBe((before.undosUsedThisAge ?? 0) + 1);
  });

  it('eski zincirli kayıt: depo aynen döner, yüklenince zincir kesilir, diğer alanlar korunur', async () => {
    const levels = 8;
    const stats = { ...game().stats };
    const preserved = {
      selectedGoal: 'ACADEMIC',
      purchasedItems: ['bike'],
      permanentFlags: { left_team: true },
      scars: [{ id: 'scar_trust', label: 'Güven Yara İzi', sourceEventId: 'tr_ihanet', sourceAge: 11 }],
      _ageStartStats: { ...stats, health: 50 },
      undosUsedThisAge: 0,
    };

    // Eski davranış: her seçim { ...gameState } aldığı için önceki snapshot da içeri girer.
    let chained = {
      ...game().gameState,
      ...preserved,
      age: 12,
      phase: 'RESULT',
      undoSnapshot: null,
    } as unknown as GameState;
    for (let level = 0; level < levels; level += 1) {
      chained = {
        ...chained,
        turn: chained.turn + 1,
        totalTurns: (chained.totalTurns ?? 0) + 1,
        undoSnapshot: { gameState: { ...chained, phase: 'EVENT' }, stats: { ...stats } },
      };
    }
    expect(snapshotDepth(chained)).toBe(levels);
    const newestSnapshotTurn = chained.undoSnapshot!.gameState.turn;

    expect(await SaveManager.saveToSlot('1', 'Ada', stats, chained)).toBe(true);
    const fromDisk = await SaveManager.loadFromSlot('1');
    expect(fromDisk).not.toBeNull();
    // Kayıt katmanı kaydı olduğu gibi döndürür (alan silinmez, format değişmez).
    expect(snapshotDepth(fromDisk!.gameState)).toBe(levels);

    let loaded = false;
    await act(async () => {
      loaded = await game().loadSavedGame('1', fromDisk!);
    });
    expect(loaded).toBe(true);

    const state = game().gameState;
    expect(snapshotDepth(state)).toBe(1);
    expect(state.undoSnapshot?.gameState.turn).toBe(newestSnapshotTurn);
    expect(state.undoSnapshot?.gameState.phase).toBe('EVENT');
    expect(state.undoSnapshot?.stats).toEqual(stats);
    expect(state).toMatchObject({ ...preserved, age: 12, phase: 'RESULT', turn: chained.turn });

    // Yüklemeden sonraki otomatik kayıt diske zincirsiz yazar.
    expect(snapshotDepth(autosavePayload().gameState)).toBe(1);
  });

  it('snapshot\'ı olmayan ya da tek seviyeli kayıt olduğu gibi yüklenir', async () => {
    const stats = { ...game().stats };
    const single = {
      ...game().gameState,
      age: 9,
      phase: 'RESULT',
      undoSnapshot: { gameState: { ...game().gameState, phase: 'EVENT', undoSnapshot: null }, stats },
    } as unknown as GameState;

    await act(async () => {
      await game().loadSavedGame('1', {
        metadata: { slotId: '1' },
        playerName: 'Ada',
        stats,
        gameState: single,
      } as any);
    });
    expect(snapshotDepth(game().gameState)).toBe(1);
    expect(game().gameState.undoSnapshot?.gameState.phase).toBe('EVENT');

    const withoutSnapshot = { ...game().gameState, phase: 'HUB', undoSnapshot: undefined } as unknown as GameState;
    await act(async () => {
      await game().loadSavedGame('1', {
        metadata: { slotId: '1' },
        playerName: 'Ada',
        stats,
        gameState: withoutSnapshot,
      } as any);
    });
    expect(game().gameState.undoSnapshot ?? null).toBeNull();
    expect(game().gameState.phase).toBe('HUB');
  });
});
