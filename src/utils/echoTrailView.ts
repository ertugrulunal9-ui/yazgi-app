/**
 * Yazgı İzi kayıtlarını ekranda gösterilecek metinlere çevirir:
 * kaynak seçimin metni ve geri dönen olayın ilk cümlesi, oyun dilinde.
 */
import { EVENTS } from '../data/events';
import { tRuntime } from '../i18n/strings';
import type { Choice, EchoTrailEntry, GameEvent } from '../types';

export interface EchoTrailItem {
  key: string;
  sourceAge: number;
  age: number;
  choiceText: string;
  summary: string;
}

const findEvent = (eventId: string): GameEvent | undefined => EVENTS.find(event => event.id === eventId);

/** Olay metninin ilk cümlesi (uzun olay metinleri iz satırında kısa kalsın diye). */
const summarize = (event: GameEvent | undefined): string => {
  if (!event || typeof event.text !== 'string') return '';
  const text = event.textKey ? tRuntime(event.textKey, undefined, event.text) : event.text;
  const firstSentence = text.split(/(?<=[.!?…])\s+/)[0] ?? text;
  return firstSentence.length > 140 ? `${firstSentence.slice(0, 137).trimEnd()}…` : firstSentence;
};

const choiceTextOf = (event: GameEvent | undefined, choiceId: string): string => {
  const choice = event?.choices.find((c): c is Choice => typeof c !== 'function' && c.id === choiceId);
  if (!choice) return '';
  return choice.textKey ? tRuntime(choice.textKey, undefined, choice.text) : choice.text;
};

/**
 * En belirleyici yankılar: seçimle geri dönüşü arasındaki süre en uzun olanlar
 * (eşitlikte daha geç gelen). Sonuç, hikâye gibi okunsun diye yaş sırasıyla döner.
 */
export const pickDefiningEchoes = (items: EchoTrailItem[], limit = 3): EchoTrailItem[] => (
  [...items]
    .sort((a, b) => (b.age - b.sourceAge) - (a.age - a.sourceAge) || b.age - a.age)
    .slice(0, limit)
    .sort((a, b) => a.sourceAge - b.sourceAge || a.age - b.age)
);

/** Paylaşım kartı için tek satır: en belirleyici yankı. */
export const buildEchoShareLine = (items: EchoTrailItem[]): string | null => {
  const [top] = pickDefiningEchoes(items, 1);
  if (!top) return null;
  return tRuntime('endings.shareCard.echoLine', { from: top.sourceAge, choice: top.choiceText, to: top.age });
};

/** Olayı ya da seçimi artık bulunamayan (ör. içerikten kaldırılmış) kayıtlar atlanır. */
export const buildEchoTrailItems = (log: EchoTrailEntry[] | undefined): EchoTrailItem[] => (
  (log ?? []).flatMap((entry, index) => {
    const choiceText = choiceTextOf(findEvent(entry.sourceEventId), entry.sourceChoiceId);
    const summary = summarize(findEvent(entry.eventId));
    if (!choiceText || !summary) return [];
    return [{
      key: `${entry.eventId}-${entry.age}-${index}`,
      sourceAge: entry.sourceAge,
      age: entry.age,
      choiceText,
      summary,
    }];
  })
);
