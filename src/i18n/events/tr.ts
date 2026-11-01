import type { EventTranslationCatalog } from './types';

// Türkçe olay metinlerinin tek kaynağı olay verisidir (src/data); bu katalog bilerek boş.
// tr.generated.ts Mart 2026'dan kalma eski bir kopya: bağlanırsa kaynağı ezer ve oyuncuya
// harfsiz metin, NPC adı yerine "Arkadasin", hedefe göre değişmeyen metin gösterir.
// __tests__/i18n/trEventSourceText.test.ts korur.
export const trEventTranslations: EventTranslationCatalog = {};
