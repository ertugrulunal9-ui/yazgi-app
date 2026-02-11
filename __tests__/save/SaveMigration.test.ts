import { detectLegacySave, migrateLegacySave, migrateToVersion } from '../../src/save/SaveMigration';
import { SAVE_VERSION, SaveSlotData } from '../../src/save/SaveSlot';
import { generateChecksum } from '../../src/utils/checksum';

const createMockStorage = () => {
  const store = new Map<string, string>();
  return {
    getItem: async (key: string) => store.get(key) ?? null,
    setItem: async (key: string, value: string) => { store.set(key, value); },
    removeItem: async (key: string) => { store.delete(key); },
    getAllKeys: async () => Array.from(store.keys()),
  };
};

describe('Save Migration', () => {
  it('should detect legacy save', async () => {
    const storage = createMockStorage();
    await storage.setItem('game_save', JSON.stringify({ foo: 'bar' }));
    const result = await detectLegacySave(storage);
    expect(result).toBe(true);
  });

  it('should migrate legacy save with playtime based on turns', async () => {
    const storage = createMockStorage();
    const legacyData = {
      playerName: 'Test',
      stats: { health: 50, intelligence: 50, charisma: 50, discipline: 50, money: 0, energy: 50, familyRelation: 50 },
      gameState: { age: 5, totalTurns: 10 },
    };
    await storage.setItem('game_save', JSON.stringify(legacyData));

    const migrated = await migrateLegacySave(storage);
    expect(migrated).not.toBeNull();
    expect(migrated?.metadata.slotId).toBe('1');
    expect(migrated?.metadata.playtime).toBe(50);
    const expectedChecksum = generateChecksum({
      playerName: legacyData.playerName,
      stats: legacyData.stats,
      gameState: legacyData.gameState as any,
    });
    expect(migrated?.metadata.checksum).toBe(expectedChecksum);
  });

  it('should migrate v0 to v1 achievements fields', () => {
    const saveData: SaveSlotData = {
      metadata: {
        slotId: '1',
        characterName: 'Test',
        age: 1,
        playtime: 0,
        lastPlayed: Date.now(),
        version: 0,
        checksum: 'old',
        status: 'active',
        isPremium: false,
      },
      playerName: 'Test',
      stats: { health: 50, intelligence: 50, charisma: 50, discipline: 50, money: 0, energy: 50, familyRelation: 50 },
      gameState: {
        age: 1,
        turn: 1,
        phase: 'HUB',
        currentEvent: null,
        pendingReportCard: false,
        characterInfo: null,
        lastResult: null,
        historyLog: [],
        family: null,
        maxEnergy: 100,
        schoolGrades: { math: 50, science: 50, language: 50, turkish: 50, history: 50, geography: 50, art: 50, music: 50 },
        skills: {
          coding: 0, music: 0, sports: 0, design: 0, athletics: 0, logic: 0, reading: 0,
          teamwork: 0, art: 0, writing: 0, work_ethic: 0, business: 0
        },
        talent: 'NONE',
        streak: { actionId: null, count: 0 },
        traits: [],
        traitProgress: {},
        actionCounts: {},
        actionHistory: [],
        eventChoiceHistory: [],
        inventory: [],
        npcs: [],
        selectedNpcId: null,
        innerThought: '',
        floatingTexts: [],
        totalTurns: 0,
        lastInteracted: {},
        recentEvents: [],
        memories: [],
        scheduledEvents: [],
        // Missing achievements fields for v0
        unlockedAchievements: [],
        achievementProgress: {},
        personality: { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50 },
        stress: { current: 0, threshold: 70, turnsSinceBreakdown: 0, sources: [] },
        personalityHistory: [],
        socialGroups: [],
        socialReputation: 50,
        examsTakenThisYear: [],
        isExamPeriod: false,
      },
    };

    const migrated = migrateToVersion(saveData, SAVE_VERSION);
    expect(migrated.metadata.version).toBe(SAVE_VERSION);
    expect(migrated.gameState.unlockedAchievements).toBeDefined();
    expect(migrated.gameState.achievementProgress).toBeDefined();
  });
});
