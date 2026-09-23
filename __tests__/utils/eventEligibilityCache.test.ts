import { GameEvent } from '../../src/types';
import { EventEligibilityCache, getEligibleEventsWithAgeCache } from '../../src/utils/eventEligibilityCache';

const events: GameEvent[] = [
  {
    id: 'child_only',
    text: 'Child event',
    minAge: 7,
    maxAge: 12,
    choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
    difficulty: 1,
    rarity: 'COMMON',
  },
  {
    id: 'teen_only',
    text: 'Teen event',
    minAge: 13,
    maxAge: 18,
    choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
    difficulty: 1,
    rarity: 'COMMON',
  },
  {
    id: 'all_ages',
    text: 'All ages event',
    minAge: 0,
    maxAge: 99,
    choices: [{ text: 'ok', effect: {}, feedback: 'ok' }],
    difficulty: 1,
    rarity: 'COMMON',
  },
];

const pickAgeSpecific = (eligible: GameEvent[]): string | undefined =>
  eligible.find(event => event.id !== 'all_ages')?.id;

describe('eventEligibilityCache', () => {
  it('invalidates cache on age change and produces different event pool', () => {
    const initial: EventEligibilityCache = { age: -1, eligible: [] };

    const age10 = getEligibleEventsWithAgeCache(initial, events, 10);
    const age10Again = getEligibleEventsWithAgeCache(age10, events, 10);
    const age16 = getEligibleEventsWithAgeCache(age10Again, events, 16);

    expect(age10Again).toBe(age10);
    expect(pickAgeSpecific(age10.eligible)).toBe('child_only');
    expect(pickAgeSpecific(age16.eligible)).toBe('teen_only');
    expect(pickAgeSpecific(age10.eligible)).not.toBe(pickAgeSpecific(age16.eligible));
  });
});

