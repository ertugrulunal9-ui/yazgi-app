import { EventContext, GameEvent, StoryArc } from '../../src/types';
import { selectStoryArcEvent, syncActiveArcsWithSelectedEvent } from '../../src/utils/storyArcSelection';

const context: EventContext = {
  age: 16,
  traits: [],
  stats: {
    health: 60,
    intelligence: 60,
    charisma: 60,
    discipline: 60,
    money: 200,
    energy: 60,
    familyRelation: 60,
  },
  family: { wealth: 'MIDDLE', dynamic: 'SUPPORTIVE', allowance: 20 },
  memories: [],
  inventory: [],
  personality: {
    openness: 50,
    courage: 50,
    empathy: 50,
    patience: 50,
    conformity: 50,
  },
  stress: {
    current: 20,
    threshold: 70,
    turnsSinceBreakdown: 0,
    sources: [],
  },
  skills: {
    coding: 10,
    music: 10,
    sports: 10,
    design: 10,
    athletics: 10,
    logic: 10,
    reading: 10,
    teamwork: 10,
    art: 10,
    writing: 10,
    work_ethic: 10,
    business: 10,
  },
  npcs: [],
};

const events: GameEvent[] = [
  { id: 'arc_start', text: 'start', minAge: 15, maxAge: 18, choices: [{ text: 'ok', effect: {}, feedback: 'ok' }] },
  { id: 'arc_mid', text: 'mid', minAge: 15, maxAge: 18, choices: [{ text: 'ok', effect: {}, feedback: 'ok' }] },
  { id: 'arc_end', text: 'end', minAge: 15, maxAge: 18, choices: [{ text: 'ok', effect: {}, feedback: 'ok' }] },
  { id: 'other_event', text: 'other', minAge: 15, maxAge: 18, choices: [{ text: 'ok', effect: {}, feedback: 'ok' }] },
];

const arcs: StoryArc[] = [
  {
    id: 'arc_test',
    title: 'Test Arc',
    ageRange: [15, 18],
    isRepeatable: false,
    events: [
      { eventId: 'arc_start', stage: 1, requiresPrevious: false },
      { eventId: 'arc_mid', stage: 2, requiresPrevious: true },
      { eventId: 'arc_end', stage: 3, requiresPrevious: true },
    ],
  },
];

describe('storyArcSelection', () => {
  it('prioritizes continuing active arc stages', () => {
    const result = selectStoryArcEvent({
      arcs,
      activeArcs: [{ arcId: 'arc_test', stage: 1 }],
      events,
      context,
      recentEventIds: [],
      allSeenEvents: ['arc_start'],
    });

    expect(result.event?.id).toBe('arc_mid');
    expect(result.activeArcs).toEqual([{ arcId: 'arc_test', stage: 2 }]);
  });

  it('starts a new arc when no active arc can continue', () => {
    const result = selectStoryArcEvent({
      arcs,
      activeArcs: [],
      events,
      context,
      recentEventIds: [],
      allSeenEvents: [],
      randomFn: () => 0,
    });

    expect(result.event?.id).toBe('arc_start');
    expect(result.activeArcs).toEqual([{ arcId: 'arc_test', stage: 1 }]);
  });

  it('syncs active arc stage with selected event', () => {
    const next = syncActiveArcsWithSelectedEvent(
      [{ arcId: 'arc_test', stage: 1 }],
      arcs,
      'arc_mid',
      context
    );

    expect(next).toEqual([{ arcId: 'arc_test', stage: 2 }]);
  });
});

