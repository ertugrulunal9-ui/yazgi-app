import { resolveEnding } from '../../src/utils/endingResolver';
import { buildSocialSummary } from '../../src/utils/gameUtils';
import { setRuntimeLocale } from '../../src/i18n/strings';
import { GameState, NPC, Stats } from '../../src/types';

const baseStats: Stats = {
  health: 60,
  intelligence: 60,
  charisma: 60,
  discipline: 60,
  money: 500,
  energy: 80,
  familyRelation: 60,
};

const createNpc = (overrides: Partial<NPC> = {}): NPC => ({
  id: `npc_${Math.random().toString(36).slice(2, 8)}`,
  name: 'NPC',
  role: 'FRIEND',
  relationship: 25,
  romance: 0,
  gender: 'FEMALE',
  age: 18,
  personality: 'FRIENDLY',
  traits: [],
  metAge: 10,
  metTurn: 30,
  lastInteraction: 80,
  sharedMemories: [],
  isInPlayerGroup: false,
  ...overrides,
});

const createGameState = (overrides: Partial<GameState> = {}): GameState => {
  const defaultState: GameState = {
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
    innerThoughtType: 'IDLE',
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
  };

  return {
    ...defaultState,
    ...overrides,
    childhood: overrides.childhood ?? defaultState.childhood,
    innerThoughtType: overrides.innerThoughtType ?? defaultState.innerThoughtType,
  };
};

describe('npc epilogue', () => {
  beforeEach(() => {
    setRuntimeLocale('tr');
  });

  it('buildSocialSummary filters by significant roles and respects priority', () => {
    const npcs: NPC[] = [
      createNpc({ id: 'a', name: 'Ali', role: 'FRIEND', relationship: 20, metAge: 13 }),
      createNpc({ id: 'b', name: 'Ayse', role: 'PARTNER', relationship: 90, metAge: 12 }),
      createNpc({ id: 'c', name: 'Bora', role: 'ENEMY', relationship: -60, metAge: 11 }),
      createNpc({ id: 'd', name: 'Can', role: 'BEST_FRIEND', relationship: 85, metAge: 9, sharedMemories: ['m1', 'm2', 'm3'] }),
      createNpc({ id: 'e', name: 'Deniz', role: 'CRUSH', relationship: 55, metAge: 15 }),
      createNpc({ id: 'f', name: 'Ece', role: 'ACQUAINTANCE', relationship: 5, metAge: 17 }),
      createNpc({ id: 'g', name: 'Fikret', role: 'RIVAL', relationship: -30, metAge: 14 }),
    ];

    const summary = buildSocialSummary(npcs);

    expect(summary).toHaveLength(5);
    expect(summary.map(item => item.role)).toEqual(['PARTNER', 'BEST_FRIEND', 'CRUSH', 'FRIEND', 'RIVAL']);
    expect(summary.some(item => item.name === 'Ece')).toBe(false);
    expect(summary[0].emoji).toBeTruthy();
    expect(summary[0].narrativeLine).toContain('Ayse');
  });

  it('resolveEnding attaches socialSummary payload', () => {
    const gameState = createGameState({
      selectedGoal: 'SOCIAL',
      npcs: [
        createNpc({ id: 'p', name: 'Pelin', role: 'PARTNER', relationship: 92, metAge: 11 }),
        createNpc({ id: 'r', name: 'Rauf', role: 'RIVAL', relationship: -35, metAge: 12 }),
      ],
      actionHistory: [
        { actionId: 'social_help', age: 17, turn: 85 },
        { actionId: 'social_group', age: 17, turn: 86 },
      ],
    });
    const stats = { ...baseStats, charisma: 80, familyRelation: 75 };

    const resolution = resolveEnding({ gameState, stats });

    expect(resolution.socialSummary).toBeDefined();
    expect(resolution.socialSummary?.length).toBe(2);
    expect(resolution.socialSummary?.[0].name).toBe('Pelin');
    expect(resolution.socialSummary?.[0].narrativeLine).toContain('Pelin');
  });
});
