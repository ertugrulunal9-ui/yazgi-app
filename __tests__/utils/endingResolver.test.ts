import { EndingGoal, resolveEnding, calculateEndingErrorDebt, calculateAllGoalScores, generateFutureVision } from '../../src/utils/endingResolver';
import { GameState, Stats } from '../../src/types';

const baseStats: Stats = {
  health: 60,
  intelligence: 60,
  charisma: 60,
  discipline: 60,
  money: 500,
  energy: 80,
  familyRelation: 60,
};

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  age: 18,
  turn: 90,
  phase: 'GAME_OVER',
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
    coding: 20,
    music: 20,
    sports: 20,
    design: 20,
    athletics: 20,
    logic: 20,
    reading: 20,
    teamwork: 20,
    art: 20,
    writing: 20,
    work_ethic: 20,
    business: 20,
  },
  talent: 'NONE',
  selectedGoal: null,
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
  totalTurns: 90,
  sessionCount: 1,
  adaptivePacingStreak: 0,
  lastInteracted: {
    math: 0,
    science: 0,
    language: 0,
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
  recentEvents: [],
  memories: [],
  scheduledEvents: [],
  activeArcs: [],
  unlockedAchievements: [],
  achievementProgress: {},
  personality: {
    openness: 50,
    courage: 50,
    empathy: 50,
    patience: 50,
    conformity: 50,
  },
  stress: {
    current: 0,
    threshold: 70,
    turnsSinceBreakdown: 0,
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
    completed: true,
    sceneIndex: 0,
    memories: [],
    selectedMemoryId: null,
  },
  ...overrides,
});

describe('endingResolver', () => {
  it('produces a stat-driven athletic ending for high sports profile', () => {
    const gameState = createGameState({
      selectedGoal: 'ATHLETIC',
      actionHistory: [
        { actionId: 'sports_run', age: 17, turn: 80 },
        { actionId: 'sports_gym', age: 17, turn: 81 },
        { actionId: 'sports_swim', age: 17, turn: 82 },
      ],
      skills: {
        ...createGameState().skills,
        sports: 95,
        athletics: 85,
      },
    });
    const stats = { ...baseStats, health: 92, discipline: 84 };

    const resolution = resolveEnding({ gameState, stats });

    expect(resolution.goal).toBe('ATHLETIC');
    expect(resolution.tier).toBe('LEGENDARY');
    expect(resolution.result.title).toContain('Sporcu');
  });

  it('degrades to failure when error debt is forced very high', () => {
    const gameState = createGameState({
      skills: {
        ...createGameState().skills,
        sports: 95,
      },
    });
    const stats = { ...baseStats, health: 90, discipline: 80 };

    const resolution = resolveEnding({
      gameState,
      stats,
      errorDebt: {
        total: 95,
        reasons: ['Asiri hata borcu'],
      },
    });

    expect(resolution.tier).toBe('FAILURE');
    expect(resolution.errorDebt.total).toBe(95);
  });

  it('adds achievement flavor text for rich+saver profile', () => {
    const gameState = createGameState({
      unlockedAchievements: [
        { achievementId: 'rich', unlockedAt: 70, timestamp: new Date().toISOString() },
        { achievementId: 'saver', unlockedAt: 72, timestamp: new Date().toISOString() },
      ],
    });
    const stats = { ...baseStats, money: 120000, familyRelation: 30, charisma: 50 };

    const resolution = resolveEnding({ gameState, stats });

    expect(resolution.achievementFlavor.length).toBeGreaterThan(0);
    expect(resolution.result.description).toContain('Paran var ama');
  });

  it('identifies academic goal from grades, discipline and study actions', () => {
    const gameState = createGameState({
      selectedGoal: 'ACADEMIC',
      actionHistory: [
        { actionId: 'study_math', age: 17, turn: 70 },
        { actionId: 'study_science', age: 17, turn: 71 },
        { actionId: 'study_book', age: 17, turn: 72 },
      ],
      schoolGrades: {
        math: 90,
        science: 88,
        language: 76,
        turkish: 78,
        history: 75,
        geography: 72,
        art: 55,
        music: 50,
      },
      skills: {
        ...createGameState().skills,
        logic: 78,
        reading: 75,
      },
    });
    const stats = { ...baseStats, intelligence: 86, discipline: 80 };

    const resolution = resolveEnding({ gameState, stats });

    expect(resolution.goal).toBe('ACADEMIC');
    expect(['SUCCESS', 'LEGENDARY']).toContain(resolution.tier);
    expect(resolution.result.title).toMatch(/Tip|Hukuk|Muhendislik|Yazilim/);
  });

  it('forces mismatch failure when selected goal and developed profile diverge', () => {
    const gameState = createGameState({
      selectedGoal: 'ATHLETIC',
      actionHistory: [
        { actionId: 'study_math', age: 17, turn: 70 },
        { actionId: 'study_science', age: 17, turn: 71 },
      ],
      schoolGrades: {
        math: 92,
        science: 90,
        language: 84,
        turkish: 80,
        history: 78,
        geography: 76,
        art: 50,
        music: 48,
      },
      skills: {
        ...createGameState().skills,
        logic: 82,
        reading: 79,
        sports: 25,
        athletics: 20,
      },
    });
    const stats = {
      ...baseStats,
      intelligence: 88,
      discipline: 82,
      health: 42,
      charisma: 52,
    };

    const resolution = resolveEnding({ gameState, stats });

    expect(resolution.mismatchFailure).toBe(true);
    expect(resolution.tier).toBe('FAILURE');
    expect(resolution.result.title).toContain('Uyumsuz');
  });

  it('keeps legendary tier when selected academic goal is perfectly aligned', () => {
    const gameState = createGameState({
      selectedGoal: 'ACADEMIC',
      actionHistory: [
        { actionId: 'study_math', age: 15, turn: 55 },
        { actionId: 'study_science', age: 15, turn: 56 },
        { actionId: 'study_book', age: 16, turn: 60 },
        { actionId: 'study_homework', age: 17, turn: 70 },
        { actionId: 'study_math', age: 17, turn: 72 },
      ],
      schoolGrades: {
        math: 98,
        science: 97,
        language: 95,
        turkish: 94,
        history: 93,
        geography: 92,
        art: 88,
        music: 86,
      },
      skills: {
        ...createGameState().skills,
        logic: 96,
        reading: 92,
        writing: 90,
        coding: 94,
      },
    });
    const stats = {
      ...baseStats,
      intelligence: 98,
      discipline: 95,
      health: 88,
      charisma: 74,
      familyRelation: 82,
      money: 3500,
    };

    const resolution = resolveEnding({
      gameState,
      stats,
      achievements: ['perfectionist', 'super_genius', 'straight_a', 'scholar'],
    });

    expect(resolution.goal).toBe('ACADEMIC');
    expect(resolution.mismatchFailure).toBe(false);
    expect(resolution.tier).toBe('LEGENDARY');
  });

  it('still fails with mismatch even when dominant profile is otherwise legendary', () => {
    const gameState = createGameState({
      selectedGoal: 'ATHLETIC',
      actionHistory: [
        { actionId: 'study_math', age: 15, turn: 58 },
        { actionId: 'study_science', age: 15, turn: 59 },
        { actionId: 'study_book', age: 16, turn: 63 },
        { actionId: 'study_homework', age: 17, turn: 76 },
      ],
      schoolGrades: {
        math: 97,
        science: 95,
        language: 92,
        turkish: 90,
        history: 91,
        geography: 89,
        art: 72,
        music: 70,
      },
      skills: {
        ...createGameState().skills,
        logic: 94,
        reading: 91,
        writing: 88,
        coding: 89,
        sports: 12,
        athletics: 8,
      },
    });
    const stats = {
      ...baseStats,
      health: 44,
      intelligence: 96,
      discipline: 90,
      charisma: 62,
      familyRelation: 78,
      money: 4200,
    };

    const resolution = resolveEnding({
      gameState,
      stats,
      achievements: ['perfectionist', 'super_genius', 'straight_a', 'scholar'],
    });

    expect(resolution.mismatchFailure).toBe(true);
    expect(resolution.tier).toBe('FAILURE');
    expect(resolution.result.title).toContain('Uyumsuz');
  });

  it('accepts achievement ids as a plain string list', () => {
    const gameState = createGameState();
    const stats = { ...baseStats, money: 90000, familyRelation: 25 };

    const resolution = resolveEnding({
      gameState,
      stats,
      achievements: ['rich', 'heartbreaker'],
    });

    expect(resolution.result.description).toContain('Iliskilerde');
  });
});

describe('calculateAllGoalScores', () => {
  it('returns 6 goals sorted by score descending', () => {
    const gameState = createGameState();
    const scores = calculateAllGoalScores(gameState, baseStats);

    expect(scores).toHaveLength(6);
    for (let i = 1; i < scores.length; i++) {
      expect(scores[i - 1].score).toBeGreaterThanOrEqual(scores[i].score);
    }
  });

  it('marks selected goal correctly', () => {
    const gameState = createGameState({ selectedGoal: 'ATHLETIC' });
    const scores = calculateAllGoalScores(gameState, baseStats);

    const selected = scores.filter(s => s.isSelected);
    expect(selected).toHaveLength(1);
    expect(selected[0].goal).toBe('ATHLETIC');
  });

  it('marks exactly one dominant goal', () => {
    const gameState = createGameState();
    const scores = calculateAllGoalScores(gameState, baseStats);

    const dominant = scores.filter(s => s.isDominant);
    expect(dominant).toHaveLength(1);
    expect(dominant[0]).toBe(scores[0]); // Dominant should be highest score
  });

  it('includes label for each goal', () => {
    const gameState = createGameState();
    const scores = calculateAllGoalScores(gameState, baseStats);

    scores.forEach(s => {
      expect(s.label).toBeTruthy();
      expect(typeof s.label).toBe('string');
    });
  });

  it('academic-focused profile has ACADEMIC as dominant', () => {
    const gameState = createGameState({
      selectedGoal: 'ACADEMIC',
      schoolGrades: {
        math: 95, science: 92, language: 88, turkish: 85,
        history: 82, geography: 80, art: 60, music: 55,
      },
      skills: { ...createGameState().skills, logic: 85, reading: 80 },
    });
    const stats = { ...baseStats, intelligence: 92, discipline: 85 };

    const scores = calculateAllGoalScores(gameState, stats);
    expect(scores[0].goal).toBe('ACADEMIC');
    expect(scores[0].isDominant).toBe(true);
  });
});

describe('calculateEndingErrorDebt', () => {
  it('calculates non-zero debt for weak stat profile', () => {
    const gameState = createGameState({
      schoolGrades: {
        math: 40,
        science: 45,
        language: 42,
        turkish: 40,
        history: 40,
        geography: 40,
        art: 40,
        music: 40,
      },
      stress: {
        current: 75,
        threshold: 70,
        turnsSinceBreakdown: 0,
        sources: [],
      },
    });
    const stats = {
      ...baseStats,
      health: 30,
      discipline: 30,
      familyRelation: 25,
      money: 0,
    };

    const debt = calculateEndingErrorDebt(gameState, stats);
    expect(debt.total).toBeGreaterThan(0);
    expect(debt.reasons.length).toBeGreaterThan(0);
  });
});

describe('generateFutureVision', () => {
  it('returns non-empty text for every goal x tier combination', () => {
    const goals: EndingGoal[] = ['ACADEMIC', 'CREATIVE', 'ATHLETIC', 'SOCIAL', 'ENTERPRISE', 'BALANCED'];
    const tiers: Array<'LEGENDARY' | 'SUCCESS' | 'NORMAL' | 'FAILURE'> = ['LEGENDARY', 'SUCCESS', 'NORMAL', 'FAILURE'];

    goals.forEach((goal) => {
      tiers.forEach((tier) => {
        const vision = generateFutureVision(
          baseStats,
          { goal, tier } as any,
          'Deniz'
        );

        expect(vision.at30.trim().length).toBeGreaterThan(0);
        expect(vision.at50.trim().length).toBeGreaterThan(0);
      });
    });
  });

  it('returns optimistic vision for LEGENDARY academic ending', () => {
    const vision = generateFutureVision(
      baseStats,
      { goal: 'ACADEMIC', tier: 'LEGENDARY' } as any,
      'Ayse'
    );

    expect(vision.mood).toBe('optimistic');
    expect(vision.at30).toContain('Ayse');
    expect(vision.at50).toContain('Ayse');
  });

  it('returns somber vision for FAILURE athletic ending', () => {
    const vision = generateFutureVision(
      baseStats,
      { goal: 'ATHLETIC', tier: 'FAILURE' } as any,
      'Can'
    );

    expect(vision.mood).toBe('somber');
    expect(vision.at30).toContain('Can');
    expect(vision.at50).toContain('Can');
  });
});
