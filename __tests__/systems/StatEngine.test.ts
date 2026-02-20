import { StatEngine, StatChangeConfig } from '@/systems/StatEngine';
import { Stats, Family } from '@/types';

function createDefaultStats(overrides: Partial<Stats> = {}): Stats {
  return {
    health: 50,
    intelligence: 50,
    charisma: 50,
    discipline: 50,
    money: 1000,
    energy: 80,
    familyRelation: 50,
    ...overrides,
  };
}

function createDefaultConfig(overrides: Partial<StatChangeConfig> = {}): StatChangeConfig {
  return {
    age: 15,
    family: { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 50 },
    traits: [],
    ...overrides,
  };
}

// ==========================================
// applyChanges TESTS
// ==========================================

describe('StatEngine.applyChanges', () => {
  it('applies positive stat changes', () => {
    const stats = createDefaultStats();
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { intelligence: 5 }, config);

    expect(result.newStats.intelligence).toBeGreaterThan(stats.intelligence);
    expect(result.details.length).toBe(1);
    expect(result.details[0].stat).toBe('intelligence');
  });

  it('applies negative stat changes', () => {
    const stats = createDefaultStats();
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { health: -10 }, config);

    expect(result.newStats.health).toBeLessThan(stats.health);
  });

  it('does not modify stats for zero changes', () => {
    const stats = createDefaultStats();
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { intelligence: 0 }, config);

    expect(result.newStats).toEqual(stats);
    expect(result.details.length).toBe(0);
  });

  it('handles multiple stat changes at once', () => {
    const stats = createDefaultStats();
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(
      stats,
      { intelligence: 5, charisma: 3, discipline: -2 },
      config
    );

    expect(result.newStats.intelligence).toBeGreaterThan(stats.intelligence);
    expect(result.newStats.charisma).toBeGreaterThan(stats.charisma);
    expect(result.newStats.discipline).toBeLessThan(stats.discipline);
    expect(result.details.length).toBe(3);
  });

  it('applies money changes directly (no diminishing returns)', () => {
    const stats = createDefaultStats({ money: 100 });
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { money: 500 }, config);

    expect(result.newStats.money).toBe(600);
  });

  it('applies energy changes directly (no diminishing returns)', () => {
    const stats = createDefaultStats({ energy: 50 });
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { energy: 20 }, config);

    expect(result.newStats.energy).toBe(70);
  });

  it('does not let stats go below 0', () => {
    const stats = createDefaultStats({ health: 5 });
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { health: -100 }, config);

    expect(result.newStats.health).toBeGreaterThanOrEqual(0);
  });

  it('does not let money go below 0', () => {
    const stats = createDefaultStats({ money: 10 });
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { money: -100 }, config);

    expect(result.newStats.money).toBe(0);
  });

  it('records applied changes (post-clamp)', () => {
    const stats = createDefaultStats();
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { intelligence: 5 }, config);

    const intChange = result.appliedChanges.intelligence;
    expect(intChange).toBeDefined();
    expect(intChange).toBeGreaterThan(0);
  });

  it('returns empty appliedChanges when nothing changed', () => {
    const stats = createDefaultStats({ health: 0 });
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { health: -10 }, config);

    // health is 0 and can't go lower
    expect(result.appliedChanges.health).toBeUndefined();
  });

  it('applies trait multipliers for positive changes', () => {
    const stats = createDefaultStats({ intelligence: 30 });
    const withTrait = createDefaultConfig({ traits: ['GENIUS'] });
    const withoutTrait = createDefaultConfig({ traits: [] });

    const resultWith = StatEngine.applyChanges(stats, { intelligence: 10 }, withTrait);
    const resultWithout = StatEngine.applyChanges(stats, { intelligence: 10 }, withoutTrait);

    // With GENIUS trait, intelligence gain should be higher
    expect(resultWith.newStats.intelligence).toBeGreaterThanOrEqual(resultWithout.newStats.intelligence);
  });

  it('provides correct details per stat change', () => {
    const stats = createDefaultStats();
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { charisma: 8 }, config);

    const detail = result.details[0];
    expect(detail.stat).toBe('charisma');
    expect(detail.originalDelta).toBe(8);
    expect(detail.oldValue).toBe(50);
    expect(detail.newValue).toBe(stats.charisma + detail.finalDelta);
    expect(detail.cap).toBeGreaterThan(0);
  });
});

// ==========================================
// applyRaw TESTS
// ==========================================

describe('StatEngine.applyRaw', () => {
  it('applies changes without diminishing returns', () => {
    const stats = createDefaultStats({ energy: 50 });
    const result = StatEngine.applyRaw(stats, { energy: 30 });

    expect(result.energy).toBe(80);
  });

  it('clamps stats at 0 minimum', () => {
    const stats = createDefaultStats({ health: 10 });
    const result = StatEngine.applyRaw(stats, { health: -50 });

    expect(result.health).toBe(0);
  });

  it('clamps regular stats at 100 maximum', () => {
    const stats = createDefaultStats({ charisma: 90 });
    const result = StatEngine.applyRaw(stats, { charisma: 20 });

    expect(result.charisma).toBe(100);
  });

  it('does not clamp money at 100', () => {
    const stats = createDefaultStats({ money: 90 });
    const result = StatEngine.applyRaw(stats, { money: 500 });

    expect(result.money).toBe(590);
  });

  it('preserves unchanged stats', () => {
    const stats = createDefaultStats();
    const result = StatEngine.applyRaw(stats, { health: 10 });

    expect(result.intelligence).toBe(stats.intelligence);
    expect(result.charisma).toBe(stats.charisma);
    expect(result.money).toBe(stats.money);
  });

  it('handles empty changes', () => {
    const stats = createDefaultStats();
    const result = StatEngine.applyRaw(stats, {});

    expect(result).toEqual(stats);
  });
});

// ==========================================
// getChangeReport TESTS
// ==========================================

describe('StatEngine.getChangeReport', () => {
  it('generates a readable report', () => {
    const stats = createDefaultStats();
    const config = createDefaultConfig();
    const result = StatEngine.applyChanges(stats, { intelligence: 5, health: -3 }, config);
    const report = StatEngine.getChangeReport(result);

    expect(report).toContain('Stat Change Report');
    expect(report).toContain('intelligence');
    expect(report).toContain('health');
  });

  it('generates empty report for no changes', () => {
    const result = StatEngine.applyChanges(
      createDefaultStats(),
      {},
      createDefaultConfig()
    );
    const report = StatEngine.getChangeReport(result);

    expect(report).toContain('Stat Change Report');
  });
});
