/**
 * Yazgı İzi: bir seçimin yıllar sonra geri döndüğü anların kaydı.
 * Kayıt, oyuncu yankı olayında seçim yaptığında TurnMediator tarafından tutulur.
 * Ekran metinleri `echoTrailView.ts`'tedir (olay verisini yalnızca orası yükler).
 */
import type { EchoTrailEntry, GameState, ScheduledEvent } from '../types';

type CausalLink = GameState['currentCausalLink'];

/** Olay bir seçimin yankısıysa kayda ekler; değilse ya da zaten kayıtlıysa aynı listeyi döner. */
export const recordEchoTrail = (
  log: EchoTrailEntry[] | undefined,
  link: CausalLink,
  eventId: string,
  age: number,
): EchoTrailEntry[] | undefined => {
  if (!link?.sourceChoiceId || typeof link.sourceAge !== 'number' || !eventId) return log;
  // Bağ yalnızca kendi olayına aittir (araya giren başka bir olayda kaydedilmez)
  if (link.targetEventId && link.targetEventId !== eventId) return log;
  const current = log ?? [];
  if (current.some(entry => entry.eventId === eventId && entry.age === age)) return log;
  return [...current, {
    sourceEventId: link.sourceEventId,
    sourceChoiceId: link.sourceChoiceId,
    sourceAge: link.sourceAge,
    eventId,
    age,
  }];
};

/** Henüz geri dönmemiş, oyuncu seçiminden doğan yankıların sayısı. */
export const countPendingEchoes = (scheduledEvents: ScheduledEvent[] | undefined): number => (
  (scheduledEvents ?? []).filter(entry => Boolean(entry.sourceChoiceId) && typeof entry.sourceAge === 'number').length
);
