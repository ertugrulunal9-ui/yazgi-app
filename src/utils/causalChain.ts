// =================================================================
// NEDENSEL ZINCIR (Causal Chain)
// Bir event'in gecmis secimlere bagli oldugunu tespit eder
// ve oyuncuya "neden bu event geldi" hissini verir.
// =================================================================

import { getRuntimeStringArray, tRuntime } from '../i18n/strings';
import { EventMemory, GameEvent } from '../types';

export interface CausalLink {
  sourceEventId: string;
  narrativeLine: string;
  emotion: string;
}

const pickByHash = (arr: string[], seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return arr[Math.abs(hash) % arr.length];
};

/**
 * Secilen event'in reqEventIds'inden biri oyuncunun memory'sinde varsa
 * bir CausalLink uretir. Yoksa null doner.
 */
export const detectCausalLink = (
  event: GameEvent,
  memories: EventMemory[],
  seenEventIds: Set<string>,
): CausalLink | null => {
  const reqIds = event.reqEventIds;
  if (!reqIds || reqIds.length === 0) return null;

  const matchingReqId = reqIds.find(id => seenEventIds.has(id));
  if (!matchingReqId) return null;

  const matchingMemory = memories.find(m => m.eventId === matchingReqId);
  const emotion = matchingMemory?.emotion ?? 'NEUTRAL';

  const templates = getRuntimeStringArray(`narrative.causalTemplates.${String(emotion).toLowerCase()}`);
  const fallbackTemplates = getRuntimeStringArray('narrative.causalTemplates.neutral');
  const pool = templates.length > 0 ? templates : fallbackTemplates;

  const narrativeLine = tRuntime(
    `narrative.causal.${String(emotion).toLowerCase()}`,
    undefined,
    pickByHash(pool, `${matchingReqId}:${event.id}`)
  );

  return {
    sourceEventId: matchingReqId,
    narrativeLine,
    emotion,
  };
};
