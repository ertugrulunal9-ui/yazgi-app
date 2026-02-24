import { GameEvent } from '../types';

export interface EventBranchingStats {
  totalEvents: number;
  gatedEvents: number;
  blockedEvents: number;
}

export interface EventBranchingResult {
  events: GameEvent[];
  stats: EventBranchingStats;
}

const TARGET_GATE_RATIO = 0.18;
const BLOCK_INJECTION_RATIO = 0.45;
const MIN_BRANCHING_AGE = 8;
const MAX_AGE_DISTANCE_FOR_LINK = 5;

const stableHash = (input: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return hash >>> 0;
};

const normalizedScore = (input: string): number => (stableHash(input) % 10000) / 10000;

const sortByNarrativeOrder = (events: GameEvent[]): GameEvent[] => [...events].sort((a, b) => {
  if (a.minAge !== b.minAge) return a.minAge - b.minAge;
  if (a.maxAge !== b.maxAge) return a.maxAge - b.maxAge;
  return a.id.localeCompare(b.id);
});

const intersects = (left: string[] | undefined, right: string[] | undefined): boolean => {
  if (!left || !right || left.length === 0 || right.length === 0) return false;
  const rightSet = new Set(right);
  return left.some(tag => rightSet.has(tag));
};

const isNarrativelyCompatible = (candidate: GameEvent, current: GameEvent): boolean => (
  (candidate.personalityCategory !== undefined && candidate.personalityCategory === current.personalityCategory)
  || intersects(candidate.tags, current.tags)
);

const isEventEligibleForAutoGate = (event: GameEvent): boolean => {
  if (event.minAge < MIN_BRANCHING_AGE) return false;
  if ((event.reqEventIds && event.reqEventIds.length > 0) || (event.blockEventIds && event.blockEventIds.length > 0)) {
    return false;
  }
  if (event.id.startsWith('cliff_')) return false;
  if (event.tags?.includes('scheduled_only')) return false;
  return true;
};

const isCandidatePrerequisite = (candidate: GameEvent, current: GameEvent): boolean => {
  if (candidate.id === current.id) return false;
  if (candidate.minAge > current.minAge) return false;
  if (candidate.maxAge < current.minAge - MAX_AGE_DISTANCE_FOR_LINK) return false;
  return true;
};

const pickByHash = <T,>(pool: T[], seed: string): T => pool[stableHash(seed) % pool.length];

const unique = (ids: string[]): string[] => Array.from(new Set(ids));

export const applyProceduralEventBranching = (events: GameEvent[]): EventBranchingResult => {
  const orderedEvents = sortByNarrativeOrder(events);
  const enhancedById = new Map<string, GameEvent>();

  let gatedEvents = 0;
  let blockedEvents = 0;

  orderedEvents.forEach((event, index) => {
    if (!isEventEligibleForAutoGate(event) || normalizedScore(`${event.id}:gate`) > TARGET_GATE_RATIO) {
      enhancedById.set(event.id, event);
      return;
    }

    const priorEvents = orderedEvents
      .slice(0, index)
      .map(previous => enhancedById.get(previous.id) ?? previous);

    const narrativePool = priorEvents.filter(candidate => (
      isCandidatePrerequisite(candidate, event)
      && isNarrativelyCompatible(candidate, event)
      && !(candidate.reqEventIds && candidate.reqEventIds.length > 1)
    ));
    const fallbackPool = priorEvents.filter(candidate => isCandidatePrerequisite(candidate, event));
    const reqPool = narrativePool.length > 0 ? narrativePool : fallbackPool;

    if (reqPool.length === 0) {
      enhancedById.set(event.id, event);
      return;
    }

    const reqEvent = pickByHash(reqPool, `${event.id}:req`);
    const reqEventIds = unique([...(event.reqEventIds ?? []), reqEvent.id]);

    let blockEventIds = event.blockEventIds ? [...event.blockEventIds] : [];
    if (normalizedScore(`${event.id}:block`) <= BLOCK_INJECTION_RATIO) {
      const blockPool = reqPool.filter(candidate => candidate.id !== reqEvent.id);
      if (blockPool.length > 0) {
        const blockEvent = pickByHash(blockPool, `${event.id}:block-candidate`);
        blockEventIds = unique([...blockEventIds, blockEvent.id]);
      }
    }

    const enhancedEvent: GameEvent = {
      ...event,
      reqEventIds,
      ...(blockEventIds.length > 0 ? { blockEventIds } : {}),
    };

    gatedEvents += 1;
    if (blockEventIds.length > 0) blockedEvents += 1;
    enhancedById.set(event.id, enhancedEvent);
  });

  const enhancedEvents = events.map(event => enhancedById.get(event.id) ?? event);
  return {
    events: enhancedEvents,
    stats: {
      totalEvents: events.length,
      gatedEvents,
      blockedEvents,
    },
  };
};
