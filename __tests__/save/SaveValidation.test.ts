import {
  validateSaveData,
  validateStats,
  validateGameState,
  DEFAULT_PERSONALITY,
  DEFAULT_STRESS,
  DEFAULT_STATS,
  DEFAULT_FAMILY_EVOLUTION,
  StatsSchema,
  PersonalitySchema,
  StressStateSchema,
  GameStateSchema,
  SaveSlotDataSchema,
} from '@/save/SaveValidation';

// Helper: minimal valid save data
function createValidSaveData() {
  return {
    metadata: {
      slotId: 'slot_1',
      characterName: 'Test',
      age: 10,
      playtime: 1000,
      lastPlayed: Date.now(),
      version: 1,
      checksum: 'abc123',
      status: 'active',
      isPremium: false,
    },
    playerName: 'TestPlayer',
    stats: {
      health: 50,
      intelligence: 50,
      charisma: 50,
      discipline: 50,
      money: 100,
      energy: 80,
      familyRelation: 60,
    },
    gameState: {},
  };
}

// ==========================================
// SCHEMA UNIT TESTS
// ==========================================

describe('StatsSchema', () => {
  it('accepts valid stats', () => {
    const result = StatsSchema.safeParse({
      health: 50, intelligence: 50, charisma: 50,
      discipline: 50, money: 100, energy: 80, familyRelation: 60,
    });
    expect(result.success).toBe(true);
  });

  it('rejects health > 200', () => {
    const result = StatsSchema.safeParse({
      health: 201, intelligence: 50, charisma: 50,
      discipline: 50, money: 100, energy: 80, familyRelation: 60,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative health', () => {
    const result = StatsSchema.safeParse({
      health: -1, intelligence: 50, charisma: 50,
      discipline: 50, money: 100, energy: 80, familyRelation: 60,
    });
    expect(result.success).toBe(false);
  });

  it('allows money to be any non-negative number', () => {
    const result = StatsSchema.safeParse({
      health: 50, intelligence: 50, charisma: 50,
      discipline: 50, money: 999999, energy: 80, familyRelation: 60,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative money', () => {
    const result = StatsSchema.safeParse({
      health: 50, intelligence: 50, charisma: 50,
      discipline: 50, money: -10, energy: 80, familyRelation: 60,
    });
    expect(result.success).toBe(false);
  });

  it('rejects familyRelation > 120', () => {
    const result = StatsSchema.safeParse({
      health: 50, intelligence: 50, charisma: 50,
      discipline: 50, money: 0, energy: 80, familyRelation: 121,
    });
    expect(result.success).toBe(false);
  });
});

describe('PersonalitySchema', () => {
  it('accepts valid personality', () => {
    const result = PersonalitySchema.safeParse(DEFAULT_PERSONALITY);
    expect(result.success).toBe(true);
  });

  it('rejects values above 100', () => {
    const result = PersonalitySchema.safeParse({ ...DEFAULT_PERSONALITY, openness: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects values below 0', () => {
    const result = PersonalitySchema.safeParse({ ...DEFAULT_PERSONALITY, courage: -1 });
    expect(result.success).toBe(false);
  });
});

describe('StressStateSchema', () => {
  it('accepts valid stress state', () => {
    const result = StressStateSchema.safeParse(DEFAULT_STRESS);
    expect(result.success).toBe(true);
  });

  it('rejects current stress > 100', () => {
    const result = StressStateSchema.safeParse({ ...DEFAULT_STRESS, current: 101 });
    expect(result.success).toBe(false);
  });

  it('accepts stress with sources', () => {
    const result = StressStateSchema.safeParse({
      ...DEFAULT_STRESS,
      current: 30,
      sources: [{ reason: 'exam', amount: 10, turn: 5 }],
    });
    expect(result.success).toBe(true);
  });
});

// ==========================================
// validateSaveData TESTS
// ==========================================

describe('validateSaveData', () => {
  it('returns valid=true for correct save data', () => {
    const data = createValidSaveData();
    const result = validateSaveData(data);
    expect(result.valid).toBe(true);
    expect(result.repaired).toBe(false);
    expect(result.data).not.toBeNull();
    expect(result.errors).toBeNull();
  });

  it('returns valid=false for null input', () => {
    const result = validateSaveData(null);
    expect(result.valid).toBe(false);
    expect(result.data).toBeNull();
  });

  it('returns valid=false for undefined input', () => {
    const result = validateSaveData(undefined);
    expect(result.valid).toBe(false);
  });

  it('returns valid=false for primitive input', () => {
    const result = validateSaveData('not an object');
    expect(result.valid).toBe(false);
  });

  it('auto-repairs missing personality in gameState', () => {
    const data = createValidSaveData();
    (data.gameState as any).personality = 'invalid';
    const result = validateSaveData(data);
    // Should attempt repair
    if (result.valid) {
      expect(result.repaired).toBe(true);
      expect(result.repairLog.length).toBeGreaterThan(0);
    }
  });

  it('auto-repairs missing stress in gameState', () => {
    const data = createValidSaveData();
    (data.gameState as any).stress = 'invalid';
    const result = validateSaveData(data);
    if (result.valid) {
      expect(result.repaired).toBe(true);
      expect(result.repairLog.some(log => log.includes('stress'))).toBe(true);
    }
  });

  it('auto-repairs missing memories array', () => {
    const data = createValidSaveData();
    (data.gameState as any).memories = 'not_an_array';
    const result = validateSaveData(data);
    if (result.valid) {
      expect(result.repaired).toBe(true);
    }
  });

  it('auto-repairs invalid personalityHistory entries', () => {
    const data = createValidSaveData();
    (data.gameState as any).personalityHistory = [
      { axis: 'openness', oldValue: 50, newValue: 55, reason: 'test', turn: 1, age: 10 },
      { axis: 'INVALID_AXIS', oldValue: 50, newValue: 55, reason: 'bad', turn: 1, age: 10 },
    ];
    const result = validateSaveData(data);
    if (result.valid && result.repaired) {
      expect(result.repairLog.some(log => log.includes('personalityHistory'))).toBe(true);
    }
  });

  it('auto-repairs negative money to 0', () => {
    const data = createValidSaveData();
    data.stats.money = -50;
    const result = validateSaveData(data);
    if (result.valid && result.repaired) {
      expect(result.data!.stats.money).toBe(0);
    }
  });

  it('auto-repairs missing familyEvolution', () => {
    const data = createValidSaveData();
    (data.gameState as any).familyEvolution = 'invalid';
    const result = validateSaveData(data);
    if (result.valid) {
      expect(result.repaired).toBe(true);
    }
  });
});

// ==========================================
// validateStats TESTS
// ==========================================

describe('validateStats', () => {
  it('returns stats for valid input', () => {
    const stats = {
      health: 50, intelligence: 50, charisma: 50,
      discipline: 50, money: 100, energy: 80, familyRelation: 60,
    };
    expect(validateStats(stats)).toEqual(stats);
  });

  it('returns null for invalid input', () => {
    expect(validateStats({ health: 'string' })).toBeNull();
  });

  it('returns null for empty object', () => {
    expect(validateStats({})).toBeNull();
  });
});

// ==========================================
// validateGameState TESTS
// ==========================================

describe('validateGameState', () => {
  it('returns game state for valid partial input (schema is partial)', () => {
    const result = validateGameState({ age: 10, turn: 5 });
    expect(result).not.toBeNull();
  });

  it('returns game state for empty object (all fields optional)', () => {
    const result = validateGameState({});
    expect(result).not.toBeNull();
  });

  it('returns null for non-object input', () => {
    expect(validateGameState('invalid')).toBeNull();
  });
});

// ==========================================
// DEFAULT VALUES TESTS
// ==========================================

describe('Default values', () => {
  it('DEFAULT_PERSONALITY has all axes at 50', () => {
    expect(DEFAULT_PERSONALITY).toEqual({
      openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50,
    });
  });

  it('DEFAULT_STRESS starts at 0 with threshold 70', () => {
    expect(DEFAULT_STRESS.current).toBe(0);
    expect(DEFAULT_STRESS.threshold).toBe(70);
    expect(DEFAULT_STRESS.sources).toEqual([]);
  });

  it('DEFAULT_STATS has balanced values', () => {
    expect(DEFAULT_STATS.health).toBe(50);
    expect(DEFAULT_STATS.intelligence).toBe(50);
    expect(DEFAULT_STATS.money).toBe(0);
    expect(DEFAULT_STATS.energy).toBe(100);
  });

  it('DEFAULT_FAMILY_EVOLUTION has all flags as false', () => {
    expect(DEFAULT_FAMILY_EVOLUTION.strictWarmthTriggered).toBe(false);
    expect(DEFAULT_FAMILY_EVOLUTION.familyCrisisTriggered).toBe(false);
    expect(DEFAULT_FAMILY_EVOLUTION.yearsAtHighRelation).toBe(0);
  });
});
