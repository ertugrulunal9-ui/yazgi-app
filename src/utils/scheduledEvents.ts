import { ScheduledEvent } from '../types';

export const getScheduledPriorityValue = (priority: ScheduledEvent['priority']): number => {
  if (typeof priority === 'number') return priority;
  return priority === 'HIGH' ? 100 : 0;
};

export const isForcedScheduledEvent = (scheduledEvent: ScheduledEvent): boolean =>
  getScheduledPriorityValue(scheduledEvent.priority) > 900;

export const getDueScheduledEvents = (scheduledEvents: ScheduledEvent[], age: number): ScheduledEvent[] => {
  return scheduledEvents.filter(evt => {
    if (typeof evt.remainingTurns === 'number') return evt.remainingTurns <= 0;
    if (typeof evt.triggerAge === 'number') return age >= evt.triggerAge;
    return true;
  });
};

export const tickScheduledEvents = (scheduledEvents: ScheduledEvent[], nextAge: number) => {
  const due: ScheduledEvent[] = [];
  const pending: ScheduledEvent[] = [];

  scheduledEvents.forEach(evt => {
    if (typeof evt.remainingTurns === 'number') {
      const remainingTurns = evt.remainingTurns - 1;
      if (remainingTurns <= 0) {
        due.push({ ...evt, remainingTurns: 0 });
      } else {
        pending.push({ ...evt, remainingTurns });
      }
      return;
    }

    if (typeof evt.triggerAge === 'number') {
      if (nextAge >= evt.triggerAge) {
        due.push(evt);
      } else {
        pending.push(evt);
      }
      return;
    }

    due.push(evt);
  });

  return { due, pending };
};

export const pickScheduledEvent = (dueEvents: ScheduledEvent[]): ScheduledEvent | null => {
  if (dueEvents.length === 0) return null;

  const forcedPriorityEvents = dueEvents.filter(isForcedScheduledEvent);
  if (forcedPriorityEvents.length > 0) {
    const highestPriority = Math.max(...forcedPriorityEvents.map(evt => getScheduledPriorityValue(evt.priority)));
    const pool = forcedPriorityEvents.filter(evt => getScheduledPriorityValue(evt.priority) === highestPriority);
    const index = Math.floor(Math.random() * pool.length);
    return pool[index] || null;
  }

  const highPriority = dueEvents.filter(evt => evt.priority === 'HIGH');
  const pool = highPriority.length > 0 ? highPriority : dueEvents;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] || null;
};
