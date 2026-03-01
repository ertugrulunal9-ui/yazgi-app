import { ScheduledEvent, Skills, Stats } from '../types';

export interface ScheduledConditionContext {
  age: number;
  turn: number;
  stress: number;
  selectedGoal?: string | null;
  traits: string[];
  inventory: string[];
  seenEventIds: Set<string>;
  stats: Partial<Stats>;
  skills: Partial<Skills>;
}

const toNumber = (value: string): number | null => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const compareNumeric = (left: number, operator: string, right: number): boolean => {
  switch (operator) {
    case '>': return left > right;
    case '>=': return left >= right;
    case '<': return left < right;
    case '<=': return left <= right;
    case '=':
    case '==': return left === right;
    case '!=': return left !== right;
    default: return false;
  }
};

const evaluateSingleCondition = (segment: string, context: ScheduledConditionContext): boolean => {
  const value = segment.trim();
  if (!value) return true;

  // Presence tokens
  if (value.startsWith('trait:')) {
    return context.traits.includes(value.slice(6).trim());
  }
  if (value.startsWith('!trait:')) {
    return !context.traits.includes(value.slice(7).trim());
  }
  if (value.startsWith('item:')) {
    return context.inventory.includes(value.slice(5).trim());
  }
  if (value.startsWith('!item:')) {
    return !context.inventory.includes(value.slice(6).trim());
  }
  if (value.startsWith('event:')) {
    return context.seenEventIds.has(value.slice(6).trim());
  }
  if (value.startsWith('!event:')) {
    return !context.seenEventIds.has(value.slice(7).trim());
  }

  const scalarMatch = value.match(/^([a-zA-Z_]+)\s*(==|=|!=|>=|<=|>|<)\s*([A-Za-z0-9_]+)$/);
  if (scalarMatch) {
    const [, key, op, rawExpected] = scalarMatch;
    if (key === 'goal') {
      const selectedGoal = context.selectedGoal ?? '';
      if (op === '!=' ) return selectedGoal !== rawExpected;
      return selectedGoal === rawExpected;
    }
    if (key === 'age' || key === 'turn' || key === 'stress') {
      const current = key === 'age'
        ? context.age
        : key === 'turn'
          ? context.turn
          : context.stress;
      const expected = toNumber(rawExpected);
      if (expected === null) return false;
      return compareNumeric(current, op, expected);
    }
  }

  const scopedMatch = value.match(/^(stat|skill):([a-zA-Z_]+)\s*(==|=|!=|>=|<=|>|<)\s*(-?\d+(?:\.\d+)?)$/);
  if (scopedMatch) {
    const [, scope, key, op, rawExpected] = scopedMatch;
    const expected = toNumber(rawExpected);
    if (expected === null) return false;
    if (scope === 'stat') {
      const current = context.stats[key as keyof Stats];
      if (typeof current !== 'number') return false;
      return compareNumeric(current, op, expected);
    }
    const current = context.skills[key as keyof Skills];
    if (typeof current !== 'number') return false;
    return compareNumeric(current, op, expected);
  }

  return false;
};

export const evaluateScheduledCondition = (
  condition: string | undefined,
  context?: ScheduledConditionContext
): boolean => {
  if (!condition || condition.trim().length === 0) return true;
  if (!context) return true;

  const segments = condition.split('&&').map(s => s.trim()).filter(Boolean);
  if (segments.length === 0) return true;
  return segments.every(segment => evaluateSingleCondition(segment, context));
};

export const getScheduledPriorityValue = (priority: ScheduledEvent['priority']): number => {
  if (typeof priority === 'number') return priority;
  return priority === 'HIGH' ? 100 : 0;
};

export const isForcedScheduledEvent = (scheduledEvent: ScheduledEvent): boolean =>
  getScheduledPriorityValue(scheduledEvent.priority) > 900;

export const getDueScheduledEvents = (
  scheduledEvents: ScheduledEvent[],
  age: number,
  conditionContext?: ScheduledConditionContext
): ScheduledEvent[] => {
  return scheduledEvents.filter(evt => {
    const timeDue = typeof evt.remainingTurns === 'number'
      ? evt.remainingTurns <= 0
      : typeof evt.triggerAge === 'number'
        ? age >= evt.triggerAge
        : true;
    if (!timeDue) return false;
    return evaluateScheduledCondition(evt.condition, conditionContext);
  });
};

export const tickScheduledEvents = (
  scheduledEvents: ScheduledEvent[],
  nextAge: number,
  conditionContext?: ScheduledConditionContext
) => {
  const due: ScheduledEvent[] = [];
  const pending: ScheduledEvent[] = [];

  scheduledEvents.forEach(evt => {
    if (typeof evt.remainingTurns === 'number') {
      const remainingTurns = evt.remainingTurns - 1;
      if (remainingTurns <= 0) {
        const matured = { ...evt, remainingTurns: 0 };
        if (evaluateScheduledCondition(matured.condition, conditionContext)) {
          due.push(matured);
        } else {
          pending.push(matured);
        }
      } else {
        pending.push({ ...evt, remainingTurns });
      }
      return;
    }

    if (typeof evt.triggerAge === 'number') {
      if (nextAge >= evt.triggerAge) {
        if (evaluateScheduledCondition(evt.condition, conditionContext)) {
          due.push(evt);
        } else {
          pending.push(evt);
        }
      } else {
        pending.push(evt);
      }
      return;
    }

    if (evaluateScheduledCondition(evt.condition, conditionContext)) {
      due.push(evt);
    } else {
      pending.push(evt);
    }
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
