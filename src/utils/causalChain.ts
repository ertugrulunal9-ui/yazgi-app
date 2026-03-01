// =================================================================
// NEDENSEL ZİNCİR (Causal Chain)
// Bir event'in geçmiş seçimlere bağlı olduğunu tespit eder
// ve oyuncuya "neden bu event geldi" hissini verir.
// =================================================================

import { EventMemory, GameEvent } from '../types';
import { tRuntime } from '../i18n/strings';

export interface CausalLink {
  sourceEventId: string;
  narrativeLine: string;
  emotion: string;
}

const CAUSAL_TEMPLATES: Record<string, string[]> = {
  PRIDE: [
    'Geçmişte verdiğin cesur karar bu kapıyı açtı.',
    'O an doğru olanı yaptın — şimdi o an sana geri dönüyor.',
    'Gururla verdiğin karar bugünü getirdi.',
  ],
  SATISFACTION: [
    'Geçmişte aldığın doğru karar bugün meyvesini veriyor.',
    'O seçim boşa gitmemişti. Şimdi anlıyorsun neden.',
    'Bilinçli bir adım atmıştın — sonucu bu.',
  ],
  REGRET: [
    'Geçmişte verdiğin bir karar bugünü şekillendiriyor.',
    'O an yaptığın seçimin gölgesi hâlâ üzerinde.',
    'Pişmanlığını taşıdığın o karar, bugün karşına çıkıyor.',
  ],
  GUILT: [
    'Suçluluk duyduğun o anın ağırlığı bugün geri döndü.',
    'Geçmişte yapamadığın ya da yanlış yaptığın bir şey seni burada buluyor.',
    'O an vicdanını sızlatan seçim, bugün karşına çıktı.',
  ],
  NEUTRAL: [
    'Geçmişte yaşananlar bugünü buraya getirdi.',
    'O zamanki kararın bugün bir kapı araladı.',
  ],
};

const pickByHash = (arr: string[], seed: string): string => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return arr[Math.abs(hash) % arr.length];
};

/**
 * Seçilen event'in reqEventIds'inden biri oyuncunun memory'sinde varsa
 * bir CausalLink üretir. Yoksa null döner.
 */
export const detectCausalLink = (
  event: GameEvent,
  memories: EventMemory[],
  seenEventIds: Set<string>,
): CausalLink | null => {
  const reqIds = event.reqEventIds;
  if (!reqIds || reqIds.length === 0) return null;

  // reqEventIds içinde oyuncunun gerçekten gördüğü bir event var mı?
  const matchingReqId = reqIds.find(id => seenEventIds.has(id));
  if (!matchingReqId) return null;

  // Bu event'e karşılık gelen bir memory bul (emotion için)
  const matchingMemory = memories.find(m => m.eventId === matchingReqId);
  const emotion = matchingMemory?.emotion ?? 'NEUTRAL';

  const templates = CAUSAL_TEMPLATES[emotion] ?? CAUSAL_TEMPLATES.NEUTRAL;
  const narrativeLine = tRuntime(
    `narrative.causal.${String(emotion).toLowerCase()}`,
    undefined,
    pickByHash(templates, `${matchingReqId}:${event.id}`)
  );

  return {
    sourceEventId: matchingReqId,
    narrativeLine,
    emotion,
  };
};
