import { EVENTS } from '../../src/data/events';

describe('event branching coverage', () => {
  it('keeps reqEventIds coverage in the 15-24% range', () => {
    const total = EVENTS.length;
    const gatedCount = EVENTS.filter(event => (event.reqEventIds?.length ?? 0) > 0).length;
    const blockedCount = EVENTS.filter(event => (event.blockEventIds?.length ?? 0) > 0).length;
    const gatedRatio = gatedCount / total;
    const blockedRatio = blockedCount / total;

    expect(total).toBeGreaterThan(300);
    expect(gatedRatio).toBeGreaterThanOrEqual(0.15);
    expect(gatedRatio).toBeLessThanOrEqual(0.24);
    expect(blockedRatio).toBeGreaterThanOrEqual(0.05);
  });

  it('requires scheduled-only events to have explicit prerequisites', () => {
    const scheduledOnlyEvents = EVENTS.filter(event => event.tags?.includes('scheduled_only'));

    expect(scheduledOnlyEvents.length).toBeGreaterThanOrEqual(7);
    scheduledOnlyEvents.forEach(event => {
      expect(event.reqEventIds && event.reqEventIds.length > 0).toBe(true);
    });
  });
});
