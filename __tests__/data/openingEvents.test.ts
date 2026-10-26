import { EVENTS } from '../../src/data/events';
import { enEventTranslations } from '../../src/i18n/events/en';
import type { Choice, GameEvent } from '../../src/types';

const OPENERS = ['tr_dis_bugdayi', 'tr_ninni', 'tr_bayram_misafir', 'tr_ilk_kasik', 'tr_cee_oyunu'] as const;
const TOOTH_WHEAT_ECHOES = ['echo_dis_bugdayi_kalem', 'echo_dis_bugdayi_stetoskop', 'echo_dis_bugdayi_para'] as const;

const byId = new Map(EVENTS.map(event => [event.id, event]));
const staticChoices = (event: GameEvent): Choice[] => event.choices.flatMap(choice => (
  typeof choice === 'function' ? [] : [choice]
));
const isRandomPool = (event: GameEvent): boolean => !(event.tags ?? []).includes('scheduled_only');

describe('opening events (ilk dakikalar)', () => {
  it('gives the first year enough openers that runs do not all start the same way', () => {
    const ageOnePool = EVENTS.filter(event => (
      isRandomPool(event) && (event.minAge ?? 0) <= 1 && (event.maxAge ?? 99) >= 1
    ));

    expect(ageOnePool.length).toBeGreaterThanOrEqual(6);
    OPENERS.forEach(id => expect(ageOnePool.map(event => event.id)).toContain(id));
  });

  it('offers a real choice in every age 1-2 event (no single-option "choices")', () => {
    const singleChoice = EVENTS
      .filter(event => isRandomPool(event) && (event.minAge ?? 0) <= 2 && (event.maxAge ?? 99) >= 1)
      .filter(event => staticChoices(event).length < 2)
      .map(event => event.id);

    expect(singleChoice).toEqual([]);
  });

  it('brings each tooth-wheat pick back years later as its own echo', () => {
    const source = byId.get('tr_dis_bugdayi') as GameEvent;
    const scheduled = staticChoices(source).map(choice => {
      const schedule = (choice.futureEvents ?? []).filter(fe => fe.trigger === 'AGE');
      expect(schedule).toHaveLength(1);
      return { age: schedule[0].age, eventId: schedule[0].eventId };
    });

    expect(scheduled.map(s => s.eventId).sort()).toEqual([...TOOTH_WHEAT_ECHOES].sort());
    scheduled.forEach(({ age, eventId }) => {
      const echo = byId.get(eventId) as GameEvent;
      expect(age).toBeGreaterThanOrEqual(10);
      expect(age).toBeLessThanOrEqual(12);
      expect(echo.minAge).toBe(age);
      expect(echo.reqEventIds).toContain('tr_dis_bugdayi');
      expect(echo.tags).toEqual(expect.arrayContaining(['followup', 'scheduled_only']));
      expect(staticChoices(echo).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('has English text for every opener, tooth-wheat echo and choice', () => {
    const ids = [...OPENERS, ...TOOTH_WHEAT_ECHOES, 'tr_ilk_adim'];
    const missing = ids.flatMap(id => {
      const event = byId.get(id) as GameEvent;
      const en = enEventTranslations[id];
      const gaps = en?.text ? [] : [`${id}.text`];
      staticChoices(event).forEach(choice => {
        const c = en?.choices?.[choice.id ?? ''];
        if (!c?.text) gaps.push(`${id}.${choice.id}.text`);
        if (!c?.feedback) gaps.push(`${id}.${choice.id}.feedback`);
      });
      return gaps;
    });

    expect(missing).toEqual([]);
  });
});
