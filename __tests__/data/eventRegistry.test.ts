import {
  auditEventPool,
  validateEventPool,
  validateSingleEvent,
} from '../../src/data/eventRegistry';

const makeValidEvent = (overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  id: 'school_exam_day',
  text: 'Exam day',
  minAge: 10,
  maxAge: 10,
  rarity: 'COMMON',
  choices: [
    {
      id: 'study_hard',
      text: 'Study hard',
      effect: { intelligence: 2 },
      feedback: 'Great focus.',
    },
  ],
  ...overrides,
});

describe('eventRegistry', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
    jest.restoreAllMocks();
  });

  it('validateEventPool returns parsed events for valid entries', () => {
    const events = [
      makeValidEvent(),
      makeValidEvent({
        id: 'dynamic_text_event',
        text: () => 'Dynamic text',
        choices: [
          () => ({
            text: 'Dynamic choice',
            effect: { discipline: 1 },
            feedback: 'Dynamic feedback',
          }),
        ],
      }),
    ];

    const result = validateEventPool(events);

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('school_exam_day');
    expect(result[1].id).toBe('dynamic_text_event');
  });

  it('validateEventPool logs and throws when invalid events exist', () => {
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined);
    const invalid = makeValidEvent({
      id: 'Bad-Id',
      minAge: 12,
      maxAge: 10,
      choices: [],
    });

    expect(() => validateEventPool([invalid])).toThrow(/EventRegistry:/);
    expect(errorSpy).toHaveBeenCalledTimes(1);
  });

  it('validateSingleEvent returns null for valid and message for invalid event', () => {
    expect(validateSingleEvent(makeValidEvent())).toBeNull();

    const message = validateSingleEvent(makeValidEvent({ id: 'invalid id format' }));

    expect(message).not.toBeNull();
    expect(message).toContain('[id]');
  });

  it('auditEventPool is no-op in production', () => {
    process.env.NODE_ENV = 'production';

    const failures = auditEventPool([
      makeValidEvent({ id: 'invalid id format' }),
      makeValidEvent({ minAge: 17, maxAge: 10 }),
    ]);

    expect(failures).toEqual([]);
  });

  it('auditEventPool returns indexed failures in non-production', () => {
    process.env.NODE_ENV = 'test';

    const failures = auditEventPool([
      makeValidEvent(),
      makeValidEvent({ id: 'invalid id format' }),
    ]);

    expect(failures).toHaveLength(1);
    expect(failures[0].index).toBe(1);
    expect(failures[0].id).toBe('invalid id format');
    expect(failures[0].errors.length).toBeGreaterThan(0);
  });
});
