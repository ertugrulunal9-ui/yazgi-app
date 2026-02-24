import { ECONOMIC_RECOVERY_EVENTS } from '../../src/data/economicRecoveryEvents';
import { EVENTS } from '../../src/data/events';

describe('ECONOMIC_RECOVERY_EVENTS', () => {
  it('defines POOR-exclusive recovery events', () => {
    expect(ECONOMIC_RECOVERY_EVENTS).toHaveLength(3);

    ECONOMIC_RECOVERY_EVENTS.forEach(event => {
      expect(event.reqFamily?.wealth).toEqual(['POOR']);
      expect(event.isRepeatable).toBe(false);
      expect(event.tags).toContain('recovery');
      expect(event.choices.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('registers all recovery events in the global event pool', () => {
    ECONOMIC_RECOVERY_EVENTS.forEach(event => {
      expect(EVENTS.some(globalEvent => globalEvent.id === event.id)).toBe(true);
    });
  });
});
