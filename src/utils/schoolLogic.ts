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
  // ===============================
  // YENİ DENGE SİSTEMİ
  // ===============================
  // Felsefe: Ders çalışma ASIL belirleyici, zeka sadece BONUS
  // Mevcut notlar %70 ağırlıkta, zeka bonusu %30 ağırlıkta

  const currentGrades = gameState?.schoolGrades || {
    math: 50, science: 50, language: 50, turkish: 50, history: 50, geography: 50, art: 50, music: 50
  };

  // Zeka bonusu (0-20 arası, zeka 100 ise max 20 puan bonus)
  const intelligenceBonus = Math.floor(stats.intelligence * 0.2);

  // Stres cezası (azaltılmış: max -8 puan)
  const stress = 100 - stats.energy;
  const stressPenalty = Math.floor(stress * 0.08);

  // Küçük şans faktörü (-3 ile +5 arası)
  const luck = Math.floor(Math.random() * 9) - 3;

  // Disiplin bonusu (çalışkanlık ödülü: max +10)
  const disciplineBonus = Math.floor(stats.discipline * 0.1);

  // Her ders için hesaplama
  const calculateSubjectGrade = (subjectKey: keyof SchoolGrades, extraBonus: number = 0): number => {
    // Mevcut not (çalışarak kazanılmış) %70 ağırlıkta
    const studyBase = currentGrades[subjectKey] * 0.7;

    // Zeka + disiplin bonusu %30 ağırlıkta (50 üzerine eklenir)
    const potentialBonus = (50 + intelligenceBonus + disciplineBonus + extraBonus) * 0.3;

    // Toplam = çalışma + potansiyel - stres + şans
    let total = studyBase + potentialBonus - stressPenalty + luck;

    // Minimum garanti: En az 35 + (mevcut not / 5)
    // Yani 80 puan çalışmışsan en az 35 + 16 = 51 alırsın
    const minGuarantee = 35 + Math.floor(currentGrades[subjectKey] / 5);
    total = Math.max(total, minGuarantee);

    return total;
  };

  // Trait bonusları hesapla
  let mathBonus = 0, scienceBonus = 0, languageBonus = 0, turkishBonus = 0, historyBonus = 0, geographyBonus = 0, artBonus = 0, musicBonus = 0;

  if (gameState?.traits?.includes('GENIUS')) {
    mathBonus += 12;
    scienceBonus += 12;
    languageBonus += 6;
  }

  if (gameState?.traits?.includes('BOOKWORM')) {
    languageBonus += 12;
    turkishBonus += 10;
    historyBonus += 8;
  }
  if (gameState?.traits?.includes('CREATIVE')) {
    artBonus += 12;
    musicBonus += 10;
  }

  if (gameState?.traits?.includes('ORGANIZED')) {
    mathBonus += 5;
    scienceBonus += 5;
  }

  if (gameState?.traits?.includes('DISCIPLINED')) {
    mathBonus += 5;
    scienceBonus += 5;
    historyBonus += 3;
  }

  // Sağlık ve karizma küçük bonuslar
  if (stats.health > 70) languageBonus += 3;
  if (stats.charisma > 50) turkishBonus += 3;
  if (stats.charisma > 60) artBonus += 4;
  if (stats.intelligence > 60) musicBonus += 3;

  // Notları hesapla
  let math = calculateSubjectGrade('math', mathBonus);
  let science = calculateSubjectGrade('science', scienceBonus);
  let language = calculateSubjectGrade('language', languageBonus);
  let turkish = calculateSubjectGrade('turkish', turkishBonus);
  let history = calculateSubjectGrade('history', historyBonus);
  let geography = calculateSubjectGrade('geography', geographyBonus);
  let art = calculateSubjectGrade('art', artBonus);
  let music = calculateSubjectGrade('music', musicBonus);

  // Clamp to 0-100
  const clamp = (val: number) => Math.max(0, Math.min(100, Math.floor(val)));

  return {
    math: clamp(math),
    science: clamp(science),
    language: clamp(language),
    turkish: clamp(turkish),
    history: clamp(history),
    geography: clamp(geography),
    art: clamp(art),
    music: clamp(music),
  };
};


export interface FamilyReaction {
  message: string;
  effect: Partial<Stats>;
}

export const getFamilyReactionToGrades = (grades: SchoolGrades, family: Family): FamilyReaction => {
  const average = calculateGradeAverage(grades);

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
        effect: {}
      };
    } else {
      return {
        message: "Ailen havaya girdi. 'Ne yapıyorsun sen? Hiç umrumda değil ama yine de başarısızsın.'",
        effect: { familyRelation: -5, money: -20 }
      };
    }
  }
};

// =================================================================
// YIL SONU SONUÇLARI VE KISITLAMA SİSTEMİ
// =================================================================

export type RestrictionType = 'COMPUTER' | 'PHONE' | 'PARTY' | 'FRIENDS' | 'GAMES' | 'TV';
export type RewardType = 'NEW_PHONE' | 'ALLOWANCE_INCREASE' | 'VACATION' | 'NEW_GAME' | 'FREEDOM';

export interface YearEndConsequence {
  message: string;
  restrictions: RestrictionType[];
  rewards: RewardType[];
  statEffects: Partial<Stats>;
  allowanceMultiplier: number; // 1.0 = normal, 0.5 = yarı, 1.5 = artış
  durationWeeks: number; // Kısıtlama süresi (oyun içi hafta)
}

// Ortalama hesaplama (tüm dersler)
export const calculateGradeAverage = (grades: SchoolGrades): number => {
  const subjects = [grades.math, grades.science, grades.language, grades.turkish, grades.history, grades.geography, grades.art, grades.music];
  return subjects.reduce((sum, grade) => sum + grade, 0) / subjects.length;
};

// Yıl sonu sonuçları hesaplama
export const getYearEndConsequences = (
  grades: SchoolGrades,
  family: Family
): YearEndConsequence => {
  const average = calculateGradeAverage(grades);

  // Mükemmel notlar (85+)
  if (average >= 85) {
    const rewards: RewardType[] = ['ALLOWANCE_INCREASE'];
    let message = '';
    let allowanceMultiplier = 1.5;
    const statEffects: Partial<Stats> = { charisma: 5, familyRelation: 15 };

    if (family.dynamic === 'STRICT') {
      message = '🎉 Baban sana yeni bir telefon aldı! "Bu başarının ödülü," dedi.';
      rewards.push('NEW_PHONE');
      statEffects.money = family.wealth === 'RICH' ? 500 : 200;
    } else if (family.dynamic === 'SUPPORTIVE') {
      message = '🎊 Ailen seninle gurur duyuyor! Yaz tatilinde istediğin yere gidebilirsin.';
      rewards.push('VACATION', 'FREEDOM');
      statEffects.money = family.wealth === 'RICH' ? 300 : 100;
    } else {
      message = '👍 Notların iyi. Ailen pek umursamadı ama en azından özgürsün.';
      rewards.push('FREEDOM');
      allowanceMultiplier = 1.2;
    }

    return {
      message,
      restrictions: [],
      rewards,
      statEffects,
      allowanceMultiplier,
      durationWeeks: 0,
    };
  }

  // İyi notlar (70-84)
  if (average >= 70) {
    return {
      message: family.dynamic === 'STRICT'
        ? '📚 Baban: "Fena değil ama daha iyisini bekliyordum. Yaz boyunca biraz daha çalış."'
        : '👍 Ailen notlarından memnun. Normal bir yaz tatili geçireceksin.',
      restrictions: [],
      rewards: family.dynamic === 'SUPPORTIVE' ? ['FREEDOM'] : [],
      statEffects: { familyRelation: 5 },
      allowanceMultiplier: 1.0,
      durationWeeks: 0,
    };
  }

  // Orta notlar (50-69)
  if (average >= 50) {
    const restrictions: RestrictionType[] = family.dynamic === 'STRICT'
      ? ['GAMES', 'TV']
      : [];

    return {
      message: family.dynamic === 'STRICT'
        ? '😤 Baban: "Bu notlar kabul edilemez! Yaz boyunca oyun ve televizyon yasak."'
        : family.dynamic === 'SUPPORTIVE'
          ? '😟 Annen: "Seneye daha iyi olacak, değil mi? Biraz daha çalışmalısın."'
          : '🙄 Ailen notlara aldırmadı bile.',
      restrictions,
      rewards: [],
      statEffects: family.dynamic === 'STRICT' ? { familyRelation: -5, discipline: 5 } : {},
      allowanceMultiplier: family.dynamic === 'STRICT' ? 0.75 : 1.0,
      durationWeeks: family.dynamic === 'STRICT' ? 4 : 0,
    };
  }

  // Kötü notlar (50 altı) - Ciddi kısıtlamalar
  const restrictions: RestrictionType[] = ['COMPUTER', 'PHONE', 'PARTY', 'FRIENDS', 'GAMES', 'TV'];

  if (family.dynamic === 'CHAOTIC') {
    // Kaotik aile: Kısıtlama yok ama duygusal zarar
    return {
      message: '😒 Ailen notlara baktı bile değil. "Senin hayatın, senin sorunun" dediler.',
      restrictions: [],
      rewards: [],
      statEffects: { familyRelation: -10 },
      allowanceMultiplier: 0.8,
      durationWeeks: 0,
    };
  }

  return {
    message: family.dynamic === 'STRICT'
      ? '😡 Baban masaya yumruk vurdu: "BU NOTLAR NE?! Telefon, bilgisayar, arkadaşlar... Hepsi yasak! Harçlığın da yarıya düşüyor!"'
      : '😢 Annen üzgün bir şekilde: "Seni çok seviyoruz ama bu notlarla bir şeyler değişmeli. Bu yaz biraz kısıtlama olacak."',
    restrictions: family.dynamic === 'STRICT' ? restrictions : ['COMPUTER', 'GAMES'],
    rewards: [],
    statEffects: {
      familyRelation: family.dynamic === 'STRICT' ? -15 : -5,
      discipline: family.dynamic === 'STRICT' ? 10 : 5,
    },
    allowanceMultiplier: 0.5,
    durationWeeks: family.dynamic === 'STRICT' ? 8 : 4,
  };
};

// Kısıtlama kontrolü - Belirli bir aktivite kısıtlanmış mı?
export const isActivityRestricted = (
  activityId: string,
  restrictions: RestrictionType[]
): boolean => {
  const activityRestrictionMap: Record<string, RestrictionType[]> = {
    'computer_game': ['COMPUTER', 'GAMES'],
    'computer_browse': ['COMPUTER'],
    'computer_code': ['COMPUTER'],
    'social_party': ['PARTY'],
    'social_friends': ['FRIENDS'],
    // Daha fazla aktivite eklenebilir
  };

  const requiredRestrictions = activityRestrictionMap[activityId] || [];
  return requiredRestrictions.some(r => restrictions.includes(r));
};
