// =================================================================
// LEGACY UNLOCK SİSTEMİ
// Her run tamamlandığında hangi içeriklerin açılacağını belirler.
// Unlock'lar MetaProgression.unlockedEventIds ve
// unlockedRunModifiers alanlarına yazılır.
// =================================================================

import type { CareerResult, MetaProgression } from '../types/game';
import type { LifeGoal } from '../types/core';

// Her goal için hangi ek event ID'leri unlock olur (LEGENDARY tamamlayınca)
const GOAL_LEGENDARY_EVENT_UNLOCKS: Partial<Record<LifeGoal, string[]>> = {
  ACADEMIC: [
    'mem_gated_genius_legacy',      // Zeka mirasını sorgulayan memory-gated event
    'late_academic_phd_dream',      // Doktora hayali — yalnızca önceki LEGENDARY academic'te
  ],
  ATHLETIC: [
    'late_pro_career_crossroads',   // Profesyonellik mi, normal hayat mı?
  ],
  CREATIVE: [
    'late_artistic_identity_crisis',// Sanatçı kimliği krizi
  ],
  WEALTH: [
    'late_money_vs_meaning',        // Para mı, anlam mı?
  ],
  SOCIAL: [
    'late_social_burnout',          // Sosyal yıkım — başarının bedeli
  ],
};

// Run sayısına göre açılan genel event grubu ID'leri
const RUN_COUNT_UNLOCKS: Array<{ minRuns: number; eventIds: string[] }> = [
  {
    minRuns: 2,
    eventIds: [
      // İkinci run'dan itibaren daha derin moral dilemma'lar
      'moral_dilemma_betrayal_echo',
      'moral_dilemma_second_chance',
    ],
  },
  {
    minRuns: 5,
    eventIds: [
      // 5. run'dan itibaren meta-narrative event'leri (karakterin kendi kaderini sorgular)
      'tr_fate_question_late',
    ],
  },
];

/**
 * Tamamlanan bir run'dan sonra hangi yeni event ID'lerinin ve
 * modifier'ların açılacağını hesaplar.
 *
 * Bu fonksiyon run sonrası çağrılmalı; dönen listeler
 * MetaProgression.unlockedEventIds / unlockedRunModifiers'a eklenmeli.
 */
export const getUnlocksForCompletedRun = (
  meta: MetaProgression,
  runTier: CareerResult['type'],
  runGoal: LifeGoal | null,
  familyWealth?: string
): { newEventIds: string[]; newModifiers: string[] } => {
  const newEventIds: string[] = [];
  const newModifiers: string[] = [];

  const currentEventIds = new Set(meta.unlockedEventIds ?? []);
  const currentModifiers = new Set(meta.unlockedRunModifiers ?? []);
  const completedRuns = (meta.totalRunsCompleted ?? 0) + 1; // henüz kaydedilmemiş bu run dahil

  // Run sayısına bağlı genel unlock'lar
  for (const tier of RUN_COUNT_UNLOCKS) {
    if (completedRuns >= tier.minRuns) {
      for (const id of tier.eventIds) {
        if (!currentEventIds.has(id)) newEventIds.push(id);
      }
    }
  }

  // Goal × LEGENDARY kombinasyonuna özel unlock'lar
  if ((runTier === 'LEGENDARY' || runTier === 'SUCCESS') && runGoal) {
    const goalUnlocks = GOAL_LEGENDARY_EVENT_UNLOCKS[runGoal] ?? [];
    for (const id of goalUnlocks) {
      if (!currentEventIds.has(id)) newEventIds.push(id);
    }
  }

  // 5 farklı goal tamamlanınca gizli 6. goal hint'i
  const completedGoals = new Set(Object.keys(meta.goalCompletions ?? {}));
  if (runGoal) completedGoals.add(runGoal);
  if (completedGoals.size >= 5 && !currentModifiers.has('sixth_goal_hint')) {
    newModifiers.push('sixth_goal_hint');
  }

  // POOR + SUCCESS/LEGENDARY → underdog bonus modifier
  if (
    familyWealth === 'POOR' &&
    (runTier === 'SUCCESS' || runTier === 'LEGENDARY') &&
    !currentModifiers.has('poor_underdog_bonus')
  ) {
    newModifiers.push('poor_underdog_bonus');
  }

  return { newEventIds, newModifiers };
};

/**
 * Mevcut run'da hangi event'lerin görünebileceğini belirler.
 * Event seçim algoritmasında eligibility filtresi olarak kullanılır.
 *
 * Eğer bir event `requiresUnlock: true` işaretliyse, yalnızca
 * unlockedEventIds içinde olduğunda eligible sayılır.
 */
export const isEventUnlockedForRun = (
  eventId: string,
  requiresUnlock: boolean,
  unlockedEventIds: string[]
): boolean => {
  if (!requiresUnlock) return true;
  return unlockedEventIds.includes(eventId);
};
