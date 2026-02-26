
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
    title: 'Prestijli Akademisyen',
    description: 'Liseden dereceyle mezun oldun. Dünyanın en iyi üniversitelerinden burs teklifleri yağıyor. Bilim dünyası yeni bir dahi kazandı.',
    priority: 100,
    condition: (gameState, stats) => stats.intelligence >= 90 && gameState.traits.includes('DISCIPLINED')
  },
  
  // 2. YERALTI DÜNYASI (Asi Yol)
  {
    id: 'crime_lord',
    title: 'Yeraltı Figürü',
    description: 'Okul sana göre değildi, kurallar da öyle. Sokakların dilini öğrendin. Şimdi kendi kurallarını koyuyorsun, ama bunun bedeli ağır olabilir.',
    priority: 90,
    condition: (gameState, stats) => gameState.traits.includes('REBELLIOUS') && (gameState.traits.includes('CHEATER') || stats.intelligence < 40)
  },

  // 3. MEDYA YILDIZI (Sosyal Yol)
  {
    id: 'social_star',
    title: 'Medya İkonu',
    description: 'İnsanlar seni seviyor. Karizman ve sosyal zekanla kapıları açtın. Belki notların mükemmel değildi ama herkes senin adını biliyor.',
    priority: 80,
    condition: (gameState, stats) => stats.charisma >= 80 || gameState.traits.includes('SOCIAL_BUTTERFLY')
  },

  // 4. ORTALAMA HAYAT (Fallback - Herkes buna düşebilir)
  {
    id: 'average_joe',
    title: 'Standart Vatandaş',
    description: 'Lise bitti. Ne çok iyi ne çok kötü geçti. Önünde sıradan bir üniversite veya memuriyet hayatı var. Belki de macera yeni başlıyordur?',
    priority: 1, // En düşük öncelik (diğerleri tutmazsa bu çalışır)
    condition: () => true // Her zaman true
  }
];

export const getEndingTitle = (endingId: string): string => {
  const ending = ENDINGS.find(e => e.id === endingId);
  return tRuntime(`endings.${endingId}.title`, undefined, ending?.title ?? endingId);
};

export const getEndingDescription = (endingId: string): string => {
  const ending = ENDINGS.find(e => e.id === endingId);
  return tRuntime(`endings.${endingId}.description`, undefined, ending?.description ?? '');
};
