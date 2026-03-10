import { act, renderHook } from '@testing-library/react-native';
import { calculateSocialStressEffect, useSocialInteractions } from '../../src/hooks/useSocialInteractions';
import type { GameState, Stats } from '../../src/types';

jest.mock('../../src/utils/gameUtils', () => ({
  checkTraitFormation: jest.fn(() => ({
    newTraits: [],
    removedTraits: [],
    updatedProgress: {},
    progressUpdates: [],
  })),
  getMaxEnergy: jest.fn(() => 100),
  resolveTraitChanges: jest.fn(({ currentTraits }) => ({
    traits: currentTraits,
    gainedTraits: [],
    removedTraits: [],
  })),
}));

jest.mock('../../src/utils/traitFeedback', () => ({
  buildTraitChangeFeedback: jest.fn(() => []),
}));

jest.mock('../../src/config/featureFlags', () => ({
  isFeatureEnabled: jest.fn(() => false),
}));

jest.mock('../../src/utils/analyticsEvents', () => ({
  logHubAction: jest.fn(),
  logTraitChanges: jest.fn(),
  logTraitFormed: jest.fn(),
}));

jest.mock('../../src/utils/shareUtils', () => ({
  createTraitShareText: jest.fn((value: string) => value),
  formatShareMessage: jest.fn((value: string) => value),
}));

const createGameState = (overrides: Partial<GameState> = {}): GameState => ({
  age: 15,
  turn: 18,
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
    coding: 10,
    music: 10,
    sports: 10,
    design: 10,
    athletics: 10,
    logic: 10,
    reading: 10,
    teamwork: 10,
    art: 10,
    writing: 10,
    work_ethic: 10,
    business: 10,
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
  npcs: [{
    id: 'npc_1',
    name: 'Deniz',
    role: 'FRIEND',
    relationship: 40,
    romance: 0,
    gender: 'FEMALE',
    age: 15,
    personality: 'FRIENDLY',
    traits: ['LOYAL'],
    metAge: 12,
    metTurn: 4,
    lastInteraction: 15,
    sharedMemories: [],
    isInPlayerGroup: false,
  }],
  selectedNpcId: null,
  innerThought: '',
  innerThoughtType: 'IDLE',
  floatingTexts: [],
  totalTurns: 18,
  sessionCount: 1,
  adaptivePacingStreak: 0,
  lastInteracted: {},
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
    current: 40,
    threshold: 70,
    turnsSinceBreakdown: 2,
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

const baseStats: Stats = {
  health: 60,
  intelligence: 55,
  charisma: 50,
  discipline: 52,
  money: 120,
  energy: 80,
  familyRelation: 48,
};

describe('calculateSocialStressEffect', () => {
  it('returns baseline stress relief for a social action', () => {
    expect(calculateSocialStressEffect('CHAT', 0)).toBe(-7);
  });

  it('keeps stress effect negative even if NPC outcome adds stress', () => {
    expect(calculateSocialStressEffect('COMPETE', 5)).toBe(-2);
  });

  it('combines relief with additional calming outcomes', () => {
    expect(calculateSocialStressEffect('HANGOUT', -3)).toBe(-13);
  });
});

describe('useSocialInteractions', () => {
  it('applies stress relief to game state after a successful social interaction', () => {
    const interactWithNPC = jest.fn(() => ({
      success: true,
      message: 'Tamam',
      cost: { energy: 10, money: 0 },
    }));
    const updateStats = jest.fn();
    const updateGameState = jest.fn();

    const { result } = renderHook(() => useSocialInteractions({
      gameState: createGameState(),
      stats: baseStats,
      interactWithNPC,
      meetNewNPC: jest.fn(() => ({ success: true })),
      updateStats,
      updateGameState,
      onTraitProgressUpdates: jest.fn(),
      buildTraitToastMessage: jest.fn(() => null),
      enqueueToast: jest.fn(),
      triggerMilestoneShare: jest.fn(() => Promise.resolve()),
    }));

    act(() => {
      result.current.handleSocialInteract('npc_1', 'CHAT');
    });

    expect(interactWithNPC).toHaveBeenCalledWith(
      'npc_1',
      'CHAT',
      expect.objectContaining({ openness: 50, empathy: 50, courage: 50, conformity: 50 }),
      80,
      120,
      expect.any(Object)
    );
    expect(updateStats).toHaveBeenCalledWith({ energy: -10 });
    expect(updateGameState).toHaveBeenCalledWith(expect.objectContaining({
      stress: expect.objectContaining({
        current: 33,
        threshold: 70,
      }),
    }));
  });
});
