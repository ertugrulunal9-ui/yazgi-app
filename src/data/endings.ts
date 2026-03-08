
import { GameState, Stats } from '../types';
import { tRuntime } from '../i18n/strings';

export interface EndingDefinition {
  id: string;
  title: string;          // Sonun Başlığı (Örn: Geleceğin CEO'su)
  description: string;    // Detaylı hikaye
  priority: number;       // Öncelik sırası (Yüksek olan önce kontrol edilir)
  condition: (gameState: GameState, stats: Stats) => boolean; // Bu sonun şartları
}

export const ENDINGS: EndingDefinition[] = [
  // 1. AKADEMİK DEHA (En Zor)
  {
    id: 'ivy_league',
    title: '',
    description: '',
    priority: 100,
    condition: (gameState, stats) => stats.intelligence >= 90 && gameState.traits.includes('DISCIPLINED')
  },
  
  // 2. YERALTI DÜNYASI (Asi Yol)
  {
    id: 'crime_lord',
    title: '',
    description: '',
    priority: 90,
    condition: (gameState, stats) => gameState.traits.includes('REBELLIOUS') && (gameState.traits.includes('CHEATER') || stats.intelligence < 40)
  },

  // 3. MEDYA YILDIZI (Sosyal Yol)
  {
    id: 'social_star',
    title: '',
    description: '',
    priority: 80,
    condition: (gameState, stats) => stats.charisma >= 80 || gameState.traits.includes('SOCIAL_BUTTERFLY')
  },

  // 4. ORTALAMA HAYAT (Fallback - Herkes buna düşebilir)
  {
    id: 'average_joe',
    title: '',
    description: '',
    priority: 1, // En düşük öncelik (diğerleri tutmazsa bu çalışır)
    condition: () => true // Her zaman true
  }
];

export const getEndingTitle = (endingId: string): string => {
  const ending = ENDINGS.find(e => e.id === endingId);
  return tRuntime(`endings.${endingId}.title`, undefined, ending?.title || endingId);
};

export const getEndingDescription = (endingId: string): string => {
  const ending = ENDINGS.find(e => e.id === endingId);
  return tRuntime(`endings.${endingId}.description`, undefined, ending?.description || '');
};
