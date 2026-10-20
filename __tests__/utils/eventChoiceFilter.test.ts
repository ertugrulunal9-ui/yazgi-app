import { describeLockReason, getChoicesToRender, getLockedChoices } from '../../src/utils/eventChoiceFilter';
import {
  Choice,
  EventContext,
  Family,
  GameEvent,
  NPCRole,
  Personality,
  Skills,
  Stats,
} from '../../src/types';

const basePersonality: Personality = {
  openness: 50,
  courage: 50,
  empathy: 50,
  patience: 50,
  conformity: 50,
};

const baseStats: Stats = {
  health: 70,
  intelligence: 65,
  charisma: 55,
  discipline: 50,
  money: 20,
  energy: 60,
  familyRelation: 45,
};

const baseSkills: Skills = {
  coding: 60,
  music: 20,
  sports: 30,
  design: 40,
  athletics: 25,
  logic: 55,
  reading: 45,
  teamwork: 50,
  art: 15,
  writing: 35,
  work_ethic: 60,
  business: 15,
};

const baseFamily: Family = {
  wealth: 'MIDDLE',
  dynamic: 'SUPPORTIVE',
  allowance: 25,
};

const baseContext: EventContext = {
  age: 14,
  traits: [],
  stats: baseStats,
  family: baseFamily,
  memories: [],
  personality: basePersonality,
  stress: {
    current: 10,
    threshold: 70,
    turnsSinceBreakdown: 4,
    sources: [],
  },
  skills: baseSkills,
  npcs: [],
};

const resolveChoice = (choice: Choice | ((ctx: EventContext) => Choice)): Choice =>
  typeof choice === 'function' ? choice(baseContext) : choice;

const makeChoice = (overrides: Partial<Choice> = {}): Choice => ({
  text: 'Base choice',
  effect: {},
  feedback: 'ok',
  ...overrides,
});

const makeEvent = (
  choices: (Choice | ((ctx: EventContext) => Choice))[],
  id: string = 'test_event',
): GameEvent => ({
  id,
  text: 'Test',
  minAge: 0,
  maxAge: 18,
  choices,
  rarity: 'COMMON',
  difficulty: 1,
  isRepeatable: true,
});

describe('eventChoiceFilter', () => {
  const npcRoles: NPCRole[] = ['FRIEND'];
  const eventChoiceSet = new Set<string>(['arc_started', 'lesson_done']);

  it('returns null when there is no current event', () => {
    const result = getChoicesToRender({
      currentEvent: null,
      resolveChoice,
      personality: basePersonality,
      stats: baseStats,
      family: baseFamily,
      skills: baseSkills,
      npcRoles,
      eventChoiceSet,
    });

    expect(result).toBeNull();
  });

  it('filters by personality requirements (min/max/empty requirements)', () => {
    const event = makeEvent([
      makeChoice({
        text: 'fails min',
        reqPersonality: [{ axis: 'courage', min: 70 }],
      }),
      makeChoice({
        text: 'fails max',
        reqPersonality: [{ axis: 'empathy', max: 30 }],
      }),
      makeChoice({
        text: 'passes range',
        reqPersonality: [{ axis: 'openness', min: 40, max: 60 }],
      }),
      makeChoice({
        text: 'empty personality requirements still pass',
        reqPersonality: [],
      }),
    ]);

    const result = getChoicesToRender({
      currentEvent: event,
      resolveChoice,
      personality: basePersonality,
      stats: baseStats,
      family: baseFamily,
      skills: baseSkills,
      npcRoles,
      eventChoiceSet,
    });

    expect(result?.map((choice) => resolveChoice(choice).text)).toEqual([
      'passes range',
      'empty personality requirements still pass',
    ]);
  });

  it('filters by stats and ignores invalid stat requirement value types', () => {
    const event = makeEvent([
      makeChoice({
        text: 'fails stats threshold',
        reqStats: { intelligence: 90 },
      }),
      makeChoice({
        text: 'passes with valid + ignored invalid value',
        reqStats: { intelligence: 50, charisma: 'skip' } as unknown as Partial<Stats>,
      }),
      makeChoice({
        text: 'function choice also passes',
      }),
    ]);

    const functionChoice = (ctx: EventContext): Choice =>
      makeChoice({
        text: `resolved function choice age ${ctx.age}`,
        reqStats: { discipline: 40 },
      });

    const result = getChoicesToRender({
      currentEvent: {
        ...event,
        choices: [...event.choices, functionChoice],
      },
      resolveChoice,
      personality: basePersonality,
      stats: baseStats,
      family: baseFamily,
      skills: baseSkills,
      npcRoles,
      eventChoiceSet,
    });

    expect(result?.map((choice) => resolveChoice(choice).text)).toEqual([
      'passes with valid + ignored invalid value',
      'function choice also passes',
      'resolved function choice age 14',
    ]);
  });

  it('returns original choices when all options are filtered out', () => {
    const event = makeEvent([
      makeChoice({ text: 'needs high coding', reqSkills: { coding: 95 } }),
      makeChoice({ text: 'needs rival role', reqNPCRole: 'RIVAL' }),
    ]);

    const result = getChoicesToRender({
      currentEvent: event,
      resolveChoice,
      personality: basePersonality,
      stats: baseStats,
      family: baseFamily,
      skills: baseSkills,
      npcRoles,
      eventChoiceSet,
    });

    expect(result).toBe(event.choices);
  });

  it('filters family requirements including missing family and mismatches', () => {
    const event = makeEvent([
      makeChoice({
        text: 'family wealth mismatch',
        reqFamily: { wealth: ['RICH'] },
      }),
      makeChoice({
        text: 'family dynamic mismatch',
        reqFamily: { dynamic: ['STRICT'] },
      }),
      makeChoice({
        text: 'family match',
        reqFamily: { wealth: ['MIDDLE'], dynamic: ['SUPPORTIVE'] },
      }),
    ]);

    const withNoFamily = getChoicesToRender({
      currentEvent: event,
      resolveChoice,
      personality: basePersonality,
      stats: baseStats,
      family: null,
      skills: baseSkills,
      npcRoles,
      eventChoiceSet,
    });
    expect(withNoFamily).toBe(event.choices);

    const withFamily = getChoicesToRender({
      currentEvent: event,
      resolveChoice,
      personality: basePersonality,
      stats: baseStats,
      family: baseFamily,
      skills: baseSkills,
      npcRoles,
      eventChoiceSet,
    });
    expect(withFamily?.map((choice) => resolveChoice(choice).text)).toEqual(['family match']);
  });

  it('filters by skills, npc role and event history rules', () => {
    const event = makeEvent([
      makeChoice({
        text: 'fails skills',
        reqSkills: { coding: 90 },
      }),
      makeChoice({
        text: 'passes skills with ignored invalid value',
        reqSkills: { coding: 50, reading: 'skip' } as unknown as Partial<Skills>,
      }),
      makeChoice({
        text: 'fails npc role',
        reqNPCRole: 'ENEMY',
      }),
      makeChoice({
        text: 'passes npc role',
        reqNPCRole: 'FRIEND',
      }),
      makeChoice({
        text: 'fails required event history',
        reqEventIds: ['missing_id'],
      }),
      makeChoice({
        text: 'fails blocked event history',
        blockEventIds: ['arc_started'],
      }),
      makeChoice({
        text: 'passes event history',
        reqEventIds: ['arc_started'],
        blockEventIds: ['another_block'],
      }),
    ]);

    const result = getChoicesToRender({
      currentEvent: event,
      resolveChoice,
      personality: basePersonality,
      stats: baseStats,
      family: baseFamily,
      skills: baseSkills,
      npcRoles,
      eventChoiceSet,
    });

    expect(result?.map((choice) => resolveChoice(choice).text)).toEqual([
      'passes skills with ignored invalid value',
      'passes npc role',
      'passes event history',
    ]);
  });

  describe('getLockedChoices', () => {
    const args = (currentEvent: GameEvent | null) => ({
      currentEvent,
      resolveChoice,
      personality: basePersonality,
      stats: baseStats,
      family: baseFamily,
      skills: baseSkills,
      npcRoles,
      eventChoiceSet,
    });

    it('lists personality/stat/skill/family locks with reasons but hides history and NPC locks', () => {
      const event = makeEvent([
        makeChoice({ text: 'open' }),
        makeChoice({ text: 'too kind', reqPersonality: [{ axis: 'empathy', max: 30 }] }),
        makeChoice({ text: 'not brave', reqPersonality: [{ axis: 'courage', min: 70 }] }),
        makeChoice({ text: 'not smart', reqStats: { intelligence: 90 } }),
        makeChoice({ text: 'no skill', reqSkills: { music: 80 } }),
        makeChoice({ text: 'not rich', reqFamily: { wealth: ['RICH'] } }),
        makeChoice({ text: 'secret history', reqEventIds: ['never_happened'] }),
        makeChoice({ text: 'secret npc', reqNPCRole: 'RIVAL' as NPCRole }),
      ]);

      const locked = getLockedChoices(args(event));

      expect(locked.map(item => [item.choice.text, item.reason])).toEqual([
        ['too kind', { kind: 'personality', axis: 'empathy', bound: 'max' }],
        ['not brave', { kind: 'personality', axis: 'courage', bound: 'min' }],
        ['not smart', { kind: 'stats', stat: 'intelligence', min: 90 }],
        ['no skill', { kind: 'skills', skill: 'music', min: 80 }],
        ['not rich', { kind: 'family' }],
      ]);
      expect(locked.every(item => describeLockReason(item.reason).length > 0)).toBe(true);
    });

    it('returns nothing when every choice is locked (all are shown instead)', () => {
      const event = makeEvent([
        makeChoice({ text: 'a', reqStats: { intelligence: 99 } }),
        makeChoice({ text: 'b', reqStats: { charisma: 99 } }),
      ]);

      expect(getLockedChoices(args(event))).toEqual([]);
      expect(getLockedChoices(args(null))).toEqual([]);
    });
  });
});
