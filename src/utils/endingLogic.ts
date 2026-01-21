
import { GameState, Stats, EventMemory } from '../types';
import { ENDINGS, EndingDefinition } from '../data/endings';

// State ve Stats'a göre en uygun sonu bulur
export const determineEnding = (gameState: GameState, stats: Stats): EndingDefinition => {
  // Priority'ye göre sırala (Yüksekten düşüğe)
  const sortedEndings = [...ENDINGS].sort((a, b) => b.priority - a.priority);

  // Şartı sağlayan ilk sonu döndür
  // Not: ENDINGS tanımında condition fonksiyonu (gameState, stats) alacak şekilde ayarlanmıştı.
  const matchedEnding = sortedEndings.find(ending => ending.condition(gameState, stats));

  // Hiçbiri uymazsa (Fallback - average_joe) sonuncuyu döndür
  return matchedEnding || ENDINGS[ENDINGS.length - 1];
};

// En önemli 3 anıyı seçer (Ekranda göstermek için)
export const getKeyMemories = (memories: EventMemory[]): EventMemory[] => {
  const weightScore = (w: string) => {
      if (w === 'HIGH') return 3;
      if (w === 'MEDIUM') return 2;
      return 1;
  };

  // Weight'i yüksek olanları önce getir, eşitse en son yaşananı (timestamp) öne al
  return [...memories]
    .sort((a, b) => {
        const scoreDiff = weightScore(b.weight) - weightScore(a.weight);
        if (scoreDiff !== 0) return scoreDiff;
        return b.turnTimestamp - a.turnTimestamp;
    }) 
    .slice(0, 3); // İlk 3'ünü al
};
