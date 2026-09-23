import { TriggerManager } from '../../src/systems/TriggerManager';
import { Choice, GameState, Stats } from '../../src/types';

const baseStats: Stats = {
  health: 50,
  intelligence: 60,
  charisma: 40,
  discipline: 45,
  money: 100,
  energy: 80,
  familyRelation: 55,
};

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  age: 14,
  turn: 22,
  phase: 'HUB',
  currentEvent: null,
  pendingReportCard: false,
  characterInfo: null,
  lastResult: null,
  historyLog: [],
  family: { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 20 },
  maxEnergy: 100,
  schoolGrades: {
    math: 60,
    science: 60,
    language: 60,
    turkish: 60,
    history: 60,
    geography: 60,
    art: 60,
    music: 60,
  },
  skills: {
    coding: 0,
    music: 0,
    sports: 0,
    design: 0,
    athletics: 0,
    logic: 0,
    reading: 0,
    teamwork: 0,
    art: 0,
    writing: 0,
    work_ethic: 0,
    business: 0,
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
  innerThoughtType: 'IDLE',
  floatingTexts: [],
  totalTurns: 22,
  sessionCount: 1,
  adaptivePacingStreak: 0,
  lastInteracted: {},
  recentEvents: [],
  memories: [],
  scheduledEvents: [],
  unlockedAchievements: [],
  achievementProgress: {},
  personality: {
    openness: 50,
    courage: 50,
    empathy: 45,
    patience: 20,
    conformity: 50,
  },
  stress: {
    current: 80,
    threshold: 70,
    turnsSinceBreakdown: 20,
    sources: [],
  },
  personalityHistory: [],
  personalityState: {
    HELPFUL: { count: 0, streak: 0, multiplier: 1 },
    PRAGMATIC: { count: 0, streak: 0, multiplier: 1 },
    AGGRESSIVE: { count: 0, streak: 0, multiplier: 1 },
  },
  socialGroups: [],
  socialReputation: 50,
  examsTakenThisYear: [],
  isExamPeriod: false,
  childhood: {
    completed: false,
    sceneIndex: 0,
    memories: [],
    selectedMemoryId: null,
  },
  stats: baseStats,
  ...overrides,
});

describe('TriggerManager', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('processes stress, personality, memory and breakdown trigger together', () => {
    const gameState = createGameState();
    const choice: Choice = {
      id: 'choice_all',
      text: 'Zor secim',
      effect: { health: 1 },
      feedback: 'Sonuc',
      stressEffect: 10,
      personalityEffects: [{ axis: 'empathy', change: 4 }],
      memory: {
        emotion: 'PRIDE',
        weight: 'HIGH',
        relatedNpcId: 'npc_1',
      },
    };

    jest.spyOn(Math, 'random').mockReturnValue(0);
    const results = TriggerManager.processChoice({
      gameState,
      stats: baseStats,
      choice,
      eventId: 'evt_test',
    });

    expect(results.stressDelta).toBe(10);
    expect(results.stressUpdate.current).toBe(90);
    expect(results.personalityShifts).toHaveLength(1);
    expect(results.personalityUpdate.empathy).toBeGreaterThan(gameState.personality.empathy);
    expect(results.memoryToStore).not.toBeNull();
    expect(results.memoryToStore?.eventId).toBe('evt_test');
    expect(results.memoryToStore?.choiceId).toBe('choice_all');
    expect(results.breakdownRisk).toBeGreaterThan(0);
    expect(results.shouldTriggerBreakdown).toBe(true);
  });

  it('keeps state unchanged when choice has no stress/personality/memory effects', () => {
    const stress = {
      current: 20,
      threshold: 70,
      turnsSinceBreakdown: 5,
      sources: [],
    };
    const gameState = createGameState({ stress });
    const choice: Choice = {
      id: 'choice_neutral',
      text: 'Notr secim',
      effect: {},
      feedback: 'Notr',
    };

    const results = TriggerManager.processChoice({
      gameState,
      stats: baseStats,
      choice,
      eventId: 'evt_neutral',
    });

    expect(results.stressDelta).toBe(0);
    expect(results.stressUpdate).toBe(stress);
    expect(results.personalityUpdate).toBe(gameState.personality);
    expect(results.personalityShifts).toEqual([]);
    expect(results.memoryToStore).toBeNull();
    expect(results.breakdownRisk).toBe(0);
    expect(results.shouldTriggerBreakdown).toBe(false);
  });

  it('builds a summary message with stress, personality and memory labels', () => {
    const summary = TriggerManager.getSummaryMessage({
      stressUpdate: { current: 40, threshold: 70, turnsSinceBreakdown: 8, sources: [] },
      stressDelta: 5,
      personalityUpdate: {
        openness: 50,
        courage: 50,
        empathy: 55,
        patience: 50,
        conformity: 50,
      },
      personalityShifts: [
        {
          axis: 'empathy',
          oldValue: 50,
          newValue: 55,
          reason: 'Test',
          turn: 3,
          age: 10,
        },
      ],
      memoryToStore: {
        id: 'mem_1',
        eventId: 'evt_1',
        choiceId: 'choice_1',
        age: 10,
        emotion: 'PRIDE',
        weight: 'MEDIUM',
        turnTimestamp: 3,
      },
      shouldTriggerBreakdown: false,
      breakdownRisk: 0,
    });

    expect(summary).toContain('Stres: +5');
    expect(summary).toContain('Empati: +5');
    expect(summary).toMatch(/Haf.*: Gurur/);
  });

  it('returns null summary when there are no visible changes', () => {
    const summary = TriggerManager.getSummaryMessage({
      stressUpdate: { current: 20, threshold: 70, turnsSinceBreakdown: 2, sources: [] },
      stressDelta: 0,
      personalityUpdate: {
        openness: 50,
        courage: 50,
        empathy: 50,
        patience: 50,
        conformity: 50,
      },
      personalityShifts: [],
      memoryToStore: null,
      shouldTriggerBreakdown: false,
      breakdownRisk: 0,
    });

    expect(summary).toBeNull();
  });

  it('creates a detailed report with breakdown/personality/memory sections', () => {
    const report = TriggerManager.getDetailedReport({
      stressUpdate: { current: 95, threshold: 70, turnsSinceBreakdown: 15, sources: [] },
      stressDelta: 12,
      personalityUpdate: {
        openness: 40,
        courage: 60,
        empathy: 45,
        patience: 20,
        conformity: 55,
      },
      personalityShifts: [
        {
          axis: 'courage',
          oldValue: 55,
          newValue: 60,
          reason: 'Event: evt_2',
          turn: 9,
          age: 14,
        },
      ],
      memoryToStore: {
        id: 'mem_2',
        eventId: 'evt_2',
        choiceId: 'choice_2',
        age: 14,
        emotion: 'GUILT',
        weight: 'HIGH',
        turnTimestamp: 9,
      },
      shouldTriggerBreakdown: true,
      breakdownRisk: 30,
    });

    expect(report).toContain('=== Trigger Results ===');
    expect(report).toContain('BREAKDOWN TRIGGERED!');
    expect(report).toContain('Personality Shifts:');
    expect(report).toContain('Memory Created:');
    expect(report).toContain('Emotion: GUILT');
  });
});
