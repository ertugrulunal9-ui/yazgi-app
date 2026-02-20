import {
  applyPersonalityEffects,
  calculateBreakdownRisk,
  calculateChoiceStressCost,
  checkPersonalityRequirements,
  checkStressRequirement,
  clampPersonality,
  enrichChoicesWithPersonality,
  filterEventsByPersonality,
  generateInitialPersonality,
  generateInnerThought,
  getArchetypeDescription,
  getPersonalityArchetype,
  getPersonalityAxisName,
  getPersonalityLevelDescription,
  naturalStressRecovery,
  updateStress,
} from '../../src/utils/personalitySystem';
import { Choice, GameEvent, Personality, StressState } from '../../src/types';

const basePersonality: Personality = {
  openness: 50,
  courage: 50,
  empathy: 50,
  patience: 50,
  conformity: 50,
};

const baseStress: StressState = {
  current: 20,
  threshold: 70,
  turnsSinceBreakdown: 10,
  sources: [],
};

const makeEvent = (overrides?: Partial<GameEvent>): GameEvent => ({
  id: 'evt',
  text: 'event',
  minAge: 0,
  maxAge: 99,
  difficulty: 1,
  rarity: 'COMMON',
  choices: [],
  ...overrides,
});

describe('personalitySystem', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('builds initial personality from family dynamic, wealth and traits', () => {
    const strictPoor = generateInitialPersonality(
      { dynamic: 'STRICT', wealth: 'POOR', allowance: 10 },
      ['CHARISMATIC', 'SICKLY', 'ATHLETIC', 'GENIUS']
    );

    expect(strictPoor).toEqual({
      openness: 60,
      courage: 35,
      empathy: 55,
      patience: 80,
      conformity: 65,
    });

    const supportiveRich = generateInitialPersonality(
      { dynamic: 'SUPPORTIVE', wealth: 'RICH', allowance: 100 },
      []
    );
    expect(supportiveRich.openness).toBe(65);
    expect(supportiveRich.courage).toBe(60);
    expect(supportiveRich.empathy).toBe(60);
    expect(supportiveRich.patience).toBe(40);

    const chaotic = generateInitialPersonality(
      { dynamic: 'CHAOTIC', wealth: 'MIDDLE', allowance: 30 },
      []
    );
    expect(chaotic.conformity).toBe(35);
    expect(chaotic.patience).toBe(40);
    expect(chaotic.courage).toBe(55);

    expect(generateInitialPersonality(null, [])).toEqual(basePersonality);
  });

  it('clamps personality values to 0-100', () => {
    const clamped = clampPersonality({
      openness: -5,
      courage: 500,
      empathy: 101,
      patience: -100,
      conformity: 25,
    });
    expect(clamped).toEqual({
      openness: 0,
      courage: 100,
      empathy: 100,
      patience: 0,
      conformity: 25,
    });
  });

  it('applies personality effects with age multipliers and tracks non-zero shifts', () => {
    const early = applyPersonalityEffects(
      basePersonality,
      [
        { axis: 'openness', change: 2 },
        { axis: 'courage', change: 0 },
      ],
      9,
      1,
      'test'
    );
    expect(early.newPersonality.openness).toBe(53);
    expect(early.shifts).toHaveLength(1);

    const teen = applyPersonalityEffects(
      basePersonality,
      [{ axis: 'empathy', change: -3 }],
      14,
      2,
      'test'
    );
    expect(teen.newPersonality.empathy).toBe(46);

    const adult = applyPersonalityEffects(
      basePersonality,
      [{ axis: 'patience', change: 4 }],
      20,
      3,
      'test'
    );
    expect(adult.newPersonality.patience).toBe(54);
  });

  it('updates stress with source tracking and turn increment', () => {
    const changed = updateStress(baseStress, 12, 'evt', 7);
    expect(changed.current).toBe(32);
    expect(changed.sources).toHaveLength(1);
    expect(changed.turnsSinceBreakdown).toBe(11);

    const unchanged = updateStress(baseStress, 0, 'evt', 8);
    expect(unchanged.sources).toHaveLength(0);
    expect(unchanged.turnsSinceBreakdown).toBe(11);
  });

  it('applies natural stress recovery by patience tiers', () => {
    expect(naturalStressRecovery({ ...baseStress, current: 20 }, { ...basePersonality, patience: 80 }).current).toBe(15);
    expect(naturalStressRecovery({ ...baseStress, current: 20 }, { ...basePersonality, patience: 50 }).current).toBe(17);
    expect(naturalStressRecovery({ ...baseStress, current: 20 }, { ...basePersonality, patience: 20 }).current).toBe(18);
  });

  it('computes breakdown risk with threshold, patience and time multipliers', () => {
    expect(calculateBreakdownRisk({ ...baseStress, current: 40 }, basePersonality)).toBe(0);

    const lowPatience = calculateBreakdownRisk(
      { ...baseStress, current: 90, turnsSinceBreakdown: 5 },
      { ...basePersonality, patience: 20 }
    );
    expect(lowPatience).toBe(15);

    const midPatience = calculateBreakdownRisk(
      { ...baseStress, current: 90, turnsSinceBreakdown: 12 },
      { ...basePersonality, patience: 40 }
    );
    expect(midPatience).toBe(24);

    const highPatience = calculateBreakdownRisk(
      { ...baseStress, current: 90, turnsSinceBreakdown: 12 },
      { ...basePersonality, patience: 70 }
    );
    expect(highPatience).toBe(20);
  });

  it('checks personality and stress requirements for pass/fail cases', () => {
    expect(checkPersonalityRequirements(basePersonality, undefined)).toBe(true);
    expect(checkPersonalityRequirements(basePersonality, [{ axis: 'courage', min: 70 }])).toBe(false);
    expect(checkPersonalityRequirements(basePersonality, [{ axis: 'courage', max: 40 }])).toBe(false);
    expect(checkPersonalityRequirements(basePersonality, [{ axis: 'courage', min: 40, max: 60 }])).toBe(true);

    expect(checkStressRequirement(baseStress, undefined)).toBe(true);
    expect(checkStressRequirement(baseStress, { min: 30 })).toBe(false);
    expect(checkStressRequirement(baseStress, { max: 10 })).toBe(false);
    expect(checkStressRequirement(baseStress, { min: 10, max: 30 })).toBe(true);
  });

  it('calculates choice stress cost with challenge mismatches and stressEffect', () => {
    const challengeChoice: Choice = {
      text: 'challenge',
      effect: {},
      feedback: 'fb',
      choiceType: 'CHALLENGE',
      reqPersonality: [
        { axis: 'courage', min: 80 },
        { axis: 'patience', max: 20 },
      ],
      stressEffect: 2,
    };

    const stressCost = calculateChoiceStressCost(
      challengeChoice,
      { ...basePersonality, courage: 60, patience: 40 },
      1
    );
    expect(stressCost).toBe(11);

    const nonChallenge: Choice = {
      text: 'normal',
      effect: {},
      feedback: 'fb',
      choiceType: 'PASSIVE',
      stressEffect: -2,
    };
    expect(calculateChoiceStressCost(nonChallenge, basePersonality, 3)).toBe(1);
  });

  it('resolves all archetype branches and description mapping', () => {
    const cases: Array<{ personality: Personality; archetype: ReturnType<typeof getPersonalityArchetype> }> = [
      { personality: { ...basePersonality, openness: 20, courage: 20 }, archetype: 'INTROVERT_CAUTIOUS' },
      { personality: { ...basePersonality, openness: 20, courage: 80 }, archetype: 'INTROVERT_BRAVE' },
      { personality: { ...basePersonality, openness: 80, courage: 20 }, archetype: 'EXTROVERT_CAUTIOUS' },
      { personality: { ...basePersonality, openness: 80, courage: 80 }, archetype: 'EXTROVERT_BRAVE' },
      { personality: { ...basePersonality, empathy: 80 }, archetype: 'EMPATH' },
      { personality: { ...basePersonality, empathy: 20, patience: 70 }, archetype: 'PRAGMATIST' },
      { personality: { ...basePersonality, conformity: 20 }, archetype: 'REBEL' },
      { personality: { ...basePersonality, conformity: 80 }, archetype: 'CONFORMIST' },
      { personality: basePersonality, archetype: 'BALANCED' },
    ];

    cases.forEach(({ personality, archetype }) => {
      expect(getPersonalityArchetype(personality)).toBe(archetype);
      expect(getArchetypeDescription(archetype).length).toBeGreaterThan(5);
    });
  });

  it('generates inner thoughts for stress and each context branch', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0);
    const highStressThought = generateInnerThought(basePersonality, { ...baseStress, current: 95 }, 'DAILY');
    expect(highStressThought).toContain('Kafam');

    expect(generateInnerThought({ ...basePersonality, openness: 20, courage: 20 }, baseStress, 'SOCIAL')).toContain('evde');
    expect(generateInnerThought({ ...basePersonality, openness: 20, courage: 80 }, baseStress, 'SOCIAL')).toContain('gereken');
    expect(generateInnerThought({ ...basePersonality, openness: 80, courage: 20 }, baseStress, 'SOCIAL')).toContain('dikkatli');
    expect(generateInnerThought({ ...basePersonality, openness: 80, courage: 80 }, baseStress, 'SOCIAL')).toContain('Hadi');
    expect(generateInnerThought({ ...basePersonality, empathy: 90 }, baseStress, 'SOCIAL')).toContain('anlay');
    expect(generateInnerThought(basePersonality, baseStress, 'SOCIAL')).toContain('neler');

    expect(generateInnerThought({ ...basePersonality, courage: 80 }, baseStress, 'RISK')).toContain('Risk');
    expect(generateInnerThought({ ...basePersonality, courage: 20 }, baseStress, 'RISK')).toContain('tehlikeli');
    expect(generateInnerThought(basePersonality, baseStress, 'RISK')).toContain('laz');

    expect(generateInnerThought({ ...basePersonality, empathy: 80 }, baseStress, 'MORAL')).toContain('olursa');
    expect(generateInnerThought({ ...basePersonality, empathy: 20 }, baseStress, 'MORAL')).toContain('kendimi');
    expect(generateInnerThought(basePersonality, baseStress, 'MORAL')).toContain('zor');

    expect(generateInnerThought(basePersonality, baseStress, 'DAILY')).toContain('Hayat');
  });

  it('filters events by personality and stress requirements', () => {
    const events = [
      makeEvent({ id: 'ok', reqPersonality: [{ axis: 'courage', min: 40 }], reqStress: { max: 30 } }),
      makeEvent({ id: 'bad_personality', reqPersonality: [{ axis: 'courage', min: 90 }] }),
      makeEvent({ id: 'bad_stress', reqStress: { min: 30 } }),
    ];

    const filtered = filterEventsByPersonality(events, {
      age: 12,
      traits: [],
      stats: {
        health: 50,
        intelligence: 50,
        charisma: 50,
        discipline: 50,
        money: 0,
        energy: 50,
        familyRelation: 50,
      },
      family: null,
      memories: [],
      personality: basePersonality,
      stress: baseStress,
    });

    expect(filtered.map(item => item.id)).toEqual(['ok']);
  });

  it('enriches choices with dynamic feedback and stress fallback behavior', () => {
    const dynamicChoice: Choice = {
      text: 'dyn',
      effect: {},
      feedback: 'base',
      dynamicFeedback: {
        introvert: 'fb_introvert',
        extrovert: 'fb_extrovert',
        brave: 'fb_brave',
        cautious: 'fb_cautious',
        empathetic: 'fb_empathetic',
        selfish: 'fb_selfish',
      },
    };
    const choiceWithStress: Choice = {
      text: 'fixed',
      effect: {},
      feedback: 'fixed',
      stressEffect: 99,
    };

    const byIntrovert = enrichChoicesWithPersonality([dynamicChoice], { ...basePersonality, openness: 20 }, makeEvent())[0];
    const byExtrovert = enrichChoicesWithPersonality([dynamicChoice], { ...basePersonality, openness: 80 }, makeEvent())[0];
    const byBrave = enrichChoicesWithPersonality([dynamicChoice], { ...basePersonality, courage: 80 }, makeEvent())[0];
    const byCautious = enrichChoicesWithPersonality([dynamicChoice], { ...basePersonality, courage: 20 }, makeEvent())[0];
    const byEmpathetic = enrichChoicesWithPersonality([dynamicChoice], { ...basePersonality, empathy: 80 }, makeEvent())[0];
    const bySelfish = enrichChoicesWithPersonality([dynamicChoice], { ...basePersonality, empathy: 20 }, makeEvent())[0];
    const fixedStress = enrichChoicesWithPersonality([choiceWithStress], basePersonality, makeEvent())[0];

    expect(byIntrovert.feedback).toBe('fb_introvert');
    expect(byExtrovert.feedback).toBe('fb_extrovert');
    expect(byBrave.feedback).toBe('fb_brave');
    expect(byCautious.feedback).toBe('fb_cautious');
    expect(byEmpathetic.feedback).toBe('fb_empathetic');
    expect(bySelfish.feedback).toBe('fb_selfish');
    expect(typeof byIntrovert.stressEffect).toBe('number');
    expect(fixedStress.stressEffect).toBe(99);
  });

  it('returns axis names and level descriptions', () => {
    expect(getPersonalityAxisName('openness')).toContain('A');
    expect(getPersonalityAxisName('courage')).toContain('C');
    expect(getPersonalityAxisName('empathy')).toContain('E');
    expect(getPersonalityAxisName('patience')).toContain('S');
    expect(getPersonalityAxisName('conformity')).toContain('U');

    const low = getPersonalityLevelDescription('openness', 20);
    const mid = getPersonalityLevelDescription('openness', 50);
    const high = getPersonalityLevelDescription('openness', 80);
    expect(low.length).toBeGreaterThan(2);
    expect(mid.length).toBeGreaterThan(2);
    expect(high.length).toBeGreaterThan(2);
    expect(low).not.toBe(mid);
    expect(high).not.toBe(mid);
  });
});
