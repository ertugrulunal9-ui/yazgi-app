import { NPC_QUESTLINE_EVENTS } from '../../src/data/npcQuestlineEvents';
import { Choice, EventContext, GameEvent } from '../../src/types';

const resolveChoice = (
  rawChoice: Choice | ((context: EventContext) => Choice),
  context: EventContext
): Choice => (typeof rawChoice === 'function' ? rawChoice(context) : rawChoice);

const pickEvent = (id: string): GameEvent => {
  const found = NPC_QUESTLINE_EVENTS.find(event => event.id === id);
  if (!found) {
    throw new Error(`Missing questline event: ${id}`);
  }
  return found;
};

const dummyContext: EventContext = {
  age: 15,
  traits: [],
  stats: {
    health: 60,
    intelligence: 60,
    charisma: 60,
    discipline: 60,
    money: 100,
    energy: 60,
    familyRelation: 60,
  },
  family: null,
  memories: [],
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
  npcs: [],
  inventory: [],
  skills: {
    coding: 0,
    music: 0,
    sports: 0,
    design: 0,
    athletics: 0,
    logic: 0,
    reading: 0,
    teamwork: 0,
    art: 0,
    writing: 0,
    work_ethic: 0,
    business: 0,
  },
};

describe('npc questline delayed chains', () => {
  it('adds 3-turn delayed consequence schedules to key branching choices', () => {
    const chainAssertions: Array<{ eventId: string; choiceIndex: number; targetEventId: string }> = [
      { eventId: 'npcq_friend_shared_crisis', choiceIndex: 0, targetEventId: 'npcq_friend_loyalty_test' },
      { eventId: 'npcq_friend_shared_crisis', choiceIndex: 1, targetEventId: 'npcq_friend_drift_apart' },
      { eventId: 'npcq_friend_shared_crisis', choiceIndex: 2, targetEventId: 'npcq_friend_adventure' },
      { eventId: 'npcq_romance_confession', choiceIndex: 0, targetEventId: 'npcq_romance_first_date' },
      { eventId: 'npcq_romance_confession', choiceIndex: 2, targetEventId: 'npcq_romance_mature_breakup' },
      { eventId: 'npcq_rival_first_challenge', choiceIndex: 0, targetEventId: 'npcq_rival_showdown' },
      { eventId: 'npcq_betray_first_doubt', choiceIndex: 1, targetEventId: 'npcq_betray_gossip_heard' },
    ];

    chainAssertions.forEach(assertion => {
      const event = pickEvent(assertion.eventId);
      const choice = resolveChoice(event.choices[assertion.choiceIndex], dummyContext);
      const scheduled = (choice.futureEvents || []).find(item => item.eventId === assertion.targetEventId);
      expect(scheduled).toBeDefined();
      expect(scheduled?.trigger).toBe('TURNS');
      expect(scheduled?.turnsLater).toBe(3);
    });
  });

  it('marks delayed consequence events as scheduled-only with req/block gates', () => {
    const loyalty = pickEvent('npcq_friend_loyalty_test');
    const driftApart = pickEvent('npcq_friend_drift_apart');
    const firstDate = pickEvent('npcq_romance_first_date');
    const breakup = pickEvent('npcq_romance_mature_breakup');

    expect(loyalty.reqEventIds).toContain('npcq_friend_shared_crisis');
    expect(loyalty.blockEventIds).toContain('npcq_friend_drift_apart');
    expect(loyalty.tags).toContain('scheduled_only');

    expect(driftApart.reqEventIds).toContain('npcq_friend_shared_crisis');
    expect(driftApart.blockEventIds).toContain('npcq_friend_loyalty_test');
    expect(driftApart.tags).toContain('scheduled_only');

    expect(firstDate.reqEventIds).toContain('npcq_romance_confession');
    expect(firstDate.blockEventIds).toContain('npcq_romance_mature_breakup');
    expect(firstDate.tags).toContain('scheduled_only');

    expect(breakup.reqEventIds).toContain('npcq_romance_confession');
    expect(breakup.blockEventIds).toContain('npcq_romance_first_date');
    expect(breakup.tags).toContain('scheduled_only');
  });
});
