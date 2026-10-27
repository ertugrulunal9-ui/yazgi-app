import { EVENTS } from '../../src/data/events';
import { t } from '../../src/i18n/strings';
import { enEventGapTranslations } from '../../src/i18n/events/en.gaps';
import { getEventContentStrings } from '../../src/i18n/events/loader';
import { sanitizeKeySegment } from '../../src/i18n/events/keyUtils';
import type { NestedRecord } from '../../src/i18n/domains/types';
import type { Choice, EventContext, GameEvent } from '../../src/types';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

/**
 * English mode shows Turkish for any event string that has no English.
 * This walks every event the game can draw and checks the exact keys the
 * runtime translator reads (useEvents.tsx: event text, choice text, choice
 * feedback, chance-outcome feedback) against the real EN content tree.
 *
 * Not covered on purpose, because the runtime never translates them:
 * `dynamicFeedback` (only read by the unused enrichChoicesWithPersonality)
 * and `tradeoffHint` (no event sets it).
 */

const enContent = getEventContentStrings('en');

const getByPath = (root: NestedRecord, key: string): unknown => {
  let current: unknown = root;
  for (const part of key.split('.')) {
    if (!current || typeof current !== 'object' || !(part in (current as NestedRecord))) return undefined;
    current = (current as NestedRecord)[part];
  }
  return current;
};

const hasEnglish = (key: string | undefined): boolean => {
  if (!key) return false;
  const value = getByPath({ events: { content: enContent } }, key);
  return typeof value === 'string' && value.trim().length > 0;
};

const buildContext = (): EventContext => {
  const state = getInitialGameState();
  return {
    age: 10,
    traits: state.traits,
    stats: state.stats ?? getInitialStats(),
    family: state.family,
    memories: state.memories,
    npcs: state.npcs,
    inventory: state.inventory,
    gameState: state,
    personality: state.personality,
    stress: state.stress,
    grades: state.schoolGrades,
    skills: state.skills,
  };
};

interface Walk {
  checked: number;
  missing: string[];
  unresolvable: string[];
}

const walkEvents = (events: GameEvent[]): Walk => {
  const context = buildContext();
  const walk: Walk = { checked: 0, missing: [], unresolvable: [] };

  const check = (label: string, key: string | undefined): void => {
    walk.checked += 1;
    if (!hasEnglish(key)) walk.missing.push(`${label} [${key ?? 'no key'}]`);
  };

  events.forEach(event => {
    check(`${event.id}.text`, event.textKey);

    event.choices.forEach((entry, index) => {
      let choice: Choice;
      if (typeof entry === 'function') {
        try {
          choice = entry(context);
        } catch {
          walk.unresolvable.push(`${event.id}#${index}`);
          return;
        }
      } else {
        choice = entry;
      }

      const token = sanitizeKeySegment(choice.id || `choice_${index}`);
      check(`${event.id}.${token}.text`, choice.textKey);
      check(`${event.id}.${token}.feedback`, choice.feedbackKey);

      (choice.conditionalOutcomes ?? []).forEach((outcome, outcomeIndex) => {
        const outcomeToken = sanitizeKeySegment(outcome.id || `outcome_${outcomeIndex}`);
        check(`${event.id}.${token}.${outcomeToken}.outcome`, outcome.feedbackKey);
      });
    });
  });

  return walk;
};

describe('English event coverage', () => {
  const walk = walkEvents(EVENTS);

  it('walks the whole event pool (the check cannot pass by checking nothing)', () => {
    expect(EVENTS.length).toBeGreaterThan(400);
    expect(walk.checked).toBeGreaterThanOrEqual(EVENTS.length * 3);
  });

  it('can resolve every dynamic choice to read its translation keys', () => {
    expect(walk.unresolvable).toEqual([]);
  });

  it('has English for every event text, choice text, choice feedback and outcome feedback', () => {
    expect(walk.missing).toEqual([]);
  });

  describe('hand-written gap fills (en.gaps.ts)', () => {
    const eventsById = new Map(EVENTS.map(event => [event.id, event]));
    const staticChoiceTokens = (event: GameEvent): Set<string> => new Set(
      event.choices.flatMap((entry, index) => (
        typeof entry === 'function' ? [] : [sanitizeKeySegment(entry.id || `choice_${index}`)]
      )),
    );

    it('only describes events and choices that exist (no typo\'d ids)', () => {
      const orphans: string[] = [];
      Object.entries(enEventGapTranslations).forEach(([eventId, gap]) => {
        const event = eventsById.get(eventId);
        if (!event) {
          orphans.push(eventId);
          return;
        }
        const tokens = staticChoiceTokens(event);
        Object.keys(gap.choices).forEach(choiceId => {
          if (!tokens.has(sanitizeKeySegment(choiceId))) orphans.push(`${eventId}.${choiceId}`);
        });
      });

      expect(orphans).toEqual([]);
    });

    it('reaches the player through the runtime translator instead of the Turkish fallback', () => {
      const wrong: string[] = [];
      Object.entries(enEventGapTranslations).forEach(([eventId, gap]) => {
        const base = `events.content.${sanitizeKeySegment(eventId)}`;
        if (t('en', `${base}.text`) !== gap.text) wrong.push(`${eventId}.text`);
        Object.entries(gap.choices).forEach(([choiceId, choice]) => {
          const choiceBase = `${base}.choices.${sanitizeKeySegment(choiceId)}`;
          if (t('en', `${choiceBase}.text`) !== choice.text) wrong.push(`${eventId}.${choiceId}.text`);
          if (t('en', `${choiceBase}.feedback`) !== choice.feedback) wrong.push(`${eventId}.${choiceId}.feedback`);
        });
      });

      expect(wrong).toEqual([]);
    });

    it('is plain English: no empty strings, no Turkish letters left behind', () => {
      const strings = Object.values(enEventGapTranslations).flatMap(gap => [
        gap.text,
        ...Object.values(gap.choices).flatMap(choice => [choice.text, choice.feedback]),
      ]);

      expect(strings.length).toBeGreaterThan(0);
      expect(strings.filter(value => value.trim().length === 0)).toEqual([]);
      expect(strings.filter(value => /[çğıöşüÇĞİÖŞÜ]/.test(value))).toEqual([]);
    });
  });
});
