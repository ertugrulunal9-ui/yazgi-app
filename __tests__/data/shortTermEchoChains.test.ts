import { TURKISH_EVENTS } from '../../src/data/turkishEvents';
import { AGE_SPECIFIC_EVENTS } from '../../src/data/ageSpecificEvents';
import { SHORT_TERM_ECHO_EVENTS } from '../../src/data/shortTermEchoEvents';
import { EVENTS } from '../../src/data/events';
import type { Choice, GameEvent } from '../../src/types';
import { enEventTranslations } from '../../src/i18n/events/en';

const sourceById = new Map([...TURKISH_EVENTS, ...AGE_SPECIFIC_EVENTS].map(event => [event.id, event]));
const targetById = new Map(SHORT_TERM_ECHO_EVENTS.map(event => [event.id, event]));

const SHORT_ECHO_SOURCE_IDS = ['tr_ilk_kelime', 'tr_kres_ilk_gun', 'tr_kardes_gelmis', 'tr_ilk_yalan'] as const;

const staticChoices = (event: GameEvent): Choice[] => event.choices.flatMap(choice => (
  typeof choice === 'function' ? [] : [choice]
));

// Baskınlık: 6 stat (enerji hariç) + stres (yüksek stres kötü)
const vector = (choice: Choice): number[] => {
  const effect = choice.effect || {};
  return [
    effect.health ?? 0,
    effect.intelligence ?? 0,
    effect.charisma ?? 0,
    effect.discipline ?? 0,
    effect.money ?? 0,
    effect.familyRelation ?? 0,
    -(choice.stressEffect ?? 0),
  ];
};
const dominates = (a: Choice, b: Choice): boolean => {
  const va = vector(a);
  const vb = vector(b);
  return va.every((value, i) => value >= vb[i]) && va.some((value, i) => value > vb[i]);
};

describe('short-term echo chains (ilk oturum yankıları)', () => {
  it.each(SHORT_ECHO_SOURCE_IDS)('%s schedules one distinct short TURNS echo per branch', sourceId => {
    const source = sourceById.get(sourceId);
    expect(source).toBeDefined();
    expect(source?.isRepeatable).toBe(false);

    const choices = source ? staticChoices(source) : [];
    const targets = choices.map(choice => {
      expect(choice.id).toBeTruthy(); // yankı kartı kaynak seçimi id ile bulur
      const schedules = (choice.futureEvents ?? []).filter(fe => fe.trigger === 'TURNS');
      expect(schedules).toHaveLength(1);
      expect(schedules[0]).toMatchObject({ trigger: 'TURNS', priority: 'HIGH' });
      expect(schedules[0].turnsLater).toBeGreaterThanOrEqual(2);
      expect(schedules[0].turnsLater).toBeLessThanOrEqual(3);
      return schedules[0].eventId;
    });

    expect(new Set(targets).size).toBe(choices.length);
    targets.forEach(targetId => {
      const target = targetById.get(targetId);
      expect(target).toBeDefined();
      expect(target?.reqEventIds).toContain(sourceId);
      expect(target?.tags).toEqual(expect.arrayContaining(['followup', 'scheduled_only', 'short_echo']));
      expect(target && staticChoices(target).every(choice => Boolean(choice.id))).toBe(true);
      expect(target && staticChoices(target).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('every short echo is scheduled by exactly one source branch and is in the event pool', () => {
    const scheduledIds = SHORT_ECHO_SOURCE_IDS.flatMap(id => staticChoices(sourceById.get(id) as GameEvent))
      .flatMap(choice => (choice.futureEvents ?? []).map(fe => fe.eventId));
    const poolIds = new Set(EVENTS.map(event => event.id));

    SHORT_TERM_ECHO_EVENTS.forEach(target => {
      expect(scheduledIds.filter(id => id === target.id)).toHaveLength(1);
      expect(poolIds.has(target.id)).toBe(true);
    });
  });

  it('gives no echo a strictly dominant choice (each option has a real trade-off)', () => {
    const dominated = SHORT_TERM_ECHO_EVENTS.filter(event => {
      const choices = staticChoices(event);
      return choices.some((a, i) => choices.every((b, j) => i === j || dominates(a, b)));
    }).map(event => event.id);

    expect(dominated).toEqual([]);
  });

  it('reaches the first echo within the first minutes (a source at age <= 2, echo <= 3 turns later)', () => {
    const earliest = SHORT_ECHO_SOURCE_IDS
      .map(id => sourceById.get(id) as GameEvent)
      .filter(source => (source.minAge ?? 0) <= 2);

    expect(earliest.map(source => source.id)).toContain('tr_ilk_kelime');
  });

  it('has English text for every echo event, choice and feedback', () => {
    const missing = SHORT_TERM_ECHO_EVENTS.flatMap(event => {
      const en = enEventTranslations[event.id];
      const gaps = en?.text ? [] : [`${event.id}.text`];
      staticChoices(event).forEach(choice => {
        const c = en?.choices?.[choice.id ?? ''];
        if (!c?.text) gaps.push(`${event.id}.${choice.id}.text`);
        if (!c?.feedback) gaps.push(`${event.id}.${choice.id}.feedback`);
      });
      return gaps;
    });

    expect(missing).toEqual([]);
  });
});
