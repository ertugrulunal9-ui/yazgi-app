import { resolveOutcome } from '../../src/systems/ConditionalOutcomeResolver';

const createEventContext = () => {
  return {
    age: 12,
    traits: ['GENIUS'],
    stats: {
      health: 50,
      intelligence: 60,
      charisma: 40,
      discipline: 45,
      money: 100,
      energy: 80,
      familyRelation: 55,
    },
    family: {
      wealth: 'MIDDLE',
      dynamic: 'SUPPORTIVE',
      allowance: 20,
    },
    memories: [],
    personality: {
      openness: 50,
      courage: 50,
      empathy: 50,
      patience: 50,
      conformity: 50,
    },
    stress: {
      current: 10,
      threshold: 70,
      turnsSinceBreakdown: 5,
      sources: [],
    },
    grades: {
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

describe('ConditionalOutcomeResolver', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns default outcome when conditional outcomes are missing', () => {
    const choice = {
      id: 'default_choice',
      text: 'Varsayilan secim',
      effect: { intelligence: 2, energy: -1 },
      feedback: 'Varsayilan sonuc',
      personalityEffects: [{ axis: 'patience', change: 1 }],
      momentumTag: 'HELPFUL',
      stressEffect: -2,
      skillUpdates: { logic: 3 },
      gradeUpdates: { math: 2 },
    };

    const resolved = resolveOutcome(choice, createEventContext());

    expect(resolved.source).toBe('default');
    expect(resolved.statChanges).toEqual(choice.effect);
    expect(resolved.feedback).toBe(choice.feedback);
    expect(resolved.personalityEffects).toEqual(choice.personalityEffects);
    expect(resolved.momentumTag).toBe('HELPFUL');
    expect(resolved.stressEffect).toBe(-2);
    expect(resolved.skillUpdates).toEqual({ logic: 3 });
    expect(resolved.gradeUpdates).toEqual({ math: 2 });
  });

  it('falls back to default when no conditional outcome is eligible', () => {
    const choice = {
      id: 'ineligible_choice',
      text: 'Kosullu secim',
      effect: { charisma: 1 },
      feedback: 'Varsayilana don',
      conditionalOutcomes: [
        {
          condition: () => false,
          weight: 1,
          statChanges: { charisma: 10 },
          feedback: 'Bu secilmemeli',
        },
        {
          condition: () => {
            throw new Error('Condition error');
          },
          weight: 1,
          statChanges: { charisma: -10 },
          feedback: 'Bu da secilmemeli',
        },
      ],
    };

    const resolved = resolveOutcome(choice, createEventContext());

    expect(resolved.source).toBe('default');
    expect(resolved.statChanges).toEqual({ charisma: 1 });
    expect(resolved.feedback).toBe('Varsayilana don');
  });

  it('returns conditional outcome and maps optional fields', () => {
    const choice = {
      id: 'conditional_single',
      text: 'Tek kosullu sonuc',
      effect: { health: 1 },
      feedback: 'Default',
      conditionalOutcomes: [
        {
          id: 'cond_1',
          condition: () => true,
          weight: 1,
          statChanges: { health: 5, discipline: -1 },
          feedback: 'Kosullu sonuc',
          personalityEffects: [{ axis: 'courage', change: 2 }],
          momentumTag: 'PRAGMATIC',
          memoryEmotion: 'PRIDE',
          memoryWeight: 'HIGH',
          scheduleEvent: {
            trigger: 'TURNS',
            turnsLater: 2,
            eventId: 'evt_followup',
          },
          skillUpdates: { coding: 2 },
          gradeUpdates: { science: 3 },
          stressEffect: -3,
        },
      ],
    };

    const resolved = resolveOutcome(choice, createEventContext());

    expect(resolved.source).toBe('conditional');
    expect(resolved.statChanges).toEqual({ health: 5, discipline: -1 });
    expect(resolved.feedback).toBe('Kosullu sonuc');
    expect(resolved.personalityEffects).toEqual([{ axis: 'courage', change: 2 }]);
    expect(resolved.momentumTag).toBe('PRAGMATIC');
    expect(resolved.memoryEmotion).toBe('PRIDE');
    expect(resolved.memoryWeight).toBe('HIGH');
    expect(resolved.scheduleEvent).toEqual({
      trigger: 'TURNS',
      turnsLater: 2,
      eventId: 'evt_followup',
    });
    expect(resolved.skillUpdates).toEqual({ coding: 2 });
    expect(resolved.gradeUpdates).toEqual({ science: 3 });
    expect(resolved.stressEffect).toBe(-3);
  });

  it('applies fate bias in weighted selection for positive vs negative outcomes', () => {
    const choice: Choice = {
      id: 'weighted_choice',
      text: 'Agirlikli secim',
      effect: {},
      feedback: 'Default',
      conditionalOutcomes: [
        {
          id: 'positive',
          condition: () => true,
          weight: 1,
          statChanges: { health: 3 },
          feedback: 'Pozitif sonuc',
        },
        {
          id: 'negative',
          condition: () => true,
          weight: 1,
          statChanges: { health: -3 },
          feedback: 'Negatif sonuc',
        },
      ],
    };

    const fateBlessed = {
      outcome: 'BLESSED',
      rawRoll: 95,
      modifiedRoll: 95,
      zodiacModifier: 0,
      pityModifier: 0,
    };
    const fateCursed = {
      outcome: 'CURSED',
      rawRoll: 5,
      modifiedRoll: 5,
      zodiacModifier: 0,
      pityModifier: 0,
    };

    jest.spyOn(Math, 'random').mockReturnValue(0.7);
    const blessedResult = resolveOutcome(choice, createEventContext(), fateBlessed);
    const cursedResult = resolveOutcome(choice, createEventContext(), fateCursed);

    expect(blessedResult.feedback).toBe('Pozitif sonuc');
    expect(cursedResult.feedback).toBe('Negatif sonuc');
  });

  it('falls back to last outcome when weights produce an invalid roll', () => {
    const choice = {
      id: 'nan_weight_choice',
      text: 'NaN agirlik testi',
      effect: {},
      feedback: 'Default',
      conditionalOutcomes: [
        {
          id: 'first',
          condition: () => true,
          weight: 1,
          statChanges: { discipline: 1 },
          feedback: 'Ilk sonuc',
        },
        {
          id: 'last',
          condition: () => true,
          weight: Number.NaN,
          statChanges: { discipline: -1 },
          feedback: 'Son sonuc',
        },
      ],
    };

    jest.spyOn(Math, 'random').mockReturnValue(0.3);
    const resolved = resolveOutcome(choice, createEventContext());

    expect(resolved.source).toBe('conditional');
    expect(resolved.feedback).toBe('Son sonuc');
  });
});
