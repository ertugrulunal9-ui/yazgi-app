import { GameEvent } from '../types';

export const validateEventGraph = (events: GameEvent[]): string[] => {
  const errors: string[] = [];
  const eventIds = new Set(events.map(event => event.id));
  const seenIds = new Set<string>();

  for (const event of events) {
    if (seenIds.has(event.id)) {
      errors.push(`Duplicate event ID: ${event.id}`);
    }
    seenIds.add(event.id);
  }

  for (const event of events) {
    for (const requiredEventId of event.reqEventIds || []) {
      if (!eventIds.has(requiredEventId)) {
        errors.push(`${event.id} requires missing event: ${requiredEventId}`);
      }
    }

    for (const blockedEventId of event.blockEventIds || []) {
      if (!eventIds.has(blockedEventId)) {
        errors.push(`${event.id} blocks missing event: ${blockedEventId}`);
      }
    }

    for (const choice of event.choices) {
      if (typeof choice === 'function') continue;

      for (const requiredEventId of choice.reqEventIds || []) {
        if (!eventIds.has(requiredEventId)) {
          errors.push(`${event.id} choice requires missing event: ${requiredEventId}`);
        }
      }

      for (const blockedEventId of choice.blockEventIds || []) {
        if (!eventIds.has(blockedEventId)) {
          errors.push(`${event.id} choice blocks missing event: ${blockedEventId}`);
        }
      }

      for (const futureEvent of choice.futureEvents || []) {
        if (!eventIds.has(futureEvent.eventId)) {
          errors.push(`${event.id} schedules missing event: ${futureEvent.eventId}`);
        }
      }
    }
  }

  return errors;
};

export const validateEventTagStandard = (events: GameEvent[]): string[] => {
  const warnings: string[] = [];

  for (const event of events) {
    const tags = (event.tags || []).map(tag => String(tag).trim()).filter(Boolean);

    if (tags.length === 0) {
      warnings.push(`${event.id} missing tags (minimum 1 tag recommended)`);
      continue;
    }

    if (tags.length < 2) {
      warnings.push(`${event.id} has low tag depth (${tags.length}/2 suggested minimum)`);
    }

    const unique = new Set(tags);
    if (unique.size !== tags.length) {
      warnings.push(`${event.id} contains duplicate tags`);
    }

    if (tags.length > 8) {
      warnings.push(`${event.id} has too many tags (${tags.length}/8 max suggested)`);
    }
  }

  return warnings;
};
