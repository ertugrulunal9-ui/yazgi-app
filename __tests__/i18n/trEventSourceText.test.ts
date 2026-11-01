import { EVENTS, FALLBACK_EVENT, HOSPITAL_EVENT } from '../../src/data/events';
import { ALL_CRISIS_EVENTS, BURDEN_BREAKDOWN_EVENT } from '../../src/data/crisisEvents';
import { MOMENTUM_EVENT_POOL } from '../../src/data/momentumEvents';
import { t } from '../../src/i18n/strings';
import { getEventContentStrings } from '../../src/i18n/events/loader';
import type { Choice, EventContext, GameEvent } from '../../src/types';
import { getInitialGameState, getInitialStats } from '../../src/utils/gameUtils';

/**
 * In Turkish the event data itself (src/data) is what the player reads. A Turkish
 * event catalog shadows it: the old tr.generated.ts copy showed letter-less text
 * ("Arkadasin ... Yarin sinav var"), "Arkadasin" instead of the NPC's name and the
 * academic goal text for every goal. These checks keep that from coming back and
 * keep the event data itself written with Turkish letters.
 */

const ALL_EVENTS: GameEvent[] = [
  ...EVENTS,
  FALLBACK_EVENT,
  HOSPITAL_EVENT,
  ...ALL_CRISIS_EVENTS,
  BURDEN_BREAKDOWN_EVENT,
  ...Object.values(MOMENTUM_EVENT_POOL).flat(),
];

const buildContext = (): EventContext => {
  const state = getInitialGameState();
  return {
    age: 14,
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

interface ShownString {
  label: string;
  key: string | undefined;
  value: string;
}

/** Every event string the runtime translator reads (useEvents.tsx), resolved with one context. */
const collectStrings = (events: GameEvent[]): ShownString[] => {
  const context = buildContext();
  const shown: ShownString[] = [];
  const add = (label: string, key: string | undefined, value: string | undefined): void => {
    if (typeof value === 'string') shown.push({ label, key, value });
  };

  events.forEach(event => {
    add(`${event.id}.text`, event.textKey, typeof event.text === 'function' ? event.text(context) : event.text);
    event.choices.forEach((entry, index) => {
      const choice: Choice = typeof entry === 'function' ? entry(context) : entry;
      const label = `${event.id}.${choice.id || `choice_${index}`}`;
      add(`${label}.text`, choice.textKey, choice.text);
      add(`${label}.feedback`, choice.feedbackKey, choice.feedback);
      (choice.conditionalOutcomes ?? []).forEach((outcome, outcomeIndex) => {
        add(`${label}.${outcome.id || `outcome_${outcomeIndex}`}`, outcome.feedbackKey, outcome.feedback);
      });
    });
  });

  return shown;
};

const TURKISH_LETTERS = /[çğıöşüÇĞİÖŞÜ]/;
const WORD = /[A-Za-zÇĞİÖŞÜçğıöşü]+/g;
const toAscii = (word: string): string => word
  .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i')
  .replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u');

/**
 * Words written without Turkish letters although the event data spells them with
 * Turkish letters elsewhere ("kotu" next to "kötü"). An ASCII word that also appears
 * in correctly lettered text is a real word ("kal", "sor") and is not reported.
 */
const findLetterlessWords = (shown: ShownString[]): string[] => {
  const letteredByAscii = new Set<string>();
  const asciiInLetteredText = new Set<string>();
  shown.forEach(({ value }) => {
    const textHasLetters = TURKISH_LETTERS.test(value);
    (value.match(WORD) ?? []).forEach(raw => {
      const word = raw.toLocaleLowerCase('tr');
      if (TURKISH_LETTERS.test(word)) letteredByAscii.add(toAscii(word));
      else if (textHasLetters) asciiInLetteredText.add(word);
    });
  });

  return shown.flatMap(({ label, value }) => {
    const words = (value.match(WORD) ?? [])
      .map(raw => raw.toLocaleLowerCase('tr'))
      .filter(word => word.length >= 3
        && !TURKISH_LETTERS.test(word)
        && letteredByAscii.has(word)
        && !asciiInLetteredText.has(word));
    return words.length > 0 ? [`${label}: ${Array.from(new Set(words)).join(', ')}`] : [];
  });
};

describe('Turkish event text comes from the event data', () => {
  const shown = collectStrings(ALL_EVENTS);

  it('walks the whole event pool (the check cannot pass by checking nothing)', () => {
    expect(EVENTS.length).toBeGreaterThan(400);
    expect(shown.length).toBeGreaterThan(EVENTS.length * 3);
  });

  it('has no Turkish event catalog that could shadow the event data', () => {
    expect(Object.keys(getEventContentStrings('tr'))).toEqual([]);
  });

  it('shows every event text, choice, feedback and outcome exactly as written', () => {
    const shadowed = shown
      .filter(({ key, value }) => key && t('tr', key, undefined, value) !== value)
      .map(({ label }) => label);

    expect(shadowed).toEqual([]);
  });

  it('writes Turkish words with Turkish letters', () => {
    expect(findLetterlessWords(shown)).toEqual([]);
  });

  it('catches letter-less words (the detector is not a no-op)', () => {
    const probe: ShownString[] = [
      { label: 'lettered', key: undefined, value: 'Kötü bir gün geçirdin.' },
      { label: 'letterless', key: undefined, value: 'Kotu bir gun gecirdin.' },
    ];

    expect(findLetterlessWords(probe)).toEqual(['letterless: kotu, gun, gecirdin']);
  });
});
