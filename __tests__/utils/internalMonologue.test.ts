import { getStrategicMonologue, composeInnerThought, StrategicMonologueInput } from '../../src/utils/internalMonologue';
import { createInitialPersonalityState } from '../../src/systems/PersonalityMomentumEngine';
import { GoalMismatchAnalysis } from '../../src/utils/endingResolver';

const NO_MISMATCH: GoalMismatchAnalysis = {
  selectedGoal: null,
  selectedScore: 60,
  dominantGoal: 'ACADEMIC',
  dominantScore: 60,
  gap: 0,
  isMismatch: false,
};

const buildInput = (overrides: Partial<StrategicMonologueInput> = {}): StrategicMonologueInput => ({
  burdenRisk: 0,
  age: 12,
  selectedGoal: null,
  goalMismatch: NO_MISMATCH,
  traitProgress: {},
  personalityState: createInitialPersonalityState(),
  turn: 10,
  ...overrides,
});

describe('getStrategicMonologue — Priority Queue', () => {
  it('returns CRISIS type when burdenRisk > 60', () => {
    const result = getStrategicMonologue(buildInput({ burdenRisk: 65 }));
    expect(result).not.toBeNull();
    expect(result!.type).toBe('CRISIS');
  });

  it('returns CRISIS SEVERE when burdenRisk > 70', () => {
    const result = getStrategicMonologue(buildInput({ burdenRisk: 75 }));
    expect(result).not.toBeNull();
    expect(result!.type).toBe('CRISIS');
  });

  it('returns CRISIS CRITICAL when burdenRisk > 80', () => {
    const result = getStrategicMonologue(buildInput({ burdenRisk: 85 }));
    expect(result).not.toBeNull();
    expect(result!.type).toBe('CRISIS');
  });

  it('returns MISMATCH type for age 13-15 with low alignment', () => {
    const mismatch: GoalMismatchAnalysis = {
      selectedGoal: 'ATHLETIC',
      selectedScore: 30,
      dominantGoal: 'ACADEMIC',
      dominantScore: 60,
      gap: 30,
      isMismatch: true,
    };
    const result = getStrategicMonologue(buildInput({
      age: 14,
      selectedGoal: 'ATHLETIC',
      goalMismatch: mismatch,
    }));
    expect(result).not.toBeNull();
    expect(result!.type).toBe('MISMATCH');
  });

  it('does NOT return MISMATCH for age outside 13-15', () => {
    const mismatch: GoalMismatchAnalysis = {
      selectedGoal: 'ATHLETIC',
      selectedScore: 30,
      dominantGoal: 'ACADEMIC',
      dominantScore: 60,
      gap: 30,
      isMismatch: true,
    };
    const result = getStrategicMonologue(buildInput({
      age: 16,
      selectedGoal: 'ATHLETIC',
      goalMismatch: mismatch,
    }));
    // At age 16 mismatch alert should not trigger (different system handles it)
    expect(result?.type).not.toBe('MISMATCH');
  });

  it('returns TRAIT type when trait progress >= 50%', () => {
    const result = getStrategicMonologue(buildInput({
      traitProgress: {
        DISCIPLINED: { points: 4, required: 6, isLocked: false, firstTriggeredAge: 8 },
      },
    }));
    expect(result).not.toBeNull();
    expect(result!.type).toBe('TRAIT');
    expect(result!.text).toContain('Disiplinli');
  });

  it('does NOT return TRAIT for locked traits', () => {
    const result = getStrategicMonologue(buildInput({
      traitProgress: {
        DISCIPLINED: { points: 5, required: 6, isLocked: true, firstTriggeredAge: 8 },
      },
    }));
    expect(result?.type).not.toBe('TRAIT');
  });

  it('returns MOMENTUM type when streak >= 5', () => {
    const personalityState = {
      ...createInitialPersonalityState(),
      HELPFUL: { count: 8, streak: 6, multiplier: 1.3 },
    };
    const result = getStrategicMonologue(buildInput({ personalityState }));
    expect(result).not.toBeNull();
    expect(result!.type).toBe('MOMENTUM');
  });

  it('returns null (IDLE) when no conditions met', () => {
    const result = getStrategicMonologue(buildInput());
    expect(result).toBeNull();
  });

  it('CRISIS takes priority over MISMATCH', () => {
    const mismatch: GoalMismatchAnalysis = {
      selectedGoal: 'ATHLETIC',
      selectedScore: 30,
      dominantGoal: 'ACADEMIC',
      dominantScore: 60,
      gap: 30,
      isMismatch: true,
    };
    const result = getStrategicMonologue(buildInput({
      burdenRisk: 70,
      age: 14,
      selectedGoal: 'ATHLETIC',
      goalMismatch: mismatch,
    }));
    expect(result!.type).toBe('CRISIS');
  });

  it('MISMATCH takes priority over TRAIT', () => {
    const mismatch: GoalMismatchAnalysis = {
      selectedGoal: 'ATHLETIC',
      selectedScore: 30,
      dominantGoal: 'ACADEMIC',
      dominantScore: 60,
      gap: 30,
      isMismatch: true,
    };
    const result = getStrategicMonologue(buildInput({
      age: 14,
      selectedGoal: 'ATHLETIC',
      goalMismatch: mismatch,
      traitProgress: {
        DISCIPLINED: { points: 4, required: 6, isLocked: false, firstTriggeredAge: 8 },
      },
    }));
    expect(result!.type).toBe('MISMATCH');
  });

  it('TRAIT takes priority over MOMENTUM', () => {
    const personalityState = {
      ...createInitialPersonalityState(),
      HELPFUL: { count: 8, streak: 6, multiplier: 1.3 },
    };
    const result = getStrategicMonologue(buildInput({
      personalityState,
      traitProgress: {
        EMPATHETIC: { points: 3, required: 4, isLocked: false, firstTriggeredAge: 5 },
      },
    }));
    expect(result!.type).toBe('TRAIT');
  });
});

describe('composeInnerThought', () => {
  it('strategic result takes priority over family thought', () => {
    const result = composeInnerThought(
      'Aile düşüncesi',
      { text: 'Kriz uyarısı', type: 'CRISIS' },
      'Fallback'
    );
    expect(result.text).toBe('Kriz uyarısı');
    expect(result.type).toBe('CRISIS');
  });

  it('returns family thought with IDLE type when no strategic result', () => {
    const result = composeInnerThought(
      'Aile düşüncesi',
      null,
      'Fallback'
    );
    expect(result.text).toBe('Aile düşüncesi');
    expect(result.type).toBe('IDLE');
  });

  it('returns fallback with IDLE type when nothing else available', () => {
    const result = composeInnerThought(null, null, 'Fallback');
    expect(result.text).toBe('Fallback');
    expect(result.type).toBe('IDLE');
  });
});
