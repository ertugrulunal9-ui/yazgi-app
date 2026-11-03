import { EVENTS } from '../../src/data/events';
import { STORY_ARCS } from '../../src/data/storyArcs';
import type { EventContext } from '../../src/types';
import { selectStoryArcEvent } from '../../src/utils/storyArcSelection';

// Şartsızken bu dizi her koşuda 15 yaşında başlıyor, 3 kartı her hayatta aynı geliyordu
const independenceArc = STORY_ARCS.filter(arc => arc.id === 'arc_family_independence');

const contextWithConformity = (conformity: number): EventContext => ({
  age: 15,
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
  personality: { openness: 50, courage: 50, empathy: 50, patience: 50, conformity },
  stress: { current: 20, threshold: 70, turnsSinceBreakdown: 0, sources: [] },
  skills: {
    coding: 10, music: 10, sports: 10, design: 10, athletics: 10, logic: 10,
    reading: 10, teamwork: 10, art: 10, writing: 10, work_ethic: 10, business: 10,
  },
  npcs: [],
});

const startingEventFor = (conformity: number) => selectStoryArcEvent({
  arcs: independenceArc,
  activeArcs: [],
  events: EVENTS,
  context: contextWithConformity(conformity),
  recentEventIds: [],
  allSeenEvents: [],
}).event?.id;

describe('family independence arc', () => {
  it('starts for a teen who does not go along with the rules', () => {
    expect(startingEventFor(35)).toBe('lt_family_independence_argument');
    expect(startingEventFor(50)).toBe('lt_family_independence_argument');
  });

  it('does not force itself on a conforming teen', () => {
    expect(startingEventFor(70)).toBeUndefined();
  });
});
