import { StatEngine } from '../../src/systems/StatEngine';
import { Stats } from '../../src/types';
import { createInitialPersonalityState } from '../../src/systems/PersonalityMomentumEngine';

describe('StatEngine', () => {
  const baseStats: Stats = {
    health: 80,
    intelligence: 80,
    charisma: 70,
    discipline: 70,
    money: 500,
    energy: 60,
    familyRelation: 60,
  };

  it('applies diminishing returns symmetrically for negative non-money/energy deltas', () => {
    const lowStatBase: Stats = {
      ...baseStats,
      intelligence: 20,
    };
    const result = StatEngine.applyChanges(
      lowStatBase,
      { intelligence: -10 },
      { age: 16, family: null, traits: [] }
    );

    expect(result.newStats.intelligence).toBe(15);
    expect(result.appliedChanges.intelligence).toBe(-5);
  });

  it('keeps raw negative deltas for money and energy', () => {
    const result = StatEngine.applyChanges(
      baseStats,
      { money: -100, energy: -20 },
      { age: 16, family: null, traits: [] }
    );

    expect(result.newStats.money).toBe(400);
    expect(result.newStats.energy).toBe(40);
  });

  it('applies momentum multiplier when stat aligns with active tendency', () => {
    const personalityState = createInitialPersonalityState();
    personalityState.HELPFUL.streak = 5;
    personalityState.HELPFUL.multiplier = 1.25;

    const result = StatEngine.applyChanges(
      baseStats,
      { charisma: 4 },
      { age: 16, family: null, traits: [], personalityState }
    );

    expect(result.newStats.charisma).toBeGreaterThan(baseStats.charisma + 1);
    expect(result.details[0].momentumMultiplier).toBe(1.25);
    expect(result.details[0].momentumTendency).toBe('HELPFUL');
  });

  it('applies burden penalty when risk is above 50', () => {
    const lowStatBase: Stats = {
      ...baseStats,
      intelligence: 20,
    };

    const normal = StatEngine.applyChanges(
      lowStatBase,
      { intelligence: 11 },
      { age: 18, family: null, traits: [] }
    );
    const burdened = StatEngine.applyChanges(
      lowStatBase,
      { intelligence: 11 },
      { age: 18, family: null, traits: [], burdenRisk: 62 }
    );
    const expectedBurdenMultiplier = 1 - (Math.min((62 - 40) / 60, 1) * 0.35);

    expect(burdened.newStats.intelligence).toBeLessThan(normal.newStats.intelligence);
    expect(burdened.details[0].burdenMultiplier).toBeCloseTo(expectedBurdenMultiplier, 6);
  });
});
