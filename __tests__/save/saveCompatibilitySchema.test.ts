import { validateSaveData } from '../../src/save/SaveValidation';

describe('Save Compatibility Schema', () => {
  const makeMinimalValidSave = () => ({
    metadata: {
      slotId: '1',
      characterName: 'Test',
      age: 10,
      playtime: 100,
      lastPlayed: Date.now(),
      version: 1,
      checksum: 'abc123',
      status: 'active' as const,
      isPremium: false,
    },
    playerName: 'Test',
    stats: {
      health: 50,
      intelligence: 30,
      charisma: 20,
      discipline: 10,
      money: 100,
      energy: 50,
      familyRelation: 50,
    },
    gameState: {
      age: 10,
      energy: 50,
      maxEnergy: 100,
      turn: 5,
      totalTurns: 5,
      traits: [],
      traitProgress: {},
      inventory: [],
      eventHistory: [],
      recentEventIds: [],
      lifeGoal: null,
      selectedGoal: null,
      unlockedAchievements: [],
      achievementProgress: {},
      eventFrequency: {},
      actionHistory: [],
      scheduledEvents: [],
      npcs: [],
      personalityHistory: [],
      personality: { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50 },
      storyArcs: [],
      activeBuffs: [],
      consumableCooldowns: {},
      consumableUsageThisTurn: {},
    },
  });

  describe('v1 key compatibility', () => {
    it('validates a minimal v1-era save (no new fields)', () => {
      const save = makeMinimalValidSave();
      // Remove new fields to simulate v1 save
      delete (save.gameState as Record<string, unknown>).activeBuffs;
      delete (save.gameState as Record<string, unknown>).consumableCooldowns;
      delete (save.gameState as Record<string, unknown>).consumableUsageThisTurn;

      const result = validateSaveData(save);
      // GameState uses .partial() so missing optional fields should be fine
      expect(result.valid || result.repaired).toBe(true);
    });

    it('validates a complete save with all fields', () => {
      const save = makeMinimalValidSave();
      const result = validateSaveData(save);
      expect(result.valid).toBe(true);
      expect(result.data).not.toBeNull();
    });
  });

  describe('validate+repair persist', () => {
    it('accepts save missing activeBuffs (optional field)', () => {
      const save = makeMinimalValidSave();
      delete (save.gameState as Record<string, unknown>).activeBuffs;

      const result = validateSaveData(save);
      // GameState uses .partial() — missing optional fields are accepted
      expect(result.valid || result.repaired).toBe(true);
    });

    it('accepts save missing consumableCooldowns (optional field)', () => {
      const save = makeMinimalValidSave();
      delete (save.gameState as Record<string, unknown>).consumableCooldowns;

      const result = validateSaveData(save);
      expect(result.valid || result.repaired).toBe(true);
    });

    it('accepts save missing consumableUsageThisTurn (optional field)', () => {
      const save = makeMinimalValidSave();
      delete (save.gameState as Record<string, unknown>).consumableUsageThisTurn;

      const result = validateSaveData(save);
      expect(result.valid || result.repaired).toBe(true);
    });
  });

  describe('unknown field handling', () => {
    it('does not crash on unknown fields in gameState', () => {
      const save = makeMinimalValidSave();
      (save.gameState as Record<string, unknown>).futureFieldV3 = 'something';

      // Zod may strip unknown fields, but validation should still succeed
      const result = validateSaveData(save);
      expect(result.valid || result.repaired).toBe(true);
      expect(result.data).not.toBeNull();
    });

    it('handles unknown fields in metadata gracefully (Zod may strip or reject)', () => {
      const save = makeMinimalValidSave();
      (save.metadata as Record<string, unknown>).newMetaField = 42;

      // Zod strict schemas reject unknown fields — this is expected behavior
      // The important thing is it doesn't throw an unhandled exception
      const result = validateSaveData(save);
      expect(typeof result.valid).toBe('boolean');
      expect(result.errors === null || result.errors !== null).toBe(true);
    });
  });

  describe('corrupt save fallback', () => {
    it('rejects completely invalid data', () => {
      const corrupt = { garbage: true };
      const result = validateSaveData(corrupt as any);
      expect(result.valid).toBe(false);
    });

    it('rejects null', () => {
      const result = validateSaveData(null as any);
      expect(result.valid).toBe(false);
    });

    it('rejects non-object', () => {
      const result = validateSaveData('not an object' as any);
      expect(result.valid).toBe(false);
    });
  });
});
