import { EventContext, GameEvent } from '../../src/types';
import {
  calculateGoalAlignmentScore,
  calculateOutcomeScore,
  getAdaptivePacingBand,
  getRecentCategories,
  isEventEligible,
  selectEventWithAdaptivePacing,
  updateAdaptivePacingStreak,
} from '../../src/utils/eventSelection';

const baseContext: EventContext = {
  age: 14,
  traits: ['GENIUS'],
  stats: {
    health: 70,
    intelligence: 75,
    charisma: 55,
    discipline: 60,
    money: 500,
    energy: 65,
    familyRelation: 70,
  },
  family: { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 30 },
  memories: [],
  inventory: ['tablet'],
  personality: {
    openness: 50,
    courage: 50,
    empathy: 50,
    patience: 50,
    conformity: 50,
  },
  stress: {
    current: 25,
    threshold: 70,
    turnsSinceBreakdown: 8,
    sources: [],
  },
  skills: {
    coding: 65,
    music: 20,
    sports: 30,
    design: 20,
    athletics: 30,
    logic: 60,
    reading: 45,
    teamwork: 40,
    art: 15,
    writing: 30,
    work_ethic: 50,
    business: 25,
  },
  npcs: [
    {
      id: 'npc_1',
      name: 'Asli',
      role: 'FRIEND',
      relationship: 60,
      romance: 0,
      gender: 'FEMALE',
      age: 14,
      personality: 'FRIENDLY',
      traits: ['LOYAL'],
      metAge: 10,
      metTurn: 4,
      lastInteraction: 1,
      sharedMemories: [],
      isInPlayerGroup: false,
    },
  ],
};

const fallbackEvent: GameEvent = {
  id: 'fallback',
  text: 'fallback',
  minAge: 0,
  maxAge: 99,
  choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
  rarity: 'COMMON',
  isRepeatable: true,
  difficulty: 1,
};

describe('eventSelection', () => {
  it('checks narrative prerequisites and blockers', () => {
    const event: GameEvent = {
      id: 'arc_2',
      text: 'Arc event',
      minAge: 10,
      maxAge: 18,
      choices: [{ text: 'Continue', effect: {}, feedback: 'ok' }],
      reqEventIds: ['arc_1'],
      blockEventIds: ['bad_ending'],
      reqFamily: { wealth: ['MIDDLE', 'RICH'] },
      reqSkills: { coding: 50 },
      reqNPCRole: 'FRIEND',
      difficulty: 3,
      rarity: 'UNCOMMON',
      isRepeatable: false,
    };

    expect(isEventEligible(event, baseContext, [], ['arc_1'])).toBe(true);
    expect(isEventEligible(event, baseContext, [], [])).toBe(false);
    expect(isEventEligible(event, baseContext, [], ['arc_1', 'bad_ending'])).toBe(false);
  });

  it('respects event-level condition callbacks', () => {
    const conditionedEvent: GameEvent = {
      id: 'goal_social_only_event',
      text: 'Goal-conditioned event',
      minAge: 10,
      maxAge: 18,
      choices: [{ text: 'Continue', effect: {}, feedback: 'ok' }],
      condition: (ctx) => ctx.gameState?.selectedGoal === 'SOCIAL',
      rarity: 'UNCOMMON',
      difficulty: 3,
      isRepeatable: true,
    };

    const socialGoalContext: EventContext = {
      ...baseContext,
      gameState: { selectedGoal: 'SOCIAL' } as any,
    };
    const academicGoalContext: EventContext = {
      ...baseContext,
      gameState: { selectedGoal: 'ACADEMIC' } as any,
    };

    expect(isEventEligible(conditionedEvent, socialGoalContext, [], [])).toBe(true);
    expect(isEventEligible(conditionedEvent, academicGoalContext, [], [])).toBe(false);
  });

  it('keeps scheduled_only events hidden unless a due scheduled entry exists', () => {
    const scheduledOnlyEvent: GameEvent = {
      id: 'scheduled_only_result',
      text: 'Scheduled result',
      minAge: 10,
      maxAge: 18,
      tags: ['scheduled_only'],
      choices: [{ text: 'Continue', effect: {}, feedback: 'ok' }],
      rarity: 'UNCOMMON',
      difficulty: 2,
      isRepeatable: false,
    };

    const withPendingSchedule: EventContext = {
      ...baseContext,
      gameState: {
        scheduledEvents: [
          { id: 'sched_pending', eventId: 'scheduled_only_result', remainingTurns: 2, priority: 'HIGH' },
        ],
      } as any,
    };

    const withDueSchedule: EventContext = {
      ...baseContext,
      gameState: {
        scheduledEvents: [
          { id: 'sched_due', eventId: 'scheduled_only_result', remainingTurns: 0, priority: 'HIGH' },
        ],
      } as any,
    };

    expect(isEventEligible(scheduledOnlyEvent, baseContext, [], [])).toBe(false);
    expect(isEventEligible(scheduledOnlyEvent, withPendingSchedule, [], [])).toBe(false);
    expect(isEventEligible(scheduledOnlyEvent, withDueSchedule, [], [])).toBe(true);
  });

  it('checks memory prerequisites with minimum weight', () => {
    const memoryEvent: GameEvent = {
      id: 'memory_gate',
      text: 'Memory gate',
      minAge: 10,
      maxAge: 18,
      choices: [{ text: 'Continue', effect: {}, feedback: 'ok' }],
      reqMemory: {
        emotion: 'REGRET',
        minWeight: 'MEDIUM',
      },
      difficulty: 2,
      rarity: 'UNCOMMON',
      isRepeatable: true,
    };

    const withoutRequiredMemory: EventContext = {
      ...baseContext,
      memories: [
        {
          id: 'm1',
          eventId: 'e1',
          choiceId: 'c1',
          age: 12,
          emotion: 'REGRET',
          weight: 'LOW',
          turnTimestamp: 1,
        },
      ],
    };

    const withRequiredMemory: EventContext = {
      ...baseContext,
      memories: [
        {
          id: 'm2',
          eventId: 'e2',
          choiceId: 'c2',
          age: 13,
          emotion: 'REGRET',
          weight: 'HIGH',
          turnTimestamp: 2,
        },
      ],
    };

    expect(isEventEligible(memoryEvent, withoutRequiredMemory, [], [])).toBe(false);
    expect(isEventEligible(memoryEvent, withRequiredMemory, [], [])).toBe(true);
  });

  it('applies repeatability rules', () => {
    const nonRepeatable: GameEvent = {
      id: 'once_only',
      text: 'Once',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      isRepeatable: false,
      rarity: 'COMMON',
      difficulty: 1,
    };
    const repeatable: GameEvent = {
      id: 'loopable',
      text: 'Loop',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      isRepeatable: true,
      rarity: 'COMMON',
      difficulty: 1,
    };

    expect(isEventEligible(nonRepeatable, baseContext, [], ['once_only'])).toBe(false);
    expect(isEventEligible(repeatable, baseContext, ['loopable'], [])).toBe(false);
  });

  it('adapts event selection band by streak', () => {
    expect(getAdaptivePacingBand(-3)).toBe('RECOVERY');
    expect(getAdaptivePacingBand(0)).toBe('BALANCED');
    expect(getAdaptivePacingBand(3)).toBe('CHALLENGE');
  });

  it('selects from weighted pool with adaptive pacing', () => {
    const easyEvent: GameEvent = {
      id: 'easy',
      text: 'Easy',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      rarity: 'COMMON',
      difficulty: 1,
      isRepeatable: true,
    };
    const hardEvent: GameEvent = {
      id: 'hard',
      text: 'Hard',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      rarity: 'UNCOMMON',
      difficulty: 5,
      isRepeatable: true,
    };

    const recoveryPick = selectEventWithAdaptivePacing(
      [easyEvent, hardEvent],
      baseContext,
      [],
      [],
      { fallbackEvent, adaptivePacingStreak: -3, randomFn: () => 0.5 }
    );
    expect(recoveryPick.id).toBe('easy');

    const challengePick = selectEventWithAdaptivePacing(
      [easyEvent, hardEvent],
      baseContext,
      [],
      [],
      { fallbackEvent, adaptivePacingStreak: 3, randomFn: () => 0.99 }
    );
    expect(challengePick.id).toBe('hard');
  });

  it('applies goal-oriented weighting and prefers aligned events', () => {
    const unrelatedEvent: GameEvent = {
      id: 'social_hangout_day',
      text: 'Sosyal bir bulusma',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      rarity: 'COMMON',
      difficulty: 2,
      isRepeatable: true,
      tags: ['social'],
    };
    const academicEvent: GameEvent = {
      id: 'study_library_session',
      text: 'Kutuphane calisma seansi',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      rarity: 'COMMON',
      difficulty: 2,
      isRepeatable: true,
      tags: ['study', 'exam'],
    };

    const pick = selectEventWithAdaptivePacing(
      [unrelatedEvent, academicEvent],
      baseContext,
      [],
      [],
      {
        fallbackEvent,
        adaptivePacingStreak: 0,
        selectedGoal: 'ACADEMIC',
        randomFn: () => 0.3,
      }
    );

    expect(pick.id).toBe('study_library_session');
    expect(calculateGoalAlignmentScore(academicEvent, 'ACADEMIC')).toBe(100);
    expect(calculateGoalAlignmentScore(unrelatedEvent, 'ACADEMIC')).toBe(25);
  });

  it('uses chaos selection every 5 turns and ignores goal alignment weights', () => {
    const unrelatedEvent: GameEvent = {
      id: 'chaos_social',
      text: 'Sosyal bir gun',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      rarity: 'COMMON',
      difficulty: 2,
      isRepeatable: true,
      tags: ['social'],
    };
    const academicEvent: GameEvent = {
      id: 'chaos_academic',
      text: 'Kutuphane gunu',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      rarity: 'COMMON',
      difficulty: 2,
      isRepeatable: true,
      tags: ['study', 'exam'],
    };

    const normalPick = selectEventWithAdaptivePacing(
      [unrelatedEvent, academicEvent],
      baseContext,
      [],
      [],
      {
        fallbackEvent,
        adaptivePacingStreak: 0,
        selectedGoal: 'ACADEMIC',
        currentTurn: 4,
        randomFn: () => 0.3,
      }
    );
    expect(normalPick.id).toBe('chaos_academic');

    const chaosPick = selectEventWithAdaptivePacing(
      [unrelatedEvent, academicEvent],
      baseContext,
      [],
      [],
      {
        fallbackEvent,
        adaptivePacingStreak: 0,
        selectedGoal: 'ACADEMIC',
        currentTurn: 5,
        randomFn: () => 0.3,
      }
    );
    expect(chaosPick.id).toBe('chaos_social');
  });

  it('boosts npc_checkin events around 4-5 turn cadence', () => {
    const regularEvent: GameEvent = {
      id: 'regular_social_event',
      text: 'Regular social',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      rarity: 'COMMON',
      difficulty: 2,
      isRepeatable: true,
      tags: ['social'],
    };
    const checkInEvent: GameEvent = {
      id: 'npc_checkin_event',
      text: 'NPC check-in',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      rarity: 'COMMON',
      difficulty: 2,
      isRepeatable: true,
      tags: ['npc_checkin', 'social'],
      reqNPCRole: 'FRIEND',
    };

    const normalTurnPick = selectEventWithAdaptivePacing(
      [regularEvent, checkInEvent],
      baseContext,
      [],
      [],
      {
        fallbackEvent,
        adaptivePacingStreak: 0,
        currentTurn: 3,
        randomFn: () => 0.4,
      }
    );
    expect(normalTurnPick.id).toBe('regular_social_event');

    const boostedTurnPick = selectEventWithAdaptivePacing(
      [regularEvent, checkInEvent],
      baseContext,
      [],
      [],
      {
        fallbackEvent,
        adaptivePacingStreak: 0,
        currentTurn: 5,
        randomFn: () => 0.4,
      }
    );
    expect(boostedTurnPick.id).toBe('npc_checkin_event');
  });

  it('applies category diversity penalty for repeated categories', () => {
    const socialEvent: GameEvent = {
      id: 'social_1',
      text: 'Social event',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      rarity: 'COMMON',
      difficulty: 2,
      isRepeatable: true,
      personalityCategory: 'SOCIAL',
    };
    const growthEvent: GameEvent = {
      id: 'growth_1',
      text: 'Growth event',
      minAge: 0,
      maxAge: 99,
      choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      rarity: 'COMMON',
      difficulty: 2,
      isRepeatable: true,
      personalityCategory: 'GROWTH',
    };

    // With 3 recent SOCIAL events, SOCIAL should be penalized heavily
    const pick = selectEventWithAdaptivePacing(
      [socialEvent, growthEvent],
      baseContext,
      [],
      [],
      {
        fallbackEvent,
        adaptivePacingStreak: 0,
        recentCategories: ['SOCIAL', 'SOCIAL', 'SOCIAL'],
        randomFn: () => 0.5,
      }
    );
    expect(pick.id).toBe('growth_1');
  });

  it('getRecentCategories extracts last N categories from event IDs', () => {
    const events: GameEvent[] = [
      { id: 'e1', text: 'E1', minAge: 0, maxAge: 99, choices: [], personalityCategory: 'SOCIAL', difficulty: 1 },
      { id: 'e2', text: 'E2', minAge: 0, maxAge: 99, choices: [], personalityCategory: 'GROWTH', difficulty: 1 },
      { id: 'e3', text: 'E3', minAge: 0, maxAge: 99, choices: [], personalityCategory: 'RISK', difficulty: 1 },
      { id: 'e4', text: 'E4', minAge: 0, maxAge: 99, choices: [], difficulty: 1 },
    ];
    const recentIds = ['e1', 'e2', 'e3', 'e4'];
    const categories = getRecentCategories(events, recentIds, 5);
    expect(categories).toEqual(['SOCIAL', 'GROWTH', 'RISK']);
  });

  it('calculates outcome score and updates streak direction', () => {
    const positiveScore = calculateOutcomeScore(
      { intelligence: 8, energy: -2 },
      { coding: 4 },
      { math: 2 },
      4
    );
    expect(positiveScore).toBeGreaterThan(6);
    expect(updateAdaptivePacingStreak(1, positiveScore)).toBe(2);

    const negativeScore = calculateOutcomeScore(
      { health: -10, energy: -4, discipline: -3 },
      {},
      {},
      5
    );
    expect(negativeScore).toBeLessThan(-6);
    expect(updateAdaptivePacingStreak(-1, negativeScore)).toBe(-2);
  });
});
