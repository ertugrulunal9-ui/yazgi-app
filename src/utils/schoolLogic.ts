import { SchoolGrades, Family, Stats } from '../types';

export const getLetterGrade = (score: number): string => {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
};

export interface SchoolReport {
  math: number;
  science: number;
  language: number;
  averageGrade: number;
}

export const calculateSchoolReport = (stats: Stats, gameState: any): SchoolGrades => {
  // Temel puan: Zeka
  const baseScore = stats.intelligence * 1.2;
  
  // Stres cezası: Enerji ne kadar düşükse stres o kadar yüksek
  const stress = 100 - stats.energy;
  const stressPenalty = stress * 0.15;
  
  // Şans faktörü
  const luck = Math.floor(Math.random() * 10);
  
  // Temel notlar
  let math = Math.floor(baseScore - stressPenalty + luck);
  let science = Math.floor(baseScore - stressPenalty + luck);
  let language = Math.floor(baseScore - stressPenalty + luck + (stats.health > 70 ? 5 : 0));
  
  // Trait bonusları
  if (gameState?.traits?.includes('GENIUS')) {
    math += 10;
    science += 10;
    language += 5;
  }
  
  if (gameState?.traits?.includes('BOOKWORM')) {
    language += 10;
  }
  
  // Clamp to 0-100
  math = Math.max(0, Math.min(100, math));
  science = Math.max(0, Math.min(100, science));
  language = Math.max(0, Math.min(100, language));
  
  return { math, science, language };
};

export interface FamilyReaction {
  message: string;
  effect: Partial<Stats>;
}

export const getFamilyReactionToGrades = (grades: SchoolGrades, family: Family): FamilyReaction => {
  const average = (grades.math + grades.science + grades.language) / 3;
  
  // Base reaction by family wealth
  const wealthMultiplier = family.wealth === 'RICH' ? 1.2 : family.wealth === 'POOR' ? 0.8 : 1;
  const adjustedAverage = average * wealthMultiplier;
  
  // Family dynamic reactions
  if (family.dynamic === 'SUPPORTIVE') {
    if (adjustedAverage >= 80) {
      return {
        message: "Ailenin seni gördüğü andan itibaren gözlerinde mutluluk çiçeğendi. 'Çok gurur duyuyoruz!' dediler.",
        effect: { charisma: 10, familyRelation: 15 }
      };
    } else if (adjustedAverage >= 60) {
      return {
        message: "Annen seni kucaklamaya gitti. 'İyi çalıştığını biliyoruz, devam et,' dedi.",
        effect: { familyRelation: 10 }
      };
    } else {
      return {
        message: "Ailen biraz hayal kırıklığına uğradı ama destek sunmaya devam etti. 'Geçen sene daha iyiydin,'",
        effect: { familyRelation: 5 }
      };
    }
  } else if (family.dynamic === 'STRICT') {
    if (adjustedAverage >= 85) {
      return {
        message: "Baban gözlüğünü çıkararak seni inceledi. 'Beklediğim tam bu. Devam et.'",
        effect: { discipline: 15, money: 50 }
      };
    } else if (adjustedAverage >= 70) {
      return {
        message: "Baban notlara baktı. 'Daha iyisi olabilir. Matematik'e daha çok çalış.'",
        effect: { discipline: 5 }
      };
    } else {
      return {
        message: "Baban masaya yumruk vurdu. 'Bu notlar beni hüsrana uğratıyor! Derhal çalışmalısın!'",
        effect: { discipline: -10, familyRelation: -10 }
      };
    }
  } else {
    // CHAOTIC
    if (adjustedAverage >= 70) {
      return {
        message: "Ailen notlara ilgilenmedi bile. Senin başarın senin işin.",
        effect: { }
      };
    } else {
      return {
        message: "Ailen havaya girdi. 'Ne yapıyorsun sen? Hiç umrumda değil ama yine de başarısızsın.'",
        effect: { familyRelation: -5, money: -20 }
      };
    }
  }
};