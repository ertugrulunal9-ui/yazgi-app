import {
  DEFAULT_PERSONALITY,
  DEFAULT_STRESS,
  generateInitialPersonality,
  clampPersonality,
  applyPersonalityEffects,
  updateStress,
  naturalStressRecovery,
  calculateBreakdownRisk,
  checkPersonalityRequirements,
  checkStressRequirement,
  calculateChoiceStressCost,
  getPersonalityArchetype,
  getArchetypeDescription,
  getPersonalityAxisName,
  getPersonalityLevelDescription,
  generateInnerThought,
  filterEventsByPersonality,
  enrichChoicesWithPersonality,
} from '@/utils/personalitySystem';
import { Personality, StressState, Family } from '@/types';

// ==========================================
// DEFAULT VALUES
// ==========================================

describe('Default values', () => {
  it('DEFAULT_PERSONALITY has all axes at 50', () => {
    const axes = ['openness', 'courage', 'empathy', 'patience', 'conformity'] as const;
    axes.forEach(axis => expect(DEFAULT_PERSONALITY[axis]).toBe(50));
  });

  it('DEFAULT_STRESS starts at 0 with threshold 70', () => {
    expect(DEFAULT_STRESS.current).toBe(0);
    expect(DEFAULT_STRESS.threshold).toBe(70);
    expect(DEFAULT_STRESS.turnsSinceBreakdown).toBe(0);
    expect(DEFAULT_STRESS.sources).toEqual([]);
  });
});

// ==========================================
// generateInitialPersonality
// ==========================================

describe('generateInitialPersonality', () => {
  it('returns default personality when no family or traits', () => {
    const result = generateInitialPersonality(null, []);
    expect(result).toEqual(DEFAULT_PERSONALITY);
  });

  it('applies STRICT family dynamic effects', () => {
    const family: Family = { wealth: 'MIDDLE', dynamic: 'STRICT', allowance: 50 };
    const result = generateInitialPersonality(family, []);

    expect(result.conformity).toBeGreaterThan(DEFAULT_PERSONALITY.conformity);
    expect(result.courage).toBeLessThan(DEFAULT_PERSONALITY.courage);
    expect(result.patience).toBeGreaterThan(DEFAULT_PERSONALITY.patience);
  });

  it('applies SUPPORTIVE family dynamic effects', () => {
    const family: Family = { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 50 };
    const result = generateInitialPersonality(family, []);

    expect(result.openness).toBeGreaterThan(DEFAULT_PERSONALITY.openness);
    expect(result.courage).toBeGreaterThan(DEFAULT_PERSONALITY.courage);
    expect(result.empathy).toBeGreaterThan(DEFAULT_PERSONALITY.empathy);
  });

  it('applies CHAOTIC family dynamic effects', () => {
    const family: Family = { wealth: 'MIDDLE', dynamic: 'CHAOTIC', allowance: 50 };
    const result = generateInitialPersonality(family, []);

    expect(result.conformity).toBeLessThan(DEFAULT_PERSONALITY.conformity);
    expect(result.patience).toBeLessThan(DEFAULT_PERSONALITY.patience);
  });

  it('applies POOR wealth effects', () => {
    const family: Family = { wealth: 'POOR', dynamic: 'SUPPORTIVE', allowance: 10 };
    const result = generateInitialPersonality(family, []);

    expect(result.patience).toBeGreaterThan(
      generateInitialPersonality(
        { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 50 },
        []
      ).patience
    );
  });

  it('applies RICH wealth effects', () => {
    const family: Family = { wealth: 'RICH', dynamic: 'SUPPORTIVE', allowance: 200 };
    const result = generateInitialPersonality(family, []);
    const middleResult = generateInitialPersonality(
      { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 50 }, []
    );

    expect(result.patience).toBeLessThan(middleResult.patience);
  });

  it('applies CHARISMATIC trait', () => {
    const result = generateInitialPersonality(null, ['CHARISMATIC']);
    expect(result.openness).toBe(70); // 50 + 20
  });

  it('applies SICKLY trait', () => {
    const result = generateInitialPersonality(null, ['SICKLY']);
    expect(result.courage).toBe(35); // 50 - 15
    expect(result.openness).toBe(40); // 50 - 10
  });

  it('clamps values to 0-100 range', () => {
    // Stack multiple negative effects
    const family: Family = { wealth: 'RICH', dynamic: 'CHAOTIC', allowance: 200 };
    const result = generateInitialPersonality(family, ['SICKLY']);

    Object.values(result).forEach(val => {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(100);
    });
  });
});

// ==========================================
// clampPersonality
// ==========================================

describe('clampPersonality', () => {
  it('clamps values above 100 to 100', () => {
    const p = { openness: 120, courage: 50, empathy: 50, patience: 50, conformity: 50 };
    const result = clampPersonality(p);
    expect(result.openness).toBe(100);
  });

  it('clamps values below 0 to 0', () => {
    const p = { openness: -10, courage: 50, empathy: 50, patience: 50, conformity: 50 };
    const result = clampPersonality(p);
    expect(result.openness).toBe(0);
  });

  it('leaves valid values unchanged', () => {
    const result = clampPersonality(DEFAULT_PERSONALITY);
    expect(result).toEqual(DEFAULT_PERSONALITY);
  });
});

// ==========================================
// applyPersonalityEffects
// ==========================================

describe('applyPersonalityEffects', () => {
  it('applies personality changes', () => {
    const effects = [{ axis: 'courage' as const, change: 10 }];
    const result = applyPersonalityEffects(DEFAULT_PERSONALITY, effects, 15, 10, 'test');

    expect(result.newPersonality.courage).toBe(60);
    expect(result.shifts.length).toBe(1);
    expect(result.shifts[0].axis).toBe('courage');
    expect(result.shifts[0].oldValue).toBe(50);
    expect(result.shifts[0].newValue).toBe(60);
  });

  it('applies age multiplier for young characters (age < 10)', () => {
    const effects = [{ axis: 'empathy' as const, change: 10 }];
    const youngResult = applyPersonalityEffects(DEFAULT_PERSONALITY, effects, 8, 5, 'test');
    const teenResult = applyPersonalityEffects(DEFAULT_PERSONALITY, effects, 16, 5, 'test');

    // Young characters change more
    expect(youngResult.newPersonality.empathy).toBeGreaterThan(teenResult.newPersonality.empathy);
  });

  it('clamps result values', () => {
    const effects = [{ axis: 'openness' as const, change: 200 }];
    const result = applyPersonalityEffects(DEFAULT_PERSONALITY, effects, 15, 10, 'test');

    expect(result.newPersonality.openness).toBeLessThanOrEqual(100);
  });

  it('handles multiple effects', () => {
    const effects = [
      { axis: 'courage' as const, change: 5 },
      { axis: 'patience' as const, change: -3 },
    ];
    const result = applyPersonalityEffects(DEFAULT_PERSONALITY, effects, 15, 10, 'test');

    expect(result.newPersonality.courage).toBeGreaterThan(50);
    expect(result.newPersonality.patience).toBeLessThan(50);
    expect(result.shifts.length).toBe(2);
  });

  it('does not create shift for zero effective change', () => {
    const effects = [{ axis: 'courage' as const, change: 0 }];
    const result = applyPersonalityEffects(DEFAULT_PERSONALITY, effects, 15, 10, 'test');

    expect(result.shifts.length).toBe(0);
  });
});

// ==========================================
// updateStress
// ==========================================

describe('updateStress', () => {
  it('increases stress', () => {
    const result = updateStress(DEFAULT_STRESS, 20, 'exam', 5);
    expect(result.current).toBe(20);
  });

  it('decreases stress', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 30 };
    const result = updateStress(stress, -10, 'rest', 5);
    expect(result.current).toBe(20);
  });

  it('clamps stress at 0 minimum', () => {
    const result = updateStress(DEFAULT_STRESS, -50, 'meditation', 5);
    expect(result.current).toBe(0);
  });

  it('clamps stress at 100 maximum', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 95 };
    const result = updateStress(stress, 20, 'crisis', 5);
    expect(result.current).toBe(100);
  });

  it('adds stress source', () => {
    const result = updateStress(DEFAULT_STRESS, 10, 'exam', 5);
    expect(result.sources.length).toBe(1);
    expect(result.sources[0]).toEqual({ reason: 'exam', amount: 10, turn: 5 });
  });

  it('keeps only last 10 sources', () => {
    let stress = DEFAULT_STRESS;
    for (let i = 0; i < 15; i++) {
      stress = updateStress(stress, 1, `source_${i}`, i);
    }
    expect(stress.sources.length).toBeLessThanOrEqual(10);
  });

  it('increments turnsSinceBreakdown', () => {
    const result = updateStress(DEFAULT_STRESS, 0, 'nothing', 5);
    expect(result.turnsSinceBreakdown).toBe(1);
  });

  it('does not add source for zero change', () => {
    const result = updateStress(DEFAULT_STRESS, 0, 'nothing', 5);
    expect(result.sources.length).toBe(0);
  });
});

// ==========================================
// naturalStressRecovery
// ==========================================

describe('naturalStressRecovery', () => {
  it('reduces stress for patient personality', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 30 };
    const personality: Personality = { ...DEFAULT_PERSONALITY, patience: 80 };
    const result = naturalStressRecovery(stress, personality);

    expect(result.current).toBe(25); // recoveryRate = 5 for patience > 70
  });

  it('reduces stress slower for impatient personality', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 30 };
    const personality: Personality = { ...DEFAULT_PERSONALITY, patience: 20 };
    const result = naturalStressRecovery(stress, personality);

    expect(result.current).toBe(28); // recoveryRate = 2 for patience < 40
  });

  it('does not go below 0', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 1 };
    const result = naturalStressRecovery(stress, DEFAULT_PERSONALITY);

    expect(result.current).toBe(0);
  });
});

// ==========================================
// calculateBreakdownRisk
// ==========================================

describe('calculateBreakdownRisk', () => {
  it('returns 0 when stress is below threshold', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 50 };
    expect(calculateBreakdownRisk(stress, DEFAULT_PERSONALITY)).toBe(0);
  });

  it('returns positive risk when stress exceeds threshold', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 80, turnsSinceBreakdown: 15 };
    const risk = calculateBreakdownRisk(stress, DEFAULT_PERSONALITY);
    expect(risk).toBeGreaterThan(0);
  });

  it('higher risk for impatient personality', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 85, turnsSinceBreakdown: 15 };
    const patient: Personality = { ...DEFAULT_PERSONALITY, patience: 80 };
    const impatient: Personality = { ...DEFAULT_PERSONALITY, patience: 20 };

    const riskPatient = calculateBreakdownRisk(stress, patient);
    const riskImpatient = calculateBreakdownRisk(stress, impatient);

    expect(riskImpatient).toBeGreaterThan(riskPatient);
  });

  it('lower risk shortly after breakdown', () => {
    const recentBreakdown: StressState = { ...DEFAULT_STRESS, current: 80, turnsSinceBreakdown: 3 };
    const oldBreakdown: StressState = { ...DEFAULT_STRESS, current: 80, turnsSinceBreakdown: 20 };

    const riskRecent = calculateBreakdownRisk(recentBreakdown, DEFAULT_PERSONALITY);
    const riskOld = calculateBreakdownRisk(oldBreakdown, DEFAULT_PERSONALITY);

    expect(riskRecent).toBeLessThan(riskOld);
  });

  it('caps risk at 100', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 100, turnsSinceBreakdown: 100 };
    const impatient: Personality = { ...DEFAULT_PERSONALITY, patience: 10 };
    const risk = calculateBreakdownRisk(stress, impatient);

    expect(risk).toBeLessThanOrEqual(100);
  });
});

// ==========================================
// checkPersonalityRequirements
// ==========================================

describe('checkPersonalityRequirements', () => {
  it('returns true when no requirements', () => {
    expect(checkPersonalityRequirements(DEFAULT_PERSONALITY, undefined)).toBe(true);
    expect(checkPersonalityRequirements(DEFAULT_PERSONALITY, [])).toBe(true);
  });

  it('returns true when requirements are met', () => {
    const reqs = [{ axis: 'courage' as const, min: 30 }];
    expect(checkPersonalityRequirements(DEFAULT_PERSONALITY, reqs)).toBe(true);
  });

  it('returns false when min requirement not met', () => {
    const reqs = [{ axis: 'courage' as const, min: 80 }];
    expect(checkPersonalityRequirements(DEFAULT_PERSONALITY, reqs)).toBe(false);
  });

  it('returns false when max requirement not met', () => {
    const reqs = [{ axis: 'courage' as const, max: 30 }];
    expect(checkPersonalityRequirements(DEFAULT_PERSONALITY, reqs)).toBe(false);
  });

  it('checks multiple requirements', () => {
    const reqs = [
      { axis: 'courage' as const, min: 40 },
      { axis: 'empathy' as const, min: 40 },
    ];
    expect(checkPersonalityRequirements(DEFAULT_PERSONALITY, reqs)).toBe(true);
  });
});

// ==========================================
// checkStressRequirement
// ==========================================

describe('checkStressRequirement', () => {
  it('returns true when no requirement', () => {
    expect(checkStressRequirement(DEFAULT_STRESS, undefined)).toBe(true);
  });

  it('checks min stress requirement', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 50 };
    expect(checkStressRequirement(stress, { min: 30 })).toBe(true);
    expect(checkStressRequirement(stress, { min: 60 })).toBe(false);
  });

  it('checks max stress requirement', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 50 };
    expect(checkStressRequirement(stress, { max: 60 })).toBe(true);
    expect(checkStressRequirement(stress, { max: 30 })).toBe(false);
  });
});

// ==========================================
// getPersonalityArchetype
// ==========================================

describe('getPersonalityArchetype', () => {
  it('identifies INTROVERT_CAUTIOUS', () => {
    const p: Personality = { openness: 20, courage: 20, empathy: 50, patience: 50, conformity: 50 };
    expect(getPersonalityArchetype(p)).toBe('INTROVERT_CAUTIOUS');
  });

  it('identifies INTROVERT_BRAVE', () => {
    const p: Personality = { openness: 20, courage: 80, empathy: 50, patience: 50, conformity: 50 };
    expect(getPersonalityArchetype(p)).toBe('INTROVERT_BRAVE');
  });

  it('identifies EXTROVERT_BRAVE', () => {
    const p: Personality = { openness: 80, courage: 80, empathy: 50, patience: 50, conformity: 50 };
    expect(getPersonalityArchetype(p)).toBe('EXTROVERT_BRAVE');
  });

  it('identifies EMPATH', () => {
    const p: Personality = { openness: 50, courage: 50, empathy: 80, patience: 50, conformity: 50 };
    expect(getPersonalityArchetype(p)).toBe('EMPATH');
  });

  it('identifies REBEL', () => {
    const p: Personality = { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 20 };
    expect(getPersonalityArchetype(p)).toBe('REBEL');
  });

  it('identifies CONFORMIST', () => {
    const p: Personality = { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 80 };
    expect(getPersonalityArchetype(p)).toBe('CONFORMIST');
  });

  it('returns BALANCED for average values', () => {
    expect(getPersonalityArchetype(DEFAULT_PERSONALITY)).toBe('BALANCED');
  });
});

// ==========================================
// getArchetypeDescription
// ==========================================

describe('getArchetypeDescription', () => {
  it('returns description for each archetype', () => {
    const archetypes = [
      'INTROVERT_CAUTIOUS', 'INTROVERT_BRAVE', 'EXTROVERT_CAUTIOUS',
      'EXTROVERT_BRAVE', 'EMPATH', 'PRAGMATIST', 'REBEL', 'CONFORMIST', 'BALANCED',
    ] as const;

    archetypes.forEach(archetype => {
      const desc = getArchetypeDescription(archetype);
      expect(typeof desc).toBe('string');
      expect(desc.length).toBeGreaterThan(0);
    });
  });
});

// ==========================================
// getPersonalityAxisName / getPersonalityLevelDescription
// ==========================================

describe('getPersonalityAxisName', () => {
  it('returns Turkish name for each axis', () => {
    expect(getPersonalityAxisName('openness')).toBe('Açıklık');
    expect(getPersonalityAxisName('courage')).toBe('Cesaret');
    expect(getPersonalityAxisName('empathy')).toBe('Empati');
    expect(getPersonalityAxisName('patience')).toBe('Sabır');
    expect(getPersonalityAxisName('conformity')).toBe('Uyum');
  });
});

describe('getPersonalityLevelDescription', () => {
  it('returns low description for values < 35', () => {
    expect(getPersonalityLevelDescription('openness', 20)).toBe('İçe kapanık');
  });

  it('returns mid description for values 35-65', () => {
    expect(getPersonalityLevelDescription('openness', 50)).toBe('Dengeli sosyal');
  });

  it('returns high description for values > 65', () => {
    expect(getPersonalityLevelDescription('openness', 80)).toBe('Dışa dönük');
  });
});

// ==========================================
// generateInnerThought
// ==========================================

describe('generateInnerThought', () => {
  it('returns stress thought when stress > 70', () => {
    const stress: StressState = { ...DEFAULT_STRESS, current: 80 };
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const thought = generateInnerThought(DEFAULT_PERSONALITY, stress, 'DAILY');
    expect(typeof thought).toBe('string');
    expect(thought.length).toBeGreaterThan(0);
    jest.restoreAllMocks();
  });

  it('returns context-appropriate thought for RISK context', () => {
    const brave: Personality = { ...DEFAULT_PERSONALITY, courage: 80 };
    const thought = generateInnerThought(brave, DEFAULT_STRESS, 'RISK');
    expect(thought).toContain('Risk');
  });

  it('returns context-appropriate thought for MORAL context', () => {
    const empathetic: Personality = { ...DEFAULT_PERSONALITY, empathy: 80 };
    const thought = generateInnerThought(empathetic, DEFAULT_STRESS, 'MORAL');
    expect(thought).toContain('Doğru');
  });

  it('returns default thought for DAILY context', () => {
    const thought = generateInnerThought(DEFAULT_PERSONALITY, DEFAULT_STRESS, 'DAILY');
    expect(typeof thought).toBe('string');
  });
});

// ==========================================
// calculateChoiceStressCost
// ==========================================

describe('calculateChoiceStressCost', () => {
  it('returns base stress when no challenge', () => {
    const choice = { text: 'test', effect: {}, feedback: '' } as any;
    const cost = calculateChoiceStressCost(choice, DEFAULT_PERSONALITY, 5);
    expect(cost).toBe(5);
  });

  it('adds extra stress for CHALLENGE choice against personality', () => {
    const choice = {
      text: 'test', effect: {}, feedback: '',
      choiceType: 'CHALLENGE' as const,
      reqPersonality: [{ axis: 'courage' as const, min: 80 }],
    } as any;
    const timid: Personality = { ...DEFAULT_PERSONALITY, courage: 20 };
    const cost = calculateChoiceStressCost(choice, timid, 0);
    expect(cost).toBeGreaterThan(0);
  });

  it('adds stress from stressEffect', () => {
    const choice = {
      text: 'test', effect: {}, feedback: '', stressEffect: 10,
    } as any;
    const cost = calculateChoiceStressCost(choice, DEFAULT_PERSONALITY, 0);
    expect(cost).toBe(10);
  });
});
