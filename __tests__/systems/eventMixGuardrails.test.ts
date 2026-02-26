import {
  classifyEventMixCategory,
  calculateEventMixDistribution,
  isEventCategoryAllowed,
  isEventDuplicateCooldownClear,
  applyEventMixGuardrails,
  calculateEventMixEntropy,
  type EventMixDistribution,
} from '../../src/systems/eventMixGuardrails';
import { EVENT_MIX_GUARDRAILS } from '../../src/config/gameBalance';
import type { GameEvent } from '../../src/types';

const makeEvent = (overrides: Partial<GameEvent> = {}): GameEvent => ({
  id: 'test_event',
  text: 'Test',
  minAge: 0,
  maxAge: 18,
  choices: [],
  ...overrides,
} as GameEvent);

describe('classifyEventMixCategory', () => {
  it('classifies goal_specific tagged events as goal', () => {
    const event = makeEvent({ id: 'goal_academic_1', tags: ['goal_specific'] });
    expect(classifyEventMixCategory(event, 'ACADEMIC')).toBe('goal');
  });

  it('classifies goal_ prefixed events as goal', () => {
    const event = makeEvent({ id: 'goal_creative_art' });
    expect(classifyEventMixCategory(event, 'CREATIVE')).toBe('goal');
  });

  it('classifies npc tagged events as relationship', () => {
    const event = makeEvent({ id: 'npc_friend_chat', tags: ['npc'] });
    expect(classifyEventMixCategory(event)).toBe('relationship');
  });

  it('classifies SOCIAL personalityCategory as relationship', () => {
    const event = makeEvent({ id: 'party_invite', personalityCategory: 'SOCIAL' });
    expect(classifyEventMixCategory(event)).toBe('relationship');
  });

  it('classifies generic events as general', () => {
    const event = makeEvent({ id: 'random_encounter', personalityCategory: 'GROWTH' });
    expect(classifyEventMixCategory(event)).toBe('general');
  });
});

describe('calculateEventMixDistribution', () => {
  it('returns zero distribution for empty array', () => {
    const dist = calculateEventMixDistribution([]);
    expect(dist).toEqual({ goal: 0, relationship: 0, general: 0, total: 0 });
  });

  it('counts categories correctly', () => {
    const events = [
      makeEvent({ id: 'goal_1', tags: ['goal_specific'] }),
      makeEvent({ id: 'npc_1', tags: ['npc'] }),
      makeEvent({ id: 'generic_1', personalityCategory: 'GROWTH' }),
      makeEvent({ id: 'generic_2', personalityCategory: 'RISK' }),
    ];
    const dist = calculateEventMixDistribution(events, 'ACADEMIC');
    expect(dist.goal).toBe(1);
    expect(dist.relationship).toBe(1);
    expect(dist.general).toBe(2);
    expect(dist.total).toBe(4);
  });
});

describe('isEventCategoryAllowed', () => {
  it('allows all categories when total < 5', () => {
    const dist: EventMixDistribution = { goal: 3, relationship: 0, general: 0, total: 3 };
    expect(isEventCategoryAllowed('goal', dist)).toBe(true);
  });

  it('blocks goal when it would exceed maxGoalEventShare', () => {
    // 5 total, 2 goal = 2/5 = 0.40. Adding one more: 3/6 = 0.50 > 0.45
    const dist: EventMixDistribution = { goal: 2, relationship: 1, general: 2, total: 5 };
    expect(isEventCategoryAllowed('goal', dist)).toBe(false);
  });

  it('allows goal when within limits', () => {
    // 10 total, 2 goal = 2/10. Adding: 3/11 = 0.27 < 0.45
    const dist: EventMixDistribution = { goal: 2, relationship: 3, general: 5, total: 10 };
    expect(isEventCategoryAllowed('goal', dist)).toBe(true);
  });

  it('always allows general events', () => {
    const dist: EventMixDistribution = { goal: 0, relationship: 0, general: 10, total: 10 };
    expect(isEventCategoryAllowed('general', dist)).toBe(true);
  });

  it('always allows relationship events', () => {
    const dist: EventMixDistribution = { goal: 0, relationship: 10, general: 0, total: 10 };
    expect(isEventCategoryAllowed('relationship', dist)).toBe(true);
  });
});

describe('isEventDuplicateCooldownClear', () => {
  it('allows event not in recent history', () => {
    expect(isEventDuplicateCooldownClear('event_a', ['event_b', 'event_c'])).toBe(true);
  });

  it('blocks event within cooldown window', () => {
    const recentIds = Array.from({ length: 10 }, (_, i) => `event_${i}`);
    // Last 6 entries include event_4 through event_9
    expect(isEventDuplicateCooldownClear('event_9', recentIds)).toBe(false);
  });

  it('allows event outside cooldown window', () => {
    const recentIds = Array.from({ length: 10 }, (_, i) => `event_${i}`);
    // event_0 is outside the last 6 window
    expect(isEventDuplicateCooldownClear('event_0', recentIds)).toBe(true);
  });
});

describe('applyEventMixGuardrails', () => {
  it('filters out duplicate events within cooldown', () => {
    const candidates = [
      makeEvent({ id: 'event_a' }),
      makeEvent({ id: 'event_b' }),
    ];
    const recentEventIds = ['event_a'];
    const result = applyEventMixGuardrails(candidates, [], recentEventIds);
    expect(result.map(e => e.id)).toContain('event_b');
    expect(result.map(e => e.id)).not.toContain('event_a');
  });
});

describe('calculateEventMixEntropy', () => {
  it('returns 0 for empty distribution', () => {
    expect(calculateEventMixEntropy({ goal: 0, relationship: 0, general: 0, total: 0 })).toBe(0);
  });

  it('returns max entropy for equal distribution', () => {
    const entropy = calculateEventMixEntropy({ goal: 10, relationship: 10, general: 10, total: 30 });
    // Max = log2(3) ≈ 1.585
    expect(entropy).toBeCloseTo(Math.log2(3), 2);
  });

  it('returns 0 for single-category distribution', () => {
    const entropy = calculateEventMixEntropy({ goal: 0, relationship: 0, general: 10, total: 10 });
    expect(entropy).toBeCloseTo(0, 5);
  });
});

describe('EVENT_MIX_GUARDRAILS config values', () => {
  it('shares should sum to approximately 1.0', () => {
    const { minGeneralEventShare, maxGoalEventShare, minRelationshipEventShare } = EVENT_MIX_GUARDRAILS;
    // Not exact 1.0 because max+min+min has slack, but each should be reasonable
    expect(minGeneralEventShare).toBeGreaterThan(0);
    expect(maxGoalEventShare).toBeGreaterThan(0);
    expect(minRelationshipEventShare).toBeGreaterThan(0);
    expect(minGeneralEventShare + maxGoalEventShare + minRelationshipEventShare).toBeLessThanOrEqual(1.0);
  });

  it('duplicate cooldown should be positive', () => {
    expect(EVENT_MIX_GUARDRAILS.duplicateEventCooldownTurns).toBeGreaterThan(0);
  });
});
