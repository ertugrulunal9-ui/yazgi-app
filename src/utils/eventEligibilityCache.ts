import { GameEvent } from '../types';

export interface EventEligibilityCache {
  age: number;
  eligible: GameEvent[];
}

export const getEligibleEventsWithAgeCache = (
  cache: EventEligibilityCache,
  allEvents: GameEvent[],
  age: number
): EventEligibilityCache => {
  if (cache.age === age) return cache;

  return {
    age,
    eligible: allEvents.filter(event => event.minAge <= age && event.maxAge >= age),
  };
};

