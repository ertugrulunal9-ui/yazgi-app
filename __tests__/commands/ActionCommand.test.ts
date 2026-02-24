import { HubActionCommand } from '../../src/commands/ActionCommand';
import { ExamGameType, SubAction } from '../../src/data/actions';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';
import { GameState, Stats } from '../../src/types';

const createBaseGameState = (): GameState => {
  const state = getInitialGameState();
  return {
    ...state,
    age: 10,
    turn: 4,
    traits: [],
    traitProgress: {},
    historyLog: [],
    actionHistory: [],
    family: { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 25 },
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
  };
};

const createBaseStats = (): Stats => ({
  ...getInitialStats(),
  health: 50,
  intelligence: 50,
  charisma: 50,
  discipline: 50,
  money: 200,
  energy: 40,
  familyRelation: 50,
});

const createAction = (overrides: Partial<SubAction> = {}): SubAction => ({
  id: 'study_book',
  text: 'Kitap Oku',
  icon: 'book',
  energyCost: 10,
  effect: { intelligence: 3 },
  feedback: 'Kitap okudun.',
  ...overrides,
});

describe('HubActionCommand', () => {
  const command = new HubActionCommand();

  it('blocks turn-limited actions when already used in the same turn', () => {
    const gameState = createBaseGameState();
    gameState.actionHistory = [{ actionId: 'baby_sleep', age: gameState.age, turn: gameState.turn }];
    const stats = createBaseStats();

    const result = command.execute({
      action: createAction({ id: 'baby_sleep', energyCost: 0, effect: { energy: 20 } }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('blocked');
    expect(result.errorType).toBe('ALREADY_USED_THIS_TURN');
    expect(result.feedbackMessage).toContain('zaten');
  });

  it('blocks action when energy is insufficient', () => {
    const gameState = createBaseGameState();
    const stats = { ...createBaseStats(), energy: 2 };

    const result = command.execute({
      action: createAction({ energyCost: 8, effect: { intelligence: 2 } }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('blocked');
    expect(result.errorType).toBe('NOT_ENOUGH_ENERGY');
    expect(result.feedbackMessage).toContain('Yeterli enerjin yok');
  });

  it('blocks action when money is insufficient', () => {
    const gameState = createBaseGameState();
    const stats = { ...createBaseStats(), money: 20 };

    const result = command.execute({
      action: createAction({
        id: 'shopping_bicycle',
        energyCost: 8,
        effect: { money: -120 },
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('blocked');
    expect(result.errorType).toBe('NOT_ENOUGH_MONEY');
  });

  it('blocks action when required item is missing', () => {
    const gameState = createBaseGameState();
    gameState.inventory = [];
    const stats = createBaseStats();

    const result = command.execute({
      action: createAction({
        id: 'computer_code',
        requiredItemIds: ['item_computer'],
        energyCost: 10,
        effect: { intelligence: 4 },
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('blocked');
    expect(result.errorType).toBe('MISSING_REQUIRED_ITEM');
  });

  it('returns open_exam when the action launches an exam mini-game', () => {
    const gameState = createBaseGameState();
    const stats = createBaseStats();
    const examType: ExamGameType = 'MATH';

    const result = command.execute({
      action: createAction({
        id: 'study_math_exam',
        opensExamGame: examType,
        energyCost: 12,
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('open_exam');
    expect(result.opensExamGame).toBe(examType);
    expect(result.newStats).toBe(stats);
  });

  it('returns calculated stats and gameState updates on successful execution', () => {
    const gameState = createBaseGameState();
    const stats = createBaseStats();
    const action = createAction({
      id: 'wellbeing_walk',
      energyCost: 6,
      effect: { health: 2, energy: -6 },
      stressEffect: -5,
      feedback: 'Yuruyus yaptin.',
    });

    const result = command.execute({
      action,
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.newStats.energy).toBeLessThan(stats.energy);
    expect(result.newStats.health).toBeGreaterThanOrEqual(stats.health);
    expect(result.gameStateUpdates.historyLog?.length).toBe(1);
    expect(result.gameStateUpdates.actionHistory?.length).toBe(1);
    expect(result.feedbackMessage).toContain('Yuruyus yaptin.');
    expect(result.feedbackMessage).toContain('Stres -5');
  });

  it('resolves ask_allowance dynamically from family behavior', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const gameState = createBaseGameState();
    gameState.family = { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 50 };
    const stats = { ...createBaseStats(), charisma: 70, familyRelation: 60, money: 100 };

    const result = command.execute({
      action: createAction({
        id: 'ask_allowance',
        text: 'Harclik Iste',
        energyCost: 5,
        effect: {},
        feedback: 'Ailenden harclik istedin.',
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.newStats.money).toBeGreaterThan(stats.money);
    expect(result.feedbackMessage).toContain('Ailen destek oldu');

    randomSpy.mockRestore();
  });

  it('applies story book bonus to study_book reading gain', () => {
    const gameState = createBaseGameState();
    gameState.inventory = ['item_story_book'];
    const stats = createBaseStats();

    const result = command.execute({
      action: createAction({
        id: 'study_book',
        text: 'Kitap Oku',
        energyCost: 10,
        effect: { intelligence: 2, energy: -10 },
        skillUpdates: { reading: 2 },
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.gameStateUpdates.skills?.reading).toBe(4);
  });

  it('applies computer bonus to coding and design skill gains', () => {
    const gameState = createBaseGameState();
    gameState.inventory = ['item_computer'];
    const stats = createBaseStats();

    const result = command.execute({
      action: createAction({
        id: 'work_freelance',
        text: 'Freelance Is',
        energyCost: 10,
        effect: { intelligence: 1, energy: -10 },
        skillUpdates: { coding: 2, design: 2 },
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.gameStateUpdates.skills?.coding).toBe(3);
    expect(result.gameStateUpdates.skills?.design).toBe(3);
  });

  it('applies instrument bonus to music skill gains', () => {
    const gameState = createBaseGameState();
    gameState.inventory = ['item_instrument'];
    const stats = createBaseStats();

    const result = command.execute({
      action: createAction({
        id: 'study_music',
        text: 'Muzik Calis',
        energyCost: 10,
        effect: { charisma: 1, energy: -10 },
        skillUpdates: { music: 2 },
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.gameStateUpdates.skills?.music).toBe(3);
  });

  it('applies personality effects from hub actions', () => {
    const gameState = createBaseGameState();
    const stats = createBaseStats();
    const action = createAction({
      id: 'explore_playground',
      text: 'Parkta Oyna',
      energyCost: 12,
      effect: { health: 3, energy: -12 },
      personalityEffects: [
        { axis: 'courage', change: 2 },
        { axis: 'openness', change: 2 },
      ],
      feedback: 'Parkta oynadin.',
    });

    const result = command.execute({
      action,
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.gameStateUpdates.personality?.courage).toBe(52);
    expect(result.gameStateUpdates.personality?.openness).toBe(52);
    expect(result.gameStateUpdates.personalityHistory?.length).toBe(2);
    expect(result.gameStateUpdates.personalityState?.AGGRESSIVE.count).toBe(1);
    expect(result.feedbackMessage).toContain('Cesaret +2');
  });

  it('removes conflicting owned traits when a new trait is unlocked', () => {
    const gameState = createBaseGameState();
    gameState.traits = ['LAZY'];
    gameState.traitProgress = {
      DISCIPLINED: { points: 5, required: 6, firstTriggeredAge: 8, isLocked: false },
    };
    const stats = { ...createBaseStats(), discipline: 70, energy: 80 };

    const result = command.execute({
      action: createAction({
        id: 'study_math',
        text: 'Matematik Calis',
        energyCost: 10,
        effect: { discipline: 2, energy: -10 },
        feedback: 'Planli calistin.',
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.newTraits).toContain('DISCIPLINED');
    expect(result.removedTraits).toContain('LAZY');
    expect(result.gameStateUpdates.traits).toContain('DISCIPLINED');
    expect(result.gameStateUpdates.traits).not.toContain('LAZY');
    expect(result.traitChanges?.some(change => change.changeType === 'REMOVED' && change.traitId === 'LAZY')).toBe(true);
  });

  it('applies age-scaled POOR income multiplier and removes upkeep for children', () => {
    const gameState = createBaseGameState();
    gameState.age = 10;
    gameState.family = { wealth: 'POOR', dynamic: 'SUPPORTIVE', allowance: 10 };
    const stats = { ...createBaseStats(), money: 100 };

    const result = command.execute({
      action: createAction({
        id: 'work_delivery',
        text: 'Kuryelik Yap',
        energyCost: 6,
        effect: { money: 10, energy: -6 },
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.newStats.money).toBe(106);
  });

  it('reduces POOR upkeep cost during early-teen years', () => {
    const gameState = createBaseGameState();
    gameState.age = 14;
    gameState.family = { wealth: 'POOR', dynamic: 'SUPPORTIVE', allowance: 10 };
    const stats = { ...createBaseStats(), money: 100 };

    const result = command.execute({
      action: createAction({
        id: 'family_help',
        text: 'Evde Yardim Et',
        energyCost: 5,
        effect: { money: 10, energy: -5 },
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.newStats.money).toBe(105);
  });

  it('applies diminishing returns to RICH families with 500+ money', () => {
    const gameState = createBaseGameState();
    gameState.age = 15;
    gameState.family = { wealth: 'RICH', dynamic: 'SUPPORTIVE', allowance: 80 };
    const stats = { ...createBaseStats(), money: 520 };

    const result = command.execute({
      action: createAction({
        id: 'work_freelance',
        text: 'Freelance Is',
        energyCost: 8,
        effect: { money: 100, energy: -8 },
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.newStats.money).toBe(615);
  });

  it('schedules a POOR-exclusive recovery event when hardship trigger succeeds', () => {
    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const gameState = createBaseGameState();
    gameState.age = 13;
    gameState.family = { wealth: 'POOR', dynamic: 'SUPPORTIVE', allowance: 8 };
    gameState.scheduledEvents = [];
    gameState.eventChoiceHistory = [];
    const stats = { ...createBaseStats(), money: 15 };

    const result = command.execute({
      action: createAction({
        id: 'work_part_time',
        text: 'Yari Zamanli Is',
        energyCost: 6,
        effect: { money: 4, energy: -6 },
      }),
      currentStats: stats,
      gameState,
    });

    expect(result.status).toBe('success');
    expect(result.gameStateUpdates.scheduledEvents?.some(
      event => event.eventId === 'econ_poor_scholarship_offer'
    )).toBe(true);
    expect(result.feedbackMessage).toContain('destek kapisi');

    randomSpy.mockRestore();
  });
});
