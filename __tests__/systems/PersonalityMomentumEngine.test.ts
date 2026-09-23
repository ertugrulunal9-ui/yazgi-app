import {
  applyMomentumSignal,
  createInitialPersonalityState,
  getMomentumMultiplierForStat,
  getMultiplierForStreak,
  isSpecialPathUnlocked,
} from '../../src/systems/PersonalityMomentumEngine';

describe('PersonalityMomentumEngine', () => {
  it('grows multiplier after consistent streak with logarithmic curve', () => {
    let state = createInitialPersonalityState();

    state = applyMomentumSignal(state, 'HELPFUL').nextState;
    state = applyMomentumSignal(state, 'HELPFUL').nextState;
    state = applyMomentumSignal(state, 'HELPFUL').nextState;

    expect(state.HELPFUL.count).toBe(3);
    expect(state.HELPFUL.streak).toBe(3);
    expect(state.HELPFUL.multiplier).toBe(1.1);

    state = applyMomentumSignal(state, 'HELPFUL').nextState;
    state = applyMomentumSignal(state, 'HELPFUL').nextState;

    expect(state.HELPFUL.multiplier).toBe(1.25);
  });

  it('applies a heavy hit on opposite signal', () => {
    let state = createInitialPersonalityState();
    state = applyMomentumSignal(state, 'HELPFUL').nextState;
    state = applyMomentumSignal(state, 'HELPFUL').nextState;
    state = applyMomentumSignal(state, 'HELPFUL').nextState;

    const afterOpposite = applyMomentumSignal(state, 'SELFISH').nextState;

    expect(afterOpposite.HELPFUL.streak).toBe(0);
    expect(afterOpposite.HELPFUL.multiplier).toBe(1);
  });

  it('maps social stats to helpful momentum multiplier', () => {
    const state = {
      ...createInitialPersonalityState(),
      HELPFUL: {
        count: 10,
        streak: 5,
        multiplier: getMultiplierForStreak(5),
      },
    };

    const social = getMomentumMultiplierForStat('charisma', state);
    const relation = getMomentumMultiplierForStat('familyRelation', state);

    expect(social.multiplier).toBeGreaterThan(1);
    expect(relation.multiplier).toBeGreaterThan(1);
    expect(social.tendency).toBe('HELPFUL');
  });

  it('preserves 70% of streak in crisis context (Softfall)', () => {
    let state = createInitialPersonalityState();
    // Build a streak of 10
    for (let i = 0; i < 10; i++) {
      state = applyMomentumSignal(state, 'HELPFUL').nextState;
    }
    expect(state.HELPFUL.streak).toBe(10);

    // Opposite signal WITH crisis context — Softfall
    const afterCrisis = applyMomentumSignal(state, 'SELFISH', { isCrisisContext: true }).nextState;
    expect(afterCrisis.HELPFUL.streak).toBe(7); // floor(10 * 0.7)
    expect(afterCrisis.HELPFUL.multiplier).toBeGreaterThan(1);

    // Opposite signal WITHOUT crisis context — heavy hit (floor(10*0.2) = 2, but multiplier resets)
    const afterNormal = applyMomentumSignal(state, 'SELFISH').nextState;
    expect(afterNormal.HELPFUL.streak).toBe(2);
    expect(afterNormal.HELPFUL.multiplier).toBe(1);
  });

  it('unlocks special path once threshold is reached', () => {
    const state = {
      ...createInitialPersonalityState(),
      PRAGMATIC: {
        count: 12,
        streak: 7,
        multiplier: 1.4,
      },
    };

    expect(isSpecialPathUnlocked(state, 'PRAGMATIC', 1.35)).toBe(true);
    expect(isSpecialPathUnlocked(state, 'PRAGMATIC', 1.5)).toBe(false);
  });
});
