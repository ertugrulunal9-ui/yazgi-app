import { GameEvent } from '../../src/types';
import { validateEventGraph, validateEventTagStandard } from '../../src/utils/eventValidation';

describe('validateEventGraph', () => {
  it('reports duplicate ids and orphan reqEventIds', () => {
    const events: GameEvent[] = [
      {
        id: 'evt_a',
        text: 'A',
        minAge: 0,
        maxAge: 18,
        choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      },
      {
        id: 'evt_a',
        text: 'A2',
        minAge: 0,
        maxAge: 18,
        reqEventIds: ['evt_missing'],
        choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      },
    ];

    const errors = validateEventGraph(events);
    expect(errors.some(error => error.includes('Duplicate event ID: evt_a'))).toBe(true);
    expect(errors.some(error => error.includes('evt_missing'))).toBe(true);
  });

  it('reports tag warnings for missing/duplicate/excess tags', () => {
    const events: GameEvent[] = [
      {
        id: 'evt_missing_tags',
        text: 'A',
        minAge: 0,
        maxAge: 18,
        choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      },
      {
        id: 'evt_duplicate_tags',
        text: 'B',
        minAge: 0,
        maxAge: 18,
        tags: ['social', 'social'],
        choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      },
      {
        id: 'evt_too_many_tags',
        text: 'C',
        minAge: 0,
        maxAge: 18,
        tags: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'],
        choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      },
      {
        id: 'evt_valid_tags',
        text: 'D',
        minAge: 0,
        maxAge: 18,
        tags: ['social', 'growth'],
        choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
      },
    ];

    const warnings = validateEventTagStandard(events);
    expect(warnings.some(w => w.includes('evt_missing_tags'))).toBe(true);
    expect(warnings.some(w => w.includes('evt_duplicate_tags'))).toBe(true);
    expect(warnings.some(w => w.includes('evt_too_many_tags'))).toBe(true);
    expect(warnings.some(w => w.includes('evt_valid_tags'))).toBe(false);
  });
});
