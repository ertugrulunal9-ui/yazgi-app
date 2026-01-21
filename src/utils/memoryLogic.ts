
import { EventMemory } from '../types';

// Hafızadaki baskın duyguyu bulur
export const analyzeMemories = (memories: EventMemory[]) => {
  let regretScore = 0;
  let prideScore = 0;

  memories.forEach(mem => {
    const score = mem.weight === 'HIGH' ? 3 : mem.weight === 'MEDIUM' ? 2 : 1;
    
    if (['REGRET', 'GUILT'].includes(mem.emotion)) {
      regretScore += score;
    } else if (['PRIDE', 'SATISFACTION'].includes(mem.emotion)) {
      prideScore += score;
    }
  });

  return { regretScore, prideScore, totalMemories: memories.length };
};

// Hafızalardan rastgele bir örnek seçer (Metin içinde kullanmak için)
export const getRandomMemoryText = (memories: EventMemory[], emotionType: 'NEGATIVE' | 'POSITIVE'): string => {
  const targetMemories = memories.filter(m => 
    emotionType === 'NEGATIVE' 
      ? ['REGRET', 'GUILT'].includes(m.emotion)
      : ['PRIDE', 'SATISFACTION'].includes(m.emotion)
  );

  if (targetMemories.length === 0) return "";

  const randomMem = targetMemories[Math.floor(Math.random() * targetMemories.length)];
  
  // Özel Olay Kontrolleri (Test verisi 'found_wallet' için özel metin)
  if (randomMem.eventId === 'found_wallet') {
      if (emotionType === 'NEGATIVE') return "Bulduğun o cüzdanı sahibine vermediğin an aklına geliyor... Vicdanın sızlıyor.";
      if (emotionType === 'POSITIVE') return "O cüzdanı dürüstçe teslim ettiğin anı hatırlıyorsun. Doğru olanı yapmıştın.";
  }

  // Varsayılan Kalıp
  return `${randomMem.age} yaşındayken yaptığın o seçim aklına geliyor...`;
};
