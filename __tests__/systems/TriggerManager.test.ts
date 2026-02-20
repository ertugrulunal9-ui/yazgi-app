import { TriggerManager, TriggerContext } from '@/systems/TriggerManager';
import { GameState, Stats, Choice, Personality, StressState } from '@/types';

// Mock personalitySystem
jest.mock('@/utils/personalitySystem', () => ({
  updateStress: jest.fn((stress, delta, reason, turn) => ({
    ...stress,
    current: Math.max(0, Math.min(100, stress.current + delta)),
    sources: [{ reason, amount: delta, turn }, ...stress.sources.slice(0, 9)],
    turnsSinceBreakdown: stress.turnsSinceBreakdown + 1,
  })),
  applyPersonalityEffects: jest.fn((personality, effects, age, turn, reason) => {
    const newPersonality = { ...personality };
    const shifts = effects.map((e: any) => {
      const oldValue = personality[e.axis];
      newPersonality[e.axis] = Math.max(0, Math.min(100, oldValue + e.change));
      return {
        axis: e.axis,
        oldValue,
        newValue: newPersonality[e.axis],
        reason,
        turn,
        age,
      };
    });
    return { newPersonality, shifts };
  }),
  calculateBreakdownRisk: jest.fn((stress, personality) => {
    if (stress.current < stress.threshold) return 0;
    return stress.current - stress.threshold;
  }),
}));

function createDefaultPersonality(): Personality {
  return { openness: 50, courage: 50, empathy: 50, patience: 50, conformity: 50 };
}

function createDefaultStress(): StressState {
  return { current: 20, threshold: 70, turnsSinceBreakdown: 5, sources: [] };
}

function createMinimalGameState(overrides: Partial<GameState> = {}): GameState {
  return {
    age: 12,
    turn: 10,
    personality: createDefaultPersonality(),
    stress: createDefaultStress(),
    ...overrides,
  } as GameState;
}

function createDefaultChoice(overrides: Partial<Choice> = {}): Choice {
  return {
    text: 'Test choice',
    effect: {},
    feedback: 'Test feedback',
    ...overrides,
  };
}

function createContext(overrides: Partial<TriggerContext> = {}): TriggerContext {
  return {
    gameState: createMinimalGameState(),
    stats: {
      health: 50, intelligence: 50, charisma: 50,
      discipline: 50, money: 100, energy: 80, familyRelation: 50,
    },
    choice: createDefaultChoice(),
    eventId: 'test_event',
    ...overrides,
  };
}

describe('TriggerManager.processChoice', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Make Math.random deterministic
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns default results for a simple choice with no effects', () => {
    const ctx = createContext();
    const results = TriggerManager.processChoice(ctx);

    expect(results.stressDelta).toBe(0);
    expect(results.personalityShifts).toEqual([]);
    expect(results.memoryToStore).toBeNull();
    expect(results.shouldTriggerBreakdown).toBe(false);
  });

  it('processes stress effects', () => {
    const ctx = createContext({
      choice: createDefaultChoice({ stressEffect: 15 }),
    });
    const results = TriggerManager.processChoice(ctx);

    expect(results.stressDelta).toBe(15);
    expect(results.stressUpdate.current).toBe(35); // 20 + 15
  });

  it('processes negative stress effects (stress relief)', () => {
    const ctx = createContext({
      choice: createDefaultChoice({ stressEffect: -10 }),
    });
    const results = TriggerManager.processChoice(ctx);

    expect(results.stressDelta).toBe(-10);
    expect(results.stressUpdate.current).toBe(10); // 20 - 10
  });

  it('processes personality effects', () => {
    const ctx = createContext({
      choice: createDefaultChoice({
        personalityEffects: [
          { axis: 'courage', change: 5 },
          { axis: 'openness', change: -3 },
        ],
      }),
    });
    const results = TriggerManager.processChoice(ctx);

    expect(results.personalityShifts.length).toBe(2);
    expect(results.personalityUpdate.courage).toBe(55);
    expect(results.personalityUpdate.openness).toBe(47);
  });

  it('creates memory when choice has memory config', () => {
    const ctx = createContext({
      choice: createDefaultChoice({
        id: 'choice_1',
        memory: {
          emotion: 'PRIDE',
          weight: 'HIGH',
        },
      }),
    });
    const results = TriggerManager.processChoice(ctx);

    expect(results.memoryToStore).not.toBeNull();
    expect(results.memoryToStore!.emotion).toBe('PRIDE');
    expect(results.memoryToStore!.weight).toBe('HIGH');
    expect(results.memoryToStore!.eventId).toBe('test_event');
    expect(results.memoryToStore!.choiceId).toBe('choice_1');
    expect(results.memoryToStore!.age).toBe(12);
  });

  it('does not create memory when choice has no memory config', () => {
    const ctx = createContext();
    const results = TriggerManager.processChoice(ctx);

    expect(results.memoryToStore).toBeNull();
  });

  it('calculates breakdown risk correctly', () => {
    const ctx = createContext({
      gameState: createMinimalGameState({
        stress: { current: 80, threshold: 70, turnsSinceBreakdown: 10, sources: [] },
      }),
    });
    const results = TriggerManager.processChoice(ctx);

    expect(results.breakdownRisk).toBeGreaterThan(0);
  });

  it('does not trigger breakdown when risk is low and random is high', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.99);
    const ctx = createContext();
    const results = TriggerManager.processChoice(ctx);

    expect(results.shouldTriggerBreakdown).toBe(false);
  });
});

describe('TriggerManager.getSummaryMessage', () => {
  it('returns null when there are no changes', () => {
    const results = TriggerManager.processChoice(createContext());
    const msg = TriggerManager.getSummaryMessage(results);

    expect(msg).toBeNull();
  });

  it('includes stress change in summary', () => {
    const ctx = createContext({
      choice: createDefaultChoice({ stressEffect: 10 }),
    });
    const results = TriggerManager.processChoice(ctx);
    const msg = TriggerManager.getSummaryMessage(results);

    expect(msg).toContain('Stres');
    expect(msg).toContain('+10');
  });

  it('includes personality shifts in summary', () => {
    const ctx = createContext({
      choice: createDefaultChoice({
        personalityEffects: [{ axis: 'courage', change: 5 }],
      }),
    });
    const results = TriggerManager.processChoice(ctx);
    const msg = TriggerManager.getSummaryMessage(results);

    expect(msg).toContain('Cesaret');
  });

  it('includes memory emotion in summary', () => {
    const ctx = createContext({
      choice: createDefaultChoice({
        id: 'test_choice',
        memory: { emotion: 'PRIDE', weight: 'HIGH' },
      }),
    });
    const results = TriggerManager.processChoice(ctx);
    const msg = TriggerManager.getSummaryMessage(results);

    expect(msg).toContain('Gurur');
  });
});

describe('TriggerManager.getDetailedReport', () => {
  it('generates a detailed report', () => {
    const ctx = createContext({
      choice: createDefaultChoice({
        stressEffect: 10,
        personalityEffects: [{ axis: 'empathy', change: 3 }],
        id: 'choice_test',
        memory: { emotion: 'SATISFACTION', weight: 'MEDIUM' },
      }),
    });
    const results = TriggerManager.processChoice(ctx);
    const report = TriggerManager.getDetailedReport(results);

    expect(report).toContain('Trigger Results');
    expect(report).toContain('Stress');
    expect(report).toContain('Personality Shifts');
    expect(report).toContain('Memory Created');
  });
});
