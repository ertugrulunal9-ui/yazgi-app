import { TurnMediator } from '../../src/systems/TurnMediator';
import { Choice, GameState, Stats } from '../../src/types';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

const createBaseGameState = (): GameState => {
  const state = getInitialGameState();
  return {
    ...state,
    age: 12,
    turn: 10,
    historyLog: [],
    actionCounts: {},
    eventChoiceHistory: [],
    traits: [],
    traitProgress: {},
    memories: [],
    scheduledEvents: [],
    inventory: [],
    adaptivePacingStreak: 0,
    personalityHistory: [],
    currentEvent: {
      id: 'evt_test',
      text: 'Test event',
      minAge: 0,
      maxAge: 100,
      difficulty: 2,
      rarity: 'COMMON',
      choices: [],
      personalityCategory: 'GROWTH',
    },
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
  };
};

const createBaseStats = (): Stats => ({
  ...getInitialStats(),
  health: 50,
  intelligence: 50,
  charisma: 50,
  discipline: 50,
  money: 150,
  energy: 45,
  familyRelation: 50,
});

describe('TurnMediator', () => {
  const mediator = new TurnMediator();

  it('processes an event choice and returns RESULT updates', () => {
    const gameState = createBaseGameState();
    const stats = createBaseStats();
    const choice: Choice = {
      id: 'ch_success',
      text: 'Odaklan',
      effect: { intelligence: 5, energy: -6 },
      feedback: 'Iyi bir tercih.',
      gradeUpdates: { math: 3 },
      skillUpdates: { logic: 2 },
      stressEffect: -4,
    };

    const result = mediator.processEventChoice({
      choice,
      gameState,
      stats,
      choiceIndex: 1,
    });

    expect(result.eventId).toBe('evt_test');
    expect(result.choiceIndexForAnalytics).toBe(1);
    expect(result.newStats.intelligence).toBeGreaterThan(stats.intelligence);
    expect(result.newStats.energy).toBeLessThan(stats.energy);
    expect(result.gameStateUpdates.phase).toBe('RESULT');
    expect(result.gameStateUpdates.eventChoiceHistory).toContain('evt_test');
    expect(result.gameStateUpdates.lastResult?.gradeChanges?.math).toBe(3);
    expect(result.gameStateUpdates.schoolGrades?.math).toBe(3);
  });

  it('updates NPC relationship and role based on npcRelationChange', () => {
    const gameState = createBaseGameState();
    gameState.npcs = [
      {
        id: 'npc_1',
        name: 'Test NPC',
        role: 'ACQUAINTANCE',
        relationship: 10,
        romance: 80,
        gender: 'FEMALE',
        age: 12,
        personality: 'FRIENDLY',
        traits: [],
        metAge: 10,
        metTurn: 3,
        lastInteraction: 2,
        sharedMemories: [],
        isInPlayerGroup: false,
      },
    ];
    const stats = createBaseStats();
    const choice: Choice = {
      id: 'ch_social',
      text: 'Destek ol',
      effect: {},
      feedback: 'Yardim ettin.',
      npcRelationChange: 40,
    };

    const result = mediator.processEventChoice({
      choice,
      gameState,
      stats,
      choiceIndex: 0,
    });

    const updatedNpcs = result.gameStateUpdates.npcs || [];
    expect(updatedNpcs).toHaveLength(1);
    expect(updatedNpcs[0].relationship).toBe(50);
    expect(updatedNpcs[0].role).toBe('PARTNER');
    expect(updatedNpcs[0].lastInteraction).toBe(gameState.turn);
  });

  it('creates scheduled events from future event configuration', () => {
    const gameState = createBaseGameState();
    const stats = createBaseStats();
    const choice: Choice = {
      id: 'ch_future',
      text: 'Plan yap',
      effect: {},
      feedback: 'Ilerisi icin plan yaptin.',
      futureEvents: [
        {
          trigger: 'TURNS',
          turnsLater: 2,
          eventId: 'evt_followup',
        },
      ],
    };

    const result = mediator.processEventChoice({
      choice,
      gameState,
      stats,
      choiceIndex: 0,
    });

    const scheduledEvents = result.gameStateUpdates.scheduledEvents || [];
    expect(scheduledEvents).toHaveLength(1);
    expect(scheduledEvents[0].eventId).toBe('evt_followup');
    expect(scheduledEvents[0].remainingTurns).toBe(2);
  });

  it('updates personality momentum state from choice behavior', () => {
    const gameState = createBaseGameState();
    const stats = createBaseStats();
    const choice: Choice = {
      id: 'ch_helpful',
      text: 'Yardim et',
      effect: { charisma: 2, familyRelation: 3 },
      feedback: 'Destek oldun.',
      personalityEffects: [{ axis: 'empathy', change: 2 }],
    };

    const result = mediator.processEventChoice({
      choice,
      gameState,
      stats,
      choiceIndex: 0,
    });

    const personalityState = result.gameStateUpdates.personalityState;
    expect(personalityState?.HELPFUL.count).toBe(1);
    expect(personalityState?.HELPFUL.streak).toBe(1);
    expect(personalityState?.HELPFUL.multiplier).toBe(1);
  });

  it('writes selectedGoal to game state updates when choice carries goal metadata', () => {
    const gameState = createBaseGameState();
    const stats = createBaseStats();
    const choice: Choice = {
      id: 'ch_goal_pick',
      text: 'Akademik hedef sec',
      effect: { intelligence: 2 },
      feedback: 'Hedefin artik net.',
      setSelectedGoal: 'ACADEMIC',
    };

    const result = mediator.processEventChoice({
      choice,
      gameState,
      stats,
      choiceIndex: 0,
    });

    expect(result.gameStateUpdates.selectedGoal).toBe('ACADEMIC');
  });

  it('applies grantTraits from event choices', () => {
    const gameState = createBaseGameState();
    const stats = createBaseStats();
    const choice: Choice = {
      id: 'ch_trait_grant',
      text: 'Cesur adim',
      effect: {},
      feedback: 'Cesur bir karar verdin.',
      grantTraits: ['BRAVE'],
    };

    const result = mediator.processEventChoice({
      choice,
      gameState,
      stats,
      choiceIndex: 0,
    });

    expect(result.newTraits).toContain('BRAVE');
    expect(result.removedTraits).toEqual([]);
    expect(result.gameStateUpdates.traits).toContain('BRAVE');
    expect(result.gameStateUpdates.lastResult?.traitChanges?.some(change => change.changeType === 'GAINED' && change.traitId === 'BRAVE')).toBe(true);
  });

  it('removes conflicting traits when grantTraits gives a conflicting trait', () => {
    const gameState = createBaseGameState();
    gameState.traits = ['LAZY'];
    const stats = createBaseStats();
    const choice: Choice = {
      id: 'ch_trait_conflict',
      text: 'Disiplin sec',
      effect: {},
      feedback: 'Sistemli bir yol sectin.',
      grantTraits: ['DISCIPLINED'],
    };

    const result = mediator.processEventChoice({
      choice,
      gameState,
      stats,
      choiceIndex: 0,
    });

    expect(result.newTraits).toContain('DISCIPLINED');
    expect(result.removedTraits).toContain('LAZY');
    expect(result.gameStateUpdates.traits).toContain('DISCIPLINED');
    expect(result.gameStateUpdates.traits).not.toContain('LAZY');
    expect(result.gameStateUpdates.lastResult?.traitChanges?.some(change => change.changeType === 'REMOVED' && change.traitId === 'LAZY')).toBe(true);
  });
});
