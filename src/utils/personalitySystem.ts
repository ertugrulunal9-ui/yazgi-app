
import {
  Personality,
  StressState,
  PersonalityShift,
  PersonalityEffect,
  PersonalityRequirement,
  Choice,
  GameEvent,
  EventContext,
  Family,
} from '../types';

// =================================================================
// KİŞİLİK SİSTEMİ YARDIMCI FONKSİYONLARI
// "Karakter = Kader"
// =================================================================

/**
 * Varsayılan kişilik profili
 * Oyun başlangıcında aile ve genetik faktörlere göre modifiye edilir
 */
export const DEFAULT_PERSONALITY: Personality = {
  openness: 50,     // Orta - ne içe kapanık ne dışa dönük
  courage: 50,      // Orta - ne korkak ne gözü kara
  empathy: 50,      // Orta - ne bencil ne fedakar
  patience: 50,     // Orta - ne dürtüsel ne sabırlı
  conformity: 50,   // Orta - ne uyumcu ne isyankar
};

/**
 * Varsayılan stres durumu
 */
export const DEFAULT_STRESS: StressState = {
  current: 0,
  threshold: 70,
  turnsSinceBreakdown: 0,
  sources: [],
};

/**
 * Aile dinamiğine göre başlangıç kişiliği oluştur
 */
export function generateInitialPersonality(family: Family | null, traits: string[]): Personality {
  const personality = { ...DEFAULT_PERSONALITY };

  // Aile dinamiği etkisi
  if (family) {
    switch (family.dynamic) {
      case 'STRICT':
        personality.conformity += 15;    // Kurallara daha uyumlu
        personality.courage -= 10;       // Daha temkinli
        personality.patience += 10;      // Daha sabırlı (zorunlu)
        break;
      case 'SUPPORTIVE':
        personality.openness += 10;      // Daha açık
        personality.courage += 10;       // Daha cesur
        personality.empathy += 10;       // Daha empatik
        break;
      case 'CHAOTIC':
        personality.conformity -= 15;    // Daha isyankar
        personality.patience -= 10;      // Daha dürtüsel
        personality.courage += 5;        // Biraz daha cesur
        break;
    }

    // Ekonomik durum etkisi
    switch (family.wealth) {
      case 'POOR':
        personality.patience += 10;      // Zorunlu sabır
        personality.empathy += 5;        // Zor günler empati geliştirir
        break;
      case 'RICH':
        personality.openness += 5;       // Daha sosyal fırsatlar
        personality.patience -= 10;      // Her şey hemen olmuş
        break;
    }
  }

  // Genetik trait etkisi
  if (traits.includes('CHARISMATIC')) {
    personality.openness += 20;
  }
  if (traits.includes('SICKLY')) {
    personality.courage -= 15;
    personality.openness -= 10;
  }
  if (traits.includes('ATHLETIC')) {
    personality.courage += 10;
    personality.openness += 5;
  }
  if (traits.includes('GENIUS')) {
    personality.patience += 10;
    personality.openness -= 5; // Biraz daha içe dönük
  }

  // Sınırları uygula
  return clampPersonality(personality);
}

/**
 * Kişilik değerlerini 0-100 arasında tut
 */
export function clampPersonality(personality: Personality): Personality {
  return {
    openness: Math.max(0, Math.min(100, personality.openness)),
    courage: Math.max(0, Math.min(100, personality.courage)),
    empathy: Math.max(0, Math.min(100, personality.empathy)),
    patience: Math.max(0, Math.min(100, personality.patience)),
    conformity: Math.max(0, Math.min(100, personality.conformity)),
  };
}

/**
 * Seçimin kişiliğe etkisini uygula
 */
export function applyPersonalityEffects(
  currentPersonality: Personality,
  effects: PersonalityEffect[],
  age: number,
  turn: number,
  reason: string
): { newPersonality: Personality; shifts: PersonalityShift[] } {
  const newPersonality = { ...currentPersonality };
  const shifts: PersonalityShift[] = [];

  for (const effect of effects) {
    const oldValue = currentPersonality[effect.axis];

    // Yaşa göre değişim miktarını ayarla
    // Küçük yaşlarda kişilik daha kolay değişir
    const ageMultiplier = age < 10 ? 1.5 : age < 15 ? 1.2 : 1.0;
    const actualChange = Math.round(effect.change * ageMultiplier);

    newPersonality[effect.axis] = Math.max(0, Math.min(100, oldValue + actualChange));

    if (actualChange !== 0) {
      shifts.push({
        axis: effect.axis,
        oldValue,
        newValue: newPersonality[effect.axis],
        reason,
        turn,
        age,
      });
    }
  }

  return { newPersonality: clampPersonality(newPersonality), shifts };
}

/**
 * Stres hesapla ve güncelle
 */
export function updateStress(
  currentStress: StressState,
  stressChange: number,
  reason: string,
  turn: number
): StressState {
  const newStress = { ...currentStress };

  // Stres değişimini uygula
  newStress.current = Math.max(0, Math.min(100, newStress.current + stressChange));

  // Kaynak ekle (son 10 kaynağı tut)
  if (stressChange !== 0) {
    newStress.sources = [
      { reason, amount: stressChange, turn },
      ...newStress.sources.slice(0, 9),
    ];
  }

  // Her turda breakdown sayacını güncelle
  newStress.turnsSinceBreakdown++;

  return newStress;
}

/**
 * Doğal stres azalması (her tur)
 */
export function getStressRecoveryRate(stress: StressState, personality: Personality): number {
  // Sabırlı karakterler daha hızlı toparlar
  const baseRate = personality.patience > 70 ? 5 : personality.patience > 40 ? 3 : 2;

  // Eşik aşılınca vücut acil toparlanma moduna girer: her 10 puan üstü için +2 bonus
  const aboveThreshold = Math.max(0, stress.current - stress.threshold);
  const urgencyBonus = Math.floor(aboveThreshold / 10) * 2;
  return baseRate + urgencyBonus;
}

export function naturalStressRecovery(stress: StressState, personality: Personality): StressState {
  const newStress = { ...stress };
  const recoveryRate = getStressRecoveryRate(newStress, personality);
  newStress.current = Math.max(0, newStress.current - recoveryRate);

  return newStress;
}

/**
 * Breakdown riski hesapla (0-100)
 */
export function calculateBreakdownRisk(stress: StressState, personality: Personality): number {
  if (stress.current < stress.threshold) return 0;

  // Stres eşiğini aştıysa risk başlar — ilk 5 puan "uyarı bölgesi" (henüz gerçek risk değil)
  const rawOverThreshold = stress.current - stress.threshold;
  const effectiveOverThreshold = Math.max(0, rawOverThreshold - 5);
  if (effectiveOverThreshold === 0) return 0;

  // Sabırsız karakterler daha kolay patlar
  const patienceMultiplier = personality.patience < 30 ? 1.5 : personality.patience < 50 ? 1.2 : 1.0;

  // Son breakdown'dan bu yana geçen süre
  const timeMultiplier = stress.turnsSinceBreakdown < 10 ? 0.5 : 1.0; // Yakın zamanda patladıysa tolerans

  return Math.min(100, effectiveOverThreshold * patienceMultiplier * timeMultiplier);
}

/**
 * Event'in kişilik gereksinimlerini karşılayıp karşılamadığını kontrol et
 */
export function checkPersonalityRequirements(
  personality: Personality,
  requirements: PersonalityRequirement[] | undefined
): boolean {
  if (!requirements || requirements.length === 0) return true;

  return requirements.every((req) => {
    const value = personality[req.axis];
    if (req.min !== undefined && value < req.min) return false;
    if (req.max !== undefined && value > req.max) return false;
    return true;
  });
}

/**
 * Stres gereksinimini kontrol et
 */
export function checkStressRequirement(
  stress: StressState,
  requirement: { min?: number; max?: number } | undefined
): boolean {
  if (!requirement) return true;
  if (requirement.min !== undefined && stress.current < requirement.min) return false;
  if (requirement.max !== undefined && stress.current > requirement.max) return false;
  return true;
}

/**
 * Seçeneğin kişiliğe uygunluğunu hesapla
 * Düşük uyum = yüksek stres maliyeti
 */
export function calculateChoiceStressCost(
  choice: Choice,
  personality: Personality,
  baseStress: number = 0
): number {
  let stressCost = baseStress;

  // Eğer seçenek CHALLENGE tipindeyse, kişiliğe göre ekstra stres
  if (choice.choiceType === 'CHALLENGE') {
    // Seçeneğin gerektirdiği kişilik özelliklerine bak
    if (choice.reqPersonality) {
      for (const req of choice.reqPersonality) {
        const currentValue = personality[req.axis];

        // Eğer karakter bu alanda zayıfsa, ekstra stres
        if (req.min && currentValue < req.min) {
          stressCost += Math.round((req.min - currentValue) / 5);
        }
        if (req.max && currentValue > req.max) {
          stressCost += Math.round((currentValue - req.max) / 5);
        }
      }
    }
  }

  // Seçeneğin kendi stres etkisi
  if (choice.stressEffect) {
    stressCost += choice.stressEffect;
  }

  return stressCost;
}

/**
 * Kişilik profiline göre karakter tipi belirle
 */
export type PersonalityArchetype =
  | 'INTROVERT_CAUTIOUS'   // İçe kapanık + temkinli
  | 'INTROVERT_BRAVE'      // İçe kapanık + cesur (sessiz kahraman)
  | 'EXTROVERT_CAUTIOUS'   // Dışa dönük + temkinli (sosyal ama güvenli)
  | 'EXTROVERT_BRAVE'      // Dışa dönük + cesur (lider tipi)
  | 'EMPATH'               // Yüksek empati
  | 'PRAGMATIST'           // Düşük empati + yüksek sabır
  | 'REBEL'                // Düşük uyum
  | 'CONFORMIST'           // Yüksek uyum
  | 'BALANCED';            // Ortalama

export function getPersonalityArchetype(personality: Personality): PersonalityArchetype {
  const { openness, courage, empathy, patience, conformity } = personality;

  // Dominant özelliklere göre arketip belirle
  if (openness < 30 && courage < 30) return 'INTROVERT_CAUTIOUS';
  if (openness < 30 && courage > 70) return 'INTROVERT_BRAVE';
  if (openness > 70 && courage < 30) return 'EXTROVERT_CAUTIOUS';
  if (openness > 70 && courage > 70) return 'EXTROVERT_BRAVE';
  if (empathy > 75) return 'EMPATH';
  if (empathy < 25 && patience > 60) return 'PRAGMATIST';
  if (conformity < 25) return 'REBEL';
  if (conformity > 75) return 'CONFORMIST';

  return 'BALANCED';
}

/**
 * Kişilik arketipine göre Türkçe açıklama
 */
export function getArchetypeDescription(archetype: PersonalityArchetype): string {
  switch (archetype) {
    case 'INTROVERT_CAUTIOUS':
      return 'İçine kapanık ve temkinli. Güvenli seçimler yapıyor, riskten kaçınıyor.';
    case 'INTROVERT_BRAVE':
      return 'Sessiz ama cesur. Tek başına büyük işler başarabilir.';
    case 'EXTROVERT_CAUTIOUS':
      return 'Sosyal ama dikkatli. İnsanları seviyor ama maceradan kaçınıyor.';
    case 'EXTROVERT_BRAVE':
      return 'Doğal lider. Hem sosyal hem de risk almaktan korkmuyor.';
    case 'EMPATH':
      return 'Derin empatik. Başkalarının acısını kendi acısı gibi hissediyor.';
    case 'PRAGMATIST':
      return 'Pragmatik. Duygulardan çok mantığa göre karar veriyor.';
    case 'REBEL':
      return 'İsyankar ruh. Kurallara ve otoriteye karşı.';
    case 'CONFORMIST':
      return 'Uyumcu. Kurallara saygılı, toplum normlarına bağlı.';
    case 'BALANCED':
      return 'Dengeli kişilik. Duruma göre adapte olabiliyor.';
  }
}

/**
 * Kişiliğe göre iç ses (inner thought) üret
 */
export function generateInnerThought(
  personality: Personality,
  stress: StressState,
  context: 'SOCIAL' | 'RISK' | 'MORAL' | 'DAILY'
): string {
  const archetype = getPersonalityArchetype(personality);

  // Yüksek stres durumunda
  if (stress.current > 70) {
    const stressThoughts = [
      'Kafam çok karışık...',
      'Nefes almakta zorlanıyorum.',
      'Her şey çok fazla...',
      'Biraz yalnız kalmam lazım.',
      'Patlayacak gibi hissediyorum.',
    ];
    return stressThoughts[Math.floor(Math.random() * stressThoughts.length)];
  }

  // Arketip ve bağlama göre düşünceler
  if (context === 'SOCIAL') {
    switch (archetype) {
      case 'INTROVERT_CAUTIOUS':
        return 'Keşke evde kalsaydım...';
      case 'INTROVERT_BRAVE':
        return 'İnsanlar yoruyor ama yapılması gereken şey belli.';
      case 'EXTROVERT_CAUTIOUS':
        return 'İnsanlarla olmak güzel ama dikkatli olmalıyım.';
      case 'EXTROVERT_BRAVE':
        return 'Hadi biraz ortamı ısıtalım!';
      case 'EMPATH':
        return 'Herkesin ne hissettiğini anlayabiliyorum.';
      default:
        return 'Bakalım bugün neler olacak.';
    }
  }

  if (context === 'RISK') {
    if (personality.courage > 70) {
      return 'Risk almadan kazanılmaz!';
    } else if (personality.courage < 30) {
      return 'Bu çok tehlikeli görünüyor...';
    }
    return 'Düşünmem lazım...';
  }

  if (context === 'MORAL') {
    if (personality.empathy > 70) {
      return 'Doğru olanı yapmalıyım, ne pahasına olursa olsun.';
    } else if (personality.empathy < 30) {
      return 'Önce kendimi düşünmeliyim.';
    }
    return 'Bu zor bir karar...';
  }

  return 'Hayat devam ediyor.';
}

/**
 * Event'leri kişiliğe göre filtrele ve sırala
 */
export function filterEventsByPersonality(
  events: GameEvent[],
  ctx: EventContext
): GameEvent[] {
  return events.filter((event) => {
    // Kişilik gereksinimlerini kontrol et
    if (!checkPersonalityRequirements(ctx.personality, event.reqPersonality)) {
      return false;
    }

    // Stres gereksinimini kontrol et
    if (!checkStressRequirement(ctx.stress, event.reqStress)) {
      return false;
    }

    return true;
  });
}

/**
 * Kişiliğe göre seçenekleri zenginleştir
 * PASSIVE seçenekleri kişiliğe uygun olanlara işaretle
 */
export function enrichChoicesWithPersonality(
  choices: Choice[],
  personality: Personality,
  _event: GameEvent
): Choice[] {
  return choices.map((choice) => {
    const enrichedChoice = { ...choice };

    // Seçeneğin stres maliyetini hesapla
    const stressCost = calculateChoiceStressCost(choice, personality);

    // Dinamik feedback varsa, kişiliğe göre seç
    if (choice.dynamicFeedback) {
      const fb = choice.dynamicFeedback;
      if (personality.openness < 30 && fb.introvert) {
        enrichedChoice.feedback = fb.introvert;
      } else if (personality.openness > 70 && fb.extrovert) {
        enrichedChoice.feedback = fb.extrovert;
      } else if (personality.courage > 70 && fb.brave) {
        enrichedChoice.feedback = fb.brave;
      } else if (personality.courage < 30 && fb.cautious) {
        enrichedChoice.feedback = fb.cautious;
      } else if (personality.empathy > 70 && fb.empathetic) {
        enrichedChoice.feedback = fb.empathetic;
      } else if (personality.empathy < 30 && fb.selfish) {
        enrichedChoice.feedback = fb.selfish;
      }
    }

    // Stres maliyetini seçeneğe ekle
    if (!enrichedChoice.stressEffect) {
      enrichedChoice.stressEffect = stressCost;
    }

    return enrichedChoice;
  });
}

/**
 * Kişilik ekseninin Türkçe adı
 */
export function getPersonalityAxisName(axis: keyof Personality): string {
  switch (axis) {
    case 'openness': return 'Açıklık';
    case 'courage': return 'Cesaret';
    case 'empathy': return 'Empati';
    case 'patience': return 'Sabır';
    case 'conformity': return 'Uyum';
  }
}

/**
 * Kişilik değerine göre seviye açıklaması
 */
export function getPersonalityLevelDescription(axis: keyof Personality, value: number): string {
  const descriptions: Record<keyof Personality, { low: string; mid: string; high: string }> = {
    openness: {
      low: 'İçe kapanık',
      mid: 'Dengeli sosyal',
      high: 'Dışa dönük',
    },
    courage: {
      low: 'Temkinli',
      mid: 'Dengeli',
      high: 'Cesur',
    },
    empathy: {
      low: 'Pragmatik',
      mid: 'Dengeli',
      high: 'Empatik',
    },
    patience: {
      low: 'Dürtüsel',
      mid: 'Dengeli',
      high: 'Sabırlı',
    },
    conformity: {
      low: 'İsyankar',
      mid: 'Dengeli',
      high: 'Uyumcu',
    },
  };

  if (value < 35) return descriptions[axis].low;
  if (value > 65) return descriptions[axis].high;
  return descriptions[axis].mid;
}
