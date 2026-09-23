/**
 * feedbackPrioritizer.ts
 * Event sonrası çok kanallı feedback'i tek hiyerarşiye indirger.
 * "Tek Büyük Mesaj" prensibi: her event sonrası 1 ana bildirim,
 * geri kalan değişimler arka planda/journal'da kalır.
 */

import { FateOutcome, Stats } from '../types';
import { tRuntime } from '../i18n/strings';

export type FeedbackPriority = 'CRITICAL' | 'NOTABLE' | 'BACKGROUND';
export type FeedbackChannel = 'stat' | 'trait' | 'personality' | 'npc' | 'fate' | 'momentum';

export interface EventFeedbackItem {
  type: FeedbackChannel;
  priority: FeedbackPriority;
  message: string;
  /** Sıralı gösterim için gecikme (ms). 0 = hemen göster. */
  delay: number;
}

export interface EventOutcomeSummary {
  statChanges: Partial<Stats>;
  newStats: Stats;
  newTraitId?: string;
  newTraitName?: string;
  npcRelationChange?: number;
  npcName?: string;
  fateOutcome?: FateOutcome;
  personalityAxisChanged?: string;
  momentumStreakBroken?: boolean;
  primaryStatLabel?: string;
  primaryStatDelta?: number;
}

const PRIORITY_ORDER: Record<FeedbackPriority, number> = {
  CRITICAL: 0,
  NOTABLE: 1,
  BACKGROUND: 2,
};

const getFateMessages = (): Record<FateOutcome, string> => ({
  BLESSED: tRuntime('feedback.prioritizer.fateBlessed'),
  FORTUNATE: tRuntime('feedback.prioritizer.fateFortunate'),
  NEUTRAL: '',
  UNLUCKY: tRuntime('feedback.prioritizer.fateUnlucky'),
  CURSED: tRuntime('feedback.prioritizer.fateCursed'),
});

/**
 * Event sonuç özetini alır, öncelik sıralı feedback listesi döndürür.
 * Çağıran bileşen yalnızca CRITICAL ve NOTABLE öğeleri gösterir;
 * BACKGROUND öğeler floating-text / journal katmanına bırakılır.
 */
export const prioritizeFeedback = (outcome: EventOutcomeSummary): EventFeedbackItem[] => {
  const items: EventFeedbackItem[] = [];

  // ── P0: KRİTİK stat eşikleri ──────────────────────────────────────────
  if (outcome.newStats.health < 15) {
    items.push({
      type: 'stat',
      priority: 'CRITICAL',
      message: tRuntime('feedback.prioritizer.healthCritical'),
      delay: 0,
    });
  } else if (outcome.newStats.energy < 10) {
    items.push({
      type: 'stat',
      priority: 'CRITICAL',
      message: tRuntime('feedback.prioritizer.energyDepleted'),
      delay: 0,
    });
  }

  // ── P1: NOTABLE — Yeni özellik kazanıldı ───────────────────────────────
  if (outcome.newTraitName) {
    items.push({
      type: 'trait',
      priority: 'NOTABLE',
      message: tRuntime('feedback.prioritizer.newTrait', { traitName: outcome.newTraitName }),
      delay: 500,
    });
  }

  // ── P1: NOTABLE — Kötü Kader rulosu ────────────────────────────────────
  if (outcome.fateOutcome === 'CURSED') {
    items.push({
      type: 'fate',
      priority: 'NOTABLE',
      message: getFateMessages().CURSED,
      delay: 200,
    });
  } else if (outcome.fateOutcome === 'BLESSED') {
    items.push({
      type: 'fate',
      priority: 'NOTABLE',
      message: getFateMessages().BLESSED,
      delay: 200,
    });
  }

  // ── P1: NOTABLE — NPC ilişki değişimi (büyük sıçrama) ──────────────────
  if (outcome.npcRelationChange !== undefined && Math.abs(outcome.npcRelationChange) >= 15) {
    const direction = outcome.npcRelationChange > 0
      ? tRuntime('feedback.prioritizer.relationShiftPositive')
      : tRuntime('feedback.prioritizer.relationShiftNegative');
    const npc = outcome.npcName ?? tRuntime('feedback.prioritizer.relationShiftFallbackNpc');
    items.push({
      type: 'npc',
      priority: 'NOTABLE',
      message: tRuntime('feedback.prioritizer.relationShift', { npcName: npc, direction }),
      delay: 400,
    });
  }

  // ── P2: BACKGROUND — Normal stat değişimleri ───────────────────────────
  // Bunlar ana bildirime dahil edilmez; floating-text yeterli.
  if (outcome.primaryStatLabel && outcome.primaryStatDelta !== undefined) {
    const sign = outcome.primaryStatDelta > 0 ? '+' : '';
    items.push({
      type: 'stat',
      priority: 'BACKGROUND',
      message: `${outcome.primaryStatLabel} ${sign}${outcome.primaryStatDelta}`,
      delay: 0,
    });
  }

  return items.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
};

/**
 * Tek büyük mesaj için event feedback'ini özetler.
 * Bileşen bu metni event sonucunun altında gösterir.
 */
export const buildPrimaryFeedbackMessage = (
  outcome: EventOutcomeSummary,
  choiceFeedback: string
): { primary: string; secondary: string | null } => {
  const items = prioritizeFeedback(outcome);
  const critical = items.find(i => i.priority === 'CRITICAL');
  const notable = items.filter(i => i.priority === 'NOTABLE');

  // Ana mesaj: seçim feedback'i (her zaman gösterilir)
  const primary = choiceFeedback;

  // İkincil satır: kritik > notable(ilk) > null
  if (critical) {
    return { primary, secondary: critical.message };
  }
  if (notable.length > 0) {
    return { primary, secondary: notable[0].message };
  }
  return { primary, secondary: null };
};
