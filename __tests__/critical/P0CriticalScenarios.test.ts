import AsyncStorage from '@react-native-async-storage/async-storage';
import SaveManager from '../../src/save/SaveManager';
import { getSlotKey, SAVE_VERSION } from '../../src/save/SaveSlot';
import { detectLegacySave, migrateLegacySave, migrateToVersion } from '../../src/save/SaveMigration';
import { selectEventWithAdaptivePacing } from '../../src/utils/eventSelection';
import { TurnMediator } from '../../src/systems/TurnMediator';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';
import type { SaveSlotData } from '../../src/save/SaveSlot';
import type {
  Choice,
  EventContext,
  GameEvent,
  GameState,
  Stats,
} from '../../src/types';

const resetSaveManagerInternals = () => {
  const manager = SaveManager as any;
  manager.state = {
    ...manager.state,
    slots: {},
    metadata: {},
    autoSaveEnabled: true,
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

const createLegacyStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: async (key: string) => {
      store.delete(key);
    },
    getAllKeys: async () => Array.from(store.keys()),
  };
};

const createRichState = (): GameState => {
  const state = getInitialGameState();
  return {
    ...state,
    age: 14,
    turn: 42,
    phase: 'HUB',
    totalTurns: 140,
    sessionCount: 4,
    traits: ['GENIUS', 'DISCIPLINED'],
    inventory: ['book', 'laptop'],
    eventChoiceHistory: ['evt_intro', 'evt_mid'],
    recentEvents: ['evt_intro', 'evt_mid'],
    memories: [
      {
        id: 'mem_1',
        eventId: 'evt_intro',
        choiceId: 'ch_1',
        age: 10,
        emotion: 'PRIDE',
        weight: 'HIGH',
        turnTimestamp: 20,
      },
    ],
    scheduledEvents: [
      {
        id: 'sc_1',
        eventId: 'evt_future',
        remainingTurns: 2,
        priority: 'HIGH',
        sourceEventId: 'evt_mid',
      },
    ],
    npcs: [
      {
        id: 'npc_1',
        name: 'Deniz',
        role: 'FRIEND',
        relationship: 65,
        romance: 20,
        gender: 'FEMALE',
        age: 14,
        personality: 'FRIENDLY',
        traits: ['LOYAL'],
        metAge: 9,
        metTurn: 8,
        lastInteraction: 40,
        sharedMemories: [],
        isInPlayerGroup: false,
      },
    ],
    unlockedAchievements: [
      {
        achievementId: 'first_income',
        unlockedAt: 11,
        timestamp: new Date('2026-01-01T00:00:00.000Z').toISOString(),
      },
    ],
    achievementProgress: {
      survivor: 1,
    },
  };
};

const createBaseStats = (): Stats => ({
  ...getInitialStats(),
  health: 68,
  intelligence: 72,
  charisma: 58,
  discipline: 65,
  money: 1500,
  energy: 70,
  familyRelation: 62,
});

const createEventContext = (): EventContext => ({
  age: 14,
  traits: ['DISCIPLINED'],
  stats: createBaseStats(),
  family: { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 25 },
  memories: [],
  inventory: [],
  personality: {
    openness: 50,
    courage: 50,
    empathy: 50,
    patience: 50,
    conformity: 50,
  },
  stress: {
    current: 20,
    threshold: 70,
    turnsSinceBreakdown: 2,
    sources: [],
  },
  skills: {
    coding: 40,
    music: 20,
    sports: 25,
    design: 20,
    athletics: 20,
    logic: 50,
    reading: 45,
    teamwork: 30,
    art: 15,
    writing: 20,
    work_ethic: 50,
    business: 10,
  },
  npcs: [],
});

describe('Critical P0 Scenarios', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    resetSaveManagerInternals();
  });

  it('P0-01 Given full state, When save+load round-trip, Then critical fields stay intact', async () => {
    const stats = createBaseStats();
    const gameState = createRichState();

    const saved = await SaveManager.saveToSlot('1', 'CriticalUser', stats, gameState);
    const loaded = await SaveManager.loadFromSlot('1');

    expect(saved).toBe(true);
    expect(loaded).not.toBeNull();
    expect(loaded?.playerName).toBe('CriticalUser');
    expect(loaded?.stats).toEqual(stats);
    expect(loaded?.gameState.traits).toEqual(gameState.traits);
    expect(loaded?.gameState.inventory).toEqual(gameState.inventory);
    expect(loaded?.gameState.npcs).toEqual(gameState.npcs);
    expect(loaded?.gameState.achievementProgress).toEqual(gameState.achievementProgress);
    expect(loaded?.gameState.scheduledEvents).toEqual(gameState.scheduledEvents);
  });

  it('P0-02 Given legacy/v0 save, When migration runs, Then schema upgrades without data loss', async () => {
    const storage = createLegacyStorage();
    const legacyData = {
      playerName: 'LegacyUser',
      stats: createBaseStats(),
      gameState: { age: 9, totalTurns: 12, phase: 'HUB' },
    };
    await storage.setItem('game_save', JSON.stringify(legacyData));

    const hasLegacy = await detectLegacySave(storage as any);
    const migratedLegacy = await migrateLegacySave(storage as any);

    expect(hasLegacy).toBe(true);
    expect(migratedLegacy).not.toBeNull();
    expect(migratedLegacy?.metadata.slotId).toBe('1');
    expect(migratedLegacy?.metadata.version).toBe(SAVE_VERSION);

    const v0 = {
      ...(migratedLegacy as SaveSlotData),
      metadata: {
        ...(migratedLegacy as SaveSlotData).metadata,
        version: 0,
        checksum: 'old_checksum',
      },
      gameState: {
        ...(migratedLegacy as SaveSlotData).gameState,
      } as any,
    } as SaveSlotData;
    delete (v0.gameState as any).unlockedAchievements;
    delete (v0.gameState as any).achievementProgress;
    delete (v0.gameState as any).eventFrequency;

    const upgraded = migrateToVersion(v0, SAVE_VERSION);

    expect(upgraded.metadata.version).toBe(SAVE_VERSION);
    expect(upgraded.gameState.unlockedAchievements).toEqual([]);
    expect(upgraded.gameState.achievementProgress).toEqual({});
    expect(upgraded.gameState.eventFrequency).toEqual({});
  });

  it('P0-03 Given corrupted slot payload, When load runs, Then it restores from backup instead of crashing', async () => {
    const stats = createBaseStats();
    const gameState = createRichState();
    await SaveManager.saveToSlot('1', 'BackupUser', stats, gameState);

    await AsyncStorage.setItem(getSlotKey('1'), 'not-a-valid-compressed-payload');
    const recovered = await SaveManager.loadFromSlot('1');

    expect(recovered).not.toBeNull();
    expect(recovered?.playerName).toBe('BackupUser');
    expect(recovered?.stats.money).toBe(stats.money);
  });

  it('P0-04 Given gated events, When eligibility fails, Then fallback is returned; otherwise valid event selected', () => {
    const context = createEventContext();
    const fallbackEvent: GameEvent = {
      id: 'fallback_evt',
      text: 'fallback',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      isRepeatable: true,
      rarity: 'COMMON',
      difficulty: 1,
    };
    const gatedEvent: GameEvent = {
      id: 'gated_evt',
      text: 'gated',
      minAge: 10,
      maxAge: 18,
      choices: [{ text: 'go', effect: {}, feedback: 'go' }],
      reqEventIds: ['story_started'],
      blockEventIds: ['story_blocked'],
      isRepeatable: false,
      rarity: 'UNCOMMON',
      difficulty: 3,
    };

    const fallbackPick = selectEventWithAdaptivePacing(
      [gatedEvent],
      context,
      [],
      [],
      { fallbackEvent, randomFn: () => 0.5 }
    );
    expect(fallbackPick.id).toBe('fallback_evt');

    const validPick = selectEventWithAdaptivePacing(
      [gatedEvent],
      context,
      [],
      ['story_started'],
      { fallbackEvent, randomFn: () => 0.5 }
    );
    expect(validPick.id).toBe('gated_evt');
  });

  it('P0-05 Given energy depletion, When turn is processed, Then recovery gating and day counter invariants hold', () => {
    const mediator = new TurnMediator();
    const base = createRichState();
    base.currentEvent = {
      id: 'evt_energy',
      text: 'Energy event',
      minAge: 0,
      maxAge: 18,
      choices: [],
      difficulty: 2,
      rarity: 'COMMON',
      personalityCategory: 'GROWTH',
    };

    const choice: Choice = {
      id: 'drain_energy',
      text: 'Push hard',
      effect: { energy: -50 },
      feedback: 'Tired.',
    };

    const forceRecovery = mediator.processEventChoice({
      choice,
      gameState: { ...base, dailyDecisionCount: 0 },
      stats: { ...createBaseStats(), energy: 10 },
    });
    expect(forceRecovery.gameStateUpdates.phase).toBe('RESULT');
    expect(forceRecovery.shouldForceRecovery).toBe(true);
    expect(forceRecovery.gameStateUpdates.dailyDecisionCount).toBe(1);

    const endDay = mediator.processEventChoice({
      choice,
      gameState: { ...base, dailyDecisionCount: 2 },
      stats: { ...createBaseStats(), energy: 10 },
    });
    expect(endDay.shouldForceRecovery).toBe(false);
    expect(endDay.gameStateUpdates.dailyDecisionCount).toBe(0);
  });
});
