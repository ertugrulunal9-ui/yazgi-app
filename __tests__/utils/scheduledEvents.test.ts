import { getDueScheduledEvents, pickScheduledEvent, tickScheduledEvents } from '../../src/utils/scheduledEvents';
import { ScheduledEvent } from '../../src/types';

describe('Scheduled Events Utils', () => {
  it('should return due events by remaining turns and age', () => {
    const events: ScheduledEvent[] = [
      { id: 'turn_due', eventId: 'evt1', remainingTurns: 0, priority: 'NORMAL' },
      { id: 'turn_pending', eventId: 'evt2', remainingTurns: 2, priority: 'NORMAL' },
      { id: 'age_due', eventId: 'evt3', triggerAge: 10, priority: 'NORMAL' },
    ];

    const dueAtAge10 = getDueScheduledEvents(events, 10).map(evt => evt.id);
    expect(dueAtAge10).toContain('turn_due');
    expect(dueAtAge10).toContain('age_due');
    expect(dueAtAge10).not.toContain('turn_pending');
  });

  it('should tick scheduled events and split due/pending', () => {
    const events: ScheduledEvent[] = [
      { id: 'turn_due', eventId: 'evt1', remainingTurns: 1, priority: 'NORMAL' },
      { id: 'turn_pending', eventId: 'evt2', remainingTurns: 3, priority: 'NORMAL' },
      { id: 'age_pending', eventId: 'evt3', triggerAge: 12, priority: 'NORMAL' },
    ];

    const result = tickScheduledEvents(events, 10);
    const dueIds = result.due.map(evt => evt.id);
    const pendingIds = result.pending.map(evt => evt.id);

    expect(dueIds).toContain('turn_due');
    expect(pendingIds).toContain('turn_pending');
    expect(pendingIds).toContain('age_pending');
  });

  it('should prefer high priority events when picking', () => {
    const events: ScheduledEvent[] = [
      { id: 'normal_1', eventId: 'evt1', priority: 'NORMAL', remainingTurns: 0 },
      { id: 'high_1', eventId: 'evt2', priority: 'HIGH', remainingTurns: 0 },
      { id: 'normal_2', eventId: 'evt3', priority: 'NORMAL', remainingTurns: 0 },
    ];

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0);
    const picked = pickScheduledEvent(events);
    randomSpy.mockRestore();

    expect(picked?.id).toBe('high_1');
  });
});
