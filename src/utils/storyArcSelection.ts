import { ActiveStoryArc, EventContext, GameEvent, PersonalityRequirement, StoryArc, StoryArcEvent } from '../types';
import { isEventEligible } from './eventSelection';

interface StoryArcSelectionParams {
  arcs: StoryArc[];
  activeArcs: ActiveStoryArc[];
  events: GameEvent[];
  context: EventContext;
  recentEventIds: string[] | Set<string>;
  allSeenEvents: string[] | Set<string>;
  randomFn?: () => number;
}

interface ArcCandidate {
  arc: StoryArc;
  arcEvent: StoryArcEvent;
  event: GameEvent;
}

interface StoryArcSelectionResult {
  event: GameEvent | null;
  activeArcs: ActiveStoryArc[];
}

const meetsPersonality = (
  requirements: PersonalityRequirement[] | undefined,
  personality: EventContext['personality']
): boolean => {
  if (!requirements || requirements.length === 0) return true;
  return requirements.every(req => {
    const value = personality[req.axis];
    if (req.min !== undefined && value < req.min) return false;
    if (req.max !== undefined && value > req.max) return false;
    return true;
  });
};

const getArcMaxStage = (arc: StoryArc): number =>
  arc.events.reduce((maxStage, arcEvent) => Math.max(maxStage, arcEvent.stage), 0);

const pickRandom = <T>(items: T[], randomFn: () => number): T =>
  items[Math.floor(randomFn() * items.length)];

const updateActiveArcsForCandidate = (
  activeArcs: ActiveStoryArc[],
  candidate: ArcCandidate
): ActiveStoryArc[] => {
  const { arc, arcEvent } = candidate;
  const maxStage = getArcMaxStage(arc);
  const next = [...activeArcs];
  const idx = next.findIndex(active => active.arcId === arc.id);

  if (arcEvent.stage >= maxStage) {
    if (idx >= 0) {
      next.splice(idx, 1);
    }
    return next;
  }

  if (idx >= 0) {
    next[idx] = { ...next[idx], stage: Math.max(next[idx].stage, arcEvent.stage) };
  } else {
    // Preserve npcId from activeArcs if this is an NPC-bound arc
    const existingActive = activeArcs.find(a => a.arcId === arc.id);
    next.push({ arcId: arc.id, stage: arcEvent.stage, ...(existingActive?.npcId ? { npcId: existingActive.npcId } : {}) });
  }

  return next;
};

const isArcAllowedByContext = (arc: StoryArc, context: EventContext): boolean =>
  context.age >= arc.ageRange[0] &&
  context.age <= arc.ageRange[1] &&
  meetsPersonality(arc.reqPersonality, context.personality);

const getEventMap = (events: GameEvent[]): Map<string, GameEvent> =>
  new Map(events.map(event => [event.id, event]));

export const selectStoryArcEvent = ({
  arcs,
  activeArcs,
  events,
  context,
  recentEventIds,
  allSeenEvents,
  randomFn = Math.random,
}: StoryArcSelectionParams): StoryArcSelectionResult => {
  const eventMap = getEventMap(events);
  const continuingCandidates: ArcCandidate[] = [];

  for (const activeArc of activeArcs) {
    const arc = arcs.find(item => item.id === activeArc.arcId);
    if (!arc || !isArcAllowedByContext(arc, context)) continue;

    // NPC arc validation: check that the bound NPC still meets role requirements
    if (arc.requiresNPC && activeArc.npcId && arc.npcRoleRequirement) {
      const npc = context.npcs?.find(n => n.id === activeArc.npcId);
      if (!npc || !arc.npcRoleRequirement.includes(npc.role)) continue;
    }

    const targetStage = activeArc.stage + 1;
    const stageEvents = arc.events.filter(arcEvent => arcEvent.stage === targetStage);

    for (const arcEvent of stageEvents) {
      if (arcEvent.requiresPrevious && activeArc.stage < targetStage - 1) continue;
      if (arcEvent.branchCondition && !arcEvent.branchCondition(context)) continue;

      const event = eventMap.get(arcEvent.eventId);
      if (!event) continue;
      if (!isEventEligible(event, context, recentEventIds, allSeenEvents)) continue;

      continuingCandidates.push({ arc, arcEvent, event });
    }
  }

  if (continuingCandidates.length > 0) {
    const selected = pickRandom(continuingCandidates, randomFn);
    return {
      event: selected.event,
      activeArcs: updateActiveArcsForCandidate(activeArcs, selected),
    };
  }

  const startingCandidates: ArcCandidate[] = [];
  for (const arc of arcs) {
    if (!isArcAllowedByContext(arc, context)) continue;
    if (activeArcs.some(active => active.arcId === arc.id)) continue;

    const minStage = arc.events.reduce((min, arcEvent) => Math.min(min, arcEvent.stage), Number.POSITIVE_INFINITY);
    const startingEvents = arc.events.filter(arcEvent => arcEvent.stage === minStage);

    for (const arcEvent of startingEvents) {
      if (arcEvent.requiresPrevious) continue;
      if (arcEvent.branchCondition && !arcEvent.branchCondition(context)) continue;

      const event = eventMap.get(arcEvent.eventId);
      if (!event) continue;
      if (!isEventEligible(event, context, recentEventIds, allSeenEvents)) continue;

      startingCandidates.push({ arc, arcEvent, event });
    }
  }

  if (startingCandidates.length > 0) {
    const selected = pickRandom(startingCandidates, randomFn);
    return {
      event: selected.event,
      activeArcs: updateActiveArcsForCandidate(activeArcs, selected),
    };
  }

  return {
    event: null,
    activeArcs,
  };
};

export const syncActiveArcsWithSelectedEvent = (
  activeArcs: ActiveStoryArc[],
  arcs: StoryArc[],
  eventId: string,
  context: EventContext
): ActiveStoryArc[] => {
  let next = [...activeArcs];

  for (const arc of arcs) {
    if (!isArcAllowedByContext(arc, context)) continue;
    const arcEvent = arc.events.find(item => item.eventId === eventId);
    if (!arcEvent) continue;

    const candidate: ArcCandidate = {
      arc,
      arcEvent,
      event: {
        id: eventId,
        text: '',
        minAge: 0,
        maxAge: 0,
        choices: [],
      },
    };

    next = updateActiveArcsForCandidate(next, candidate);
    break;
  }

  return next;
};

